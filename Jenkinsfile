pipeline {
    agent any
    stages {
        stage('Build image') {
            steps {
                script {
                    dockerapp = docker.build("financial/financial-api:${env.BUILD_ID}", '-f ./Dockerfile .')
                }
            }
        }
        stage('Deploy Postgres DB') {
            steps {
                script {
                    sh 'docker compose up -d postgres-db --build'
                }
            }
        }
        stage('Deploy Financial API - Stop and Remove Container') {
            steps {
                script {
                    def containerName = 'financial-api'

                    sh "docker stop ${containerName} || true"
                    sh "docker rm ${containerName} || true"
                }
            }
        }


        stage('Deploy Financial API - Run New Container') {
            steps {
                script {
                    def imageName = "financial/financial-api:${env.BUILD_ID}"
                    def containerName = 'financial-api'

                    sh "docker run -d --name ${containerName} -p 3001:3001 ${imageName}"
                }
            }
        }
    }
}
