pipeline {
    agent any
    stages {
        stage('Build image') {
            steps {
                script {
                    dockerapp = docker.build("instituto/instituto-api:${env.BUILD_ID}", '-f ./Dockerfile .')
                }
            }
        }
        
        stage('Deploy Instituto API - Stop and Remove Container') {
            steps {
                script {
                    def containerName = 'instituto-api'

                    sh "docker stop ${containerName} || true"
                    sh "docker rm ${containerName} || true"
                }
            }
        }


        stage('Deploy instituto API - Run New Container') {
            steps {
                script {
                    def imageName = "instituto/instituto-api:${env.BUILD_ID}"
                    def containerName = 'instituto-api'

                    sh "docker run -d --name ${containerName} -p 3011:3011 ${imageName}"
                }
            }
        }
    }
}
