# Mario Platformer GitOps CI/CD Lab

Hands-on DevOps and GitOps project focused on Jenkins, Docker, SonarQube, Trivy, GHCR, Kustomize, ArgoCD, K3s, Terraform and Hetzner Cloud.

docs/images/mario-platformer-gitops.gif

---

## Overview

This project showcases a complete end-to-end CI/CD and GitOps lab where I built, scanned, published and deployed a containerized Next.js Mario Platformer application on a Kubernetes environment.

The environment was built on Hetzner Cloud, provisioned with Terraform, orchestrated with K3s, automated through Jenkins, secured with SonarQube and Trivy, published to GitHub Container Registry, and deployed through ArgoCD using a GitOps workflow.

The main goal of this lab was to simulate a realistic modern DevOps platform where application code, container images, Kubernetes manifests and deployment automation are managed through a clean and traceable delivery process.

This project demonstrates practical skills across:

- Infrastructure as Code
- CI/CD automation
- Docker containerization
- Code quality analysis
- Container security scanning
- GitOps deployment
- Kubernetes operations
- Image registry integration
- Application release traceability

---

## Live Environment

Production-style development environment:


Mario Platformer running on Hetzner K3s

Application runtime:

K3s namespace: mario-dev
Container port: 3000
Image registry: ghcr.io/nick84667/mario-platformer



## Core Technologies

Terraform
Hetzner Cloud
Ubuntu 24.04 LTS
Docker
Jenkins
K3s
ArgoCD
SonarQube
Trivy
GitHub Container Registry
Kustomize
GitHub
Next.js
Node.js
Linux / SSH

## Project Goals

Provision cloud infrastructure using Terraform
Build a realistic Jenkins-based CI pipeline
Containerize a Next.js application using Docker
Run application quality checks before image publishing
Integrate SonarQube for static code analysis
Integrate Trivy for container vulnerability scanning
Push validated Docker images to GitHub Container Registry
Separate application source code from Kubernetes deployment manifests
Use a dedicated GitOps repository as the Kubernetes source of truth
Deploy the application to K3s using ArgoCD
Manage Kubernetes manifests with Kustomize overlays
Implement a traceable build → scan → push → deploy workflow
Validate a full DevOps lifecycle across infrastructure, CI, security and CD layers


## Architecture

![Mario Platformer GitOps CI/CD Architecture](docs/images/mario-platformer-gitops.gif)

```text
Developer
   │
   ├── Pushes code to GitHub
   │
   ▼
Application Repository
github.com/Nick84667/mario-platformer
   │
   ├── Jenkinsfile
   ├── Dockerfile
   ├── Next.js source code
   └── sonar-project.properties
   │
   ▼
Jenkins CI Pipeline
   │
   ├── Checkout source code
   ├── Install dependencies
   ├── Run lint
   ├── Run typecheck
   ├── Build application
   ├── Run SonarQube scan
   ├── Build Docker image
   ├── Run Trivy image scan
   └── Push image to GHCR
   │
   ▼
GitHub Container Registry
ghcr.io/nick84667/mario-platformer
   │
   ▼
GitOps Repository Update
github.com/Nick84667/Mario-platformer-gitops
   │
   ├── apps/mario-platformer/base
   └── apps/mario-platformer/overlays/dev
   │
   ▼
ArgoCD
   │
   ├── Detects GitOps repository change
   ├── Compares desired state with cluster state
   └── Synchronizes the application
   │
   ▼
Hetzner K3s Cluster
   │
   ├── Namespace: mario-dev
   ├── Deployment
   ├── Service
   ├── Ingress
   └── imagePullSecrets
   │
   ▼
Mario Platformer Application
```

Why This Architecture
This project was intentionally built using a GitOps-based architecture instead of a traditional direct deployment pipeline.
In a basic CI/CD setup, Jenkins could deploy directly to Kubernetes using:

kubectl apply

However, this lab follows a cleaner and more production-oriented model:

Jenkins builds and validates the application.
Jenkins publishes the Docker image.
Jenkins updates the GitOps repository.
ArgoCD deploys the desired state from Git.


This provides a strong separation between CI and CD.
Jenkins is responsible for producing a validated artifact.
ArgoCD is responsible for applying the desired state to Kubernetes.
This design improves:

traceability
auditability
rollback capability
environment consistency
security boundaries
deployment visibility
operational control

The Kubernetes cluster is not modified manually and Jenkins does not directly apply manifests to the cluster.
The GitOps repository is the source of truth.


## Repository Design

The project is split into two repositories:

1. **Application Repository**
2. **GitOps Repository**

This separation is intentional and follows a production-oriented GitOps model.

