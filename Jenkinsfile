pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    IMAGE_NAME      = 'mario-platformer'
    AWS_REGION      = 'eu-central-1'
    ECR_REPOSITORY  = 'supermario-mario-platformer'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_SHA_SHORT = sh(
            returnStdout: true,
            script: 'git rev-parse --short=8 HEAD'
          ).trim()
        }
      }
    }

    stage('Resolve AWS / Image Metadata') {
      steps {
        script {
          env.AWS_ACCOUNT_ID = sh(
            returnStdout: true,
            script: 'aws sts get-caller-identity --query Account --output text'
          ).trim()

          env.ECR_REGISTRY = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com"
          env.IMAGE_URI    = "${env.ECR_REGISTRY}/${env.ECR_REPOSITORY}"
        }

        sh '''
          echo "GIT_SHA_SHORT=${GIT_SHA_SHORT}"
          echo "ECR_REGISTRY=${ECR_REGISTRY}"
          echo "IMAGE_URI=${IMAGE_URI}"
        '''
      }
    }

    stage('Preflight') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail
          docker version
          aws --version
          trivy --version
        '''
      }
    }

    stage('Quality Gates') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail
          npm ci
          npm run lint
          npm run build
        '''
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          docker build --pull \
            -t ${IMAGE_NAME}:${BUILD_NUMBER} \
            -t ${IMAGE_NAME}:${GIT_SHA_SHORT} \
            -t ${IMAGE_NAME}:latest \
            .
        '''
      }
    }

    stage('Scan Image with Trivy') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          trivy image \
            --no-progress \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            --format table \
            ${IMAGE_NAME}:${BUILD_NUMBER} | tee trivy-report.txt
        '''
      }
    }

    stage('Login to ECR') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin ${ECR_REGISTRY}
        '''
      }
    }

    stage('Tag and Push Image') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_URI}:${BUILD_NUMBER}
          docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_URI}:${GIT_SHA_SHORT}
          docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_URI}:latest

          docker push ${IMAGE_URI}:${BUILD_NUMBER}
          docker push ${IMAGE_URI}:${GIT_SHA_SHORT}
          docker push ${IMAGE_URI}:latest
        '''
      }
    }

    stage('Publish Metadata') {
      steps {
        writeFile file: 'image-metadata.txt', text: """IMAGE_URI=${env.IMAGE_URI}
BUILD_NUMBER=${env.BUILD_NUMBER}
GIT_SHA_SHORT=${env.GIT_SHA_SHORT}
AWS_REGION=${env.AWS_REGION}
"""
        archiveArtifacts artifacts: 'trivy-report.txt,image-metadata.txt', fingerprint: true
      }
    }

    stage('Cleanup Local Images') {
      steps {
        sh '''#!/bin/bash
          set +e
          docker image prune -f
        '''
      }
    }
  }

  post {
    success {
      echo "Image published successfully: ${env.IMAGE_URI}:${env.BUILD_NUMBER}"
      echo "Also tagged as: ${env.IMAGE_URI}:${env.GIT_SHA_SHORT} and ${env.IMAGE_URI}:latest"
    }

    failure {
      sh '''#!/bin/bash
        set +e
        echo "Build failed. Showing local images:"
        docker images | head -n 30
      '''
    }

    always {
      deleteDir()
    }
  }
}
