output "vpc_id" {
  description = "ID of the VPC created for the lab"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "instance_id" {
  description = "EC2 instance ID of the Jenkins host"
  value       = aws_instance.jenkins.id
}

output "public_ip" {
  description = "Public IP of the Jenkins EC2 instance"
  value       = aws_instance.jenkins.public_ip
}

output "ssm_shell_command" {
  description = "Command to open an SSM shell session to the Jenkins EC2 instance"
  value       = "aws ssm start-session --target ${aws_instance.jenkins.id}"
}

output "ssm_port_forward_jenkins" {
  description = "Command to port-forward local port 8080 to Jenkins on the EC2 instance via SSM"
  value       = "aws ssm start-session --target ${aws_instance.jenkins.id} --document-name AWS-StartPortForwardingSession --parameters '{\"portNumber\":[\"8080\"],\"localPortNumber\":[\"8080\"]}'"
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.mario_platformer.name
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.mario_platformer.repository_url
}

output "jenkins_role_name" {
  description = "IAM role attached to the Jenkins EC2 instance"
  value       = aws_iam_role.jenkins_ec2_role.name
}

output "ssm_port_forward_mario" {
  description = "Command to port-forward local port 3000 to the Mario app via SSM"
  value       = "aws ssm start-session --target ${aws_instance.jenkins.id} --document-name AWS-StartPortForwardingSession --parameters '{\"portNumber\":[\"3000\"],\"localPortNumber\":[\"3000\"]}'"
}
