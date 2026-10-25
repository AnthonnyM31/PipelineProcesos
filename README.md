# inventario-api: Pipeline de Entrega Continua en Jenkins

Practica grupal de Procesos de Software.
Integrantes: Sebastian Vallejo y Anthonny Mosquera.

API REST construida con Node.js y Express para gestionar un inventario de instrumentos musicales, acompaniada de una interfaz web estatica y un pipeline declarativo y modular en Jenkins bajo la estrategia Trunk Based Development con cuatro estrategias de optimizacion activas.

## Estructura del Proyecto

```text
inventario-api/
├── .vscode/
│   ├── extensions.json        # Extensiones sugeridas para VS Code
│   └── settings.json          # Asociacion de sintaxis para Jenkinsfile y groovy
├── ci/
│   ├── stages.groovy          # Modulo reutilizable con las etapas del pipeline
│   └── notify.groovy          # Modulo reutilizable de notificaciones a GitHub API
├── public/
│   └── index.html             # Interfaz web para pruebas funcionales con navegador
├── scripts/
│   ├── build.js               # Empaqueta el codigo productivo en dist/
│   ├── deploy.ps1             # Script de despliegue por entorno en PowerShell
│   └── deploy.sh              # Script de despliegue alternativo para bash
├── src/
│   ├── app.js                 # Endpoints REST y servidor de archivos estaticos
│   └── server.js              # Punto de entrada HTTP
├── tests/
│   ├── app.test.js            # Pruebas automatizadas con Jest y Supertest
│   └── selenium.test.js       # Pruebas funcionales con Selenium WebDriver y Chrome headless
├── .eslintrc.json             # Reglas de estilo con ESLint
├── Jenkinsfile                # Orquestador del pipeline declarativo
├── package.json               # Scripts y dependencias del proyecto
└── sonar-project.properties   # Configuracion para SonarQube Scanner
```

## Estrategia de Branching: Trunk Based Development

El proyecto adopta Trunk Based Development como estrategia de control de versiones:
- Tronco principal main: Representa la linea base de verdad y el estado productivo o listo para entrega continua.
- Ramas de vida corta: Ramas feature creadas a partir de main con duracion menor a dos dias, integradas rapidamente tras superar las validaciones automatizadas.
- Comportamiento del pipeline:
  - En ramas secundarias: Se ejecutan las etapas de instalacion con cache, analisis de estilo, pruebas unitarias, pruebas de Selenium y empaquetado.
  - En la rama main: Se ejecutan todas las validaciones previas, el analisis estatico obligatorio con SonarQube, el despliegue automatico hacia staging y la aprobacion manual para despliegue hacia produccion.

## Estrategias de Optimizacion Aplicadas

### 1. Ejecucion Paralela
Dentro de la etapa Calidad de codigo se ejecutan de manera concurrente tres tareas independientes:
- Analisis de estilo con ESLint.
- Pruebas unitarias y de integracion de API con Jest, generando reporte JUnit y cobertura.
- Pruebas funcionales de navegacion con Selenium WebDriver en Chrome headless.
- Auditoria de seguridad de dependencias con npm audit.

### 2. Cache
Se implementa almacenamiento en cache para el directorio node_modules mediante la directiva cache de Jenkins. La clave de validez se asocia al archivo package-lock.json, permitiendo descargas rapidas y reutilizacion entre builds sucesivos.

### 3. Ejecucion Selectiva
El pipeline aplica filtros en dos niveles:
- Por tipo de archivo modificado: Mediante la funcion hayCambiosDeCodigo en ci/stages.groovy, si un commit en una rama de caracteristica solo modifica archivos de documentacion en docs o archivos con extension .md, las etapas de calidad se omiten automaticamente ahorrando tiempo de computo.
- Por rama: Las etapas de SonarQube, despliegue automatico a staging y compuerta de aprobacion hacia produccion se activan exclusivamente en la rama main.

### 4. Pipelines Modulares y Reutilizables
La logica operativa se encuentra desacoplada del orquestador principal:
- ci/stages.groovy: Contiene la definicion de cada etapa tecnica, aislando la sintaxis de comandos y herramientas del flujo principal.
- ci/notify.groovy: Modulo independiente para la comunicacion con la API de GitHub y emision de estados.

## Bloques Post y Notificaciones

El pipeline cuenta con bloques post configurados para los diferentes estados de cierre:
- always: Archiva de manera permanente los reportes de pruebas JUnit en reports/ y los reportes de cobertura en coverage/.
- success: Envia una notificacion automatica hacia la API de GitHub marcando el commit como exitoso con contexto jenkins/ci.
- unstable: Envia una notificacion de advertencia hacia la API de GitHub.
- failure: Envia una notificacion de fallo hacia la API de GitHub indicando el estado del build.

## Comandos Locales en Terminal de Windows

1. Instalar dependencias:
   ```powershell
   npm install
   ```
2. Ejecutar el linter ESLint:
   ```powershell
   npm run lint
   ```
3. Ejecutar pruebas unitarias con Jest y cobertura al 100%:
   ```powershell
   npm test
   ```
4. Ejecutar pruebas unitarias en modo CI con reporte JUnit:
   ```powershell
   npm run test:ci
   ```
5. Ejecutar pruebas funcionales con Selenium WebDriver:
   ```powershell
   npm run test:selenium
   ```
6. Generar el empaquetado de distribucion en dist:
   ```powershell
   npm run build
   ```
7. Probar script de despliegue en staging:
   ```powershell
   powershell -File scripts/deploy.ps1 staging
   ```
8. Iniciar el servidor localmente:
   ```powershell
   npm start
   ```
