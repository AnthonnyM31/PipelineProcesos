# Universidad de las Americas
# Facultad de Ingenieria y Ciencias Aplicadas
# Materia: Procesos de Software

---

# INFORME FINAL DE PRACTICA
## Configuracion de un Pipeline de Entrega Continua con Estrategias de Optimizacion

**Integrantes:**
- Anthonny Mosquera
- Sebastian Vallejo

**Repositorio del Proyecto:**
https://github.com/AnthonnyM31/PipelineProcesos.git

**Fecha de Entrega:**
Octubre de 2026

---

## 1. Introduccion y Objetivos

### 1.1 Introduccion
En el marco del desarrollo moderno de software y las practicas de DevOps, la integracion continua y la entrega continua constituyen pilares fundamentales para garantizar la calidad, seguridad y velocidad de liberacion de aplicaciones. Un pipeline automatizado no solo reduce el error humano al compilar y probar codigo, sino que su eficiencia impacta directamente en el tiempo de retroalimentacion hacia los desarrolladores.

La optimizacion de pipelines busca acelerar estos flujos mediante tecnicas como la ejecucion concurrente de tareas independientes, el almacenamiento en cache de dependencias pesadas, la ejecucion selectiva segun la naturaleza de los cambios y la organizacion modular del codigo de infraestructura.

### 1.2 Objetivos de la Practica
- Configurar un pipeline de entrega continua robusto y automatizado para un proyecto funcional no trivial denominado inventario-api.
- Aplicar la estrategia de branching Trunk Based Development como mecanismo agil de integracion de caracteristicas.
- Integrar etapas obligatorias de construccion, verificacion de estilo, pruebas unitarias de API, pruebas funcionales con navegador web, analisis de calidad estatico y despliegue continuo.
- Implementar bloques post con envio automatico de notificaciones hacia la API de GitHub para registrar el estado de cada commit.
- Aplicar de manera practica y comprobable cuatro estrategias clave de optimizacion: ejecucion paralela, cache de dependencias, ejecucion selectiva y pipelines modulares reutilizables.

---

## 2. Arquitectura de la Solucion

### 2.1 Proyecto Base Funcional: inventario-api
El proyecto base consiste en una API REST desarrollada con Node.js y el framework Express para la gestion integral de inventario de instrumentos musicales:
- Servidor HTTP con endpoints REST para consultar salud del servicio, listar instrumentos, filtrar por categoria, consultar por identificador, registrar nuevos elementos, actualizar y eliminar.
- Interfaz web estatica servida en public/index.html para presentar la lista de instrumentos en el navegador y validar la respuesta del servidor mediante consumo asincrono de la API.
- Suite de pruebas automatizadas con Jest y Supertest garantizando el 100 por ciento de cobertura de lineas en src/app.js.
- Pruebas funcionales de interfaz con Selenium WebDriver en modo Chrome headless para validar el renderizado real de la pagina y la carga dinamica del catalogo.
- Analisis de estilo y buenas practicas con ESLint.
- Analisis de calidad estatico configurado mediante sonar-project.properties.

### 2.2 Entorno de Ejecucion y Orquestador
- Motor de orquestacion: Jenkins ejecutandose sobre sistema operativo Windows.
- Interprete de comandos: PowerShell nativo para garantizar compatibilidad con comandos y scripts del sistema operativo anfitrion.
- Control de versiones: Git conectado con el repositorio remoto alojado en GitHub.

### 2.3 Estrategia de Branching: Trunk Based Development
Se adopto Trunk Based Development como estrategia central:
- Rama main como tronco unico: Es la linea base de verdad donde todo el codigo se mantiene en estado desplegable y listo para produccion.
- Ramas de caracteristica de corta duracion: Ramas temporales creadas para modificaciones puntuales, con una vida util menor a dos dias antes de integrarse a main.
- Reglas de activacion en el pipeline:
  - En ramas de caracteristica: Se ejecutan las validaciones de calidad y empaquetado.
  - En la rama main: Se ejecutan todas las validaciones previas, el analisis estatico de Sonar, el empaquetado, el despliegue automatico a staging y la compuerta de aprobacion manual para despliegue a produccion.

