aws_region = "eu-central-1"

name_prefix = "supermario"

vpc_cidr = "10.50.0.0/16"

public_subnet_cidrs = [
  "10.50.1.0/24",
  "10.50.2.0/24"
]

public_subnet_azs = [
  "eu-central-1b",
  "eu-central-1c"
]

instance_type    = "c7i-flex.large"
root_volume_size = 30

tags = {
  Project     = "super-mario"
  Environment = "lab"
  ManagedBy   = "terraform"
}
admin_cidr = "147.161.244.200/32"
