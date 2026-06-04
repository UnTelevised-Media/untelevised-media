# Coral Comments — Hetzner Ubuntu Server Deployment

Self-hosted Coral by Vox Media on a fresh Hetzner Ubuntu 22.04 / 24.04 VPS.

**Minimum server spec:** 2 vCPU, 4 GB RAM, 40 GB SSD (Hetzner CX22 or above)

---

## 1. Initial Server Access

When Hetzner provisions the server they email you the root password or let you add an SSH key.

```bash
ssh root@YOUR_SERVER_IP
```

---

## 2. Create a Non-Root User

Never run your services as root.

```bash
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key to the new user so you can log in as deploy
rsync --archive --chown=sysadmin:sysadmin ~/.ssh /home/sysadmin
```

Log out and log back in as `deploy`:

```bash
exit
ssh deploy@YOUR_SERVER_IP
```

---

## 3. Update the System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw
```

---

## 4. Configure the Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
sudo ufw status
```

---

## 5. Install Docker

Use the official Docker apt repository — **not** the Ubuntu snap version.

```bash
# Add Docker's GPG key
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the Docker apt repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow deploy user to run docker without sudo
sudo usermod -aG docker deploy

# Apply the group change in this session
newgrp docker

# Verify
docker --version
docker compose version
```

---

## 6. Point DNS at the Server

In your DNS provider (Cloudflare, Namecheap, etc.) add an **A record**:

| Name  | Type | Value          | Proxy                               |
| ----- | ---- | -------------- | ----------------------------------- |
| coral | A    | YOUR_SERVER_IP | DNS only (grey cloud if Cloudflare) |

> **Cloudflare note:** Set to "DNS only" (grey cloud). Caddy needs to reach Let's Encrypt directly on port 80 to issue the TLS certificate. You can enable the proxy after the first certificate is issued if you want.

Wait 2–5 minutes for DNS to propagate before continuing. Test with: `dig coral.untelevised.media +short`

---

## 7. Clone the Repository

Clone the Coral container repo into `/opt/untelevised-media`.

```bash
sudo mkdir -p /opt/untelevised-media
sudo chown sysadmin:sysadmin /opt/untelevised-media

git clone https://github.com/Digitl-Alchemyst/coral-container.git /opt/untelevised-media

cd /opt/untelevised-media
```

---

## 8. Create the Environment File

All docker configuration lives in the `docker/` subdirectory.mkdir-p

```bash
cd /opt/untelevised-media/docker

cp .env.example .env
nano .env
```

Fill in every value. Here is what each one needs:

```bash
# The public URL of your Coral instance — must match your DNS record
CORAL_URL=https://coral.untelevised.media

# Origins allowed to embed the comment widget
CORAL_ALLOWED_ORIGINS=https://untelevised.live,https://www.untelevised.live,https://untelevised.media,https://www.untelevised.media

# Coral's own internal signing secret (NOT the SSO secret)
# Generate a fresh one:
#   openssl rand -base64 32
CORAL_SIGNING_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE

# Gmail SMTP — use an App Password, not your Gmail login password
# Steps: myaccount.google.com/security → App passwords → create one named "Coral"
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=your@gmail.com
EMAIL_SMTP_PASSWORD=xxxx xxxx xxxx xxxx    # 16-char App Password from Google
EMAIL_SMTP_SECURE=false
EMAIL_FROM_ADDRESS=your@gmail.com

# Optional but recommended — AI toxicity detection
# https://developers.google.com/codelabs/setup-perspective-api
PERSPECTIVE_API_KEY=

# How many days of nightly backups to keep
BACKUP_RETAIN_DAYS=14
```

Generate the signing secret now:

```bash
openssl rand -base64 32
# Copy the output and paste it as CORAL_SIGNING_SECRET in .env
```

Save and close (`Ctrl+X`, `Y`, `Enter` in nano).

---

## 9. Create the Backups Directory

```bash
mkdir -p /opt/untelevised-media/docker/backups
```

---

## 10. Start the Stack

```bash
cd /opt/untelevised-media/docker

docker compose up -d
```

