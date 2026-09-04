# 📱 Guía Base y Configuración para los Trabajos Prácticos (TPs)

## 1. ⚙️ Versiones del Entorno y Compatibilidad

Para evitar los clásicos errores de *"Project is incompatible with this version of Expo Go"* o fallos de compilación:

| Componente | Versión en TP1 | Notas importantes |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` (Recomendado: `20.18.0` LTS) | Node 20 LTS es la versión más estable para este SDK. |
| **npm** | `10.8.x` | Gestor de paquetes oficial. |
| **Expo SDK** | **`~54.0.0`** (actual: `54.0.37`) | SDK oficial del proyecto. |
| **React** | `19.1.0` | Sincronizado con React Native 0.81. |
| **React Native** | `0.81.0` | Versión nativa manejada por Expo SDK 54. |
| **TypeScript** | `~5.5.3` (actual: `5.5.4`) | Configurado con tipado estricto (`strict: true`). |
| **Expo Go (Celular)** | **Versión compatible con SDK 54** | Mira en tu celular: abajo en la pantalla principal de Expo Go debe decir compatible con **SDK 54**. |

> [!IMPORTANT]
> **Regla de oro de Expo Go:**
> La app Expo Go en tu teléfono tiene que ser compatible con **SDK 54**.
> - Si Expo Go en tu celular te pide otra versión, siempre podés verificar con:
>   ```bash
>   npx expo doctor
>   ```
> - Para corregir versiones desfasadas automáticamente en cualquier TP:
>   ```bash
>   npx expo install --fix
>   ```

---

## 2. 📦 Dependencias Base Comunes

Cuando crees un nuevo TP o necesites agregar librerías nativas, **NUNCA** uses `npm install <libreria-nativa>`. Usá siempre **`npx expo install`**, ya que Expo seleccionará automáticamente la versión testeada para SDK 54.

### Paquetes instalados en TP1:

```bash
# 1. Íconos vectoriales (Ionicons, MaterialIcons, etc.):
npx expo install @expo/vector-icons

# 2. Almacenamiento local persistente (Base de datos local clave-valor):
npx expo install @react-native-async-storage/async-storage

# 3. Control de la barra de estado del celular:
npx expo install expo-status-bar
```

### Versiones exactas en `package.json`:
```json
"dependencies": {
  "expo": "~54.0.0",
  "expo-status-bar": "~2.0.1",
  "react": "19.1.0",
  "react-native": "0.81.0",
  "@react-native-async-storage/async-storage": "1.24.0",
  "@expo/vector-icons": "^14.0.4"
},
"devDependencies": {
  "@types/react": "^19.1.0",
  "typescript": "~5.5.3"
}
```

---

## 3. 🚀 Cómo Iniciar un Nuevo TP desde Cero

Para inicializar por ejemplo el **Tp_2** o futuros TPs manteniendo esta misma base:

### Paso 1: Crear el proyecto con TypeScript
```bash
npx create-expo-app@latest NombreDelTP --template blank-typescript
```

### Paso 2: Instalar dependencias esenciales
```bash
cd NombreDelTP
npx expo install @expo/vector-icons @react-native-async-storage/async-storage expo-status-bar
```

### Paso 3: Verificar salud del proyecto
```bash
npx expo doctor
```

---

## 4. 📄 Archivos de Configuración Esenciales

### A. `tsconfig.json`
Mantiene la compatibilidad con el compilador de Expo y tipado estricto:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

### B. `index.ts` (Punto de entrada)
```typescript
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

### C. `app.json` (Configuración de Expo y Android/iOS)
```json
{
  "expo": {
    "name": "NombreDelTP",
    "slug": "nombredeltp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

## 5. 📂 Estructura de Carpetas Recomendada (Patrón TP1)

```text
NombreDelTP/
├── assets/                 # Imágenes, logos, íconos
├── src/
│   ├── components/         # Componentes modulares (UI reutilizable)
│   ├── hooks/              # Custom hooks (e.g. useThemeStyles.ts)
│   ├── types/              # Definiciones TypeScript e interfaces (e.g. models)
│   └── utils/              # Funciones auxiliares o helpers de storage
├── App.tsx                 # Contenedor principal con navegación y estado global
├── index.ts                # Registro raíz de Expo
├── app.json                # Configuración de Expo
├── package.json            # Scripts y dependencias
└── tsconfig.json           # Configuración TypeScript
```

---

## 6. 💡 Buenas Prácticas y Patrones Clave de TP1

### 1. Manejo Seguro del Status Bar en Android
En Android, el notch y la barra superior pueden tapar tu app. Usá siempre este ajuste en el estilo de tu `SafeAreaView` o contenedor principal:
```typescript
import { Platform, StatusBar as RNStatusBar, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 40 : 0,
  },
});
```

### 2. Animaciones de Layout en Android
Si usás `LayoutAnimation` para transiciones suaves al agregar/eliminar elementos (como en listas):
```typescript
import { Platform, UIManager, LayoutAnimation } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Al actualizar un estado:
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
```

### 3. Patrón de Temas (Modo Claro / Oscuro)
Definir la paleta centralizada en `src/hooks/useThemeStyles.ts` para que todos los componentes cambien de tema limpiamente sin código duplicado.

### 4. Uso de AsyncStorage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mi_clave_storage';

// Guardar
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(datos));

// Leer
const json = await AsyncStorage.getItem(STORAGE_KEY);
const datos = json ? JSON.parse(json) : [];
```

---

## 7. 🛠️ Comandos de Ejecución y Solución de Problemas

