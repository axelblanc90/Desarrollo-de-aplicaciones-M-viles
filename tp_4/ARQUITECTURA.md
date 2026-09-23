# AgroPulse — Documento de Arquitectura de Software (ARQUITECTURA.md)

## 1. Visión General y Objetivos Arquitectónicos

**AgroPulse** es una plataforma móvil orientada a la agricultura de precisión que resuelve la toma tardía de decisiones de riego en lotes productivos. Su arquitectura sigue un diseño desacoplado, resiliente y orientado a eventos (*event-driven architecture*), combinando:
- Un **Frontend Móvil** desarrollado en React Native (Expo SDK 54, TypeScript Estricto).
- Un **Backend as a Service (BaaS)** provisto por Supabase (PostgreSQL 15+, Row-Level Security, Realtime WebSockets, Auth).
- Un **Pipeline de Telemetría IoT en Tiempo Real** orquestado con Docker Compose (broker Kafka/Redpanda, simulador de sensores in-situ y worker de ingesta).

---

## 2. Diagrama de Arquitectura Global

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            INFRAESTRUCTURA IOT                              │
│                                                                             │
│   ┌─────────────────────┐               ┌───────────────────────────────┐   │
│   │   Simulador IoT     │               │        Redpanda / Kafka       │   │
│   │  (Estaciones Costa1,│  Publica      │                               │   │
│   │   Costa2, Monte A)  │──────────────>│ • Topic: soil.moisture        │   │
│   └─────────────────────┘   JSON Ticks  │ • Topic: weather.tick         │   │
│                                         └───────────────┬───────────────┘   │
└─────────────────────────────────────────────────────────│───────────────────┘
                                                          │ Consume eventos
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND INGESTION WORKER                           │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Ingestion Worker (Node.js Service Role)                             │   │
│   │ • Upsert telemetría periódica en PostgreSQL                         │   │
│   │ • Polling y ejecución asíncrona de comandos de riego (pending)      │   │
│   │ • Transición a 'applied' / 'failed' y conmutación de válvulas       │   │
│   └──────────────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────────────│──────────────────────────────────────┘
                                       │ Service Role Key (REST/RPC)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (BaaS & PERSISTENCIA)                      │
│                                                                             │
│   ┌────────────────────────┐  RLS Guard  ┌──────────────────────────────┐   │
│   │ PostgreSQL Relacional  │<────────────│ Supabase Auth (JWT)          │   │
│   │ • organizations        │             │ • Roles: producer, operator, │   │
│   │ • plots / stations     │             │   advisor                    │   │
│   │ • readings / valves    │             └──────────────────────────────┘   │
│   │ • irrigation_commands  │                                                │
│   │ • alerts               │             ┌──────────────────────────────┐   │
│   └───────────┬────────────┘             │ Supabase Realtime            │   │
│               │                          │ (Postgres Changes via WS)    │   │
│               └─────────────────────────>│ • readings / valves          │   │
│                                          │ • commands / alerts          │   │
│                                          └──────────────┬───────────────┘   │
└─────────────────────────────────────────────────────────│───────────────────┘
                                                          │ TLS / WSS / REST
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APLICACIÓN MÓVIL                                 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ React Native Client (Expo SDK 54 / TypeScript Estricto)             │   │
│   │ • AgroContext & AuthContext (Gestión centralizada del estado)       │   │
│   │ • PolygonMap (Renderizado vectorial interactivo SVG y Geofencing)   │   │
│   │ • PlotStatusCalculator (Semáforo 4 estados: Óptimo/Seco/Húmedo/     │   │
│   │   Stale > 15m)                                                      │   │
│   │ • ValveControlModal (Comandos asíncronos con idempotencia UUID)     │   │
│   │ • OfflineQueue (Almacenamiento y reconciliación en AsyncStorage)    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Justificación Técnica: Frontera BaaS vs. Broker de Streaming

Una de las directrices arquitectónicas más importantes del proyecto es que **la aplicación móvil nunca se conecta directamente al broker Kafka**:

