# Mario Platformer

Production-style lab repository that validates an end-to-end DevOps workflow on AWS for a browser-playable 2D platformer inspired by classic side-scrolling games.

## Overview

This repository combines:

- **Application layer**: a Next.js-based Mario-style browser game
- **Infrastructure layer**: Terraform module to provision AWS networking and a Jenkins EC2 host
- **Delivery layer**: Jenkins pipeline to build a Docker image and run the application on EC2

The V1 lab has been validated end-to-end with:

- Terraform **apply**
- Jenkins + Docker bootstrap on EC2
- Dockerized application deployment
- Application health verification
- Terraform **destroy**

## Repository Structure

- `infra/jenkins-ec2/` - Terraform module for AWS infrastructure and Jenkins EC2 bootstrap
- `Dockerfile` - container definition for the Mario application
- `Jenkinsfile` - Jenkins pipeline for build and deployment
- `package.json` - Node.js / Next.js application definition
- `README.md` - project documentation

## Tech Stack

- **Frontend / App**: Next.js, React, TypeScript
- **Infrastructure**: Terraform, AWS EC2, VPC, IAM, Security Groups
- **CI Runtime**: Jenkins, Docker
- **Access / Ops**: AWS Systems Manager Session Manager

## What V1 Validates

- Provisioning of a dedicated AWS lab environment with Terraform
- Automated installation of Jenkins and Docker on EC2
- Build and deployment of the Mario application as a Docker container
- Secure access to Jenkins and application endpoints through restricted Security Group rules
- Clean teardown of all provisioned infrastructure with Terraform destroy

## Application Endpoints

When the lab is provisioned:

- **Jenkins UI**: `http://<ec2-public-ip>:8080`
- **Mario App**: `http://<ec2-public-ip>:3000`

## Quick Start

### Provision infrastructure


cd infra/jenkins-ec2
terraform init
terraform apply -var-file=terraform.tfvars