The application repository contains the source code, Dockerfile and Jenkins pipeline.

The GitOps repository contains the Kubernetes desired state, Kustomize overlays and ArgoCD configuration.

---

## 1. Application Repository

Repository:

```text
github.com/Nick84667/mario-platformer
```

This repository contains the Mario Platformer application source code and the CI pipeline definition.

Main structure:

```text
mario-platformer
├── app/
├── components/
├── engine/
├── entities/
├── hooks/
├── levels/
├── public/
├── store/
├── utils/
├── Dockerfile
├── Jenkinsfile
├── package.json
├── package-lock.json
├── next.config.ts
├── sonar-project.properties
└── README.md
```

This repository is responsible for:

- storing the Mario Platformer source code;
- defining the Docker image build;
- defining the Jenkins CI pipeline;
- executing application quality gates;
- executing security scans;
- publishing validated images to GitHub Container Registry;
- updating the GitOps repository with the new image tag.

---

## 2. GitOps Repository

Repository:

```text
github.com/Nick84667/Mario-platformer-gitops
```

This repository contains the Kubernetes desired state.

Main structure:

```text
Mario-platformer-gitops
├── apps
│   └── mario-platformer
│       ├── base
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   ├── ingress.yaml
│       │   └── kustomization.yaml
│       └── overlays
│           └── dev
│               └── kustomization.yaml
└── argocd
    ├── applications
    │   └── mario-platformer-dev.yaml
    └── projects
        └── mario-platformer-project.yaml
```

This repository is responsible for:

- defining Kubernetes resources;
- managing Kustomize base manifests;
- managing the `dev` overlay;
- storing the desired runtime state of the application;
- allowing ArgoCD to synchronize the K3s cluster;
- enabling rollback through Git history;
- keeping deployment changes auditable and traceable.

---

## Why Two Repositories?

The project uses two repositories to separate application delivery from environment configuration.

```text
Application repository
    → source code, Dockerfile, Jenkinsfile, CI pipeline

GitOps repository
    → Kubernetes manifests, Kustomize overlays, ArgoCD configuration
```

This separation provides:

- clearer ownership;
- better traceability;
- safer deployments;
- easier rollbacks;
- cleaner CI/CD design;
- alignment with GitOps best practices.

Jenkins works on the application repository, builds the Docker image, pushes the image to GHCR and then updates the GitOps repository.

ArgoCD watches the GitOps repository and applies the desired state to K3s.


2. GitOps Repository

github.com/Nick84667/Mario-platformer-gitops

This repository contains the Kubernetes desired state.
Main structure:

Mario-platformer-gitops
├── apps
│   └── mario-platformer
│       ├── base
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   ├── ingress.yaml
│       │   └── kustomization.yaml
│       └── overlays
│           └── dev
│               └── kustomization.yaml
└── argocd
    ├── applications
    │   └── mario-platformer-dev.yaml
    └── projects
        └── mario-platformer-project.yaml

This repository is responsible for:

defining Kubernetes resources
managing Kustomize base manifests
managing the dev overlay
storing the desired runtime state
allowing ArgoCD to synchronize the cluster
enabling rollback through Git

What I Implemented

1. Provisioned the Infrastructure with Terraform
Provisioned → Configured → Validated → Deployed
Terraform was used to provision the cloud infrastructure required for the lab environment on Hetzner Cloud.
The infrastructure layer was designed to support:

Jenkins
Docker
K3s
ArgoCD
SonarQube
GitOps deployment flow

Terraform was used to make the infrastructure repeatable and disposable.
Typical Terraform workflow:

terraform init
terraform validate
terraform plan
terraform apply

The goal was to create a reproducible platform foundation instead of manually provisioning cloud resources.

2. Configured Jenkins as the CI Engine
Jenkins was configured as the main Continuous Integration engine.
The Jenkins pipeline is defined in the root-level Jenkinsfile.
Jenkins is responsible for:

checkout
preflight validation
dependency installation
lint
typecheck
application build
SonarQube analysis
Docker image build
Trivy image scan
GHCR push
GitOps repository update

The pipeline uses Jenkins Credentials for secret management.
Configured Jenkins credentials:

ghcr-creds
github-pat
sonar-token

No secret is stored inside the Git repository.


3. Implemented Application Quality Gates
Before building and publishing the Docker image, the pipeline validates the application.
Quality gate commands:

npm ci
npm run lint
npm run typecheck
npm run build

These checks ensure that:

dependencies are installed cleanly
linting rules pass
TypeScript checks pass
the Next.js application builds successfully

If one of these steps fails, the pipeline stops immediately.
This prevents broken code from being packaged and deployed.

