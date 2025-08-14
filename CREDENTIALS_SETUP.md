# 🔑 Credentials Setup Guide for Full-Stack Deployment

## 📍 **Where to Set Credentials**

### **1. 🚂 Railway Backend (Most Important)**

**Go to:** [Railway.app](https://railway.app) → Your Project → Variables

**Add these environment variables:**
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/orbsocial
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here
DB_NAME=orbsocial
```

**Steps:**
1. Open Railway dashboard
2. Click your project
3. Go to "Variables" tab
4. Click "New Variable"
5. Add each one separately

---

### **2. 🌐 Netlify Frontend**

**Go to:** [Netlify.com](https://netlify.com) → Your Site → Site settings → Environment variables

**Add this environment variable:**
```
REACT_APP_BACKEND_URL=https://your-railway-app.railway.app
```

**Steps:**
1. Open Netlify dashboard
2. Click your site
3. Go to "Site settings"
4. Click "Environment variables"
5. Add the backend URL

---

### **3. 🗄️ MongoDB Atlas Database**

**Go to:** [MongoDB Atlas](https://mongodb.com/atlas)

**What you need:**
- Database username and password
- Connection string

**Steps:**
1. **Create account:**
   - Go to MongoDB Atlas
   - Sign up with email
   - Choose free tier

2. **Create cluster:**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select region (closest to you)
   - Click "Create"

3. **Create database user:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `orbsocial_user`
   - Password: `your_secure_password`
   - Role: "Read and write to any database"
   - Click "Add User"

4. **Get connection string:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

**Example connection string:**
```
mongodb+srv://orbsocial_user:your_secure_password@cluster0.abc123.mongodb.net/orbsocial
```

---

### **4. 🤗 Hugging Face API Key**

**Go to:** [Hugging Face](https://huggingface.co/)

**Steps:**
1. **Create account:**
   - Go to [Hugging Face](https://huggingface.co/)
   - Click "Sign Up" (top right)
   - Create account with email or GitHub
   - Verify your email

2. **Get API key:**
   - Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Click "New token"
   - Give it a name (e.g., "OrbSocial")
   - Choose "Read" role (free tier)
   - Click "Generate token"
   - Copy the token (starts with `hf_`)

---

## 🔧 **How to Update Credentials**

### **Option 1: Through Web Dashboards (Recommended)**

1. **Railway:** Project → Variables → Add/Edit
2. **Netlify:** Site settings → Environment variables → Add/Edit
3. **MongoDB Atlas:** Database Access → Edit user → Change password
4. **Hugging Face:** Settings → Tokens → Regenerate token

### **Option 2: Through Code (Advanced)**

You can also create a `.env` file locally (but don't commit it to GitHub):

```bash
# .env (local development only)
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/orbsocial
HUGGINGFACE_API_KEY=hf_your-key-here
DB_NAME=orbsocial
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 🚨 **Security Best Practices**

1. **Never commit credentials to GitHub**
2. **Use strong, unique passwords**
3. **Rotate API keys regularly**
4. **Use environment variables (not hardcoded)**
5. **Limit database user permissions**

---

## 📱 **Quick Reference**

| Service | What You Need | Where to Get It |
|---------|---------------|-----------------|
| **Railway** | Environment variables | Railway dashboard → Variables |
| **Netlify** | Backend URL | Netlify dashboard → Environment variables |
| **MongoDB** | Connection string | MongoDB Atlas → Database → Connect |
| **Hugging Face** | API key | Hugging Face → Settings → Tokens |

---

## 🆘 **Need Help?**

- **Railway Variables:** [docs.railway.app/variables](https://docs.railway.app/variables)
- **Netlify Environment Variables:** [docs.netlify.com/environment-variables](https://docs.netlify.com/environment-variables)
- **MongoDB Atlas:** [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Hugging Face API:** [huggingface.co](https://huggingface.co/)

---

**Remember:** Keep your credentials secure and never share them publicly! 🔒
