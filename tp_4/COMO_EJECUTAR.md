# AgroPulse — Guía de Ejecución y Despliegue (COMO_EJECUTAR.md)

Este documento detalla las instrucciones paso a paso para levantar, configurar y evaluar la plataforma **AgroPulse** (TP4 - Programación Móvil / FCyT UADER 2026).

---

## 1. Modos de Ejecución Disponibles

La aplicación fue diseñada siguiendo el principio de **degradación elegante y resiliencia autónoma**:
1. **Modo Autónomo / Demo (Recomendado para evaluación rápida y defensa oral):**
   - No requiere Docker ni conexión externa a Supabase.
   - Utiliza generadores de telemetría periódica en memoria, persistencia local con `AsyncStorage`, y conmutador rápido de roles de cátedra.
2. **Modo Infraestructura Completa (Event-Driven & BaaS):**
   - Levanta el broker Kafka/Redpanda, el Simulador IoT de sensores y el Worker de Ingesta en Docker.
   - Conecta con el proyecto de Supabase (PostgreSQL + RLS + Realtime).

---

## 2. Requisitos Previos

- **Node.js**: versión `v20.x` o superior.
- **npm**: versión `10.x` o superior.
- **Expo CLI**: incluido en las dependencias locales (`npx expo`).
- **Docker y Docker Compose** (únicamente si se ejecuta el Modo Infraestructura Completa).
- Dispositivo móvil con **Expo Go** (Android/iOS) o navegador web moderno.

---

## 3. Instalación de Dependencias

Abra una terminal en la raíz del proyecto y ejecute:

```bash
# 1. Instalar dependencias de la aplicación móvil
npm install

# 2. Verificar que las pruebas unitarias pasen satisfactoriamente
npm test
```

---

## 4. Ejecución en Modo Autónomo / Demo

Para iniciar la aplicación directamente:

```bash
# Iniciar con Expo
npm start

# O para abrir directamente en el navegador Web:
npm run web

# O para Android / iOS:
npm run android
npm run ios
```

### Credenciales Didácticas de Evaluación
En la pantalla de inicio de sesión (`LoginScreen.tsx`), puede ingresar manualmente o utilizar los **botones de acceso rápido de cátedra**:

| Rol | Correo Electrónico | Contraseña | Permisos |
|---|---|---|---|
| **Productor** | `productor@agropulse.test` | `AgroPulse2026!` | Control total, ajuste de umbrales, despacho de riego |
| **Operador** | `operador@agropulse.test` | `AgroPulse2026!` | Despacho de riego y lecturas manuales de campo |
| **Asesor Agrónomo** | `asesor@agropulse.test` | `AgroPulse2026!` | Solo lectura (auditoría técnica y diagnósticos) |

---

## 5. Ejecución con Infraestructura Completa (Docker + Supabase)

### Paso A: Configuración de Base de Datos (Supabase)
1. Cree un proyecto en [Supabase](https://supabase.com) o inicie una instancia local con Supabase CLI (`supabase start`).
2. Diríjase al **SQL Editor** de Supabase y ejecute los scripts en el siguiente orden estricto:
   - `supabase/migrations/001_initial_schema.sql` (tablas, índices y restricciones).
   - `supabase/migrations/002_rls_policies.sql` (políticas de seguridad RLS y canales Realtime).
   - `supabase/seed.sql` (organización didáctica de Concordia, usuarios, lotes, estaciones y lecturas iniciales).

### Paso B: Variables de Entorno
Copie el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edite el archivo `.env` con sus credenciales de Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<TU-PROYECTO>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<TU-ANON-KEY-PUBLICA>
SUPABASE_SERVICE_ROLE_KEY=<TU-SERVICE-ROLE-KEY-PRIVADA>
```

> **IMPORTANTE**: La clave `SUPABASE_SERVICE_ROLE_KEY` sólo es consumida por el worker de backend en Node.js; nunca queda expuesta ni empaquetada en el cliente móvil.

### Paso C: Iniciar el Cluster de Telemetría (Docker Compose)
En una terminal:

```bash
cd infra
docker compose up --build
```

Esto iniciará:
- **`agropulse-redpanda`**: Broker Kafka en los puertos `9092` y `9644`.
- **`agropulse-simulator`**: Publica telemetría periódica cada 5s en los tópicos `soil.moisture` y `weather.tick`.
- **`agropulse-worker`**: Consume eventos Kafka, inserta lecturas en Supabase e implementa la ejecución asíncrona de comandos de riego con acuse de recibo.

### Paso D: Iniciar la Aplicación Móvil
En otra terminal, en la raíz del proyecto:

```bash
npm start
```

---

## 6. Verificación de Casos de Prueba y Rúbrica Académica

### 6.1 Semáforo Agronómico de 4 Estados (RF-12, §8)
- **Costa 1 (Óptimo - Verde)**: Humedad volumétrica ~34% (entre el umbral mínimo de 25% y máximo de 45%).
- **Costa 2 (Seco - Rojo)**: Humedad ~18% (< 25%). Muestra banner de advertencia agronómica recomendando riego.
- **Monte A (Sin Datos / Stale - Gris)**: Sensor desconectado por más de 15 minutos. Muestra alerta de estación inactiva.
- Modifique los umbrales en el modal del lote para verificar cómo el semáforo recalcula reactivamente a Óptimo, Seco o Húmedo (Azul).

### 6.2 Comandos de Riego Asíncronos e Idempotencia (RF-13 a RF-18)
1. Ingrese como **Productor** u **Operador**.
2. Abra el detalle de **Costa 2** y presione **Regar** en la válvula.
3. Seleccione duración (ej. 30 min) y confirme la orden.
4. Observe el indicador de **Comando en Vuelo (Pending)** con su identificador UUID v4.
5. Intente enviar un segundo comando a la misma válvula: el sistema rechazará la operación (defensa **RF-16** contra órdenes concurrentes).
6. En ≤ 3 segundos, observe cómo el actuador físico virtual cambia de estado a **Abierta (Regando)** y el comando pasa a **`applied`**.

### 6.3 Restricción Estricta de Asesor (H2, OA-1)
1. En la pestaña **Cuenta**, seleccione el rol **Asesor Agrónomo**.
2. Intente accionar una válvula o modificar los umbrales: la aplicación deshabilitará los controles y notificará la restricción de solo lectura (403 Forbidden).

### 6.4 Modo Desconectado / Offline (RF-21, RNF-07)
1. Presione **Lectura Manual** en la barra superior del Mapa o Lote.
2. Ingrese los datos observados en campo (humedad, temperatura, notas y GPS).
3. Guarde la lectura: si no hay conexión a Supabase, se encola de forma transparente en `AsyncStorage`.
4. El banner naranja superior alertará sobre las lecturas pendientes de sincronización.

---

## 7. Ejecución de la Suite de Pruebas Automatizadas

Para ejecutar las 19 pruebas unitarias automatizadas:

```bash
npm test
```

Para ejecutar con cobertura de código:

```bash
npx jest --coverage
```
