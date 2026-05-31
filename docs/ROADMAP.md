# SolarLabX — Product Roadmap (2026-Q2 → Q4)

> Generated: 2026-05-31 · Sunday roadmap review

---

## Milestone 0 — Foundation Hardening *(blocks everything else)*

These items must land on `main` before new feature work can be reliably shipped or demoed.

| # | Item | Status | Linked |
|---|------|--------|--------|
| M0-1 | Add GitHub Actions CI (lint + type-check + build) | Open PR #95 — unmerged | blocks all PRs |
| M0-2 | Upgrade `next@14.2.18 → next@16.2.6` — 23 critical CVEs | Open PRs #108 / #117 — need rebase | #86 |
| M0-3 | Replace `xlsx@0.18.5` (prototype-pollution + ReDoS, **no upstream fix**) with `exceljs` | Issue #136 — partial refactor in progress | — |
| M0-4 | Establish a production Vercel deployment — all 20 recent builds are **CANCELED** | Untracked | — |
| M0-5 | Wire `DATABASE_URL` + `prisma db push` for live LIMS/CAPA persistence | Untracked | #91 |
| M0-6 | Triage the 27 open draft PRs from Claude sessions — merge, rebase, or close | — | — |

---

## Milestone 1 — Core LIMS + QMS *(MVP, v0.9)*

Target: **2026-06-30**

- [ ] LIMS sample registration → test execution → results write-back (Prisma models done; API layer missing)
- [ ] QMS document control — CAPA lifecycle state machine (draft → review → approved → closed)
- [ ] ISO 17025 calibration chain (UI in PR #125; needs link to live instrument DB records)
- [ ] NextAuth RBAC enforced on all dashboard pages (Admin / Lab Manager / Technician / Auditor)
- [ ] PDF report generation wired to live LIMS data (currently rendered from mock data only)

---

## Milestone 2 — Technical Calculators *(v0.10)*

Target: **2026-07-31**

- [ ] Uncertainty Calculator: GUM budget + Monte Carlo (GUM-S1) tab wired to real data entry
- [ ] Sun Simulator Classifier: IEC 60904-9 A+/A/B/C class with real spectral file import
- [ ] IEC 60891 IV translation: procedures 1/2/3 with module-file upload
- [ ] Chamber Configurator: complete quote-generation pipeline with PDF output

---

## Milestone 3 — AI Modules *(v1.0)*

Target: **2026-08-31**

- [ ] SOP Generator: `@anthropic-ai/sdk` with prompt caching; PDF + Word export end-to-end
- [ ] Vision AI: Roboflow integration with real EL / IR / visual model inference
- [ ] RAG Chatbot: Pinecone knowledge base seeded with IEC/ISO standards corpus
- [ ] Test Report Automation: IEC 61215/61730/61853 templates auto-populated from LIMS

---

## Milestone 4 — Audit + Projects + Procurement *(v1.1)*

Target: **2026-09-30**

- [ ] Audit module: NC/OFI → CAR/8D workflow with email notifications
- [ ] Project Management: Gantt chart with resource-conflict detection
- [ ] Procurement: RFQ → PO → FAT/SAT lifecycle with vendor portal
- [ ] Sun Simulator + Chamber pages: promote from calculators to bookable lab assets

---

## Known Technical Debt

| Item | Severity | Issue / PR |
|------|----------|------------|
| `next@14.2.18` — 23 critical CVEs (DoS, SSRF, auth bypass, cache poisoning, XSS) | **Critical** | #86; PRs #108 / #117 |
| `xlsx@0.18.5` — prototype pollution + ReDoS, no upstream fix (package abandoned) | **High** | #136 |
| `jspdf@4.2.0` — PDF Object Injection + HTML Injection (patched in 4.2.1) | High | PR #85 |
| `@ts-nocheck` suppressors across 6+ component files | Medium | #114 |
| No end-to-end tests (Playwright / Cypress) | Medium | — |
| All data is mock-only — no live DB writes | High | #91 |
| No GitHub Actions CI on `main` (branch protection unenforced) | High | PR #95 |
| 27 open draft PRs accumulating — none merged to `main` | High | — |
| `lodash` HIGH — code injection + prototype pollution (fix available) | Medium | — |

---

## Dependency Drift Snapshot — 2026-05-31

```
npm audit summary
  critical : 2   (next, jspdf)
  high     : 7   (xlsx ×2, lodash ×2, glob, picomatch, flatted)
  moderate : 5   (brace-expansion, dompurify, next-auth/uuid, postcss, uuid)
  low      : 0

Key packages
  next@14.2.18    → latest 16.2.6   CRITICAL  23 CVEs  (semver MAJOR — audit fix: 16.2.6)
  jspdf@4.2.0     → latest 4.2.1    CRITICAL   2 CVEs  (patch bump fixes both)
  xlsx@0.18.5     → latest 0.18.5   HIGH       2 CVEs  NO FIX — replace with exceljs
  lodash          → 4.18.1 available HIGH       2 CVEs  audit fix available

Pin policy: 58/60 deps use ^ ranges; only `next` and `eslint-config-next`
are pinned — ironic, as these are the two most urgently-upgraded packages.
```

---

## Vercel Deployment Health — 2026-05-31

- Project: `solar-lab-x` (`prj_AHZlhDfpU33SZbdtylTvEtBgoL1l`)
- All 20 most-recent deployments have state **CANCELED** (preview builds from PR branches)
- **No `target: "production"` deployment found** — production URL health is unverified
- No Hugging Face Space is connected to this project

**Action required:** trigger a fresh production deployment from `main` (or the most
stable branch), then set up Vercel branch protection so previews do not auto-cancel.

---

## Data Pipeline / CI Health — 2026-05-31

- No `.github/workflows/` directory on `main` — **zero automated pipelines**
- No overnight data-pipeline jobs to report on (none configured)
- No benchmark notebooks (`.ipynb`) in the repository
- Solver modules last changed: `lib/uncertainty.ts`, `lib/sun-simulator.ts`,
  `lib/iec60904.ts` — all untouched since PR #38; last commit touched only
  `app/(dashboard)/turtle-diagrams/page.tsx` (UI-only)

**Recommended next step:** merge PR #95 (GitHub Actions) and add a `schedule:`
trigger for nightly `npm audit` + `tsc --noEmit` so drift is caught automatically.

---

## Notes for Next Sunday (2026-06-07)

1. **Merge M0 items first** — the 27-PR backlog is the primary bottleneck.
2. Schedule a triage pass: merge PRs that are green, rebase stale ones, close duplicates.
3. Once CI (PR #95) lands on `main`, add branch-protection rules requiring green CI.
4. Database connectivity (#91) is the single highest-leverage unlock for demo readiness.
5. Upgrade `next` to v16 — the major-version jump needs a migration guide check
   (App Router, server components, `next.config` schema changes).
