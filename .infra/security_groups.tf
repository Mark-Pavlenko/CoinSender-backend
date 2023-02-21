resource "aws_security_group" "default" {
  name = "default-sg"
  description = "Default SG to allow traffic from VPC"

  vpc_id = aws_vpc.main.id

  ingress {
    from_port = 0
    protocol = "tcp"
    to_port = 65535
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port = 0
    protocol = "-1"
    to_port = 0
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    managed_by = "terraform"
  }
}

resource "aws_security_group_rule" "ping" {
  from_port = -1
  protocol = "icmp"
  security_group_id = aws_security_group.default.id
  to_port = -1
  type = "ingress"
  cidr_blocks = ["0.0.0.0/0"]
}