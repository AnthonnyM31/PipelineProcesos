// modulo reutilizable de notificaciones

// envio de estado a github
def estadoGithub(String estado, String descripcion) {
    def sha = powershell(returnStdout: true, script: 'git rev-parse HEAD').trim()
    withCredentials([string(credentialsId: 'github-token', variable: 'GH_TOKEN')]) {
        powershell """
            \$headers = @{
                "Authorization" = "Bearer \$env:GH_TOKEN"
                "Accept"        = "application/vnd.github+json"
            }
            \$body = @{
                state       = "${estado}"
                context     = "jenkins/ci"
                description = "${descripcion}"
                target_url  = "${env.BUILD_URL}"
            } | ConvertTo-Json
            Invoke-RestMethod -Uri "https://api.github.com/repos/${env.GITHUB_REPO}/statuses/${sha}" -Method Post -Headers \$headers -Body \$body -ContentType "application/json"
        """
    }
}

// gestion de notificaciones por resultado
def notificar(String resultado) {
    def estados = [
        success : [estado: 'success', texto: 'Build exitoso'],
        unstable: [estado: 'failure', texto: 'Build inestable'],
        failure : [estado: 'failure', texto: 'Build fallido']
    ]
    def e = estados[resultado]
    try {
        estadoGithub(e.estado, e.texto)
    } catch (err) {
        // manejo de excepciones sin romper ejecucion
        echo "Aviso: no se pudo notificar a github"
    }
}

return this
