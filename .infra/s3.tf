resource "aws_s3_bucket" "payroll" {
  bucket = "megadev-payroll"
  acl    = "public-read"

  policy = <<EOF
{
  "Version":"2012-10-17",
  "Statement":[{
     "Sid":"PublicReadGetObject",
     "Effect":"Allow",
     "Principal": "*",
     "Action":["s3:GetObject"],
     "Resource":["arn:aws:s3:::megadev-payroll/*"]
  }]
}
EOF
}

resource "aws_s3_bucket_website_configuration" "payroll" {
  bucket = aws_s3_bucket.payroll.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_cors_configuration" "payroll" {
  bucket = aws_s3_bucket.payroll.bucket

  cors_rule {
    allowed_methods = ["GET","HEAD","PUT","POST","DELETE"]
    allowed_origins = ["*"]
  }
}