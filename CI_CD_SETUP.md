# CI/CD Configuration — PengPeng Dashboard

## GitHub Actions Workflow

### Workflow File
- **Location**: `.github/workflows/deploy.yml`
- **Trigger**: Push to `main` branch
- **Actions**:
  1. Checkout code
  2. Setup Node.js 22
  3. Install dependencies (`npm ci`)
  4. Run build (`npm run build`)
  5. Deploy to Vercel (production)

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:
https://github.com/pengpengagent-cell/pengpeng-dashboard/settings/secrets/actions

### 1. VERCEL_TOKEN
- **Description**: Vercel Authentication Token
- **How to get**: https://vercel.com/account/tokens
- **Required**: ✅ Yes
- **Permissions**: `Full Account`

### 2. VERCEL_ORG_ID
- **Description**: Vercel Organization ID
- **How to get**:
  1. SSH to VPS
  2. Docker container: `docker exec -it openclaw-openclaw-gateway-1 bash`
  3. Run: `npx vercel ls`
  4. Look for `Organization ID` in the output
- **Required**: ✅ Yes
- **Example**: `team_xxxxxxxx`

### 3. VERCEL_PROJECT_ID
- **Description**: Vercel Project ID
- **How to get**:
  1. SSH to VPS
  2. Docker container: `docker exec -it openclaw-openclaw-gateway-1 bash`
  3. Run: `npx vercel ls`
  4. Look for `Project ID` for `pengpeng-dashboard`
- **Required**: ✅ Yes
- **Example**: `prj_xxxxxxxx`

## Setup Steps

### Step 1: Get Vercel Project Details

SSH to VPS and run:

```bash
docker exec -it openclaw-openclaw-gateway-1 bash
cd /home/node/.openclaw/workspace/pengpeng-dashboard
npx vercel ls
```

Copy the **Organization ID** and **Project ID** from the output.

### Step 2: Add GitHub Secrets

Go to: https://github.com/pengpengagent-cell/pengpeng-dashboard/settings/secrets/actions/new

Add each secret:
- `VERCEL_TOKEN` (your Vercel token)
- `VERCEL_ORG_ID` (from Step 1)
- `VERCEL_PROJECT_ID` (from Step 1)

### Step 3: Test CI/CD

Push any change to `main` branch. GitHub Actions will automatically:
1. Build the project
2. Deploy to Vercel production
3. Report results in the Actions tab

## Workflow Status Check

After setup, verify:
1. Go to: https://github.com/pengpengagent-cell/pengpeng-dashboard/actions
2. Check that workflow runs successfully
3. Verify deployment at: https://pengpeng-dashboard.vercel.app

## Troubleshooting

### "VERCEL_ORG_ID not found"
- Run `npx vercel ls` again
- Check that you're logged in with correct Vercel account

### "Build failed"
- Check the workflow logs on GitHub Actions
- Verify `npm run build` works locally

### "Deploy failed"
- Verify Vercel token has correct permissions
- Check VERCEL_PROJECT_ID matches the deployed project
