output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.backend.id
}
