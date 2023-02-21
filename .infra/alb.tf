resource "aws_alb" "alb" {
  name            = "server-api"
  subnets         = [aws_subnet.public.id, aws_subnet.public1.id]
  security_groups = [aws_security_group.default.id]
  internal        = false
  idle_timeout    = 300

  tags = {
    Name    = "server-api"
    Managed_By = "terraform"
  }
}

resource "aws_alb_listener" "alb_listener" {
  load_balancer_arn = aws_alb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.alb_target_group.arn
    type             = "forward"
  }
}

resource "aws_alb_listener_rule" "listener_rule" {
  listener_arn = aws_alb_listener.alb_listener.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.alb_target_group.arn
  }

  condition {
    http_header {
      http_header_name = "X-Forwarded-For"
      values = ["*"]
    }
  }
}

resource "aws_alb_target_group" "alb_target_group" {
  name     = "api"
  port     = "3000"
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  tags = {
    name = "api"
    Managed_By = "terraform"
  }
  stickiness {
    type            = "lb_cookie"
    cookie_duration = 1800
    enabled         = true
  }
}

resource "aws_lb_target_group_attachment" "test" {
  target_group_arn = aws_alb_target_group.alb_target_group.arn
  target_id        = aws_instance.ubuntu.id
  port             = 3000
}