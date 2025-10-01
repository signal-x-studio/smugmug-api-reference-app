# Technical Debt Backlog

**SmugMug API Reference Application**

---

## Document Metadata

- **Created:** 2025-09-30
- **Last Updated:** 2025-09-30
- **Git Commit:** `f6c9e111dcb3f9f29938a6aa06b0f1dfc4bc1fbb`
- **Maintained By:** Engineering Team

---

## Priority Legend

- 🔴 **P0 - Critical:** Security risks, production blockers
- 🟡 **P1 - High:** Performance, reliability improvements
- 🟢 **P2 - Medium:** Quality of life, developer experience
- ⚪ **P3 - Low:** Nice to have, future considerations

---

## Active Technical Debt Items

### 🔴 P0 - Critical

#### 1. OAuth Client-Side Implementation (Security Risk)

**Issue:** OAuth 1.0a signing currently happens in browser JavaScript, exposing API credentials.

**Location:** `src/services/smugmugService.ts:44-100`

**Risk:**
- API keys visible in browser developer tools
- Potential unauthorized access to SmugMug account
- Does not meet production security standards

**Proposed Solution:**
- Implement server-side OAuth proxy (Node.js/Express backend)
- Move credential signing to backend
- Frontend sends requests to proxy, proxy signs and forwards to SmugMug

**Effort Estimate:** 40 hours

**Priority Justification:** Security vulnerability that exposes user credentials

**Status:** 🔴 Open

---

#### 2. No Uptime Monitoring

**Issue:** No automated monitoring to detect when application goes down.

**Risk:**
- Outages go unnoticed until users report issues
- No alerting mechanism for downtime
- Cannot measure actual uptime SLA

**Proposed Solution:**
- Implement external uptime monitoring (Pingdom, UptimeRobot, or StatusCake)
- Set up PagerDuty alerts for critical team members
- Monitor: https://signal-x-studio.github.io/smugmug-api-reference-app/
- Alert frequency: Every 60 seconds
- Escalation: Email → SMS after 3 failed checks

**Effort Estimate:** 6 hours

**Priority Justification:** Production outages should not require user reports

**Status:** 🔴 Open

---

#### 3. No Incident Response Runbooks

**Issue:** No documented procedures for handling production incidents.

**Risk:**
- Inconsistent incident response
- Longer mean time to recovery (MTTR)
- Knowledge gaps when on-call engineer changes

**Proposed Solution:**
Create operational runbooks for common scenarios:
- `docs/runbooks/incident-response.md`
- `docs/runbooks/deployment-rollback.md`
- `docs/runbooks/error-investigation.md`

**Required Runbook Content:**
- Severity definitions (P0, P1, P2, P3)
- Escalation paths
- Diagnostic steps
- Resolution procedures
- Post-incident review template

**Effort Estimate:** 12 hours

**Priority Justification:** Faster incident resolution, consistent process

**Status:** 🔴 Open

---

### 🟡 P1 - High

#### 4. No APM / Performance Monitoring

**Issue:** No application performance monitoring or real user monitoring (RUM).

**Current State:**
- Page load times: Unknown
- Error rates: Unknown (except in E2E tests)
- User experience metrics: Unknown

**Proposed Solution:**
- Integrate Datadog RUM, New Relic, or Google Analytics 4
- Track Core Web Vitals:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - Time to Interactive (TTI)
- Set performance budgets in CI/CD

**Effort Estimate:** 10 hours

**Priority Justification:** Cannot optimize what you don't measure

**Status:** 🟡 Open

---

#### 5. No Security Headers

**Issue:** Missing HTTP security headers (CSP, HSTS, X-Frame-Options).

**Location:** GitHub Pages default configuration (no custom headers)

**Risk:**
- Vulnerable to XSS attacks
- No clickjacking protection
- No content security policy

**Current Headers:** GitHub Pages defaults only

**Proposed Solution:**