| Criterio | Acceso Directo Móvil -> Kafka | Patrón Adoptado: Móvil -> BaaS -> Worker -> Kafka |
|---|---|---|
| **Seguridad de Credenciales** | Inviable. Expondría llaves maestras SASL/SCRAM del cluster en el paquete APK/IPA. | **Óptima**. El cliente autentica con JWT efímero y políticas de seguridad a nivel de fila (Row-Level Security). |
| **Batería y Recursos Móviles** | Agotamiento acelerado por mantener sockets TCP de bajo nivel y polling constante de particiones Kafka. | **Eficiente**. Supabase Realtime multiplexa suscripciones sobre una única conexión WebSocket segura (`wss://`). |
| **Resiliencia de Red Móvil** | Kafka asume conexiones estables de alta velocidad; ante cambios 4G/WiFi o pérdida de señal, el rebalanceo de grupos de consumidores satura el broker. | **Tolerante a Desconexión**. El cliente móvil opera con caché optimista y cola offline en `AsyncStorage`. |
| **Control de Acceso y Autorización** | Kafka no provee filtrado por lote u organización de forma nativa a nivel de mensaje. | **Estricto**. PostgreSQL RLS audita cada consulta en base a la membresía del usuario autenticado. |

---

## 4. Ciclo de Vida de Comandos de Riego y Defensa de Concurrencia (RF-13 a RF-18)

Para garantizar la seguridad de los actuadores en el campo y evitar la sobre-irrigación o colisiones de válvulas:

1. **Generación de `client_request_id` (UUID v4)**:
   - Todo comando originado por el usuario genera un identificador único en el cliente antes de ser transmitido. Esto previene que una retransmisión por fallo de red provoque una apertura duplicada.
2. **Defensa de Concurrencia (RF-16)**:
   - Se prohíbe taxativamente la existencia de más de un comando en estado `pending` sobre la misma válvula.
   - **En la Base de Datos**: Respaldado por el índice condicional:
     ```sql
     CREATE UNIQUE INDEX idx_unique_pending_command_per_valve 
     ON irrigation_commands(valve_id) 
     WHERE status = 'pending';
     ```
   - **En la Aplicación Móvil**: Validación reactiva previa al despacho, deshabilitando el botón y alertando al operador.
3. **Acuse de Recibo Asíncrono (SLA ≤ 3s)**:
   - Al emitirse la orden, se inserta con estado `pending`.
   - El worker de ingesta detecta la solicitud, simula el tiempo de respuesta del actuador mecánico (1 a 3 segundos) y actualiza el comando a `applied` (o `failed` con probabilidad controlada de 10%).
   - Al actualizarse el comando, la válvula pasa inmediatamente a `open` o `closed`, actualizando el mapa y la vista de detalle en tiempo real vía WebSockets.

---

## 5. Modelo de Seguridad por Fila (Row-Level Security - RLS)

La plataforma aplica el principio de menor privilegio mediante políticas declarativas en PostgreSQL:

- **Productor (`producer`)**:
  - `SELECT`: Todas las tablas de su establecimiento.
  - `UPDATE`: Umbrales de humedad (`threshold_min`, `threshold_max`) de sus lotes.
  - `INSERT`: Órdenes de irrigación (`irrigation_commands`) y lecturas manuales de campo.
  - `CANCEL`: Cancelación de comandos pendientes propios.
- **Operador (`operator`)**:
  - `SELECT`: Datos agronómicos y de telemetría de su establecimiento.
  - `INSERT`: Comandos de irrigación y lecturas manuales.
  - `UPDATE`: No puede alterar umbrales agronómicos base del lote.
- **Asesor Agrónomo (`advisor`)**:
  - `SELECT`: Acceso total de consulta y análisis histórico.
  - `INSERT / UPDATE`: **Bloqueado estrictamente** tanto en el RLS como en la interfaz gráfica (botones deshabilitados con insignia de solo lectura).

---

## 6. Algoritmos Puros y Lógica Aislada

La arquitectura desacopla completamente las reglas de negocio de los componentes visuales mediante funciones puras testeadas con Jest:

### 6.1 Motor del Semáforo Agronómico (`src/lib/plotStatusCalculator.ts`)
Calcula el estado del lote en base a la última lectura disponible y los umbrales configurados:
1. **`stale` (Gris)**: Si no existe lectura previa o la antigüedad de `measured_at` supera los 15 minutos (`STALE_THRESHOLD_MS`).
2. **`dry` (Rojo)**: Si `moisture_pct < threshold_min`.
3. **`optimal` (Verde)**: Si `threshold_min <= moisture_pct <= threshold_max`.
4. **`wet` (Azul)**: Si `moisture_pct > threshold_max`.

