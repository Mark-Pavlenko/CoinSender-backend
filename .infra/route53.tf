resource "aws_route53_zone" "megadevlc" {
  name = "megadevllc.com"

  tags = {
    Managed_By = "Terraform"
  }
}