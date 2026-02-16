# EduNexus Deployment Guide

## 🚀 Quick Deploy

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `shreeK05/EduNexus`
5. **Root Directory**: `client`
6. **Framework Preset**: Vite
7. **Build Command**: `npm run build`
8. **Output Directory**: `dist`
9. Click "Deploy"

### Backend (Render)
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect `shreeK05/EduNexus`
5. **Root Directory**: `server`
6. **Build Command**: `npm install`
7. **Start Command**: `node server.js`
8. **Environment Variables**:
   ```
   MONGO_URI=<your_mongodb_atlas_connection_string>
   JWT_SECRET=<your_jwt_secret>
   EMAIL_USER=<your_email>
   EMAIL_PASS=<your_email_app_password>
   PORT=10000
   ```
9. Click "Create Web Service"

### Update Frontend API URLs
After backend is deployed, update `client/src` files:
- Replace `http://localhost:10000` with your Render backend URL
- Example: `https://edunexus-api.onrender.com`

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/edunexus
JWT_SECRET=your_super_secret_key_here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
PORT=10000
```

### Frontend (Vercel Environment Variables)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## ✅ Post-Deployment Checklist
- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] MongoDB Atlas connected
- [ ] Email notifications working
- [ ] API URLs updated in frontend
- [ ] Test login/register
- [ ] Test creating a class
- [ ] Test live video call

## 🔄 Making Updates
1. Make changes locally
2. Test with `npm run dev`
3. Commit: `git add . && git commit -m "Update: description"`
4. Push: `git push`
5. Auto-deploys on Vercel & Render!

## 🆘 Troubleshooting
- **CORS Error**: Add frontend URL to backend CORS config
- **API Not Found**: Check API URLs in frontend
- **Email Not Sending**: Verify EMAIL_USER and EMAIL_PASS
- **Database Error**: Check MONGO_URI connection string