### 6.2 Geolocalización "Estoy en el Lote" (`src/lib/geofence.ts`)
Implementa el algoritmo de **Ray-Casting** para determinar si las coordenadas GPS de la antena satelital del teléfono inteligente caen dentro del polígono GeoJSON del lote. Si el usuario se encuentra dentro de los límites del lote, el mapa resalta la parcela con un borde punteado verde y el banner informa: *"Estás en: Costa 1 (Citrus)"*.

### 6.3 Cola Offline (`src/services/offlineQueue.ts`)
Ante la pérdida de conectividad en zonas rurales:
- Las lecturas manuales se almacenan en una cola estructurada dentro de `AsyncStorage`.
- Se genera un `client_request_id` para garantizar que, cuando la conexión retorne, la sincronización en segundo plano inserte cada observación exactamente una vez.

---

## 7. Estructura de Directorios del Código Fuente

```
tp_4/
├── src/
│   ├── components/            # Componentes UI desacoplados y reutilizables
│   │   ├── MoistureChart.tsx       # Gráfico vectorial SVG de 6 horas
│   │   ├── OfflineBanner.tsx       # Alerta reactiva de sincronización offline
│   │   ├── PolygonMap.tsx          # Canvas SVG interactivo con geofence GPS
│   │   ├── StatusBadge.tsx         # Insignia accesible con texto y color
│   │   ├── ThresholdModal.tsx      # Modal de configuración de umbrales
│   │   └── ValveControlModal.tsx   # Modal de órdenes de riego e idempotencia
│   ├── context/               # Proveedores de estado global reactivo
│   │   ├── AgroContext.tsx         # Telemetría, comandos, lotes y realtime
│   │   └── AuthContext.tsx         # Sesión, perfiles y conmutador de roles
│   ├── lib/                   # Lógica de negocio pura (100% testeada)
│   │   ├── geofence.ts             # Algoritmo de punto en polígono (Ray-Casting)
│   │   ├── idempotency.ts          # Generador de UUID v4 (RFC4122)
│   │   └── plotStatusCalculator.ts # Motor del semáforo agronómico de 4 estados
│   ├── navigation/
│   │   └── RootNavigator.tsx       # Navegación por pestañas (Mapa, Lotes, Alertas, Cuenta)
│   ├── screens/               # Vistas de aplicación
│   │   ├── AccountScreen.tsx       # Perfil, switcher rápido y panel de diagnóstico RF-23
│   │   ├── AlertsScreen.tsx        # Centro de notificaciones in-app
│   │   ├── LoginScreen.tsx         # Acceso con Supabase Auth y credenciales demo
│   │   ├── ManualReadingScreen.tsx # Carga de observaciones en campo (offline)
│   │   ├── MapScreen.tsx           # Vista principal geográfica con lotes y semáforo
│   │   ├── PlotDetailScreen.tsx    # Métricas, histórico 6h, umbrales y auditoría
│   │   └── PlotsScreen.tsx         # Catálogo filtrable por nombre, cultivo y estado
│   ├── services/
│   │   ├── offlineQueue.ts         # Persistencia y reconciliación offline
│   │   └── supabase.ts             # Cliente singleton Supabase
│   ├── types/
│   │   └── agropulse.types.ts      # Definiciones de tipos TypeScript del modelo
│   └── __tests__/             # Suite de pruebas unitarias automatizadas (Jest)
│       ├── geofence.test.ts
│       ├── idempotency.test.ts
│       ├── offlineQueue.test.ts
│       └── plotStatusCalculator.test.ts
├── infra/                     # Infraestructura Docker
│   ├── docker-compose.yml     # Redpanda + Simulator + Ingestion Worker
│   ├── simulator/             # Simulador de telemetría IoT
│   └── worker/                # Worker de ingesta y actuadores
├── supabase/                  # Artefactos de base de datos
│   ├── migrations/            # Esquema DDL y políticas de seguridad RLS
│   └── seed.sql               # Datos iniciales de Concordia
├── COMO_EJECUTAR.md           # Guía de instalación y evaluación
├── ARQUITECTURA.md            # Este documento
└── INFORME.md                 # Informe técnico final y verificación de rúbrica
```
