output "server_ip" {
  description = "Public IP of the server — add this to GitHub Secrets as EC2_HOST"
  value       = aws_eip.app.public_ip
}

output "ssh_private_key" {
  description = "SSH private key — add this to GitHub Secrets as EC2_SSH_KEY"
  value       = tls_private_key.ssh.private_key_pem
  sensitive   = true
}