Docker will pull all images (Coral, MongoDB, Redis, Caddy) — this takes 2–4 minutes on first run.

Watch the startup logs:

```bash
docker compose logs -f
```

Once you see Coral log `Listening on port 5000` and Caddy log `certificate obtained successfully`, press `Ctrl+C` to stop tailing.

Check all containers are running:

```bash
docker compose ps
```

All five services (`talk`, `mongo`, `redis`, `caddy`, `backup`) should show `running`.

---

## 11. Complete the Coral Admin Setup Wizard

Open a browser and visit:

```
https://coral.untelevised.media/admin
```

The setup wizard walks you through:

1. **Create admin account** — set your admin email and password
2. **Organization name** — "UnTelevised Media"
3. **Site URL** — `https://untelevised.media`

---

## 12. Configure SSO in Coral Admin

This connects Coral to your Clerk-authenticated readers.

1. In Coral Admin go to **Configure → Authentication**
2. Enable **Single Sign-On**
3. In the **SSO Key** field paste your `CORAL_SSO_SECRET` value

> `CORAL_SSO_SECRET` is the secret you set in your **Vercel environment variables** and in your local `.env.local`. It is **different** from `CORAL_SIGNING_SECRET` in this docker `.env` file.
>
> If you haven't generated it yet:
>
> ```bash
> openssl rand -base64 32
> ```
>
> Add this value to Vercel → Settings → Environment Variables as `CORAL_SSO_SECRET`, and paste the same value into the Coral Admin SSO Key field.

---

## 13. Configure Toxicity Detection (Optional)

In Coral Admin → **Configure → Moderation**:

- Enable **Perspective API** and paste your `PERSPECTIVE_API_KEY`
- Set a toxicity threshold (70% is a good starting point)

---

## 14. Verify Everything Works End-to-End

1. Open any article on `https://untelevised.media`
2. If you have functional cookies accepted, the Coral embed should load
3. Click "Sign in" — it should redirect to Clerk login
4. After signing in, you should be automatically logged into Coral with no second prompt
5. Try posting a test comment

---

## Ongoing Operations

### View logs

```bash
cd /opt/untelevised-media/docker

docker compose logs -f talk        # Coral
docker compose logs -f mongo       # MongoDB
docker compose logs -f caddy       # Caddy / TLS
```

### Stop / start

```bash
docker compose down       # stop (data is preserved in volumes)
docker compose up -d      # start again
```

### Update Coral to a new version

```bash
cd /opt/untelevised-media/docker

git pull                            # pull latest docker configs
docker compose pull                 # pull latest images
docker compose up -d                # recreate containers with new images
docker image prune -f               # clean up old image layers
```

### Manual backup

```bash
docker compose exec backup /backup.sh
ls /opt/untelevised-media/docker/backups/
```

### Restore from backup

```bash
# Stop Coral so no writes happen during restore
docker compose stop talk

# Extract the archive
tar -xzf /opt/untelevised-media/docker/backups/coral_YYYYMMDD_HHMMSS.tar.gz \
  -C /tmp/coral-restore

# Restore into MongoDB
docker compose exec -T mongo mongorestore \
  --host localhost \
  --db coral \
  --drop \
  /tmp/coral-restore

# Restart Coral
docker compose start talk
```

### Renew TLS certificate

Caddy renews certificates automatically. No action needed.

---

## Troubleshooting

**Caddy fails to get a certificate**

- Make sure port 80 is open in the firewall: `sudo ufw status`
- Make sure DNS is pointing at this server: `dig coral.untelevised.media +short`
- Check Caddy logs: `docker compose logs caddy`

**Coral container keeps restarting**

- MongoDB may still be starting. Wait 30 seconds and check: `docker compose ps`
- Check logs: `docker compose logs talk`

**SSO not working — users not logged into Coral**

- Confirm `CORAL_SSO_SECRET` in Vercel and in Coral Admin → Configure → Authentication → SSO Key are **identical**
- Check `/api/coral-token` returns a token in the browser network tab when logged in