---

## 3. Descripcion de las Etapas del Pipeline

### 3.1 Etapa de Checkout y Carga Dinamica de Modulos
En esta etapa el pipeline descarga la revision correspondiente desde GitHub y realiza la carga dinamica de los modulos externos ci/stages.groovy y ci/notify.groovy. De inmediato se emite una notificacion a la API de GitHub marcando el estado del commit como pending con la descripcion Build en curso.

### 3.2 Etapa de Instalacion de Dependencias con Cache
Se restauran los paquetes de node_modules utilizando el plugin Job Cacher de Jenkins. Si el archivo package-lock.json no ha sufrido modificaciones, el directorio se recupera del almacenamiento local en pocos segundos, ejecutando a continuacion npm ci con banderas de optimizacion que omiten auditorias y descargas innecesarias.

### 3.3 Etapa de Calidad de Codigo
Esta etapa agrupa cuatro controles de calidad ejecutados en paralelo:
- Lint ESLint: Verifica el cumplimiento estricto de las reglas de sintaxis y convenciones de estilo de JavaScript.
- Tests unitarios Jest: Ejecuta las pruebas automatizadas de la API, recopilando la cobertura de codigo y generando el reporte estandarizado junit.xml para su visualizacion en Jenkins.
- Pruebas funcionales Selenium: Levanta una instancia de la aplicacion e inicia Chrome headless mediante Selenium WebDriver para inspeccionar la tabla de instrumentos en el DOM.
- Auditoria de dependencias: Examina vulnerabilidades de seguridad de nivel alto o critico en los paquetes instalados.

### 3.4 Etapa de SonarQube
Verifica la presencia y validez del archivo sonar-project.properties, registrando las claves de proyecto, fuentes de analisis y ruta de reportes de cobertura LCOV.

### 3.5 Etapa de Build
Ejecuta el script scripts/build.js que limpia y genera la carpeta de distribucion dist/, copiando los archivos fuente de codigo, la interfaz web estatica y el archivo de manifiesto package.json. Al finalizar archiva los artefactos en Jenkins con sus respectivas firmas digitales.

### 3.6 Etapa de Deploy a Staging
Ejecuta de manera automatica el script nativo de PowerShell scripts/deploy.ps1 con el argumento staging, validando la integridad fisica de los artefactos antes de confirmar el despliegue.

### 3.7 Etapa de Deploy a Produccion con Aprobacion Manual
Implementa una compuerta de seguridad con la directiva input de Jenkins. El pipeline detiene el avance hasta que un operador humano presiona el boton Desplegar, ejecutando inmediatamente el script de despliegue con el parametro produccion.

### 3.8 Bloque Post y Notificaciones Automaticas
- always: Archiva de manera permanente los reportes de pruebas JUnit y los reportes de cobertura HTML.
- success: Envia una notificacion de estado success con la descripcion Build exitoso hacia la API de GitHub.
- failure: Envia una notificacion de estado failure con la descripcion Build fallido hacia la API de GitHub si alguna etapa falla.

---

## 4. Implementacion de las Cuatro Estrategias de Optimizacion

### 4.1 Optimizacion 1: Ejecucion Paralela
- Justificacion: Ejecutar las pruebas unitarias, el analisis de linter, las pruebas funcionales de Selenium y la auditoria de dependencias de forma secuencial acumula los tiempos de cada herramienta.
- Solucion tecnica: Uso del bloque parallel dentro de la etapa de calidad de codigo en Jenkinsfile.
- Impacto: Las cuatro tareas se ejecutan al mismo tiempo, reduciendo el tiempo total de la etapa de calidad al tiempo de la tarea mas lenta.

