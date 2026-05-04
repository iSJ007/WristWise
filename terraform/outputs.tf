output "server_ip" {
  description = "Public IP of the server — add this to GitHub Secrets as EC2_HOST"
  value       = aws_eip.app.public_ip
}

output "api_ecr_url" {
  description = "ECR URL for the API image — add this to GitHub Secrets as ECR_API_URL"
  value       = aws_ecr_repository.api.repository_url
}

output "client_ecr_url" {
  description = "ECR URL for the client image — add this to GitHub Secrets as ECR_CLIENT_URL"
  value       = aws_ecr_repository.client.repository_url
}

output "ssh_private_key" {
  description = "SSH private key — add this to GitHub Secrets as EC2_SSH_KEY"
  value       = tls_private_key.ssh.private_key_pem
  sensitive   = true
}
