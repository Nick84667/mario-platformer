variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
  default     = "supermario"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.50.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Two public subnet CIDRs"
  type        = list(string)
  default     = ["10.50.1.0/24", "10.50.2.0/24"]
}
variable "public_subnet_azs" {
  description = "Availability Zones for the two public subnets"
  type        = list(string)
  default     = ["eu-central-1b", "eu-central-1c"]
}

variable "instance_type" {
  description = "EC2 instance type for Jenkins server"
  type        = string
  default     = "c7i-flex.large"
}

variable "root_volume_size" {
  description = "Root volume size in GiB"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default = {
    Project     = "super-mario"
    Environment = "lab"
    ManagedBy   = "terraform"
  }
}

variable "admin_cidr" {
  description = "CIDR allowed to access Jenkins and Mario app"
  type        = string
}
