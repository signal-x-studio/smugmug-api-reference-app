# Troubleshooting Guide

> **Common issues and solutions for local development**

## 🚨 Common Issues & Solutions

### **Build or Install Failures**

#### ❌ `npm install` fails or takes too long
**Symptoms:** Hanging installation, network errors, or missing packages
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### ❌ `vite: command not found` 
**Symptoms:** Build fails with "sh: vite: command not found"
```bash
# Use npx to run vite directly
npm run build    # Should work with current setup
# Or manually: npx vite build
```

### **Development Server Issues**

#### ❌ Port 3000 already in use
**Symptoms:** `Error: listen EADDRINUSE: address already in use :::3000`
```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
npm run dev -- --port 3001

# Option 3: Configure permanently in vite.config.ts
# server: { port: 3001 }
```

#### ❌ Blank white screen on localhost:3000
**Symptoms:** Page loads but shows nothing
```bash
# Check browser console for errors
# Usually means Tailwind CSS isn't loading

# Fix: Restart dev server
npm run dev
```

### **Styling Issues**

#### ❌ Tailwind styles not appearing
**Symptoms:** App loads but looks unstyled, missing colors/layout
```bash
# Check if CSS is building
npm run build

# Should see: dist/assets/index-*.css (~28KB)
# If missing, check tailwind.config.js content patterns
```

#### ⚠️ Tailwind performance warning
**Symptoms:** Warning about content pattern matching node_modules
```
# Already fixed in current tailwind.config.js
# If you see this, update the content patterns to exclude node_modules
```

### **API & Environment Issues**

#### ❌ `API_KEY environment variable not set`
**Symptoms:** App crashes on startup with API key error
```bash
# This should be fixed - app now works without API key
# If you still see this, check services/geminiService.ts
# Should have graceful fallbacks
```

#### ❌ AI features not working
**Symptoms:** Mock data instead of real AI responses
```bash
# This is expected behavior without API key
# To enable AI features:
cp .env.example .env
# Edit .env and add real Gemini API key
```

### **Node.js Version Issues**

#### ❌ Installation fails with Node version error
**Symptoms:** Incompatible Node.js version warnings
```bash
# Check your Node version
node --version

# Should be 18.0.0 or higher
# To upgrade Node.js:
# - Use nvm: nvm install --lts
# - Or download from: https://nodejs.org
```

### **Memory Issues**

#### ❌ Build process crashes or is very slow
**Symptoms:** Out of memory errors, very slow builds
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or close other applications to free memory
```

## 🛠️ Advanced Debugging

### **Reset Everything**
```bash
# Nuclear option - clean slate
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install
npm run dev
```

### **Check Dependencies**
```bash
# Verify all packages installed correctly
npm list --depth=0

# Check for vulnerabilities
npm audit

# Update dependencies if needed
npm update
```

### **Development Mode Verification**
```bash
# Verify app is running correctly
curl http://localhost:3000
# Should return HTML with React app

# Check build output
npm run build
ls -la dist/
# Should see index.html and assets/
```

## 📊 Expected Performance

### **Development Server**
- **Startup time:** 2-3 seconds
- **Hot reload:** < 100ms
- **Memory usage:** ~200MB
- **Port:** 3000 (configurable)

### **Production Build**
- **Build time:** < 1 second
- **Bundle size:** ~300KB total
- **CSS size:** ~28KB
- **Assets:** Optimized and compressed

## 🆘 Still Having Issues?

1. **Check Node.js version:** `node --version` (need 18+)
2. **Clear all caches:** npm cache, browser cache
3. **Try different port:** `npm run dev -- --port 3001`
4. **Check firewall/antivirus:** May block local servers
5. **Verify disk space:** Need 500MB+ free for node_modules

If none of these solutions work, the issue may be environment-specific. Consider:
- Using a different machine or virtual environment
- Checking system-specific Node.js installation guides
- Using Docker for consistent environment (advanced)