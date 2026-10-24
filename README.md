# inventario-api — Pipeline de Entrega Continua en Jenkins

Práctica grupal · **Procesos de Software**  
**Integrantes:** Sebastián Vallejo y Anthonny Mosquera

API REST construida con **Node.js** y **Express** para gestionar un inventario de instrumentos musicales, acompañada de un pipeline declarativo y modular en **Jenkins** bajo una estrategia **GitFlow simplificado** y cuatro estrategias de optimización.

## Estructura del Proyecto para Visual Studio Code

```text
inventario-api/
├── .vscode/
│   ├── extensions.json        # Extensiones sugeridas para VS Code (ESLint, Jest, Groovy)
│   └── settings.json          # Asociación de sintaxis para Jenkinsfile y *.groovy
├── ci/
│   ├── stages.groovy          # Módulo reutilizable con las etapas del pipeline
│   └── notify.groovy          # Módulo reutilizable de notificaciones (GitHub API y Telegram)
├── scripts/
│   ├── build.js               # Empaqueta el código productivo en dist/
│   └── deploy.sh              # Script de despliegue por entorno (staging / produccion)
├── src/
│   ├── app.js                 # Endpoints REST (/health, /instrumentos, /instrumentos/:id)
│   └── server.js              # Punto de entrada HTTP
├── tests/
│   └── app.test.js            # 7 pruebas automatizadas con Jest + Supertest (100% cobertura)
├── .eslintrc.json             # Reglas de estilo con ESLint
├── Jenkinsfile                # Orquestador del pipeline declarativo
├── package.json               # Scripts y dependencias
└── sonar-project.properties   # Configuración para SonarQube Scanner
```

## Comandos locales (para probar en la terminal de VS Code)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Ejecutar el linter (ESLint):**
   ```bash
   npm run lint
   ```
3. **Ejecutar las 7 pruebas y ver el 100 % de cobertura:**
   ```bash
   npm test
   ```
4. **Ejecutar pruebas en modo CI (genera `reports/junit.xml`):**
   ```bash
   npm run test:ci
   ```
5. **Generar el build (`dist/`):**
   ```bash
   npm run build
   ```
6. **Levantar el servidor localmente:**
   ```bash
   npm start
   ```
