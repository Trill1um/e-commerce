# Non-Docker Deployment Guide
## Railway (Database) + Render (Backend) + Netlify (Frontend)

This guide walks you through deploying PastraBeez without Docker for cost efficiency.

---

## 🎯 Deployment Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Netlify   │ ───► │    Render    │ ───► │   Railway   │
│  (Frontend) │      │  (Backend)   │      │  (Database) │
│    FREE     │      │ $7/month or  │      │  $5/month   │
│             │      │    FREE      │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
```

**Total Cost:** $5-12/month (or FREE with limitations)

---

## Step 1: Railway MySQL Database Setup

### 1.1 Create MySQL Database

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Provision MySQL"
5. Wait for database to deploy (~30 seconds)

### 1.2 Get Database Credentials

1. Click on your MySQL service
2. Go to "Variables" tab
3. Copy these values:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLDATABASE`
   - `MYSQLPASSWORD`
   - `DATABASE_URL` (complete connection string)

**Example DATABASE_URL format:**
```
mysql://root:password@containers-us-west-123.railway.app:6789/railway
```

### 1.3 Initialize Database Schema

**Option A: Using Railway CLI (Recommended)**

Install Railway CLI:
```bash
npm i -g @railway/cli
```

Login and connect:
```bash
railway login
railway link
```

Import schema:
```bash
railway run mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < backend/database/schema.sql

railway run mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < backend/database/sample.sql
```

**Option B: Using MySQL Workbench (GUI)**

