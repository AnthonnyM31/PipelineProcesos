// Módulo reutilizable de notificaciones (GitHub commit status y Telegram opcional)
// Se carga desde el Jenkinsfile con: avisos = load 'ci/notify.groovy'

def estadoGithub(String estado, String descripcion) {
    def sha = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
    withCredentials([string(credentialsId: 'github-token', variable: 'GH_TOKEN')]) {
        sh """
            curl -s -o /dev/null -w "GitHub status: HTTP %{http_code}\n" -X POST \\
                -H "Authorization: Bearer \$GH_TOKEN" \\
                -H "Accept: application/vnd.github+json" \\
                "https://api.github.com/repos/${env.GITHUB_REPO}/statuses/${sha}" \\
                -d '{"state":"${estado}","context":"jenkins/ci","description":"${descripcion}","target_url":"${env.BUILD_URL}"}'
        """
    }
}

def telegram(String texto) {
    withCredentials([
        string(credentialsId: 'telegram-token', variable: 'TG_TOKEN'),
        string(credentialsId: 'telegram-chat-id', variable: 'TG_CHAT')
    ]) {
        sh """
            curl -s -X POST "https://api.telegram.org/bot\$TG_TOKEN/sendMessage" \\
                -d chat_id=\$TG_CHAT -d text="${texto}"
        """
    }
}

def notificar(String resultado) {
    def estados = [
        success : [estado: 'success', texto: 'Build exitoso',   icono: 'EXITO'],
        unstable: [estado: 'failure', texto: 'Build inestable', icono: 'INESTABLE'],
        failure : [estado: 'failure', texto: 'Build fallido',   icono: 'FALLO']
    ]
    def e = estados[resultado]
    try {
        estadoGithub(e.estado, e.texto)
        if (params.NOTIFY_TELEGRAM) {
            telegram("[${e.icono}] ${env.JOB_NAME} #${env.BUILD_NUMBER} - ${env.BUILD_URL}")
        }
    } catch (err) {
        // Una notificación fallida nunca debe romper el build
        echo "Aviso: no se pudo notificar (${err.message})"
    }
}

return this