### 4.2 Optimizacion 2: Cache de Dependencias
- Justificacion: La descarga e instalacion de dependencias externas desde repositorios publicos es uno de los pasos mas lentos y propensos a fallos de red en un pipeline.
- Solucion tecnica: Integracion de la directiva cache mediante el plugin Job Cacher en ci/stages.groovy, asociando la clave de validez al hash criptografico del archivo package-lock.json.
- Impacto: En el build numero 4 el cache de node_modules se restauro en exactamente 3274 milisegundos, evitando volver a descargar cientos de paquetes.

### 4.3 Optimizacion 3: Ejecucion Selectiva por Ramas y Etapas
- Justificacion: Ejecutar la totalidad de las pruebas y despliegues ante cualquier commit, incluso cuando solo se modifica documentacion, desperdicia recursos computacionales.
- Solucion tecnica:
  - Filtro por tipo de archivo: La funcion hayCambiosDeCodigo analiza mediante git diff los archivos modificados. Si un commit en una rama de caracteristica solo altera archivos con extension .md o en la carpeta docs, las etapas de calidad se omiten por completo.
  - Filtro por rama: Las etapas de SonarQube, despliegue automatico a staging y compuerta de aprobacion hacia produccion unicamente se activan en la rama main.
- Impacto: Ahorro significativo de tiempo en ramas de caracteristica y proteccion absoluta de los entornos productivos.

### 4.4 Optimizacion 4: Pipelines Modulares y Reutilizables
- Justificacion: Mantener miles de lineas de logica en un unico Jenkinsfile dificulta la lectura, el mantenimiento y la reutilizacion en otros proyectos de la organizacion.
- Solucion tecnica: Separacion de responsabilidades en modulos Groovy independientes:
  - ci/stages.groovy: Contiene la logica de cada etapa tecnica.
  - ci/notify.groovy: Contiene la logica de comunicacion y envio de estados a la API de GitHub.
- Impacto: El Jenkinsfile principal queda reducido a un orquestador declarativo limpio, legible y facilmente extensible.

---

## 5. Tabla de Metricas y Resultados de Ejecucion

| Metrica o Indicador | Valor Obtenido | Estado |
| :--- | :--- | :--- |
| Cobertura de codigo en src/app.js | 100 por ciento de lineas | Cumplido |
| Pruebas unitarias de API con Jest | 7 de 7 pruebas exitosas | Cumplido |
| Pruebas funcionales con Selenium | Ejecucion correcta en Chrome headless | Cumplido |
| Analisis de estilo con ESLint | 0 errores y 0 advertencias | Cumplido |
| Tiempo de restauracion de cache | 3274 milisegundos | Optimizado |
| Tiempo de ejecucion de calidad paralela | Menos de 4 segundos | Optimizado |
| Resultado final del build numero 4 | Finished: SUCCESS | Exitoso |
| Notificacion enviada a GitHub | Contexto jenkins/ci en verde | Exitoso |

---

## 6. Conclusiones y Recomendaciones

### 6.1 Conclusiones
- Se logro implementar con exito un pipeline de entrega continua profesional sobre Jenkins en Windows, cumpliendo con la totalidad de los requerimientos de la catedra.
- Las cuatro estrategias de optimizacion demostraron una reduccion tangible en los tiempos de construccion, evidenciada por la restauracion de dependencias en 3.2 segundos y la ejecucion simultanea de pruebas y estilo.
- La integracion de Selenium WebDriver con Chrome headless permitio validar la aplicacion web a nivel de interfaz de usuario sin necesidad de una sesion grafica interactiva.
- La estrategia Trunk Based Development agiliza la entrega al mantener main en estado desplegable continuo, protegiendo produccion mediante una compuerta manual de aprobacion.

### 6.2 Recomendaciones
- Mantener siempre actualizado el archivo package-lock.json para asegurar la coherencia en la invalidacion del cache.
- Incorporar en futuros incrementos pruebas de rendimiento con herramientas como k6 o Lighthouse dentro de las ramas paralelas de calidad.
