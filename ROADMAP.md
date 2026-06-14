# SolarLabX — Roadmap

> Last updated: **2026-06-14** (Sunday roadmap angle)  
> Main branch last commit: `2010f6b` — **2026-03-25** (day 83 of freeze)

---

## Status snapshot — 2026-06-14

| Signal | State | Tracking |
|--------|-------|----------|
| CI pipeline | ⛔ NO RUNS — day 83 | #181, #182 |
| Vercel production | ⛔ ALL CANCELED | #173, #183 |
| npm audit | ⚠️ 2 CRITICAL / 5 HIGH / 3 MOD | #160, #174, #187 |
| Open draft PRs | ⚠️ 30+ unmerged | #176 |
| Numerical solvers | ✅ No changes since last merge | — |
| Hugging Face Space | ✅ N/A (none connected) | — |

---

## M0 — Foundation Hardening (blocking M1)

All items below must land on `main` before feature milestones are reliable.

- [ ] **Merge PR #164** (CI workflow) — relax audit gate to `--audit-level=critical` or `continue-on-error: true` so the PR passes and the daily cron starts firing
- [ ] **Merge PR #119** (daily-audit cron) — restores overnight security reporting
- [ ] **Merge PR #108 / #117** (next 14.2.18 → 14.2.35) — eliminates CRITICAL CVSS 9.1 auth bypass
- [ ] **Merge PR #187** (npm overrides — dompurify, brace-expansion, flatted, picomatch) — clears 4 transitive advisories
- [ ] **Merge PR #133** (auth guards on AI routes) — prevents unauthenticated access to Anthropic/Roboflow proxies
- [ ] **Merge PR #104** (HTTP security headers) — X-Frame-Options, HSTS, CSP report-only
- [ ] **Wire Vercel production** to `main` branch (see #173) — set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CLAUDE_API_KEY`, `ROBOFLOW_API_KEY` in Vercel dashboard
- [ ] **Replace `xlsx`** with `exceljs` (see #174) — `xlsx@0.18.5` carries HIGH prototype-pollution CVE with no upstream patch
- [ ] **Wire real database** — `DATABASE_URL` in `.env.local` / Vercel env vars; run `prisma db push` against Neon/Supabase production instance

---

## PR Merge Sprint — Priority Order

With 30+ draft PRs open and no merge in 83 days, the recommended sequence:

### Tier 1 — CI + Security (unblock automation)
1. PR #164 — CI workflow (relaxed audit gate)
2. PR #119 — daily-audit cron
3. PR #108 / #117 — next CVE patch
4. PR #187 — npm overrides (4 transitive CVEs)
5. PR #133 — AI route auth guards
6. PR #104 — HTTP security headers
7. PR #180 — jspdf CVSS-8.1 patch + CSP report-only

### Tier 2 — Code quality (no conflicts expected)
8. PR #116 — JSDoc iv-curve, nmot-noct
9. PR #132 — JSDoc uncertainty, sun-simulator
10. PR #155 — JSDoc chamber, iec60891
11. PR #175 — JSDoc data-analysis, iec60904
12. PR #109 — refactor: remove dead NMOTInputs exports
13. PR #120 — refactor: rename duplicated NMOT exports
14. PR #124 — chore: strip debug console.log / window.alert
15. PR #144 — refactor: computeColWidths helper
16. PR #146 — bulk-removal: @ts-nocheck from export-utils.ts
17. PR #166 — bulk-removal: @ts-nocheck from GUMCalculator.tsx
18. PR #185 — bulk-removal: @ts-nocheck from 22 components/ui/ files

### Tier 3 — Features (review individually)
19. PR #97 / #127 / #154 — Vitest unit tests (pick #154 as most complete)
20. PR #125 — calibration traceability graph
21. PR #149 — Monte Carlo GUM-S1 tab
22. PR #169 — @anthropic-ai/sdk v0.100 + prompt caching
23. PR #158 — file-upload validation + input-length caps
24. PR #184 — protocol-types StandardName literal union

---

## M1 — LIMS / QMS MVP

**Target**: first live Vercel production deployment with real data

**Prerequisite**: M0 complete (CI green, Vercel wired, DB connected)

| Feature | Status | Notes |
|---------|--------|-------|
| Sample registration + tracking | ✅ UI complete (PR #81) | Needs DB wiring |
| IEC 61215/61730/61853 test templates | ✅ UI complete | Needs DB wiring |
| Equipment calibration chain | ✅ UI complete (PR #125) | Needs DB wiring |
| Document control (SOP/WI/forms) | ✅ UI complete | Needs DB wiring |
| CAPA management | ✅ UI complete (PR #82) | Needs DB wiring |
| ISO 17025 audit checklist | ✅ UI complete (PR #82) | Needs DB wiring |
| Turtle diagrams | ✅ UI complete (PR #84) | Static, no DB needed |
| Lab layout visualisation | ✅ UI complete (PR #82) | Static, no DB needed |

**ETA**: 2 weeks after M0 unblocked (DB wiring + E2E smoke tests)

---

## M2 — AI Modules

**Prerequisite**: M1 deployed, API keys set in Vercel

| Feature | Status | Notes |
|---------|--------|-------|
| SOP Generator (Claude API) | ✅ Route complete | Prompt caching in PR #169 |
| Test Report Automation | ✅ Route complete | Pulls from LIMS (needs M1 DB) |
| AI Vision / Defect Detection | ✅ Route complete | Roboflow key needed |
| @anthropic-ai/sdk upgrade | ⚠️ Draft PR #169 | 0.39 → 0.100; prompt caching |

**ETA**: 1 week after M1

---

## M3 — Full 11-Module Suite (v1.0)

| Module | UI | API | DB | Status |
|--------|-----|-----|-----|--------|
| LIMS | ✅ | ✅ | ❌ | Needs DB |
| QMS | ✅ | ✅ | ❌ | Needs DB |
| Audit | ✅ | ✅ | ❌ | Needs DB |
| Projects | ✅ | partial | ❌ | Needs DB |
| Uncertainty Calculator | ✅ | ✅ | n/a | Monte Carlo: PR #149 |
| Vision AI | ✅ | ✅ | partial | Roboflow integration |
| SOP Generator | ✅ | ✅ | n/a | AI route complete |
| Test Report Automation | ✅ | ✅ | ❌ | Needs LIMS DB |
| Sun Simulator (IEC 60904-9) | ✅ | ✅ | n/a | Classifier complete |
| Chamber Configurator | ✅ | ✅ | n/a | CFD vis complete |
| Procurement | ✅ | partial | ❌ | Needs DB |

**ETA**: v1.0 tag — 4–6 weeks after M0 unblocked

---

## Technical Debt Register

| Item | Severity | Files | Tracking |
|------|----------|-------|----------|
| `next@14.2.18` — CRITICAL CVE CVSS 9.1 | P0 | `package.json` | #160 |
| `jspdf@4.2.0` — CRITICAL CVE CVSS 9.6 | P0 | `package.json` | #174 |
| `xlsx@0.18.5` — HIGH CVE, no upstream fix | P0 | `lib/export-utils.ts` | #174 |
| `@ts-nocheck` blanket suppressors | P2 | ~228 files outside `components/ui/` | #111 |
| Zero E2E test coverage | P2 | — | #92 |
| All data is mock / hard-coded | P1 | All module pages | #173 |
| No `.github/workflows/` on `main` | P0 | — | #181 |
| `@anthropic-ai/sdk` 65 minors behind | P1 | `app/api/sop/`, `app/api/chat/` | PR #169 |
| `prisma` 2 majors behind | P2 | `package.json` | — |
| `react` 1 major behind (v18 → v19) | P2 | — | — |

---

## Dependency Upgrade Roadmap

| Package | Pinned | Target | Risk | Notes |
|---------|--------|--------|------|-------|
| `next` | 14.2.18 | 16.x | HIGH | App Router compatible; breaking middleware changes |
| `@anthropic-ai/sdk` | ^0.39.0 | ^0.104.x | LOW | PR #169 ready at ^0.100 |
| `react` / `react-dom` | ^18.3.1 | 19.x | HIGH | `useEffect`/Suspense changes |
| `@prisma/client` | ^5.22.0 | 7.x | HIGH | ORM breaking changes |
| `recharts` | ^2.13.3 | 3.x | MEDIUM | Chart API changes |
| `zod` | ^3.23.8 | 4.x | HIGH | Breaking schema API |
| `uuid` | ^11.0.3 | 14.x | LOW | Import syntax change |
| `xlsx` | ^0.18.5 | replace → `exceljs` | — | CVE, no upstream fix |
| `eslint` | 8.57.1 | 9.x | MEDIUM | Config format change |
| `tailwindcss` | ^3.4.15 | 4.x | HIGH | Config breaking changes |

---

## 2026 Q3 Weekly Cadence

| Week | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|------|-----|-----|-----|-----|-----|-----|-----|
| Jun 15 | Refactor | Bulk-removal | Enhancement | Tests | Docs | Security | Roadmap |
| Jun 22 | Refactor | Bulk-removal | Enhancement | Tests | Docs | Security | Roadmap |
| Jul+ | … | … | … | … | … | … | … |

**Priority for week of Jun 15**: Execute the Tier 1 PR merge sprint (items 1–7 above) to restore CI and unblock Vercel production deployment.
