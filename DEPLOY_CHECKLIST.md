# 🚀 Quick Deployment Checklist

## Railway + Render + Netlify Deployment (No Docker)

### ⚡ Quick Start (20 minutes)

---

## 1️⃣ Railway MySQL (5 min)

1. [ ] Go to railway.app → New Project → MySQL
2. [ ] Copy `DATABASE_URL` from Variables tab
3. [ ] Install Railway CLI: `npm i -g @railway/cli`
4. [ ] Import schema:
   ```bash
   railway login
   railway link
   railway run mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < backend/database/schema.sql
   railway run mysql -h $MYSQLHOST -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < backend/database/sample.sql
   ```

**Railway Cost:** $5/month (or free trial)

---

## 2️⃣ Render Backend (10 min)

1. [ ] Go to render.com → New Web Service
2. [ ] Connect GitHub repo
3. [ ] Settings:
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. [ ] Add Environment Variables:

```env
NODE_ENV=production
DATABASE_URL=<from-railway>
ACCESS_TOKEN_SECRET=<generate-below>
REFRESH_TOKEN_SECRET=<generate-below>
EMAIL_TOKEN_SECRET=<generate-below>
CLOUDINARY_CLOUD_NAME=dcn9hggyd
CLOUDINARY_API_KEY=666817156987834
CLOUDINARY_API_SECRET=Xz65J3wOXsskVvonTVzSRXqzInY
REDIS_URL=rediss://default:AWPiAAIncDJkNzRmNWY1NTY3NGQ0YTc2YjkxOThjMWZjOTEzZjJhNXAyMjU1NzA@set-kid-25570.upstash.io:6379
FRONTEND_URL=https://your-site.netlify.app
```

**Generate Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. [ ] Deploy → Note backend URL

**Render Cost:** $7/month (or FREE with cold starts)

---

## 3️⃣ Netlify Frontend (5 min)

1. [ ] Go to netlify.com → New site from Git
2. [ ] Connect GitHub repo
3. [ ] Settings:
   - Base: `frontend`
   - Build: `npm run build`
   - Publish: `frontend/dist`
4. [ ] Add Environment Variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
   - `VITE_CLOUDINARY_CLOUD_NAME` = `dcn9hggyd`
5. [ ] Deploy → Note frontend URL

**Netlify Cost:** FREE

---

## 4️⃣ Final Steps (2 min)

1. [ ] Update Render `FRONTEND_URL` with Netlify URL
2. [ ] Test login: `admin@gmail.com` / `admin1`
3. [ ] Test product creation
4. [ ] Verify images upload

---

## 💰 Total Cost

- **Budget:** $0/month (with limitations)
- **Recommended:** $12/month (Railway $5 + Render $7)
- **Always-on:** No cold starts, reliable performance

---

## 🐛 Common Issues

### Backend 502
→ Wait 60 seconds (Render free tier cold start)

### CORS Error
→ Check `FRONTEND_URL` matches Netlify URL exactly

### Database Connection Failed
→ Verify `DATABASE_URL` in Render matches Railway

### Images Not Uploading
→ Check Cloudinary credentials in Render

---

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.

---

## ✅ Success Criteria

All these should work:

- [ ] Homepage loads
- [ ] User login works
- [ ] Products display with images
- [ ] Sellers can create products
- [ ] Image upload works
- [ ] Ratings display
- [ ] Admin panel shows tables

---

## 🔗 Service URLs

**Railway Dashboard:** https://railway.app/dashboard
**Render Dashboard:** https://dashboard.render.com
**Netlify Dashboard:** https://app.netlify.com

---

## 📞 Need Help?

1. Check service logs (Railway/Render/Netlify dashboards)
2. Review `DEPLOYMENT_GUIDE.md` troubleshooting section
3. Test locally with production env variables
4. Verify all services are running (green status)
