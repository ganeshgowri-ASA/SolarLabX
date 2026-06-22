# SolarLabX — Roadmap

*Last updated: 2026-06-22 (Sunday week-25 roadmap angle)*

---

## Status at a glance

| Signal | State |
|--------|-------|
| Vercel production | ❌ CANCELED — no production target configured (90+ days) |
| CI / overnight pipeline | ❌ ci.yml not on `main` — cron never fires (90+ days) |
| `next` CVE (auth bypass) | 🔴 CRITICAL — `next@14.2.18`, fix requires jump to 16.x |
| `jspdf` CVE (CVSS 9.6) | 🔴 CRITICAL — patch available |
| `xlsx` CVE | 🟠 HIGH — no upstream fix; needs library replacement |
| `@anthropic-ai/sdk` drift | 🟠 66 minor versions behind (0.39 → 0.105) |
| Open issues | 75 (as of 2026-06-22) |
| Open draft PRs | ~30 unmerged (PR backlog sprint needed) |

---

## M0 — Foundation hardening (in progress)

Items that must land before v1.0 can ship.

- [ ] **Vercel**: owner must set `main` as production branch in Vercel dashboard
- [ ] **CI on main**: merge the ci.yml PR so the overnight pipeline cron fires
- [ ] **`next` upgrade**: evaluate v14 → v16 migration; patch CRITICAL auth-bypass CVE (GHSA)
- [ ] **`xlsx` replacement**: replace with `exceljs` or `@e965/xlsx` (issue #174)
- [ ] **`jspdf` patch**: upgrade to latest — CRITICAL CVSS 9.6 (issue #193)
- [ ] **DB wiring**: set `DATABASE_URL` + `NEXTAUTH_SECRET` in Vercel env; run `prisma db push`
- [ ] **PR backlog sprint**: merge or close ~30 open draft PRs (issue #176)

---

## M1 — LIMS / QMS MVP (next)

- Replace mock data in LIMS sample endpoints with real Prisma queries
- Wire QMS document control to database (create / read / approve flows)
- Sample lifecycle state machine (Registered → In-Test → Completed → Archived)
- Equipment calibration alert emails (cron-triggered, ISO 17025 §6.4.6)

## M2 — AI modules

- Upgrade `@anthropic-ai/sdk` from 0.39 → 0.105 (66 minor versions of SDK improvements)
- SOP generator: connect prompt-cached Claude route to real IEC standard library
- Vision AI: wire Roboflow live inference; store detection results in LIMS
- Report automation: generate PDF from live LIMS test data

## M3 — Full suite (v1.0)

- E2E tests (Playwright) for auth, LIMS sample registration, and report generation
- NABL / ISO 17025 compliance audit checklist integrated into QMS module
- Multi-tenant role enforcement tested across all 11 modules
- Production Vercel deployment with working database and auth

---

## Week plan — 2026-06-23 to 2026-06-28

| Day | Angle | Planned task |
|-----|-------|-------------|
| Mon 23 | Refactor | Consolidate `lib/api-auth.ts` patterns; extract shared server-action helpers to reduce duplication across 8 API routes |
| Tue 24 | Bulk removal | Sweep remaining `@ts-nocheck` suppressors in `components/lims/` and `components/audit/` |
| Wed 25 | Enhancement | Wire real Prisma queries to `/api/lims/samples` route (replace in-memory mock) |
| Thu 26 | Tests | Expand Vitest suite: `lib/iec60891.ts` IEC 60891 translation procedures + `lib/chamber.ts` sizing calculations |
| Fri 27 | Docs + ideation | JSDoc for remaining API route handlers; ideate on Prisma schema improvements for multi-lab tenancy |
| Sat 28 | Security | Patch `jspdf` CRITICAL + `flatted`/`form-data`/`lodash` HIGH CVEs; promote CSP from report-only to enforcing |

---

## npm audit snapshot — 2026-06-22

```
Total: 16 vulnerabilities (2 critical, 8 high, 6 moderate)

CRITICAL
  next@14.2.18         Authorization bypass + SSRF   fix: upgrade to 16.x (semver-major)
  jspdf                CVSS 9.6                       fix: npm update jspdf

HIGH
  xlsx@0.18.5          Prototype pollution             fix: replace library (no upstream patch)
  flatted               ReDoS                          fix: npm update
  form-data            CRLF injection                  fix: npm update
  glob                 ReDoS                           fix: upgrade eslint-config-next → v16
  lodash               Prototype pollution             fix: npm update
  picomatch            ReDoS                           fix: npm update
  @next/eslint-plugin-next  (via glob)                fix: upgrade to v16
  eslint-config-next   (via glob)                     fix: upgrade to v16
```

---

## Major version drift — 2026-06-22

| Package | Pinned | Latest | Gap |
|---------|--------|--------|-----|
| `@anthropic-ai/sdk` | ^0.39.0 | 0.105.0 | **66 minor** |
| `next` | 14.2.18 | 16.2.9 | **2 major** |
| `react` / `react-dom` | ^18.3.1 | 19.2.7 | **1 major** |
| `@prisma/client` | ^5.22.0 | 7.8.0 | **2 major** |
| `zod` | ^3.23.8 | 4.4.3 | **1 major** |
| `uuid` | ^11.0.3 | 14.0.1 | **3 major** |
| `recharts` | ^2.13.3 | 3.8.1 | **1 major** |
| `tailwind-merge` | ^2.5.5 | 3.6.0 | **1 major** |
| `lucide-react` | ^0.460.0 | 1.21.0 | **1 major** |
| `bcryptjs` | ^2.4.3 | 3.0.3 | **1 major** |

Recommended order: `jspdf` patch first (CRITICAL), then `@anthropic-ai/sdk` (SDK features),
then `next` + `react` together (intertwined), then `prisma`, `zod`, `uuid` independently.

---

## Action needed from repo owner

1. **Vercel dashboard** → Project `solar-lab-x` → Settings → Git → set Production Branch to `main`
2. **Merge CI PR** → approve the `ci.yml` workflow PR so the overnight cron starts running
3. **Vercel env vars** → add `DATABASE_URL`, `NEXTAUTH_SECRET`, `CLAUDE_API_KEY`, `ROBOFLOW_API_KEY`
4. **`next` upgrade decision** → read [Next.js 15 migration guide](https://nextjs.org/docs/app/guides/upgrading/version-15) and confirm scope