**Option A: Add via `index.html` meta tags** (Limited)
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' https://api.smugmug.com; connect-src 'self' https://generativelanguage.googleapis.com;">
```

**Option B: Cloudflare Workers** (Recommended)
- Add Cloudflare in front of GitHub Pages
- Configure security headers via Workers
- Full control over CSP, HSTS, etc.

**Effort Estimate:** 4 hours (Option A), 8 hours (Option B)

**Priority Justification:** Basic web security best practice

**Status:** 🟡 Open

---

### 🟢 P2 - Medium

#### 6. No Load Testing Baseline

**Issue:** Unknown application capacity and performance under load.

**Risk:**
- Cannot plan for traffic spikes
- Unknown breaking point
- No performance regression detection

**Proposed Solution:**
- Use Artillery, k6, or Playwright for load testing
- Establish baseline:
  - 100 concurrent users
  - 1000 requests/minute
  - Acceptable response time: <2s
- Run in CI/CD on major releases

**Effort Estimate:** 12 hours

**Status:** 🟢 Open

---

#### 7. No Image Optimization Pipeline

**Issue:** Images loaded from SmugMug without optimization.

**Impact:**
- Larger page payloads
- Slower load times on mobile
- Higher bandwidth consumption

**Proposed Solution:**
- Integrate image CDN (imgix, Cloudinary)
- Automatic WebP/AVIF conversion
- Responsive image sizing
- Lazy loading (if not already implemented)

**Implementation:**
```typescript
// src/utils/image-optimizer.ts
export function optimizeImageUrl(url: string, width?: number): string {
  return `https://smugmug-app.imgix.net${new URL(url).pathname}?w=${width || 'auto'}&q=80&fm=webp&auto=format,compress`;
}
```

**Effort Estimate:** 10 hours

**Status:** 🟢 Open

---

#### 8. No Centralized Error Tracking

**Issue:** Runtime errors only captured during E2E tests, not in production.

**Current State:**
- Comprehensive error detection framework exists (`src/testing/runtime-errors/`)
- Only active during Playwright tests
- No production error aggregation

**Proposed Solution:**
- Integrate Sentry, LogRocket, or Bugsnag
- Enable error tracking in production build
- Configure source maps for stack trace resolution
- Alert on error rate spikes

**Effort Estimate:** 8 hours

**Status:** 🟢 Open

---

## Future Considerations (P3)

#### 9. No A/B Testing Framework

**Issue:** Cannot run experiments on UI changes.

**Status:** ⚪ Future

---

#### 10. No Analytics / User Behavior Tracking

**Issue:** No insight into how users interact with the application.

**Proposed Solution:** Google Analytics 4 or Mixpanel

**Status:** ⚪ Future

---

## Completed / Resolved Items

*(None yet)*

---

## Effort Summary

| Priority | Items | Total Effort |
|----------|-------|--------------|
| P0 (Critical) | 3 | 58 hours |
| P1 (High) | 2 | 14 hours |
| P2 (Medium) | 3 | 30 hours |
| **Total Active** | **8** | **102 hours** |

---

## Quarterly Planning

### Q1 2025 Focus

**Recommended:** Clear all P0 items
- [ ] OAuth backend proxy
- [ ] Uptime monitoring
- [ ] Incident runbooks

**Target:** 2-week sprint (58 hours @ 1 FTE)

### Q2 2025 Focus

**Recommended:** P1 items
- [ ] APM integration
- [ ] Security headers

**Target:** 1-week sprint (14 hours)

### Q3 2025 Focus

**Recommended:** P2 items
- [ ] Load testing
- [ ] Image optimization
- [ ] Error tracking

**Target:** 1.5-week sprint (30 hours)

---

## Adding New Items

**Template:**

```markdown
#### [Priority] [Number]. [Title]

**Issue:** [Description of the problem]

**Location:** [File paths if applicable]

**Risk:** [What happens if not fixed]

**Proposed Solution:** [How to fix it]

**Effort Estimate:** [Hours]

**Priority Justification:** [Why this priority level]

**Status:** [Open/In Progress/Blocked/Resolved]
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-09-30 | Initial backlog created with 8 items | Docu-Agent |

---

**End of Technical Debt Backlog**

*Review quarterly and update as items are resolved or new debt is identified.*
