// Pipeline de entrega continua - inventario-api
// Estrategia de branching: GitFlow simplificado (main = producción, develop = staging, feature/* = solo CI)
// Módulos reutilizables: ci/stages.groovy (etapas) y ci/notify.groovy (notificaciones)

def etapas // se carga tras el checkout
def avisos // se carga tras el checkout

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
    }

    parameters {
        booleanParam(name: 'RUN_SONAR', defaultValue: false, description: 'Ejecutar análisis de SonarQube')
        booleanParam(name: 'NOTIFY_TELEGRAM', defaultValue: false, description: 'Enviar además la notificación por Telegram')
    }

    tools {
        nodejs 'node20'
    }

    environment {
        GITHUB_REPO = 'TU_USUARIO/TU_REPO'
        CI          = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    etapas = load 'ci/stages.groovy'
                    avisos = load 'ci/notify.groovy'
                    avisos.estadoGithub('pending', 'Build en curso')
                }
            }
        }

        // OPTIMIZACIÓN: caché de node_modules (Job Cacher), se invalida si cambia package-lock.json
        stage('Instalar dependencias (caché)') {
            steps {
                script { etapas.instalar() }
            }
        }

        // OPTIMIZACIÓN: ejecución selectiva -> se omite si solo cambió documentación
        stage('Calidad de código') {
            when {
                expression { etapas.hayCambiosDeCodigo() }
            }
            // OPTIMIZACIÓN: ejecución paralela
            parallel {
                stage('Lint (ESLint)') {
                    steps {
                        script { etapas.lint() }
                    }
                }
                stage('Tests + cobertura') {
                    steps {
                        script { etapas.tests() }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                        }
                    }
                }
                // OPTIMIZACIÓN: ejecución selectiva por rama -> solo en develop, main y pull requests
                stage('Auditoría de dependencias') {
                    when {
                        anyOf {
                            branch 'main'
                            branch 'develop'
                            changeRequest()
                        }
                    }
                    steps {
                        script { etapas.auditoria() }
                    }
                }
            }
        }

        stage('SonarQube') {
            when {
                expression { params.RUN_SONAR }
            }
            steps {
                script { etapas.sonar() }
            }
        }

        stage('Build') {
            steps {
                script { etapas.build() }
            }
        }

        stage('Deploy a Staging') {
            when { branch 'develop' }
            steps {
                script { etapas.desplegar('staging') }
            }
        }

        stage('Deploy a Producción') {
            when { branch 'main' }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    input message: '¿Desplegar a producción?', ok: 'Desplegar'
                }
                script { etapas.desplegar('produccion') }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**, coverage/lcov-report/**', allowEmptyArchive: true
        }
        success {
            script { if (avisos) { avisos.notificar('success') } }
        }
        unstable {
            script { if (avisos) { avisos.notificar('unstable') } }
        }
        failure {
            script { if (avisos) { avisos.notificar('failure') } }
        }
    }
}
