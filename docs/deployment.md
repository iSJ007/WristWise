# Deployment

The app runs on a single EC2 t3.micro. Everything is containerised with Docker Compose, infrastructure is provisioned with Terraform, and GitHub Actions handles the full build and deploy on every push to `main`.

```
nginx (port 80)
  ├── /api/*  →  .NET API container
  └── /*      →  React static files (served directly by nginx)

PostgreSQL container (internal only)
```

The React app gets built at deploy time and its output files are served by nginx directly — no separate frontend container needed.

## What you need before starting

- An AWS account with an IAM user that has programmatic access
- Terraform installed locally — [download here](https://developer.hashicorp.com/terraform/downloads)
- A GitHub repo with Actions enabled

## First-time setup

### 1. Provision the server

Run Terraform from the `terraform/` folder. It creates everything — the EC2 instance, a fixed public IP, the security group, and SSH keys.

```bash
cd terraform
terraform init
terraform apply
```

Terraform will show you what it's about to create and ask you to confirm. Type `yes`. It takes about 2 minutes.

Once it's done, grab the values you'll need for GitHub Secrets:

```bash
terraform output server_ip            # → EC2_HOST
terraform output -raw ssh_private_key # → EC2_SSH_KEY
```

The server runs a setup script on first boot that installs Docker. Give it 2 minutes after the instance starts before you deploy.

### 2. Create a GitHub Personal Access Token

The server needs to pull the API Docker image from GitHub Container Registry. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)** and create a token with the `read:packages` scope. Save it — you'll need it in the next step.

> If your repo is public, images are public too and the server can pull without a token. In that case you can skip this step and remove the `GHCR_TOKEN` login line from `deploy.yml`.

### 3. Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions** and add these:

| Secret | Where to get it |
|---|---|
| `EC2_HOST` | From `terraform output server_ip` |
| `EC2_SSH_KEY` | From `terraform output -raw ssh_private_key` |
| `GHCR_TOKEN` | The personal access token you just created |
| `DB_PASSWORD` | Pick any strong password for the database |
| `JWT_KEY` | Any random string, at least 32 characters |
| `ADMIN_PASSWORD` | Password for the admin account |

### 4. Push to main

Once the secrets are in, push to `main`. GitHub Actions handles the rest. The first deploy takes 3–5 minutes, then the app is live at `http://<server_ip>`.

## What happens on every deploy

Every push to `main` triggers this automatically:

1. Log in to GitHub Container Registry using the built-in `GITHUB_TOKEN`
2. Build the .NET API Docker image and push it to `ghcr.io`
3. Build the React app with `npm run build` — produces a folder of static files
4. Copy `docker-compose.yml`, `nginx.conf`, and the built frontend to the server
5. SSH into the server, write the `.env` file from GitHub Secrets, pull the new API image, restart the containers

The whole thing takes 2–3 minutes. The app stays up while pulling the new image — only a few seconds of downtime when the containers actually restart.



## Infrastructure

| Resource | Purpose | Monthly cost |
|---|---|---|
| EC2 t3.micro | Runs all three containers | ~$7.50 |
| Elastic IP | Gives the server a stable public IP | Free while attached |
| PostgreSQL | Database, running inside Docker | Included |
| **Total** | | **~$8/mo** |

Docker images are stored in GitHub Container Registry (ghcr.io) — free for public repos, and free up to 500MB for private ones.

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

Wipe the database too:
```bash
docker compose down -v
```

## Tearing everything down

When you're done and want to stop paying for AWS:

```bash
cd terraform
terraform destroy
```

This removes the EC2 instance, Elastic IP, and everything else Terraform created. Your data goes with it — there's no undo.
