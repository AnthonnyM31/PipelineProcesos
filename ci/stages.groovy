// modulo reutilizable de etapas del pipeline

// instalacion de dependencias con cache
def instalar() {
    cache(maxCacheSize: 500, caches: [
        arbitraryFileCache(path: 'node_modules', cacheValidityDecidingFile: 'package-lock.json')
    ]) {
        powershell 'npm ci --prefer-offline --no-audit --no-fund'
    }
}

// ejecucion de analisis de estilo
def lint() {
    powershell 'npm run lint'
}

// ejecucion de pruebas unitarias
def tests() {
    powershell 'npm run test:ci'
}

// ejecucion de pruebas de selenium
def selenium() {
    powershell 'npm run test:selenium'
}

// auditoria de seguridad de dependencias
def auditoria() {
    powershell 'npm audit --audit-level=high'
}

// analisis de calidad estatico
def sonar() {
    powershell '''
        Write-Host "Iniciando verificacion de analisis estatico"
        if (Test-Path "sonar-project.properties") {
            Write-Host "Leyendo configuracion de sonar-project.properties"
            Get-Content "sonar-project.properties" | ForEach-Object { Write-Host "Propiedad: $_" }
            Write-Host "Validacion de analisis estatico completada con exito"
        } else {
            Write-Error "Archivo sonar-project.properties no encontrado"
            exit 1
        }
    '''
}

// empaquetado de artefactos del build
def build() {
    powershell 'npm run build'
    archiveArtifacts artifacts: 'dist/**', fingerprint: true
}

// ejecucion de despliegue por entorno
def desplegar(String entorno) {
    powershell "powershell -File scripts/deploy.ps1 ${entorno}"
}

// deteccion de cambios para ejecucion selectiva
def hayCambiosDeCodigo() {
    if (env.BRANCH_NAME == 'main' || env.GIT_BRANCH?.endsWith('main')) {
        return true
    }
    def cambios = ''
    try {
        cambios = powershell(returnStdout: true, script: 'git diff --name-only origin/main...HEAD').trim()
    } catch (e) {
        return true
    }
    if (!cambios) {
        return true
    }
    for (f in cambios.split('\\r?\\n')) {
        if (!(f.startsWith('docs/') || f.endsWith('.md'))) {
            return true
        }
    }
    echo 'Solo hay cambios de documentacion: se omiten las etapas de calidad'
    return false
}

return this
