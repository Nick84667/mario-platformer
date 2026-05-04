data "aws_iam_policy_document" "jenkins_ecr" {
  statement {
    sid    = "EcrAuth"
    effect = "Allow"

    actions = [
      "ecr:GetAuthorizationToken"
    ]

    resources = ["*"]
  }

  statement {
    sid    = "EcrPushPull"
    effect = "Allow"

    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeImages",
      "ecr:DescribeRepositories",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:ListImages",
      "ecr:PutImage",
      "ecr:UploadLayerPart"
    ]

    resources = [
      aws_ecr_repository.mario_platformer.arn
    ]
  }
}

resource "aws_iam_policy" "jenkins_ecr" {
  name   = "${var.name_prefix}-jenkins-ecr"
  policy = data.aws_iam_policy_document.jenkins_ecr.json

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-jenkins-ecr"
    Role = "jenkins-ecr-policy"
  })
}

resource "aws_iam_role_policy_attachment" "jenkins_ecr" {
  role       = aws_iam_role.jenkins_ec2_role.name
  policy_arn = aws_iam_policy.jenkins_ecr.arn
}

