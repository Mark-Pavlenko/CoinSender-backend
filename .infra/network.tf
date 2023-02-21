resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
  instance_tenancy = "default"

  tags = {
    managed_by = "terraform"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main"
    managed_by = "terraform"
  }
}

resource "aws_subnet" "public" {
  cidr_block = "10.0.0.0/24"
  vpc_id = aws_vpc.main.id
  map_public_ip_on_launch = true

  availability_zone = "${var.region}a"

  tags = {
    Name = "public_main"
    managed_by = "terraform"
  }
}

resource "aws_subnet" "public1" {
  cidr_block = "10.0.1.0/24"
  vpc_id = aws_vpc.main.id
  map_public_ip_on_launch = true

  availability_zone = "${var.region}b"

  tags = {
    Name = "public_main"
    managed_by = "terraform"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "public_main"
    managed_by = "terraform"
  }
}

resource "aws_route" "public" {
  route_table_id = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.gw.id
}

resource "aws_route_table_association" "public" {
  route_table_id = aws_route_table.public.id
  subnet_id = aws_subnet.public.id
}

resource "aws_route_table_association" "public1" {
  route_table_id = aws_route_table.public.id
  subnet_id = aws_subnet.public1.id
}
