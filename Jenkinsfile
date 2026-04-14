pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 20, unit: 'MINUTES')
  }

  environment {
    IMAGE_NAME     = 'mario-platformer'
    CONTAINER_NAME = 'mario'
    APP_PORT       = '3000'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        sh 'git rev-parse --short HEAD || true'
      }
    }

    stage('Preflight') {
      steps {
        sh 'docker version'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          docker build \
            -t ${IMAGE_NAME}:${BUILD_NUMBER} \
            -t ${IMAGE_NAME}:latest \
            .
        '''
      }
    }

    stage('Stop Previous Container') {
      steps {
        sh 'docker rm -f ${CONTAINER_NAME} || true'
      }
    }

    stage('Run Mario Container') {
      steps {
        sh '''
          docker run -d \
            --name ${CONTAINER_NAME} \
            --restart unless-stopped \
            -p ${APP_PORT}:${APP_PORT} \
            ${IMAGE_NAME}:${BUILD_NUMBER}
        '''
      }
    }

    stage('Verify Mario') {
      steps {
        script {
          retry(6) {
            sh 'sleep 5'
            sh 'curl -fsSI http://localhost:${APP_PORT}'
          }
        }
      }
    }

    stage('Cleanup Dangling Images') {
      steps {
        sh 'docker image prune -f || true'
      }
    }
  }

  post {
    success {
      echo "Mario deployed successfully on http://18.196.129.153:3000"
    }

    failure {
      sh 'docker logs ${CONTAINER_NAME} --tail=200 || true'
      sh 'docker ps -a || true'
    }

    always {
      sh 'docker ps -a --filter name=${CONTAINER_NAME} || true'
    }
  }
}