1. Download [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. Create new connection with Railway credentials
3. Open `backend/database/schema.sql`
4. Execute the script
5. Open `backend/database/sample.sql`
6. Execute the script

**Option C: Using Railway's Web Terminal**

1. In Railway dashboard, click on MySQL service
2. Go to "Data" tab
3. Use the web-based query interface
4. Copy and paste contents of `schema.sql`, execute
5. Copy and paste contents of `sample.sql`, execute

---

## Step 2: Render Backend Deployment

### 2.1 Prepare Backend for Render

Your backend is already ready! It uses:
- `npm start` → `node server.js` (production)
- `npm run dev` → `nodemon server.js` (development)

### 2.2 Create Web Service on Render

1. Go to [Render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select the repository

### 2.3 Configure Render Service

**Basic Settings:**
- **Name:** `pastrabeez-backend` (or your choice)
- **Region:** Oregon (US West) or closest to you
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free (or Starter $7/month for always-on)

### 2.4 Environment Variables

Click "Advanced" → "Add Environment Variable" and add these:

```env
# Server
NODE_ENV=production
PORT=10000

# Database (from Railway Step 1.2)
DB_HOST=containers-us-west-123.railway.app
DB_PORT=6789
DB_USER=root
DB_PASSWORD=your-railway-password
DB_NAME=railway

# Or use single DATABASE_URL instead of above 5 variables
DATABASE_URL=mysql://root:password@containers-us-west-123.railway.app:6789/railway

# JWT Secrets (generate new ones!)
ACCESS_TOKEN_SECRET=your-super-secret-access-token-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-min-32-chars
EMAIL_TOKEN_SECRET=your-super-secret-email-token-min-32-chars

# Cloudinary (your existing credentials)
CLOUDINARY_CLOUD_NAME=dcn9hggyd
CLOUDINARY_API_KEY=666817156987834
CLOUDINARY_API_SECRET=Xz65J3wOXsskVvonTVzSRXqzInY

# Redis (your existing Upstash)
REDIS_URL=rediss://default:AWPiAAIncDJkNzRmNWY1NTY3NGQ0YTc2YjkxOThjMWZjOTEzZjJhNXAyMjU1NzA@set-kid-25570.upstash.io:6379

# Frontend URL (add after deploying frontend in Step 3)
FRONTEND_URL=https://pastrabeez.netlify.app
```

**Generate Strong JWT Secrets:**
```bash
# Run these commands locally
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.5 Deploy Backend

1. Click "Create Web Service"
2. Wait for build (3-5 minutes)
3. Note your backend URL: `https://pastrabeez-backend.onrender.com`

### 2.6 Test Backend

Visit: `https://pastrabeez-backend.onrender.com/health` (if you have a health endpoint)

Or use the API directly to test.

---

## Step 3: Netlify Frontend Deployment

### 3.1 Prepare Frontend

Create `netlify.toml` in project root:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "frontend/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

### 3.2 Create Environment Variables File

Create `frontend/.env.production`:

```env
VITE_API_URL=https://pastrabeez-backend.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=dcn9hggyd
```

**Important:** This file should NOT be committed to git. Add to `.gitignore`:

```
# Add to frontend/.gitignore
.env.production
.env.local
```

### 3.3 Deploy to Netlify

**Option A: Netlify CLI (Recommended)**

Install Netlify CLI:
```bash
npm install -g netlify-cli
```

Login and deploy:
```bash
netlify login
cd frontend
netlify init
# Follow prompts, select "Create & configure a new site"
# Build command: npm run build
# Publish directory: dist

netlify deploy --prod
```

**Option B: Netlify Dashboard**

1. Go to [Netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect GitHub and select your repository
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
   - **Branch:** `main`

### 3.4 Add Environment Variables to Netlify

**Via Dashboard:**
1. Go to Site settings → Environment variables
2. Add:
   - `VITE_API_URL` = `https://pastrabeez-backend.onrender.com`
   - `VITE_CLOUDINARY_CLOUD_NAME` = `dcn9hggyd`

**Via CLI:**
```bash
netlify env:set VITE_API_URL https://pastrabeez-backend.onrender.com
netlify env:set VITE_CLOUDINARY_CLOUD_NAME dcn9hggyd
```

### 3.5 Trigger Rebuild

After adding environment variables:
1. Go to "Deploys" tab
2. Click "Trigger deploy" → "Deploy site"

### 3.6 Get Frontend URL

Your site will be available at: `https://pastrabeez.netlify.app`

Or configure custom domain in Netlify settings.

---

## Step 4: Final Configuration

### 4.1 Update Backend FRONTEND_URL

1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Netlify URL
5. Click "Save Changes" (service will auto-redeploy)

### 4.2 Update Backend CORS

Your backend already supports dynamic CORS. Verify in `backend/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
```

If you want stricter CORS, change to:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### 4.3 Verify Database Connection

Check if backend can connect to Railway:

Update `backend/lib/db.js` to support `DATABASE_URL`:

```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided (Railway format)
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading /
    };
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mern_db',
    port: process.env.DB_PORT || 3306,
  };
};

// Create connection pool
let pool = mysql.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ...rest of your code
```

---

## Step 5: Testing & Verification

### 5.1 Test Checklist

- [ ] Frontend loads at Netlify URL
- [ ] Backend responds at Render URL
- [ ] Database contains sample data
- [ ] User login works (try `admin@gmail.com` / `admin1`)
- [ ] Product listing displays
- [ ] Image upload works (Cloudinary)
- [ ] Product creation by sellers
- [ ] Rating system functions
- [ ] Admin panel shows database tables

### 5.2 Monitor Logs

**Backend logs (Render):**
- Dashboard → Your service → Logs

**Frontend build logs (Netlify):**
- Dashboard → Deploys → Click on latest deploy → Deploy log

**Database logs (Railway):**
- Dashboard → MySQL service → Deployments → Logs

---

## Troubleshooting

### Backend Can't Connect to Database

**Check:**
1. Railway MySQL is running (green status)
2. Database credentials in Render match Railway
3. Railway allows external connections (default: yes)
4. Connection string format is correct

**Fix:** Verify `DATABASE_URL` or individual DB_* variables in Render.

### CORS Errors

**Symptoms:** 
- Frontend shows "Access-Control-Allow-Origin" errors
- API calls fail with CORS policy errors

**Fix:**
1. Update `FRONTEND_URL` in Render to exact Netlify URL
2. Ensure no trailing slash in URLs
3. Redeploy backend after changes

### Frontend Environment Variables Not Working

**Symptoms:**
- API calls go to wrong URL
- Console shows `undefined` for VITE variables

**Fix:**
1. Environment variables MUST start with `VITE_`
2. Rebuild frontend after adding env vars
3. Clear Netlify cache: Deploy settings → Clear cache and retry

### Images Not Uploading

**Check:**
- Cloudinary credentials are correct
- File size under 10MB
- Network tab shows 413 or 5xx errors

**Fix:** Verify `CLOUDINARY_*` variables in Render.

### Render Free Tier Spin-Down

**Problem:** First request takes 30-60 seconds

**Solutions:**
1. Upgrade to Starter plan ($7/month) for always-on
2. Use [UptimeRobot](https://uptimerobot.com) to ping your backend every 5 minutes (keeps it warm)
3. Accept the cold start (budget option)

---

## Cost Breakdown

### Free Tier (Budget Option)
- **Railway MySQL:** $0 (Free tier: 500MB, 5GB egress)
- **Render Backend:** $0 (Spins down after 15 min inactive)
- **Netlify Frontend:** $0 (100GB bandwidth, unlimited sites)
- **Total:** $0/month

**Limitations:**
- Railway free tier expires after trial period
- Backend cold starts (30-60s delay)
- 100GB monthly bandwidth limit on Netlify

### Recommended Production Setup
- **Railway MySQL:** $5/month (1GB storage, 100GB egress)
- **Render Backend:** $7/month (Always-on, 512MB RAM)
- **Netlify Frontend:** $0 (Free tier sufficient)
- **Total:** $12/month

### Enterprise Setup
- **Railway MySQL:** $20/month (8GB storage, 500GB egress)
- **Render Backend:** $25/month (2GB RAM, auto-scaling)
- **Netlify Pro:** $19/month (400GB bandwidth)
- **Total:** $64/month

---

## Environment Variables Quick Reference

### Railway MySQL
No setup needed - auto-configured

### Render Backend
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<from-railway>
ACCESS_TOKEN_SECRET=<generate>
REFRESH_TOKEN_SECRET=<generate>
EMAIL_TOKEN_SECRET=<generate>
CLOUDINARY_CLOUD_NAME=dcn9hggyd
CLOUDINARY_API_KEY=666817156987834
CLOUDINARY_API_SECRET=Xz65J3wOXsskVvonTVzSRXqzInY
REDIS_URL=<your-upstash-url>
FRONTEND_URL=https://pastrabeez.netlify.app
```

### Netlify Frontend
```env
VITE_API_URL=https://pastrabeez-backend.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=dcn9hggyd
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Push latest code to GitHub
- [ ] Verify all packages in package.json
- [ ] Test locally with production environment
- [ ] Generate strong JWT secrets

### Railway
- [ ] MySQL service created
- [ ] Schema imported (`schema.sql`)
- [ ] Sample data imported (`sample.sql`)
- [ ] Connection tested

### Render
- [ ] Web service created
- [ ] All environment variables set
- [ ] Service deployed successfully
- [ ] Backend URL noted

### Netlify
- [ ] Site created and linked to repo
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Site deployed successfully
- [ ] Frontend URL noted

### Final Steps
- [ ] Update Render `FRONTEND_URL`
- [ ] Test full user flow
- [ ] Verify CORS working
- [ ] Check image uploads
- [ ] Test all CRUD operations

---

## Useful Commands

### Generate JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Database Connection
```bash
mysql -h <railway-host> -P <port> -u root -p<password> <database>
```

### Check Backend Health
```bash
curl https://pastrabeez-backend.onrender.com
```

### View Netlify Build Locally
```bash
cd frontend
npm run build
npx serve dist
```

---

## Support Links

- **Railway:** https://railway.app/help
- **Render:** https://render.com/docs
- **Netlify:** https://docs.netlify.com
- **MySQL:** https://dev.mysql.com/doc/

---

## Next Steps

1. Set up custom domain (optional)
2. Configure SendGrid for emails
3. Set up monitoring (Sentry, LogRocket)
4. Add CI/CD with GitHub Actions
5. Set up staging environment
