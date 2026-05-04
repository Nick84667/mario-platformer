# Jenkins Pipeline Scripts

This directory contains helper scripts used by the Jenkins CI pipeline.

The pipeline is responsible for:

- Installing dependencies
- Running quality checks
- Running security scans
- Building the Docker image
- Pushing the image to the container registry
- Updating the GitOps repository

Jenkins must not deploy directly to Kubernetes.  
Deployment is handled by ArgoCD through GitOps.
