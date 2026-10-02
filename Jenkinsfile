// Declarative Jenkins pipeline: Checkout -> Build -> Test -> Deploy -> Verify
// Requires: a Jenkins agent with Docker installed and access to the Docker daemon.
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 15, unit: 'MINUTES')
    }

    // Trigger the pipeline on every commit:
    //  - githubPush(): instant, via GitHub webhook -> http://<jenkins-url>/github-webhook/
    //  - pollSCM:      fallback, Jenkins checks the repo roughly every 2 minutes
    triggers {
        githubPush()
        pollSCM('H/2 * * * *')
    }

    environment {
        APP_NAME   = 'jenkins-docker-demo'
        IMAGE      = "${APP_NAME}:${env.BUILD_NUMBER}"
        CONTAINER  = 'jenkins-demo-app'
        HOST_PORT  = '3000'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo "Building Docker image ${IMAGE}"
                sh '''
                    docker build --target production \
                        --build-arg APP_VERSION=${BUILD_NUMBER} \
                        -t ${IMAGE} -t ${APP_NAME}:latest .
                '''
            }
        }

        stage('Test') {
            steps {
                echo 'Running unit tests inside Docker (build fails if any test fails)'
                sh 'docker build --target test -t ${APP_NAME}-test:${BUILD_NUMBER} .'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying ${IMAGE} on port ${HOST_PORT}"
                sh '''
                    docker rm -f ${CONTAINER} || true
                    docker run -d --name ${CONTAINER} \
                        -p ${HOST_PORT}:3000 \
                        --restart unless-stopped \
                        ${IMAGE}
                '''
            }
        }

        stage('Verify') {
            steps {
                echo 'Smoke test: calling /health inside the running container'
                sh '''
                    for i in $(seq 1 10); do
                        if docker exec ${CONTAINER} wget -qO- http://localhost:3000/health; then
                            echo
                            echo "Health check passed"
                            exit 0
                        fi
                        echo "Waiting for app to start... ($i/10)"
                        sleep 3
                    done
                    echo "Health check FAILED"
                    docker logs ${CONTAINER}
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} deployed. Open http://localhost:${HOST_PORT}"
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed. Check the console output above."
        }
        always {
            // Clean up the throwaway test image and dangling layers
            sh 'docker rmi ${APP_NAME}-test:${BUILD_NUMBER} || true'
            sh 'docker image prune -f || true'
        }
    }
}
