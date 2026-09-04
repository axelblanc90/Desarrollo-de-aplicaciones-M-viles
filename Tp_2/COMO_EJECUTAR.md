# 🚀 Guía de Ejecución - TP2: Flujo Checkout Tienda

Este proyecto corresponde al **Trabajo Práctico N° 2 (Flujo de Checkout de Tienda Online)** de la cátedra Desarrollo de Aplicaciones Móviles. Implementa en React Native con Expo el flujo completo de compra diseñado en Figma (Carrito de compras, Pago seguro con selección de tarjetas y direcciones, Resumen desplegable y Confirmación de orden).

---

## 1. 📋 Requisitos Previos del Sistema

Antes de ejecutar la aplicación, verifica tener instalado en tu computadora:

- **Node.js**: Versión `v20.x` LTS (Recomendada: `v20.18.0` o superior dentro de la línea 20).
  ```bash
  node -v
  ```
- **npm**: Versión `10.8.x` o superior.
  ```bash
  npm -v
  ```
- **Dispositivo Móvil**: Celular con la aplicación **Expo Go** instalada desde Google Play Store o Apple App Store, compatible con **Expo SDK 54**.

---

## 2. 📦 Instalación de Dependencias

Si clonas el repositorio o abres el proyecto por primera vez, instala los módulos ejecutando desde la raíz de `Tp_2`:

```bash
npm install
```

> [!TIP]
> Si en algún momento necesitas verificar o reparar versiones de paquetes nativos, utiliza el comando oficial de Expo:
> ```bash
> npx expo install --fix
> ```

---

## 3. 📱 Pasos para Iniciar la Aplicación

### Paso 1: Iniciar el servidor de desarrollo de Expo

Ejecuta en tu terminal dentro de la carpeta `Tp_2`:

```bash
npx expo start
```

### Paso 2: Abrir en el Celular (Expo Go)

1. Aparecerá en la terminal un código QR interactivo y la URL del servidor Metro (por defecto en el puerto `8081`).
2. **Android**: Abre la aplicación **Expo Go**, presiona la opción **"Scan QR Code"** y apunta la cámara a la terminal.
3. **iOS**: Abre la aplicación de **Cámara nativa**, enfoca el código QR y presiona la notificación emergente para abrirlo en Expo Go.

---

## 4. 🌐 Modos Alternativos de Ejecución

### Modo Túnel (Recomendado si hay problemas de red)
Si la computadora y el teléfono están en redes distintas, utilizas datos móviles o el router bloquea la conexión local:

```bash
npx expo start --tunnel
```

### Modo Limpieza de Caché
Si realizaste modificaciones en dependencias o notas comportamientos desactualizados del bundler Metro:

```bash
npx expo start -c
```

### Modo Web
Para probar rápidamente la interfaz en el navegador web de tu equipo de desarrollo:

```bash
npx expo start --web
```

---

## 5. 🛠️ Solución de Problemas Frecuentes

### 1. Error de red o "Could not connect to development server"
- Asegúrate de que tu PC y el dispositivo móvil estén conectados a la **misma red Wi-Fi**.
- En Windows, verifica que tu perfil de red esté configurado como **Red Privada** (las redes Públicas bloquean los puertos entrantes mediante Windows Defender Firewall).
- Como solución inmediata, inicia con `npx expo start --tunnel`.

### 2. "Project is incompatible with this version of Expo Go"
- Expo Go en tu celular debe estar actualizado y soportar **SDK 54**.
- Comprueba el estado del entorno ejecutando:
  ```bash
  npx expo-doctor
  ```

### 3. Error de caché o módulos residuales
- Detén la terminal con `Ctrl + C`.
- Ejecuta `npx expo start -c` para invalidar la caché de Metro.
