# Mario Platformer

Production-style DevOps lab repository that demonstrates how to build, secure, and package a browser-playable 2D platformer on AWS using Terraform, Jenkins, Docker, Trivy, and Amazon ECR.

---

## Overview

This repository combines three main layers:

- **Application layer**: a Next.js-based Mario-style browser game
- **Infrastructure layer**: Terraform code to provision AWS networking, IAM, an EC2 Jenkins host, and an Amazon ECR repository
- **CI layer**: a Jenkins pipeline that builds the application container image, scans it with Trivy, and publishes versioned images to Amazon ECR

The project started as a validated **V1 lab** where Jenkins built and ran the container locally on EC2.  
It is now evolving toward a more enterprise-oriented **V2 model** in which Jenkins acts as a CI engine that produces container artifacts for downstream deployment workflows.

---

## Objectives

- Provision a reproducible AWS lab environment with Terraform
- Bootstrap Jenkins and Docker on an EC2 instance
- Package a Next.js browser game as a Docker image
- Run CI quality checks before image publication
- Scan container images for vulnerabilities with Trivy
- Push versioned images to Amazon ECR
- Prepare the repository for future CD / GitOps integration

---

## Tech Stack

### Application
- Next.js
- React
- TypeScript
- Zustand

### Infrastructure
- Terraform
- AWS EC2
- Amazon VPC
- IAM
- Security Groups
- Amazon ECR

### CI / Operations
- Jenkins
- Docker
- Trivy
- AWS Systems Manager Session Manager

---

## Repository Structure



├── app/
├── components/
├── engine/
├── entities/
├── hooks/
├── levels/
├── store/
├── utils/
├── infra/
│   └── jenkins-ec2/
│       ├── ecr.tf
│       ├── iam_ecr.tf
│       ├── main.tf
│       ├── outputs.tf
│       ├── user_data.sh.tftpl
│       ├── variables.tf
│       └── versions.tf
├── Dockerfile
├── Jenkinsfile
├── package.json
├── package-lock.json
└── README.md


Architecture

Application Layer

A browser-playable Mario-inspired 2D platformer built with Next.js, React, and TypeScript.

Infrastructure Layer

Terraform provisions:

- dedicated VPC
- public subnets
- internet gateway and route table
- Jenkins EC2 instance
- IAM role and instance profile
- security group restricted to the admin CIDR
- Amazon ECR repository for container image publication

CI Layer
Jenkins is used as the CI engine to:

check out source code
run Node.js quality gates
build the Docker image
scan the image with Trivy
tag the image with build metadata
publish the image to Amazon ECR

Registry Layer
Amazon ECR stores:

build-number tags
Git short SHA tags
an optional latest tag for lab convenience


Validation Status
V1 — Fully Validated
The following V1 workflow has been validated end-to-end:

Terraform apply
Jenkins + Docker bootstrap on EC2
Local Docker image build
Local container deployment on the Jenkins EC2 host
Application health verification
Terraform destroy

V2 — Host and CI Prerequisites Validated
The following V2 prerequisites are now validated:

Amazon ECR repository provisioned with Terraform
ECR lifecycle policy configured
ECR image scanning on push enabled
IAM policy attached to the Jenkins EC2 role for ECR authentication and image push
Jenkins EC2 host configured with:

Jenkins
Docker
AWS CLI
Trivy


Jenkins user validated for:

Docker access
AWS role resolution
Amazon ECR authentication



The next validation step is the first successful Jenkins pipeline run that publishes the Mario Platformer image to Amazon ECR.

AWS Resources
Network

Dedicated VPC for the lab
Two public subnets
Internet Gateway
Public route table

Compute

Jenkins EC2 instance with:

Docker
Jenkins
AWS CLI
Trivy



Registry

ECR repository:

supermario-mario-platformer




Security Notes
This lab adopts several security-minded practices:

Restricted inbound access using an admin CIDR allowlist
EC2 management through AWS Systems Manager Session Manager
IAM instance profile instead of static AWS credentials on the host
ECR image scanning on push
Trivy image scanning in the CI pipeline
Encrypted EC2 root volume
ECR encryption enabled with AES256


CI Pipeline Flow (V2)
The V2 pipeline follows this sequence:

Checkout source
Resolve build metadata
Preflight checks

Docker
AWS CLI
Trivy


Quality gates

npm ci
npm run lint
npm run build


Build Docker image
Scan image with Trivy
Authenticate to Amazon ECR
Tag image

build number
Git short SHA
latest


Push image to ECR
Archive build metadata and scan output


Terraform Outputs
After terraform apply, useful outputs include:

instance_id
public_ip
ssm_shell_command
ssm_port_forward_jenkins
ssm_port_forward_mario
ecr_repository_name
ecr_repository_url

Example:

ecr_repository_name = "supermario-mario-platformer"
ecr_repository_url  = "132334512300.dkr.ecr.eu-central-1.amazonaws.com/supermario-mario-platformer"

1. Provision infrastructure

cd infra/jenkins-ec2
terraform init
terraform apply -var-file=terraform.tfvars

2. Access the Jenkins host with SSM

aws ssm start-session --target <instance-id>

3. Optional: port-forward Jenkins locally

aws ssm start-session \
  --target <instance-id> \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["8080"],"localPortNumber":["8080"]}'

Then open:http://localhost:8080

4. Run the Jenkins pipeline
The V2 pipeline should:

build the image
scan it with Trivy
push it to Amazon ECR

5. Verify ECR publication

aws ecr describe-images \
  --repository-name supermario-mario-platformer \
  --region eu-central-1

6. Destroy infrastructure when finished
terraform destroy -var-file=terraform.tfvars



Operational Notes

The Jenkins EC2 instance is intended to act as a CI engine, not as the final runtime target for production deployment.
The published container image is the main output of the V2 workflow.
Future delivery stages can consume the ECR image from ECS, EKS, or a GitOps-driven deployment workflow.


Roadmap
Planned next steps include:

Final V2 validation with successful image publication to ECR
Improved Docker image optimization with Next.js standalone output
Additional quality gates such as TypeScript type checking
SonarQube integration
Environment promotion strategy (dev / stage / prod)
CD integration using ECS, EKS, or ArgoCD
GitOps-based deployment model
Secrets management improvements

This repository is intentionally built as more than a simple game demo.
It demonstrates how to evolve a small web application into a production-style DevOps workflow by combining:

infrastructure as code
containerization
CI security checks
artifact publication
AWS-native registry integration

The goal is not only to run the application, but also to package and validate it in a way that is closer to real enterprise delivery practices.
