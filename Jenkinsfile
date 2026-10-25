// pipeline principal de entrega continua

def etapas
def avisos

pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
    }

    tools {
        nodejs 'node20'
    }

    environment {
        GITHUB_REPO = 'AnthonnyM31/PipelineProcesos'
        CI          = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // carga de modulos reutilizables
                    etapas = load 'ci/stages.groovy'
                    avisos = load 'ci/notify.groovy'
                    avisos.estadoGithub('pending', 'Build en curso')
                }
            }
        }

        stage('Instalar dependencias') {
            steps {
                // instalacion de dependencias con cache
                script { etapas.instalar() }
            }
        }

        stage('Calidad de codigo') {
            when {
                expression { etapas.hayCambiosDeCodigo() }
            }
            // ejecucion paralela de etapas de calidad
            parallel {
                stage('Lint ESLint') {
                    steps {
                        script { etapas.lint() }
                    }
                }
                stage('Tests unitarios Jest') {
                    steps {
                        script { etapas.tests() }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                        }
                    }
                }
                stage('Pruebas funcionales Selenium') {
                    steps {
                        script { etapas.selenium() }
                    }
                }
                stage('Auditoria de dependencias') {
                    steps {
                        script { etapas.auditoria() }
                    }
                }
            }
        }

        stage('SonarQube') {
            when { branch 'main' }
            steps {
                // analisis de calidad en rama main
                script { etapas.sonar() }
            }
        }

        stage('Build') {
            steps {
                // empaquetado de artefactos del proyecto
                script { etapas.build() }
            }
        }

        stage('Deploy a Staging') {
            when { branch 'main' }
            steps {
                // despliegue automatico a entorno staging
                script { etapas.desplegar('staging') }
            }
        }

        stage('Deploy a Produccion') {
            when { branch 'main' }
            steps {
                // aprobacion manual para despliegue a produccion
                timeout(time: 10, unit: 'MINUTES') {
                    input message: 'Aprobar despliegue a produccion', ok: 'Desplegar'
                }
                script { etapas.desplegar('produccion') }
            }
        }
    }

    post {
        always {
            // bloque post ejecucion y notificaciones
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
