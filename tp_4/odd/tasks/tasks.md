# AgroPulse — Documento de Tareas ODD (TP4)

## Contexto y Arquitectura General
- **Proyecto**: AgroPulse — Aplicación Móvil de Agricultura de Precisión (TP4)
- **Cliente**: React Native (Expo SDK ~54.0.0, TypeScript Estricto)
- **BaaS**: Supabase (PostgreSQL, Row-Level Security, Realtime, Auth)
- **Backend de Streaming y Telemetría**: Docker Compose (Redpanda/Kafka, Simulador IoT, Worker de Ingesta)
- **Regla Arquitectónica Clave**: La aplicación móvil nunca se conecta directamente al broker Kafka; interactúa únicamente a través de Supabase REST y Realtime.

---

## Fase 1: Configuración del Proyecto y Arquitectura Base
- [x] **Tarea 1.1: Inicialización del Proyecto Expo**
  - Crear estructura base de Expo compatible con el estándar de cátedra SDK 54 (`expo ~54.0.0`, `react 19.1.0`, `react-native 0.81.0`).
  - Configurar `tsconfig.json` con modo estricto (`strict: true`).
  - Configurar `app.json` con nombre, slug, scheme y permisos necesarios (geolocalización).
- [x] **Tarea 1.2: Instalación y Verificación de Dependencias**
  - Cliente Supabase: `@supabase/supabase-js`.
  - Persistencia y navegación: `@react-native-async-storage/async-storage`, `expo-status-bar`.
  - Sensores y mapas: `expo-location`, `react-native-svg` para polígonos interactivos y gráficos.
  - Interfaz y gráficos: `@expo/vector-icons`, soporte para gráficos de series temporales SVG.
  - Soporte multiplataforma web verificado con `react-dom` y `react-native-web`.
- [x] **Tarea 1.3: Capas Arquitectónicas y Configuración de Servicios**
  - Definir estructura modular limpia: `src/components/`, `src/context/`, `src/lib/`, `src/navigation/`, `src/screens/`, `src/services/`, `src/types/`.
  - Instanciar cliente singleton de Supabase con persistencia de sesión en AsyncStorage (`src/services/supabase.ts`).
  - Configuración de variables de entorno (`.env.example` y `.env` con URL y Anon Key).

---

## Fase 2: Esquema de Base de Datos, Migraciones y Políticas RLS (Supabase)
- [x] **Tarea 2.1: Migraciones SQL y Modelo de Datos (`supabase/migrations/001_initial_schema.sql`)**
  - Tabla `organizations` (`id`, `name`, `region`, `created_at`).
  - Tabla `memberships` (`id`, `user_id`, `organization_id`, `role`: `producer`, `operator`, `advisor`).
  - Tabla `plots` (`id`, `organization_id`, `name`, `crop`, `geom` polígono/GeoJSON, `threshold_min` por defecto 25, `threshold_max` por defecto 45).
  - Tabla `stations` (`id`, `plot_id`, `name`, `lat`, `lng`).
  - Tabla `readings` (`id`, `station_id`, `measured_at`, `moisture_pct`, `temp_c`, `rain_mm`, `source`: `sensor`, `manual`).
  - Índice de optimización en `readings(station_id, measured_at DESC)`.
  - Tabla `valves` (`id`, `plot_id`, `name`, `status`: `open`, `closed`).
  - Tabla `irrigation_commands` (`id`, `valve_id`, `requested_by`, `action`: `open`, `close`, `duration_min`, `status`: `pending`, `applied`, `failed`, `cancelled`, `client_request_id` UUID único, `created_at`, `applied_at`).
  - Tabla `alerts` (`id`, `plot_id`, `type`, `payload`, `created_at`, `read_at`).
- [x] **Tarea 2.2: Políticas de Seguridad Row Level Security (RLS) (`supabase/migrations/002_rls_policies.sql`)**
  - Habilitar RLS en todas las tablas del esquema.
  - Perímetro de consulta (SELECT) basado estrictamente en membresías del usuario autenticado.
  - Restricción de INSERT/UPDATE de umbrales y comandos de riego únicamente a roles `producer` y `operator`.
  - Restricción estricta de solo lectura (SELECT) para el rol `advisor`.
  - Publicación Realtime activa para `readings`, `valves`, `irrigation_commands` y `alerts`.
  - Restricción / validación para impedir un segundo comando `pending` en la misma válvula (RF-16).
