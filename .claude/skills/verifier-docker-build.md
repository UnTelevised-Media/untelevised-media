# Docker Build & Push Skill Guide

## Purpose
Perform a complete, cache-free Docker build and push to Docker Hub with zero residual artifacts.

## When to Use
- Fresh deployment needed with all caches cleared
- Build/push failing due to cached layers
- Verifying code changes work in production
- Regular maintenance builds

## Prerequisites
- Docker running and authenticated with `docker login`
- `.env` file or env vars set for all required build args
- Git repo clean (or at least no uncommitted src/ changes affecting build)

## Complete Process

### 1. Purge Everything (LOCAL)
```bash
# Delete Next.js build artifacts
rm -rf .next node_modules/.cache

# Remove all old images of this app
docker rmi -f $(docker images -q untelevisedmedia/untelevised-media)

# Prune Docker caches
docker buildx prune -af
docker system prune -f
```

**What this does:**
- `.next` and cache dirs prevent stale builds
- Old images stay on disk otherwise (huge space waste)
- buildx/system prune removes dangling layers and containers

### 2. Fresh Build (NO CACHE)
```bash
docker build \
  --no-cache \
  --pull \
  --build-arg KEY1=value1 \
  --build-arg KEY2=value2 \
  ... (all required args) \
  -t untelevisedmedia/untelevised-media:new \
  .
```

**Critical flags:**
- `--no-cache` — ignore layers from previous builds
- `--pull` — always fetch fresh base image (node:22-alpine)
- `-t new` — tag as "new" (don't overwrite "latest" yet)

**Expected output:**
```
#19 writing image sha256:xyz...
#19 naming to docker.io/untelevisedmedia/untelevised-media:new done
```

If you see `(cached)` stages, something went wrong—check flags and retry.

### 3. Verify Build Success
```bash
docker images untelevisedmedia/untelevised-media:new
docker inspect untelevisedmedia/untelevised-media:new --format='{{.RepoDigests}}'
```

Should show:
- Image exists and is recent (CREATED timestamp)
- RepoDigests shows a single entry (local image not yet pushed)

### 4. Push to Docker Hub
```bash
docker push untelevisedmedia/untelevised-media:new
```

**Expected output:**
```
latest: digest: sha256:abc... size: 2625
```

Verify it's on Docker Hub:
```bash
docker pull untelevisedmedia/untelevised-media:new
# Should fetch from remote, not use local copy
```

### 5. Deploy in Coolify
1. Go to Coolify → Your Service
2. Click **Redeploy** (NOT "Restart")
   - "Restart" reuses cached local image
   - "Redeploy" pulls latest from Docker Hub
3. Watch deployment logs until "✓ Deploy complete"

### 6. Verify in Browser
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Open DevTools → Application → Clear Site Data
3. Reload page
4. Check Network tab for new image digest in response headers (if available)

---

## Using the Scripts (EASY WAY)

### Option 1: Run Everything
```bash
npm run docker:build:push
```

### Option 2: Separate Steps
```bash
npm run docker:clean      # Purge caches only
npm run docker:build      # Build and optionally push
```

Both scripts are in `scripts/docker-clean.js` and `scripts/docker-build.js`.

---

## Troubleshooting

### Build hangs or is very slow
- Docker daemon may be unresponsive
- **Fix:** Restart Docker Desktop, retry

### "Error: docker: command not found"
- Docker not installed or not in PATH
- **Fix:** Install Docker, ensure it's running

### Build fails with "Missing environment variable"
- A required build arg wasn't set
- **Fix:** Check `.env` file, ensure all PUBLIC_ and SECRET_ keys are present

### Image builds but push fails
- Authentication issue or network
- **Fix:** Run `docker login`, check credentials, retry

### Deployed image still shows old behavior
- Coolify pulled from cache instead of Docker Hub
- **Fix:** Stop service in Coolify, delete local image, redeploy

### "Layer already exists" warnings
- Normal—only new/changed layers upload, saves bandwidth

---

## Best Practices

✅ **Always use `-t new`** until you're 100% sure the build is good
- Prevents accidentally overwriting production `:latest`
- Easy to roll back or compare

✅ **Verify digest after push**
```bash
docker push untelevisedmedia/untelevised-media:new 2>&1 | grep digest
```
- Digest is immutable identifier of the image
- Same digest = exact same content, no flakiness

✅ **Keep .env in git (encrypted)** or use CI secrets
- Hardcoding args in scripts fails locally
- Use env vars for flexibility across environments

✅ **Tag 'new' → 'latest' only after verification**
```bash
docker tag untelevisedmedia/untelevised-media:new untelevisedmedia/untelevised-media:latest
docker push untelevisedmedia/untelevised-media:latest
```

✅ **Clean between deploys**
- Don't let old images accumulate (kills disk space)
- `docker system prune -a` removes unused images globally (destructive!)

---

## Monitoring Post-Deploy

After Coolify redeploy:
1. ✅ Service starts without errors
2. ✅ Pages load (no 502s)
3. ✅ Console shows no new errors
4. ✅ Features work (click buttons, load images, etc.)

If anything fails, check Coolify logs → rollback to previous deploy → investigate root cause.

---

## Performance Notes

**Build time:** ~4-6 min (fresh, no cache)
- Dependencies install (pnpm) — 1-2 min
- Next.js build — 2-3 min
- Image export — 30s

**Image size:** ~691 MB (final)
- Base (node + deps) — ~200 MB
- Next.js build output — ~490 MB

**Push time:** ~30s - 2 min
- Depends on how many layers are new
- First push slower (all layers new)
- Subsequent pushes faster (layer reuse)

---

## Rollback if Needed

If deployed image is broken:
1. Coolify → Deployment History → select previous version
2. Click "Redeploy" on old deployment
3. Wait for it to come back up

Or manually:
```bash
docker pull untelevisedmedia/untelevised-media:latest  # Gets the old one
docker tag untelevisedmedia/untelevised-media:latest my-app:rollback
# Redeploy in Coolify pointing to :rollback tag
```
