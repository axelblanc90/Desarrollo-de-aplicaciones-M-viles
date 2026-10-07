#  Network QoS Monitor & Field Hardware Auditor (TP5)
### Licenciatura en Sistemas de Información — Desarrollo de Aplicaciones Móviles 2026
**Facultad de Ciencia y Tecnología (FCyT)**

---

##  Descripción del Proyecto

Aplicación móvil nativa multiplataforma desarrollada en **React Native** (TypeScript) diseñada para técnicos e ingenieros de campo en redes y telecomunicaciones. La solución integra auditoría de infraestructura in situ, telemetría SNMP/SSH, benchmark de calidad de servicio (QoS) en tiempo real con georreferenciación satelital y operación 100% **Offline-First**.

---

##  Arquitectura de 6 Capas

El proyecto está organizado de manera modular según los requerimientos de la cátedra:

```
Tp_5/
├── App.tsx                     # Shell principal con Tab Navigation y Monitor de red
├── index.js                    # Punto de entrada de la aplicación
├── package.json                # Dependencias móviles del proyecto
├── tsconfig.json               # Configuración de TypeScript
├── backend/                    # Backend de referencia (QoS + SNMP + Sync API)
│   ├── server.js               # Servidor Express + Agente SNMP UDP 161
│   ├── package.json
│   ├── Dockerfile              # Contenedor Linux con snmpd y OpenSSH
│   └── docker-compose.yml
├── src/
│   ├── layers/
│   │   ├── discovery/          # CAPA 1: Escaneo ARP, Zeroconf mDNS/Bonjour y DNS
│   │   ├── protocol/           # CAPA 2: Cliente SNMP (UDP 161), Parser ASN.1 BER, SSH y QoS
│   │   ├── evidence/           # CAPA 3: Scanner QR, Cámara y Georreferenciación GPS
│   │   ├── storage/            # CAPA 4: WatermelonDB (SQLite) y Hardware Keychain
│   │   ├── sync/               # CAPA 5: NetInfo y Motor de Sincronización en Segundo Plano
│   │   └── reporting/          # CAPA 6: Plantilla HTML y Generador de PDF nativo
│   ├── components/             # Componentes visuales (StatusBar, LiveTerminal, Heatmap, MetricCard)
│   ├── screens/                # Pantallas del flujo de campo
│   ├── state/                  # useAppStore (Zustand reactive store)
│   └── theme/                  # Tokens de diseño y colores
├── ARQUITECTURA.md             # Documentación exhaustiva de la arquitectura y flujo
├── COMO_EJECUTAR.md            # Guía paso a paso para ejecutar Backend y App Móvil
└── GUIA_DEFENSA_PROFESOR.md    # Preguntas típicas, teoría y guion de defensa ante la cátedra
```

---

##  Inicio Rápido

### 1. Iniciar el Backend
```bash
cd backend
npm install
npm start
```
*El backend quedará escuchando en `http://0.0.0.0:3001` (QoS & Sync) y en `UDP 161` (SNMP).*

### 2. Iniciar la App Móvil
```bash
# En la raíz del proyecto:
npm install
npm start
# En otra terminal:
npm run android    # o npm run ios
```

---

##  Documentación Técnica Detallada

Para comprender a fondo la solución y defenderla ante el profesor, consulta los documentos complementarios:
- [COMO_EJECUTAR.md](file:///c:/Users/usr/Desktop/programacion%20movil/Tp_5/COMO_EJECUTAR.md): Manual paso a paso de instalación, configuración y pruebas de cada funcionalidad.
- [ARQUITECTURA.md](file:///c:/Users/usr/Desktop/programacion%20movil/Tp_5/ARQUITECTURA.md): Explicación técnica de las 6 capas, diagramas Mermaid, parser ASN.1 BER y estrategia Offline-First.
- [GUIA_DEFENSA_PROFESOR.md](file:///c:/Users/usr/Desktop/programacion%20movil/Tp_5/GUIA_DEFENSA_PROFESOR.md): Guion para la presentación, conceptos clave de redes (ARP vs IP, MIB, sockets vs ICMP, Jitter RFC 3550) y las 10 preguntas clave de examen.
