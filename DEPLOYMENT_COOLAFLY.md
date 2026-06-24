# Coolafly Deployment Guide

This guide explains how to deploy the UnTelevised Media Next.js frontend to Coolafly using Docker Compose.

## Prerequisites

- Git repository pushed to GitHub/GitLab
- Coolafly account and project
- All required environment variables (see `.env.docker`)

## Deployment Steps

### 1. Connect Git Repository

In Coolafly:
1. Go to **Services** → **Add Service** → **Docker Compose**
2. Select your Git repository (GitHub/GitLab)
3. Choose the branch to deploy (usually `main` or `production`)

### 2. Configure Environment Variables

Copy the environment variables from `.env.docker` into Coolafly:

1. In Coolafly Service Settings → **Variables**
2. Add all variables from `.env.docker`, replacing placeholder values with actual credentials

**Critical variables** (required for build):
- `NEXT_PUBLIC_PRODUCTION_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Critical variables** (required at runtime):
- `SANITY_API_READ_TOKEN`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_MEMBERSHIP_SECRET_KEY`

### 3. Select Docker Compose File

In Coolafly deployment configuration:
- **Docker Compose File**: `docker-compose.yml`
- **Build Context**: Root directory (`.`)

### 4. Configure Port Mapping

- **Internal Port**: `3000`
- **External Port**: Choose based on your domain setup (typically `80`/`443` via reverse proxy)

### 5. Enable Health Check Monitoring

The docker-compose includes a health check. Verify it's enabled:
```yaml
healthcheck:
  test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:3000/']
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 6. Deploy

1. Review configuration
2. Click **Deploy**
3. Monitor logs for build completion (typically 5-10 minutes)

## Resource Allocation

Current limits in `docker-compose.yml`:
- **CPU**: 1 core (limit) / 0.5 cores (reservation)
- **Memory**: 1 GB (limit) / 512 MB (reservation)

Adjust based on your traffic:
- **Light traffic** (< 1k/day): 512 MB RAM, 0.5 CPU
- **Medium traffic** (1k-10k/day): 1 GB RAM, 1 CPU
- **Heavy traffic** (10k+/day): 2+ GB RAM, 2+ CPU

## Troubleshooting

### Build Fails: "Dockerfile not found"

Ensure:
1. Dockerfile exists in repository root
2. Git repository is fully pushed
3. Try re-syncing the repository in Coolafly settings

### Build Hangs on pnpm Install

The build uses pnpm with `--frozen-lockfile`. Ensure:
1. `pnpm-lock.yaml` is committed to git
2. Run `pnpm install` locally before pushing if you added dependencies
3. Commit `pnpm-lock.yaml` changes

### Application Crashes After Deployment

Check logs for missing environment variables:
1. Verify all variables from `.env.docker` are set in Coolafly
2. Check that `SANITY_API_READ_TOKEN` is correct
3. Ensure runtime secrets (STRIPE, SUPABASE, etc.) are valid

### Health Check Fails

If container restarts repeatedly:
1. Check application logs for startup errors
2. Verify all required environment variables are set
3. Increase `start_period` in docker-compose if build is slow

## Monitoring

### Logs
- View real-time logs in Coolafly dashboard
- Search for ERROR, WARN levels to identify issues

### Metrics
- CPU usage: Monitor if consistently > 80%
- Memory usage: Monitor if consistently > 90%
- Response time: Health check endpoint should respond in < 1s

## Updates & Redeployment

### After Code Changes
1. Push to your Git branch
2. Coolafly auto-detects changes (if auto-deploy enabled)
3. Manually trigger deploy if needed via Coolafly dashboard

### After Dependency Updates
1. Run `pnpm install` locally
2. Commit `pnpm-lock.yaml`
3. Push to repository
4. Redeploy

### After Environment Variable Changes
1. Update variables in Coolafly dashboard
2. Redeploy service (doesn't require code push)

## SSL/TLS

Coolafly automatically handles SSL via Let's Encrypt. Ensure:
- Domain is properly configured in Coolafly
- DNS points to Coolafly servers
- HTTPS enforcement is enabled

## Database & External Services

This deployment connects to external services:
- **Sanity CMS** — Content management
- **Clerk** — Authentication
- **Stripe** — Payments
- **Supabase** — View tracking / user data
- **Coral** — Comments system

All connections use environment variables. Ensure these services are:
1. Accessible from Coolafly's network (typically any public HTTPS endpoint)
2. Configured with correct API tokens in environment variables
3. Webhook endpoints configured if applicable (e.g., Stripe webhooks)

## Backup & Recovery

Coolafly automatically snapshots your deployment. To rollback:
1. Access Coolafly deployment history
2. Select previous working version
3. Redeploy from snapshot

## Cost Optimization

- **Container doesn't run when not needed**: Set auto-scaling if Coolafly supports it
- **Optimize image size**: Current multi-stage build is already optimized (~250MB)
- **Cache layers**: Docker automatically caches build layers between deployments

## Support

For Coolafly-specific issues:
- Check Coolafly documentation: https://coolfiy.io/docs
- Review container logs in Coolafly dashboard
- Test locally with: `docker-compose -f docker-compose.yml up`

For application-specific issues:
- Check `/api/*` endpoints for errors
- Review Sentry for error tracking
- Check external service status pages (Sanity, Clerk, etc.)
