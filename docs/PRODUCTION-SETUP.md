# Production Setup Guide

**Solo Developer Edition**

---

## Quick Setup Checklist

- ✅ Security headers added to `index.html`
- ⏳ Set up UptimeRobot monitoring
- ⏳ Set up Sentry error tracking

---

## 1. Security Headers

**Status:** ✅ Complete

**What was added:** Added to `index.html`:
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Referrer Policy

**Test:** Deploy and check headers at https://securityheaders.com/

---

## 2. Uptime Monitoring (UptimeRobot)

**Status:** ⏳ Todo (30 minutes)

### Steps:

1. **Sign up:** https://uptimerobot.com/ (free tier)

2. **Create Monitor:**
   - Monitor Type: HTTP(s)
   - URL: `https://signal-x-studio.github.io/smugmug-api-reference-app/`
   - Monitoring Interval: 5 minutes (free tier)
   - Monitor Timeout: 30 seconds

3. **Configure Alerts:**
   - Alert Contacts: Add your email
   - Alert When Down For: 5 minutes (2 failed checks)
   - Email format: Detailed

4. **Optional:** Add SMS alerts (requires paid plan)

**Cost:** Free (50 monitors, 5-min intervals)

**Time Investment:** 30 minutes

---

## 3. Error Tracking (Sentry)

**Status:** ⏳ Todo (2 hours)

### Steps:

1. **Sign up:** https://sentry.io/ (free tier)

2. **Create Project:**
   - Platform: React
   - Project Name: smugmug-api-reference-app

3. **Install SDK:**

```bash
pnpm add @sentry/react
```

4. **Add to `src/main.tsx`:**

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN_HERE",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

// Wrap root render
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error occurred</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
```

5. **Add DSN to `.env`:**

```
VITE_SENTRY_DSN=your_sentry_dsn_here
```

6. **Update `vite.config.ts`:**

```typescript
define: {
  'process.env.SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN),
  // ... existing defines
}
```

**Cost:** Free (5K errors/month, 50 replays/month)

**Time Investment:** 2 hours

---

## 4. Environment Variables

**Current `.env.example`:**

```
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

**Add for production:**

```
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_APP_URL=https://signal-x-studio.github.io/smugmug-api-reference-app/
```

---

## 5. GitHub Secrets (for CI/CD)

**Navigate to:** Repository Settings → Secrets and variables → Actions

**Add secrets:**
- `SENTRY_DSN`: Your Sentry DSN
- `GEMINI_API_KEY`: Your Gemini API key (if needed in build)

---

## Production Checklist

### Before Launch:

- [x] Security headers configured
- [ ] UptimeRobot monitoring active
- [ ] Sentry error tracking deployed
- [ ] Test error reporting (trigger test error)
- [ ] Verify uptime alerts work
- [ ] Document recovery procedures

### Post-Launch:

- [ ] Monitor Sentry dashboard for errors
- [ ] Check UptimeRobot weekly
- [ ] Set up weekly error report email
- [ ] Review performance metrics monthly

---

## Minimal Operations Runbook

### If Site Goes Down:

1. **Check UptimeRobot alert** (you'll get email)
2. **Verify GitHub Pages status:** https://www.githubstatus.com/
3. **Check last deployment:** GitHub Actions tab
4. **If deployment failed:** Re-run workflow or revert commit
5. **If GitHub issue:** Wait (usually resolves in minutes)

### If Errors Spike in Sentry:

1. **Check Sentry Issues tab**
2. **Group by error type**
3. **If related to recent deploy:** Revert commit
4. **If API issue:** Check Gemini/SmugMug status pages
5. **If unknown:** Create GitHub issue for investigation

### Recovery Commands:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Re-run failed deployment
# Go to Actions tab → Click failed workflow → Re-run jobs

# Emergency: Revert to specific commit
git reset --hard <commit-hash>
git push --force origin main  # Use with caution
```

---

## Cost Summary (Solo Dev)

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| GitHub Pages | Free | $0 | 100GB bandwidth/mo |
| UptimeRobot | Free | $0 | 50 monitors, 5-min checks |
| Sentry | Free | $0 | 5K errors/mo, 50 replays |
| **Total** | - | **$0/mo** | Sufficient for demo/showcase |

**If you exceed free tiers:**
- UptimeRobot Pro: $7/mo (1-min checks, SMS alerts)
- Sentry Team: $26/mo (50K errors, unlimited replays)

---

## Next Steps

1. ✅ Security headers: Done (already added to `index.html`)
2. ⏳ UptimeRobot: Follow steps above (30 min)
3. ⏳ Sentry: Follow steps above (2 hours)
4. ⏳ Deploy and test
5. ✅ Mark production-ready

**Estimated Total Time:** 2.5 hours

---

**End of Production Setup Guide**

*Last Updated: 2025-09-30*