- [x] **Tarea 2.3: Script de Datos Semilla (`supabase/seed.sql`)**
  - Organización: "Estancia Didáctica Concordia".
  - Cuentas de demostración: `productor@agropulse.test`, `operador@agropulse.test`, `asesor@agropulse.test`.
  - Tres lotes didácticos en Concordia, Entre Ríos:
    - *Costa 1* (Citrus, humedad inicial óptima ~35%).
    - *Costa 2* (Citrus, humedad inicial seca ~18% para demostración de riego).
    - *Monte A* (Soja, para demostración de estado stale al desconectar sensores).
  - Estaciones de telemetría y válvulas asociadas a cada lote.

---

## Fase 3: Infraestructura de Telemetría, Broker y Worker (`infra/`)
- [x] **Tarea 3.1: Entorno Docker Compose (`infra/docker-compose.yml`)**
  - Servicio Redpanda (broker compatible con Kafka ligero y mononodo).
  - Servicio del Simulador IoT.
  - Servicio del Worker de Ingesta.
- [x] **Tarea 3.2: Simulador IoT de Sensores (`infra/simulator/`)**
  - Publicación periódica de telemetría (cada 3–8 segundos) por estación.
  - Tópicos Kafka: `soil.moisture` (`station_id`, `moisture_pct`, `temp_c`, `ts`) y `weather.tick` (`station_id`, `rain_mm`, `ts`).
  - Interruptor o control para pausar ticks de una estación (para validar estado stale tras 15 minutos).
- [x] **Tarea 3.3: Worker de Ingesta y Ejecución de Comandos (`infra/worker/`)**
  - Consumidor de tópicos de telemetría e inserción en Supabase con Service Role.
  - Detección y procesamiento de comandos de irrigación `pending`.
  - Simulación de retraso del actuador físico (1–4 segundos), transición a `applied` (con 10% de fallo simulado) y cambio de estado de válvula a `open`/`closed`.
  - Registro de trazas visible en consola: `[PRODUCED]`, `[CONSUMED]`, `[UPSERT READING]`, `[COMMAND APPLIED]`.

---

## Fase 4: Aplicación Móvil — Autenticación y Contexto
- [x] **Tarea 4.1: Pantalla de Acceso y Persistencia de Sesión (`RF-01`)**
  - Pantalla de inicio de sesión con validación de credenciales y manejo de errores en español.
  - Restauración automática de sesión activa al iniciar la app (`AsyncStorage`).
  - Botones de acceso rápido para evaluación de cátedra (Productor, Operador, Asesor).
  - Cierre de sesión en la pestaña de Cuenta.
- [x] **Tarea 4.2: Contexto de Organización y Roles (`RF-02`, `RF-03`)**
  - Obtención de membresías y roles asignados al usuario.
  - Selector de establecimiento si el usuario pertenece a más de uno.
  - Proveedor global `useAuth()` con usuario actual, establecimiento activo y permisos.

---

## Fase 5: Aplicación Móvil — Mapa de Lotes y Geolocalización
- [x] **Tarea 5.1: Motor de Cálculo del Semáforo de Lote (`RF-12`, Reglas de Negocio §8)**
  - Implementación de la lógica pura en TypeScript (`src/lib/plotStatusCalculator.ts`):
    - `stale` (Gris): sin lecturas recientes (> 15 min).
    - `dry` (Rojo): `moisture_pct < threshold_min`.
    - `optimal` (Verde): `threshold_min <= moisture_pct <= threshold_max`.
    - `wet` (Azul): `moisture_pct > threshold_max`.
  - Tests unitarios de cobertura de la fórmula y condiciones de borde (`src/__tests__/plotStatusCalculator.test.ts`).
- [x] **Tarea 5.2: Vista de Mapa Interactivo (`RF-05`)**
  - Renderizado de polígonos GeoJSON coloreados según el estado del semáforo con SVG.
  - Indicadores accesibles (texto y badge, no solo color: `src/components/StatusBadge.tsx`).
  - Interacción táctil en polígono o tarjeta para abrir el Detalle del Lote.
- [x] **Tarea 5.3: Geolocalización "Estoy en el Lote" (`RF-06`)**
  - Solicitud de permisos GPS con degradación elegante si se rechaza ("Ubicación no disponible").
  - Algoritmo de punto en polígono con Ray-Casting (`src/lib/geofence.ts`).
  - Detección reactiva y resaltado visual del lote donde se encuentra físicamente el usuario.

---

## Fase 6: Aplicación Móvil — Detalle del Lote, Gráficos y Umbrales
- [x] **Tarea 6.1: Vista Detalle del Lote (`RF-09`)**
  - Información agronómica (nombre, cultivo, estado del semáforo).
  - Última lectura recibida con antigüedad relativa formateada ("hace 12 s", "hace 2 min").
  - Banner agronómico destacado ante condición de sequía o sensor caído (RF-22).
  - Actualización reactiva inmediata mediante canal Supabase Realtime o simulación local.