| Acción | Comando |
| :--- | :--- |
| **Iniciar servidor Expo** | `npx expo start` |
| **Iniciar limpiando caché** *(útil si algo se traba)* | `npx expo start -c` |
| **Iniciar en modo túnel** *(si el cel y la PC no están en la misma red Wi-Fi)* | `npx expo start --tunnel` |
| **Abrir en navegador web** | `npx expo start --web` |
| **Comprobar conflictos de versiones** | `npx expo doctor` |
| **Reparar paquetes a versiones compatibles** | `npx expo install --fix` |

> [!TIP]
> **¿No conecta el celular con el QR?**
> 1. Asegurate de que la PC y el celular estén conectados a la **misma red Wi-Fi** y que la red no esté configurada como "Pública" en Windows (el firewall puede bloquear el puerto 8081).
> 2. Si sigue sin conectar o usás datos móviles, ejecutá `npx expo start --tunnel`.

# 🤖 INSTRUCCIONES Y GUÍA BASE DE DESARROLLO PARA AGENTES DE IA (TPs MOBILE)
> **PROPÓSITO DEL DOCUMENTO:**  
> Este documento define las directivas técnicas obligatorias, restricciones de código, versiones compatibles y entregables que **TODO AGENTE DE INTELIGENCIA ARTIFICIAL** debe cumplir estrictamente al generar, estructurar o modificar Trabajos Prácticos (TPs) de React Native con Expo en este repositorio.
---
## 🛑 REGLAS ESTRICTAS PARA EL AGENTE (CONSTRAINTS)
### 1. Nombres de Carpetas y Archivos 100% Representativos
* **Nombres semánticos y descriptivos:** Toda carpeta y archivo debe indicar con absoluta claridad su responsabilidad única.
* **PROHIBIDO usar nombres vagos o genéricos:** No utilices nombres como `temp/`, `data/`, `stuff/`, `misc/`, `cosas/`, `componentes1/`, `folder/`, `test/`.
* **Convenciones de nomenclatura:**
  * **Carpetas de módulos/funcionalidades:** Nombres descriptivos en minúsculas con camelCase o kebab-case semántico (ej: `checkout/`, `productCatalog/`, `orderSummary/`, `cartState/`).
  * **Componentes React:** PascalCase representativo de su función visual (ej: `CheckoutSummaryCard.tsx`, `CartItemRow.tsx`, `PaymentMethodSelector.tsx`).
  * **Custom Hooks:** camelCase con prefijo `use` representativo (ej: `useCartStorage.ts`, `useThemeStyles.ts`, `useCheckoutFlow.ts`).
  * **Tipos e Interfaces:** camelCase o PascalCase con sufijo `.types.ts` (ej: `cart.types.ts`, `checkout.types.ts`).
### 2. PROHIBIDO Comentarios Típicos de IA en el Código
* **Cero comentarios redundantes u obvios:** No incluyas comentarios como `// Import React`, `// Hook to get state`, `// Function that handles submit`, `// Return JSX`, `// Generated by AI assistant`, `// Here we define styles`.
* El código debe ser **autodocumentado**, limpio, legible y profesional (Clean Code).
* **Única excepción:** Comentarios breves y estrictamente técnicos cuando se trate de configuraciones nativas no evidentes (ej: flags experimentales en Android como `UIManager.setLayoutAnimationEnabledExperimental`).
### 3. Entregables Obligatorios de Documentación en CADA TP
Cada Trabajo Práctico que el agente desarrolle debe incluir **obligatoriamente dos archivos Markdown** en la raíz de su carpeta:
1. **`COMO_EJECUTAR.md`**:
   * Requisitos previos del sistema (Node.js 20+, versión de Expo Go en el móvil compatible con SDK 54).
   * Comandos de instalación de dependencias.
   * Pasos detallados para levantar el entorno (`npx expo start`, escaneo de código QR, uso de flag `--tunnel` si las redes no coinciden).
   * Guía rápida de solución de problemas comunes (limpieza de caché `-c`, firewall de Windows, reconexión).
2. **`ARQUITECTURA.md`**:
   * Árbol de carpetas completo y representativo del TP.
   * Explicación detallada de **cada una de las carpetas** y qué rol cumple en el proyecto.
   * Explicación de **cómo funciona el flujo del código**: desde la entrada en `App.tsx`, el paso de datos entre componentes, la gestión del estado global/local y la persistencia en almacenamiento.
---
## ⚙️ ESPECIFICACIÓN TÉCNICA Y VERSIONES OBLIGATORIAS (STACK BASE TP1)
El entorno base validado en **TP1** debe replicarse exactamente en los siguientes TPs para asegurar que corran sin errores de compatibilidad:
| Componente / Herramienta | Versión Obligatoria | Justificación / Restricción |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` (ej: `v20.18.0` LTS) | Entorno de ejecución estándar y estable. |
| **npm** | `10.8.x` | Gestor de paquetes oficial. |
| **Expo SDK** | **`~54.0.0`** (actual: `54.0.37`) | SDK oficial del proyecto. |
| **React Native** | **`0.81.0`** | Versión nativa correspondiente a Expo SDK 54. |
| **React** | **`19.1.0`** | Versión soportada por React Native 0.81. |
| **TypeScript** | **`~5.5.3`** (actual: `5.5.4`) | Modo estricto activado (`"strict": true`). |
| **App Expo Go (Celular)** | **Compatible con SDK 54** | El cliente móvil instalado en el teléfono debe coincidir con SDK 54. |
> [!CRITICAL]
> **REGLA DE INSTALACIÓN DE DEPENDENCIAS PARA EL AGENTE:**  
> **NUNCA** uses `npm install <paquete-nativo>` para librerías que toquen código nativo o de Expo.  
> Usa **SIEMPRE**:
> ```bash
> npx expo install <nombre-del-paquete>
> ```
> Esto garantiza que Expo instale la versión exacta testeada para SDK 54.
---