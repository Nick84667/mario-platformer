pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t mario-platformer:latest .'
      }
    }

    stage('Stop Previous Container') {
      steps {
        sh 'docker rm -f mario || true'
      }
    }

    stage('Run Mario Container') {
      steps {
        sh '''
          docker run -d \
            --name mario \
            -p 3000:3000 \
            mario-platformer:latest
        '''
      }
    }

    stage('Verify Mario') {
      steps {
        sh 'sleep 5'
        sh 'curl -I http://localhost:3000'
      }
    }
  }
}
