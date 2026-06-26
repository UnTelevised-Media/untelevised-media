# Coolafly Deployment Troubleshooting

## Error: "failed to read dockerfile: open Dockerfile: no such file or directory"

This error means coolafly's Docker build cannot locate the `Dockerfile` in the build context.

### Quick Fix Checklist

- [x] Dockerfile is committed to git repository
- [x] docker-compose.yml is committed to git repository  
- [x] Files are pushed to remote GitHub
- [ ] **Action:** In Coolafly, force a repository re-sync:
  1. Go to Service Settings
  2. Click "Resync Repository" or similar refresh button
  3. Wait for git to pull latest changes
  4. Retry deployment

---

## Step-by-Step Resolution

### 1. Verify Repository Sync (Coolafly)

**In Coolafly Dashboard:**
- Navigate to your service settings
- Look for "Repository" or "Source" section
- Click "Refresh" or "Resync" to force a git pull
- Verify the commit hash includes `da6ad34` (the deployment commit)

### 2. Check Build Configuration

**In Coolafly Service Configuration:**
- **Docker Compose File:** `docker-compose.yml`
- **Build Context:** `.` (dot, meaning root directory)
- **Dockerfile:** Leave blank OR set to `Dockerfile` (coolafly will find it via docker-compose)

Do NOT set `dockerfile` path in docker-compose if it's relative to root.

### 3. Verify Git Branch

**In Coolafly Service Settings:**
- Check which branch is being deployed (main vs production)
- Confirm it matches your GitHub branch
- Both main and production now have the deployment files

### 4. Clear Coolafly Cache (if available)

Some platforms cache build contexts. Try:
- Stopping the service
- Clearing build cache
- Starting/redeploying from scratch

### 5. Manual Docker Test (Optional - Local)

Test the docker-compose locally to verify it works:

```bash
# From project root
docker-compose -f docker-compose.yml config
docker-compose -f docker-compose.yml build
```

If either command fails locally, the issue is not with coolafly.

---

## Deployment Configuration in Coolafly

Make sure these are set correctly:

| Setting | Value |
|---------|-------|
| **Repository URL** | https://github.com/UnTelevised-Media/untelevised-media.git |
| **Branch** | `main` (or `production`) |
| **Docker Compose File** | `docker-compose.yml` |
| **Build Context** | `.` |
| **Node.js Version** | 22+ (if coolafly asks) |

---

## Required Environment Variables

Before retrying deployment in Coolafly, ensure these variables are set:

**Build-time (required for successful build):**
- `NEXT_PUBLIC_SANITY_PROJECT_ID` = `ypejdt32`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...`

**Runtime (required for app to function):**
- `SANITY_API_READ_TOKEN` = your token
- `CLERK_SECRET_KEY` = your secret
- `NEXT_PUBLIC_SUPABASE_URL` = URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = key

See `DEPLOYMENT_COOLAFLY.md` for the complete list.

---

## If Issue Persists

### Option A: Rebuild from Clean State
1. Delete the service in Coolafly
2. Disconnect repository
3. Wait 1-2 minutes
4. Create new service and reconnect repository

### Option B: Use Direct Image Build
If Coolafly supports it, try building without docker-compose:
1. Point directly to the `Dockerfile` 
2. Set build context to `.`
3. Provide all required build args as environment variables

### Option C: Alternative Deploy Method
Use Coolafly's direct CLI or API if available:
```bash
coolify deploy --service <service-id> --force-rebuild
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Dockerfile not found | Git not synced | Click resync repository in Coolafly |
| Build args missing | Env vars not set | Add all NEXT_PUBLIC_* variables |
| Port 3000 unreachable | Health check failing | Check logs for startup errors |
| OOM (Out of Memory) | Resource limits too low | Increase to 1-2GB in docker-compose |
| CSP/CORS errors | App running but connection fails | Verify all URLs in env vars |

---

## Support Resources

- **Coolafly Docs:** https://coolfiy.io/docs
- **Docker Compose Reference:** https://docs.docker.com/compose/compose-file/
- **Next.js Deployment:** https://nextjs.org/docs/deployment

For application-specific issues, check application logs in Coolafly for Sentry/error messages.
