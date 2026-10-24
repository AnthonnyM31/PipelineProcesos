// Módulo reutilizable con las etapas del pipeline
// Se carga desde el Jenkinsfile con: etapas = load 'ci/stages.groovy'

def instalar() {
    // Caché de node_modules claveada por el hash de package-lock.json
    cache(maxCacheSize: 500, caches: [
        arbitraryFileCache(path: 'node_modules', cacheValidityDecidingFile: 'package-lock.json')
    ]) {
        sh 'npm ci --prefer-offline --no-audit --no-fund'
    }
}

def lint() {
    sh 'npm run lint'
}

def tests() {
    sh 'npm run test:ci'
}

def auditoria() {
    // Falla solo con vulnerabilidades altas o críticas
    sh 'npm audit --audit-level=high'
}

def sonar() {
    withSonarQubeEnv('sonarqube') {
        sh "${tool 'sonar-scanner'}/bin/sonar-scanner"
    }
}

def build() {
    sh 'npm run build'
    archiveArtifacts artifacts: 'dist/**', fingerprint: true
}

def desplegar(String entorno) {
    sh "./scripts/deploy.sh ${entorno}"
}

// Ejecución selectiva: devuelve false si los cambios son solo documentación (*.md o docs/)
def hayCambiosDeCodigo() {
    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'develop') {
        return true
    }
    def cambios = ''
    try {
        cambios = sh(returnStdout: true, script: 'git diff --name-only origin/develop...HEAD || git diff --name-only HEAD~1').trim()
    } catch (e) {
        return true
    }
    if (!cambios) {
        return true
    }
    for (f in cambios.split('\n')) {
        if (!(f.startsWith('docs/') || f.endsWith('.md'))) {
            return true
        }
    }
    echo 'Solo hay cambios de documentación: se omiten las etapas de calidad'
    return false
}

return this
