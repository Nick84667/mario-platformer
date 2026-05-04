resource "aws_ecr_repository" "mario_platformer" {
  name                 = "${var.name_prefix}-mario-platformer"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-mario-platformer"
    Role = "container-registry"
  })
}

resource "aws_ecr_lifecycle_policy" "mario_platformer" {
  repository = aws_ecr_repository.mario_platformer.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
