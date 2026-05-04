# Deployment

The app runs on a single EC2 t3.micro (~$8/month) with four Docker containers managed by Docker Compose. Infrastructure is provisioned with Terraform. GitHub Actions handles building, pushing, and deploying on every push to `main`.

```
nginx (port 80)
  ├── /api/*  →  .NET API container
  └── /*      →  React (nginx) container

PostgreSQL container (internal only)
```

## Prerequisites

- AWS account with programmatic access
- Terraform installed locally
- Docker installed locally (for testing)
- GitHub repo with Actions enabled

## First-time setup

### 1. Provision infrastructure

```bash
cd terraform
terraform init
terraform apply
```

Terraform creates the EC2 instance, Elastic IP, security group, ECR repositories, and an SSH key pair. When it finishes, grab the outputs:

```bash
terraform output server_ip          # → EC2_HOST secret
terraform output api_ecr_url        # → ECR_API_URL secret
terraform output client_ecr_url     # → ECR_CLIENT_URL secret
terraform output -raw ssh_private_key  # → EC2_SSH_KEY secret
```

The EC2 instance bootstraps itself on first boot — it installs Docker, Docker Compose, and creates `/app`. This takes about 2 minutes. You can SSH in to check: `ssh -i key.pem ec2-user@<server_ip>`.

### 2. Add GitHub Secrets

Go to your repo → Settings → Secrets and variables → Actions, and add:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `EC2_HOST` | From `terraform output server_ip` |
| `EC2_SSH_KEY` | From `terraform output -raw ssh_private_key` |
| `ECR_API_URL` | From `terraform output api_ecr_url` |
| `ECR_CLIENT_URL` | From `terraform output client_ecr_url` |
| `DB_PASSWORD` | Pick a strong password |
| `JWT_KEY` | Random string, 32+ characters |
| `ADMIN_PASSWORD` | Password for the admin account |

### 3. Push to main

Once secrets are set, push to `main`. GitHub Actions will build the images, push them to ECR, SSH into the server, write the `.env` file, and start the containers. First deploy takes 3-5 minutes.

## CI/CD flow

Every push to `main`:

1. Builds the API Docker image (from `src/WristWise.API/Dockerfile`)
2. Builds the Client Docker image (from `src/WristWise.Client/Dockerfile`)
3. Pushes both to ECR
4. SSHs into the EC2 instance
5. Writes `.env` from GitHub Secrets
6. Clones/pulls the repo to `/app`
7. Runs `docker compose pull && docker compose up -d`

The app is live at `http://<server_ip>` within a minute of the workflow finishing.

## Running locally with Docker

To test the full Docker setup on your machine before pushing:

```bash
cp .env.example .env
# fill in .env with real values

docker compose up --build
```

Visit `http://localhost`. The setup is identical to production.

## Infrastructure overview

| Resource | Purpose | Cost |
|---|---|---|
| EC2 t3.micro | Runs all containers | ~$7.50/mo |
| Elastic IP | Fixed public IP | Free while attached |
| ECR (x2) | Stores Docker images | Free under 500MB |
| PostgreSQL (Docker) | Database | Included in EC2 |
| **Total** | | **~$8/mo** |

## Useful commands

SSH into the server:
```bash
ssh -i key.pem ec2-user@<server_ip>
```

Check running containers:
```bash
docker compose ps
```

View API logs:
```bash
docker compose logs api -f
```

Restart a single container:
```bash
docker compose restart api
```

Tear down everything (data is preserved in the postgres volume):
```bash
docker compose down
```

To also wipe the database:
```bash
docker compose down -v
```

## Destroying infrastructure

When you're done with the app, run this to avoid ongoing charges:

```bash
cd terraform
terraform destroy
```

This removes the EC2 instance, Elastic IP, ECR repos, and everything else Terraform created. The EBS volume (and your data) goes with it.
