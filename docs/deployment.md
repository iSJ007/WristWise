# Deployment

The app runs on a single EC2 t3.micro (~$8/month) with four Docker containers managed by Docker Compose. Infrastructure is provisioned with Terraform. GitHub Actions handles building, pushing, and deploying on every push to `main`.

```
nginx (port 80)
  ├── /api/*  →  .NET API container
  └── /*      →  React (nginx) container

PostgreSQL container (internal only)
```

## Prerequisites

- AWS account with programmatic access (an IAM user with programmatic credentials)
- Terraform installed locally — [download here](https://developer.hashicorp.com/terraform/downloads)
- Docker Desktop installed locally (for testing before you deploy)
- A GitHub repo with Actions enabled

## First-time setup

### 1. Provision infrastructure

This step creates everything on AWS — the server, the database, the image registry, all of it.

```bash
cd terraform
terraform init
terraform apply
```

Terraform will show you a list of what it's about to create and ask you to confirm. Type `yes`. It takes about 2 minutes.

When it finishes, run these commands to get the values you'll need for the next step:

```bash
terraform output server_ip              # the public IP of your server → EC2_HOST
terraform output api_ecr_url            # where to push the API Docker image → ECR_API_URL
terraform output client_ecr_url         # where to push the frontend image → ECR_CLIENT_URL
terraform output -raw ssh_private_key   # the SSH key to access the server → EC2_SSH_KEY
```

The EC2 instance runs a setup script on first boot that installs Docker and creates the `/app` folder. This takes about 2 minutes after the instance starts. You can SSH in to check: `ssh -i key.pem ec2-user@<server_ip>`.

### 2. Add GitHub Secrets

GitHub Secrets are how you pass sensitive values to the deployment pipeline without putting them in the code. Go to your repo → **Settings** → **Secrets and variables** → **Actions**, then add each of these:

| Secret | Where to get it |
|---|---|
| `AWS_ACCESS_KEY_ID` | Your IAM user's access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user's secret key |
| `EC2_HOST` | From `terraform output server_ip` |
| `EC2_SSH_KEY` | From `terraform output -raw ssh_private_key` |
| `ECR_API_URL` | From `terraform output api_ecr_url` |
| `ECR_CLIENT_URL` | From `terraform output client_ecr_url` |
| `DB_PASSWORD` | Pick a strong password for the database |
| `JWT_KEY` | Any random string, at least 32 characters |
| `ADMIN_PASSWORD` | The password for the admin account |

### 3. Push to main

Once the secrets are in place, push to `main`. GitHub Actions will take it from there — build the images, push them to ECR, SSH into the server, write the `.env` file, and start the containers.

The first deploy takes 3-5 minutes. After that, the app is live at `http://<server_ip>`.

## What happens on every deploy

Every push to `main` triggers this sequence automatically:

1. Build the API Docker image and push it to ECR
2. Build the frontend Docker image and push it to ECR
3. Copy `docker-compose.yml` and `nginx.conf` to the server
4. SSH into the server
5. Write the `.env` file from GitHub Secrets (this file is never stored in git)
6. Pull the new images from ECR
7. Restart the containers with the new images

The whole thing takes about 2-3 minutes. The app stays up during the pull — it only goes down for a few seconds when the containers restart.

## Running locally with Docker

To test the full Docker setup on your machine before pushing:

```bash
cp .env.example .env
# open .env and fill in real values
docker compose up --build
```

Visit `http://localhost`. This is the same setup as production — nginx in front, API and frontend behind it, PostgreSQL in a container.

## Infrastructure overview

| Resource | What it's for | Monthly cost |
|---|---|---|
| EC2 t3.micro | Runs all four containers | ~$7.50 |
| Elastic IP | Gives the server a fixed public IP | Free while attached |
| ECR (×2) | Stores the Docker images | Free under 500MB |
| PostgreSQL | Database, running inside Docker on the EC2 | Included |
| **Total** | | **~$8/mo** |

## Useful commands

SSH into the server:
```bash
ssh -i key.pem ec2-user@<server_ip>
```

Check what's running:
```bash
docker compose ps
```

Follow the API logs:
```bash
docker compose logs api -f
```

Restart one container without touching the others:
```bash
docker compose restart api
```

Shut everything down (data is preserved in the postgres volume):
```bash
docker compose down
```

Shut down and wipe the database too:
```bash
docker compose down -v
```

## Destroying everything

When you're done and want to stop paying for AWS resources:

```bash
cd terraform
terraform destroy
```

This removes the EC2 instance, Elastic IP, ECR repos, and everything else Terraform created. The EBS volume (and your data) goes with it — there's no undo.
