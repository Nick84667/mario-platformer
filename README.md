# Mario Platformer

An enterprise-style browser platformer project inspired by classic 2D side-scrolling games, built to demonstrate not only application development, but also a modern **CI/CD + GitOps delivery architecture** using **Jenkins**, **Docker**, **Amazon ECR**, and **Argo CD**.

This repository evolves from a local/browser game implementation into a structured cloud-native delivery lab, where every application change can flow through a complete pipeline:

**Code change → Build → Container image → Registry → GitOps update → Kubernetes sync**

---

## Overview

`mario-platformer` started as a browser-playable 2D platformer built with modern frontend technologies.  
The project is being progressively transformed into an **enterprise delivery showcase**, where the application is used as a realistic workload to demonstrate:

- application versioning
- containerization best practices
- CI automation with Jenkins
- image publishing to a container registry
- GitOps-based deployment flow
- Kubernetes continuous delivery with Argo CD

The core idea is simple but effective:

make a visible change in the game (for example, changing Mario’s outfit color), build a new image through Jenkins, publish it to a registry, update the deployment manifests, and let Argo CD synchronize the cluster automatically.

This makes the project useful both as:
- a **technical portfolio repository**
- a **hands-on DevOps lab**
- a **GitOps reference implementation**

---

## Architecture

The project is structured around two complementary layers:

### 1. Application Layer
The application layer contains the actual game source code and frontend logic.

Main responsibilities:
- gameplay logic
- UI and assets
- browser rendering
- local development workflow
- Docker image build context

### 2. Delivery Layer
The delivery layer contains the infrastructure and automation components required to build, publish, and deploy the application in an enterprise-like environment.

Main responsibilities:
- Terraform-managed cloud resources
- Jenkins CI pipeline
- Docker image build and tagging
- container registry integration
- GitOps deployment flow
- Argo CD synchronization into Kubernetes

### High-Level Components

- **Frontend App**  
  Browser-based Mario-style 2D platformer

- **Docker**  
  Packages the application into a deployable container image

- **Jenkins**  
  Executes the CI pipeline:
  - checkout
  - build
  - image tagging
  - image push
  - GitOps manifest update

- **Amazon ECR**  
  Stores versioned container images for deployment

- **GitOps Repository / Deployment Manifests**  
  Stores the desired deployment state (image tag, manifests, overlays, Helm/Kustomize configuration)

- **Argo CD**  
  Watches the GitOps source of truth and reconciles the Kubernetes cluster to the desired state

- **Kubernetes Cluster**  
  Runs the deployed application

---

## CI/CD Flow

The target enterprise workflow is designed as follows:

1. A developer pushes a change to the application source code  
   Example: update UI assets or change Mario’s outfit color

2. Jenkins detects the change and starts the CI pipeline

3. Jenkins builds the application container image

4. Jenkins tags the image using a versioning strategy such as:
   - latest
   - build-number
   - short-sha
   - buildNumber-shortSha

5. Jenkins pushes the image to the configured container registry

6. Jenkins updates the deployment manifest or values file in the GitOps layer  
   Example:
   - Helm values.yaml
   - Kustomize image tag
   - environment-specific deployment configuration

7. Argo CD detects that Git no longer matches the live cluster state

8. Argo CD synchronizes the Kubernetes cluster

9. The updated application version is deployed automatically

This separates responsibilities clearly:

- **Jenkins = Continuous Integration**
- **Registry = Artifact Storage**
- **Git = Source of Truth**
- **Argo CD = Continuous Delivery / Reconciliation**

---

## Jenkins / ECR / ArgoCD

### Jenkins
Jenkins is used as the CI engine and pipeline orchestrator.

Its responsibilities include:
- source checkout
- build automation
- Docker image creation
- immutable tagging
- push to registry
- update of deployment descriptors in the GitOps flow

The pipeline is defined as code using a Jenkinsfile, making the delivery process versioned, reviewable, and reproducible.

### Amazon ECR
Amazon ECR is the chosen registry for the AWS-based implementation of this lab.

Why ECR for this project:
- native AWS integration
- simple IAM-based authentication model
- no need to self-manage registry infrastructure
- good fit for EC2/EKS-based delivery flows
- clean integration for image push from Jenkins

The project may later be extended to compare ECR with alternative enterprise registries such as:
- Nexus Repository
- JFrog Artifactory / JFrog Container Registry

### Argo CD
Argo CD is used as the GitOps delivery controller.

Its role is to:
- monitor the desired application state stored in Git
- detect drift between Git and the live Kubernetes cluster
- synchronize the cluster automatically or manually
- provide deployment visibility and reconciliation tracking

In the target architecture, Argo CD does **not** receive direct deployment commands from Jenkins.  
Instead, Jenkins updates Git, and Argo CD reacts to Git changes.

This enforces a clean GitOps model:
- no direct imperative deploy from CI
- deployment state is declarative
- the cluster is reconciled from Git

---

## Roadmap V1 → V4

### V1 — Jenkins + Docker on EC2
Initial validation of the CI foundation.

**Goals**
- Provision infrastructure with Terraform
- Run Jenkins on EC2
- Install and validate Docker
- Build and serve the Mario platformer application
- Validate `terraform apply` / `destroy`

**Status**
- Foundation completed and validated

---

### V2 — Container Registry Integration (ECR)
Extend the pipeline to publish versioned images into a managed registry.

**Goals**
- Create Amazon ECR repository
- Grant Jenkins permissions to authenticate and push images
- Update Terraform to include ECR resources and IAM policies
- Update Jenkins pipeline to:
  - build image
  - tag image
  - push image to ECR

**Target Outcome**
- CI produces deployable container artifacts in a registry

---

### V3 — GitOps Integration with Argo CD
Introduce declarative continuous delivery.

**Goals**
- Create GitOps deployment structure
- Store image references in deployment manifests
- Configure Argo CD application
- Enable automated sync from Git to Kubernetes
- Demonstrate full flow:
  - code change
  - new image
  - manifest update
  - cluster sync

**Target Outcome**
- End-to-end CI/CD + GitOps working flow

---

### V4 — Enterprise Hardening and Promotion Flow
Move from functional lab to enterprise-grade delivery model.

**Goals**
- Separate application repo and GitOps repo
- Introduce environment strategy (`dev`, `stage`, `prod`)
- Improve tagging and release discipline
- Add rollback and promotion patterns
- Optionally integrate:
  - Argo CD Image Updater
  - Helm/Kustomize overlays
  - RBAC and project boundaries
  - quality gates and policy checks
  - vulnerability scanning and image retention policies

**Target Outcome**
- Reproducible enterprise-style delivery reference architecture

---

## Repository Structure


mario-platformer/
├── app/                      # Application source (optional future separation)
├── components/               # Frontend/game UI components
├── infra/                    # Terraform and infrastructure code
├── k8s/                      # Kubernetes manifests or Helm/Kustomize (future)
├── Jenkinsfile               # CI pipeline definition
├── Dockerfile                # Container build definition
└── README.md                 # Project documentation