- [x] **Tarea 6.2: Gráfico de Serie Temporal de Humedad (`RF-10`)**
  - Gráfico SVG vectorial de humedad de las últimas 6 horas (13 puntos temporales).
  - Líneas punteadas de referencia para umbrales mínimo (rojo) y máximo (azul).
  - Soporte para pull-to-refresh e inserción en tiempo real.
- [x] **Tarea 6.3: Configuración de Umbrales por Lote (`RF-11`)**
  - Modal para ajustar `threshold_min` y `threshold_max` (`src/components/ThresholdModal.tsx`).
  - Habilitado para `producer` y `operator`; deshabilitado/bloqueado para `advisor` (OA-1).
  - Persistencia en base de datos y recálculo automático inmediato del semáforo.

---

## Fase 7: Aplicación Móvil — Comandos de Riego y Control de Válvulas
- [x] **Tarea 7.1: Gestión de Válvulas y Despacho de Comandos (`RF-13`, `RF-14`)**
  - Lista de válvulas del lote con estado (`abierta` / `cerrada`).
  - Modal de acción: Abrir, Cerrar o Regar por duración (chips de 15 a 120 min).
  - Generación de `client_request_id` (UUID v4) para garantizar idempotencia (`src/lib/idempotency.ts`).
  - Confirmación con resumen de la orden.
- [x] **Tarea 7.2: Ciclo de Vida Asíncrono y Acuse en Tiempo Real (`RF-15`, `RF-16`)**
  - Inserción del comando con estado `pending`.
  - Bloqueo preventivo de comandos concurrentes en la misma válvula con mensaje descriptivo (RF-16).
  - Indicador visual de comando en vuelo y actualización reactiva a `applied` o `failed` en ≤ 3 segundos.
  - Soporte para cancelar comandos pendientes (`RF-17`).
- [x] **Tarea 7.3: Historial de Auditoría de Comandos (`RF-18`)**
  - Historial con los últimos 20 comandos del lote (fecha, usuario emisor, acción, UUID y resultado).

---

## Fase 8: Aplicación Móvil — Modo Offline y Lecturas de Campo Manuales (`Should`)
- [x] **Tarea 8.1: Cola de Lecturas Manuales Desconectadas (`RF-21`, `RNF-07`)**
  - Formulario de lectura manual en campo (% humedad, temperatura, lluvia, notas y GPS opcional).
  - Encolado local en AsyncStorage ante falta de conectividad (`src/services/offlineQueue.ts`).
  - Sincronizador automático en segundo plano al recuperar señal, evitando duplicados.
  - Banner reactivo en el mapa informando de lecturas pendientes de sincronización.

---

## Fase 9: Alertas, Diagnóstico y Observabilidad
- [x] **Tarea 9.1: Alertas en la Aplicación (`RF-19`, `RF-20`)**
  - Notificaciones in-app cuando un lote entra en estado seco o un sensor pasa a stale (`src/screens/AlertsScreen.tsx`).
  - Insignia con conteo de alertas no leídas en la barra de navegación inferior.
- [x] **Tarea 9.2: Pantalla de Diagnóstico (`RF-23`)**
  - Panel para evaluación técnica en la pestaña Cuenta: ID de usuario autenticado, establecimiento activo, modo de datos (Supabase Live / Simulado), último tick recibido y lag aparente de red (ms).

---

## Fase 10: Pruebas, Verificación y Entregables Académicos
- [x] **Tarea 10.1: Pruebas Unitarias Automatizadas (`RNF-08`)**
  - Suite de pruebas para la fórmula del semáforo (stale, seco, óptimo, húmedo): `src/__tests__/plotStatusCalculator.test.ts`.
  - Suite de pruebas para algoritmo de geofencing ray-casting: `src/__tests__/geofence.test.ts`.
  - Suite de pruebas para idempotencia y rechazo de comandos pendientes duplicados: `src/__tests__/idempotency.test.ts`.
  - Suite de pruebas para la cola offline: `src/__tests__/offlineQueue.test.ts`.
  - Cobertura: 19 pruebas ejecutadas y aprobadas (100% éxito).
- [x] **Tarea 10.2: Documentación Obligatoria de Entrega**
  - `COMO_EJECUTAR.md`: Guía paso a paso de arranque (Docker, migraciones Supabase y app Expo SDK 54).
  - `ARQUITECTURA.md`: Estructura del proyecto, flujo event-driven y justificación técnica de la frontera BaaS vs broker.
  - `INFORME.md`: Cumplimiento del PRD y checklist de rúbrica académica.