4. Integrated SonarQube Code Analysis
SonarQube was integrated into the Jenkins pipeline to provide static code analysis.
The scan helps detect:

bugs
code smells
duplicated code
maintainability issues
security hotspots
quality regressions

The SonarQube token is stored in Jenkins Credentials as:
sonar-token

Example scan step:

sonar-scanner \
  -Dsonar.projectKey=mario-platformer \
  -Dsonar.projectName=mario-platformer \
  -Dsonar.sources=. \
  -Dsonar.host.url=${SONAR_HOST_URL} \
  -Dsonar.login=${SONAR_TOKEN}


5. Built a Production Docker Image
The application is packaged using a multi-stage Dockerfile.
The Dockerfile contains three main stages:

deps
builder
runner

The deps stage installs dependencies.
The builder stage runs typecheck and builds the Next.js application.
The runner stage creates the final production container.
The final image:

runs in production mode
exposes port 3000
runs as a non-root user
starts the Next.js standalone server

Runtime command:

CMD ["node", "server.js"]

The image is tagged with:
BUILD_NUMBER
GIT_SHA_SHORT
BUILD_NUMBER-GIT_SHA_SHORT
latest

Example: ghcr.io/nick84667/mario-platformer:23-589ea11f

6. Added Container Security Scanning with Trivy
Trivy was integrated into the Jenkins pipeline to scan the Docker image before publishing it.
The pipeline blocks the release if vulnerabilities with the following severities are found:

HIGH
CRITICAL

Example scan:

trivy image \
  --no-progress \
  --severity HIGH,CRITICAL \
  --exit-code 1 \
  --format table \
  ghcr.io/nick84667/mario-platformer:${IMAGE_TAG}

This adds a DevSecOps layer to the delivery process.
If the image is not secure enough, the pipeline fails and the image is not promoted.

7. Published the Image to GitHub Container Registry
After a successful build and scan, Jenkins authenticates to GitHub Container Registry.
The image is pushed to:

ghcr.io/nick84667/mario-platformer

Jenkins pushes multiple tags:
docker push ghcr.io/nick84667/mario-platformer:${BUILD_NUMBER}
docker push ghcr.io/nick84667/mario-platformer:${GIT_SHA_SHORT}
docker push ghcr.io/nick84667/mario-platformer:${IMAGE_TAG}
docker push ghcr.io/nick84667/mario-platformer:latest

The Kubernetes deployment uses the immutable tag: BUILD_NUMBER-GIT_SHA_SHORT

This ensures that each deployment can be traced back to a specific Jenkins build and Git commit.

8. Implemented GitOps Deployment with Kustomize
After pushing the Docker image, Jenkins updates the GitOps repository.
The target file is: apps/mario-platformer/overlays/dev/kustomization.yaml

The file contains:

apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: mario-dev

resources:
  - ../../base

images:
  - name: ghcr.io/nick84667/mario-platformer
    newTag: bootstrap

Jenkins updates the image tag using Kustomize:

kustomize edit set image \
  ghcr.io/nick84667/mario-platformer=ghcr.io/nick84667/mario-platformer:${IMAGE_TAG}

Then Jenkins commits and pushes the change:

git add apps/mario-platformer/overlays/dev/kustomization.yaml
git commit -m "chore: deploy mario-platformer image ${IMAGE_TAG}"
git push origin main

This Git commit becomes the trigger for ArgoCD.

9. Deployed the Application with ArgoCD
ArgoCD was configured to monitor the GitOps repository.
ArgoCD watches the path:  desired state in Git  with: actual state in K3s
If the states differ, ArgoCD synchronizes the application.
Expected final state:


Synced
Healthy

This confirms that the Kubernetes deployment matches the GitOps repository.

10. Deployed on K3s
The application runs on a lightweight Kubernetes cluster based on K3s.
The target namespace is: mario-dev

Main Kubernetes resources:
Deployment
Service
Ingress
imagePullSecrets
Namespace

The Deployment pulls the container image from GHCR.
The Service exposes the application internally.
The Ingress or port-forwarding exposes the application for browser access.
The application listens on: 3000

## CI/CD Flow
The complete CI/CD flow is:

1. Developer pushes code to GitHub.
2. Jenkins checks out the source code.
3. Jenkins installs dependencies.
4. Jenkins runs lint, typecheck and build.
5. Jenkins runs SonarQube analysis.
6. Jenkins builds the Docker image.
7. Jenkins scans the image with Trivy.
8. Jenkins logs in to GHCR.
9. Jenkins pushes the image to GHCR.
10. Jenkins updates the GitOps repository.
11. ArgoCD detects the GitOps commit.
12. ArgoCD synchronizes the K3s cluster.
13. Kubernetes rolls out the new version.
14. Mario Platformer is updated.


