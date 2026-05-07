pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    APP_NAME        = 'mario-platformer'
    IMAGE_NAME      = 'ghcr.io/nick84667/mario-platformer'
    DOCKER_BUILDKIT = '1'

    GITOPS_REPO     = 'https://github.com/Nick84667/Mario-platformer-gitops.git'
    GITOPS_BRANCH   = 'main'
    GITOPS_PATH     = 'apps/mario-platformer/overlays/dev'

    SONAR_HOST_URL  = 'http://159.69.151.41:9000'



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

          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_SHA_SHORT}"
        }

        sh '''#!/bin/bash
          set -euo pipefail

          echo "APP_NAME=${APP_NAME}"
          echo "GIT_SHA_SHORT=${GIT_SHA_SHORT}"
          echo "IMAGE_NAME=${IMAGE_NAME}"
          echo "IMAGE_TAG=${IMAGE_TAG}"
          echo "FULL_IMAGE=${IMAGE_NAME}:${IMAGE_TAG}"
        '''
      }
    }

    stage('Preflight') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          echo "Checking required tools..."

          docker version
          git --version
          node --version
          npm --version
          trivy --version
          sonar-scanner --version
          kustomize version

          echo "Checking SonarQube reachability..."
          curl -I ${SONAR_HOST_URL}
        '''
      }
    }

    stage('Quality Gates') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          npm ci
          npm run lint
          npm run typecheck
          npm run build
        '''
      }
    }

    stage('SonarQube Scan') {
      environment {
        SONAR_TOKEN = credentials('sonar-token')
      }

      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          sonar-scanner \
            -Dsonar.projectKey=mario-platformer \
            -Dsonar.projectName=mario-platformer \
            -Dsonar.sources=. \
            -Dsonar.exclusions=node_modules/**,dist/**,build/**,coverage/**,.git/**,.next/** \
            -Dsonar.host.url=${SONAR_HOST_URL} \
            -Dsonar.token=${SONAR_TOKEN}
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
            -t ${IMAGE_NAME}:${IMAGE_TAG} \
            -t ${IMAGE_NAME}:latest \
            .

          docker images | grep mario-platformer
        '''
      }
    }

    stage('Scan Image with Trivy') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          echo "Running Trivy scan - OS packages only, CRITICAL blocking..."

          trivy image \
            --no-progress \
            --scanners vuln \
            --pkg-types os \
            --severity CRITICAL \
            --exit-code 1 \
            --format table \
            ${IMAGE_NAME}:${IMAGE_TAG} | tee trivy-report.txt
        '''
      }
    }

   stage('Login to GHCR') {
  environment {
    GHCR_CREDS = credentials('ghcr-token')
  }

  steps {
    sh '''#!/bin/bash
      set -euo pipefail

      echo "${GHCR_CREDS_PSW}" | docker login ghcr.io \
        -u "${GHCR_CREDS_USR}" \
        --password-stdin
    '''
  }
}

    stage('Push Image to GHCR') {
      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          docker push ${IMAGE_NAME}:${BUILD_NUMBER}
          docker push ${IMAGE_NAME}:${GIT_SHA_SHORT}
          docker push ${IMAGE_NAME}:${IMAGE_TAG}
          docker push ${IMAGE_NAME}:latest
        '''
      }
    }

    stage('Update GitOps Repository') {
      environment {
        GITHUB_PAT = credentials('github-pat')
      }

      steps {
        sh '''#!/bin/bash
          set -euo pipefail

          rm -rf gitops

          git clone https://x-access-token:${GITHUB_PAT}@github.com/Nick84667/Mario-platformer-gitops.git gitops

          cd gitops
          git checkout ${GITOPS_BRANCH}

          echo "Current kustomization.yaml:"
          cat ${GITOPS_PATH}/kustomization.yaml

          echo "Updating Kustomize image tag..."
          cd ${GITOPS_PATH}
          kustomize edit set image ${IMAGE_NAME}=${IMAGE_NAME}:${IMAGE_TAG}
          cd -

          echo "Updated kustomization.yaml:"
          cat ${GITOPS_PATH}/kustomization.yaml

          echo "Rendered image after Kustomize build:"
          kustomize build ${GITOPS_PATH} | grep -n "image"

          git status

          git config user.email "jenkins@local"
          git config user.name "jenkins"

          git add ${GITOPS_PATH}/kustomization.yaml

          git commit -m "chore: deploy mario-platformer image ${IMAGE_TAG}" || echo "No changes to commit"

          git push origin ${GITOPS_BRANCH}
        '''
      }
    }

    stage('Publish Metadata') {
      steps {
        writeFile file: 'image-metadata.txt', text: """IMAGE_NAME=${env.IMAGE_NAME}
IMAGE_TAG=${env.IMAGE_TAG}
FULL_IMAGE=${env.IMAGE_NAME}:${env.IMAGE_TAG}
BUILD_NUMBER=${env.BUILD_NUMBER}
GIT_SHA_SHORT=${env.GIT_SHA_SHORT}
GITOPS_REPO=${env.GITOPS_REPO}
GITOPS_PATH=${env.GITOPS_PATH}
SONAR_HOST_URL=${env.SONAR_HOST_URL}
"""

        archiveArtifacts artifacts: 'trivy-report.txt,image-metadata.txt', fingerprint: true, allowEmptyArchive: true
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
      echo "Image published successfully: ${env.IMAGE_NAME}:${env.IMAGE_TAG}"
      echo "GitOps repository updated: ${env.GITOPS_REPO}"
      echo "ArgoCD should sync mario-platformer-dev automatically."
    }

    failure {
      sh '''#!/bin/bash
        set +e
        echo "Build failed. Showing local images:"
        docker images | head -n 30
      '''
    }

    always {
      archiveArtifacts artifacts: 'trivy-report.txt,image-metadata.txt', fingerprint: true, allowEmptyArchive: true

      sh '''#!/bin/bash
        set +e
        docker logout ghcr.io || true
      '''

      deleteDir()
    }
  }
}