## GitOps Flow
The GitOps deployment model is:

Jenkins does not deploy directly to Kubernetes.
Jenkins updates Git.
ArgoCD deploys from Git.

This provides a clean separation of responsibilities.
Jenkins produces the artifact.
ArgoCD applies the desired state.
Git remains the source of truth.


## Security Practices
Implemented security practices:

Jenkins Credentials for secrets
No hardcoded tokens in Git
SonarQube static code analysis
Trivy container vulnerability scanning
Non-root container execution
Immutable image tags
GitOps-based deployment control
No direct Jenkins deployment to Kubernetes

Container user hardening:

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

USER nextjs


Required Jenkins Credentials
The pipeline requires the following Jenkins credentials.
ghcr-creds
Used to authenticate Docker against GitHub Container Registry.
Type:   Username with password

Required GitHub token permissions:
read:packages
write:packages
repo

## github-pat
Used to clone, commit and push changes to the GitOps repository.
Type: Secret text

## sonar-token
Used by SonarQube Scanner.
Type: Secret text


## Required Tools on Jenkins Agent
The Jenkins agent must have the following tools installed:

docker
git
node
npm
trivy
sonar-scanner
kustomize

The pipeline validates these tools during the preflight stage.

## Validation Commands
Check ArgoCD applications: kubectl -n argocd get applications
Check application pods:    kubectl -n mario-dev get pods
Check services:            kubectl -n mario-dev get svc
Check ingress:             kubectl -n mario-dev get ingress
Check running image:

kubectl -n mario-dev get deployment mario-platformer \
  -o=jsonpath='{.spec.template.spec.containers[0].image}'

Expected image format:  ghcr.io/nick84667/mario-platformer:<BUILD_NUMBER>-<GIT_SHA_SHORT>

## Rollback Strategy
Rollback is managed through GitOps.
To roll back to a previous version, revert the GitOps commit that changed the image tag.
Example:


git revert <commit_id>
git push origin main


ArgoCD detects the revert and synchronizes the K3s cluster back to the previous desired state.
This makes rollback:

simple
traceable
auditable
Git-driven
reproducible


## Real Troubleshooting Experience
During the implementation I worked through real-world DevOps issues such as:

Jenkins credentials configuration
GHCR authentication
Docker build migration from ECR to GHCR
GitOps repository structure validation
Kustomize image tag updates
ArgoCD synchronization
K3s namespace and imagePullSecrets validation
SonarQube connectivity
Trivy scan integration
SSH access troubleshooting
Hetzner firewall and access checks
Jenkins UI timeout investigation
Git line ending warnings on Windows
Local and remote Kustomize validation

This made the lab more realistic because the environment was not only built, but also debugged and validated across multiple layers.

## Current Lab Status
Completed:

Hetzner infrastructure provisioned
Jenkins installed
Docker available on Jenkins host
K3s installed and running
ArgoCD installed and configured
SonarQube installed
GitOps repository created
Kustomize base and dev overlay configured
ArgoCD application validated as Synced and Healthy
Mario Platformer reachable from the Kubernetes environment
Jenkins credentials configured
Jenkinsfile migrated from AWS ECR to GHCR
GitOps update stage implemented
Architecture GIF generated and added to documentation

Next Steps:

Run final Jenkins pipeline after restoring Jenkins UI access
Validate GHCR image push
Validate automatic GitOps repository update
Validate ArgoCD rollout after Jenkins commit
Add SonarQube Quality Gate blocking stage
Add multi-environment overlays for stage and prod
Add ArgoCD rollback documentation
Add ApplicationSet for multi-environment deployment

## Key Learning Outcomes
This project strengthened practical experience in:

Terraform-based provisioning
Linux server management
Jenkins pipeline design
Docker image build optimization
secure credential handling
SonarQube integration
Trivy security scanning
GHCR image publishing
Kubernetes deployment
Kustomize overlays
ArgoCD GitOps workflow
CI/CD troubleshooting
cloud lab cost awareness
end-to-end DevOps architecture design

## Final Result
The final platform implements a complete GitOps-based CI/CD workflow:

Code → Build → Quality Scan → Security Scan → Image Registry → GitOps Update → ArgoCD Sync → K3s Deployment

The most important architectural principle is:

Jenkins produces and validates the artifact.
Git stores the desired deployment state.
ArgoCD applies that desired state to Kubernetes.

This makes the delivery process secure, repeatable, traceable and aligned with modern DevOps and platform engineering practices.
