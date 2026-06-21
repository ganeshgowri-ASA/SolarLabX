# SolarLabX Roadmap

> **Sunday 2026-06-21 snapshot** — automated weekly roadmap update.

---

## Current State

| Dimension | Status |
|-----------|--------|
| `main` HEAD | PR #84 merged **2026-03-25** (turtle diagrams — 88 days behind active work) |
| Draft PRs open | **30** (PRs #85–#203, all unmerged) |
| CI pipeline | ❌ **Day 87 gap** — no `.github/workflows` on `main`; cron never fires |
| Vercel production | ❌ **No live deployment** — all 20+ builds `CANCELED`, `target: null` |
| Active CVEs | ⚠️ **16** (see Security Register below) |
| Unit tests on `main` | 0 (Vitest added in PR #154; never merged) |
| Hugging Face Space | N/A — not connected |

---

## PR Merge Priority Queue

Merging in this order unlocks CI, then security, then features with the lowest blast radius first.

| Priority | PR | Title | Risk | Blocks |
|----------|----|-------|------|--------|
| 🔴 1 | #164 | `ci: GitHub Actions workflow` | Low — additive only | CI cron, `npm audit` reports |
| 🔴 2 | #119 | `fix(security): daily-audit.yml` | Low — additive only | Overnight pipeline check |
| 🔴 3 | #203 | `security: next@14.2.25 CVE patch + middleware auth` | Medium — dep bump + new middleware | CVE-2025-29927 (CRITICAL 9.1) |
| 🟡 4 | #180 | `security: HTTP headers + jspdf CVSS-9.6 patch` | Low — config + dep bump | jspdf arbitrary-code-exec |
| 🟡 5 | #177 | `security(api): auth + Zod on 8 data-plane routes` | Medium — all data-API routes | Unauthenticated LIMS/audit/QMS write access |
| 🟢 6 | #175 | `docs(solvers): JSDoc for data-analysis.ts, iec60904.ts` | None | Developer ergonomics |
| 🟢 7 | #184 | `refactor(protocol-types): StandardName literal union` | None | Type safety in LIMS |
| 🟢 8 | #185 | `chore: strip @ts-nocheck from 22 ui/ files` | None | Unblocks TS error detection |

**After PRs #164 + #119 merge:** the `daily 02:00 UTC` cron will fire, `npm audit` will run on `main`, and the overnight pipeline check will produce real results.

**After PR #203 merges:** Vercel should attempt a production build. The CVE-2025-29927 auth bypass (middleware) will be patched. This is the prerequisite for going live.

---

## Milestone Plan

### M0 — Foundation Hardening · Target: 2026-07-05

Goal: `main` is deployable, CI is green, no CRITICAL CVEs, first production URL live.

- [ ] Merge PR #164 (CI workflow)
- [ ] Merge PR #119 (daily-audit workflow)
- [ ] Merge PR #203 (next CVE patch + middleware)
- [ ] Merge PR #180 (HTTP headers + jspdf patch)
- [ ] Merge PR #177 (API auth + Zod)
- [ ] Configure Vercel → Settings → Git → Production Branch = `main`
- [ ] First successful production deployment
- [ ] Replace `xlsx@0.18.5` with `exceljs` (issue #174)
- [ ] Merge Vitest bootstrap PR #154 (91 unit tests)
- [ ] Merge @ts-nocheck sweep PRs #146, #166, #185

### M1 — LIMS / QMS MVP · Target: 2026-08-02

Goal: Core lab operations (LIMS, QMS, Audit, Equipment) are live with a real database, not mock data.

- [ ] Wire `DATABASE_URL` (Supabase/Neon) in Vercel env vars
- [ ] Run `prisma db push` — provision schema
- [ ] Seed reference data (users, roles, IEC test protocols)
- [ ] LIMS: replace mock arrays with Prisma queries (samples, tests, equipment)
- [ ] QMS: document control, CAPA, NC register backed by DB
- [ ] Audit: internal audit, NC, CAR backed by DB
- [ ] Equipment: calibration records, intermediate checks backed by DB
- [ ] Sample tracking: chain of custody with real DB writes
- [ ] API routes: switch from in-memory demo data to Prisma
- [ ] End-to-end smoke test: register sample → execute test → generate report

### M2 — AI Modules · Target: 2026-09-06

Goal: Chat (RAG), SOP Generator, and Vision AI routes are operational end-to-end with API keys wired.

- [ ] Set `ANTHROPIC_API_KEY` in Vercel env (unblocks chat + SOP gen)
- [ ] Set `ROBOFLOW_API_KEY` in Vercel env (unblocks vision AI)
- [ ] Set `OPENAI_API_KEY` + `PINECONE_API_KEY` in Vercel env (unblocks RAG)
- [ ] Ingest IEC standard documents into Pinecone index
- [ ] Validate SOP generation round-trip (IEC 61215 test → PDF export)
- [ ] Validate vision AI defect detection on EL/IR sample images
- [ ] Merge SDK upgrade PR (chat route to @anthropic-ai/sdk, prompt caching)
- [ ] Rate limiting on AI routes (prevent cost runaway)
- [ ] Add prompt caching to SOP route (stable system prompt > 1024 tokens)

### M3 — Full Suite v1.0 · Target: 2026-10-04

Goal: All 11 modules feature-complete, E2E tested, accreditation-ready docs.

- [ ] Uncertainty Calculator: DB persistence of budgets, PDF export
- [ ] Sun Simulator Classifier: IEC 60904-9 report generation
- [ ] Chamber Configurator: quote PDF, CFD result storage
- [ ] Project Management: Gantt, client portal, invoice PDF
- [ ] Procurement: RFQ → PO lifecycle, FAT/SAT sign-off
- [ ] Reports: ISO 17025 compliant report template, digital signature
- [ ] E2E tests (Playwright): cover login, LIMS workflow, report generation
- [ ] Security review: CSP from report-only → enforcing
- [ ] NABL accreditation checklist: QMS docs, calibration records, uncertainty budgets
- [ ] Performance: bundle size audit, lazy-load heavy deps (jspdf, xlsx-replacement)

### v1.1 — Roadmap Items (Post-Launch)

- Multi-tenant / organisation isolation
- Mobile-optimised views for technician field use
- SCIM provisioning for enterprise SSO (Okta / Azure AD)
- Webhook notifications (calibration due, CAPA overdue, NC raised)
- IEC 62715 (ammonia) and IEC 61701 (salt mist) dedicated test flows
- AI-powered report narrative generation from raw test data

---

## Security Debt Register

| # | Package / Area | Issue | CVSS | Status | Owning PR |
|---|---------------|-------|------|--------|----------|
| S-1 | `next@14.2.18` | CVE-2025-29927 auth middleware bypass | **9.1 CRITICAL** | ⚠️ Unpatched on `main` | PR #203 |
| S-2 | `next@14.2.18` | GHSA-g8wf-bx88-rmbc SSRF in RSC | HIGH | ⚠️ Unpatched on `main` | PR #203 |
| S-3 | `jspdf@^4.2.0` | Arbitrary code execution via malformed PDF | **9.6 CRITICAL** | ⚠️ Unpatched on `main` | PR #180 |
| S-4 | `xlsx@0.18.5` | Prototype pollution / RCE (supply-chain history) | CRITICAL | ⚠️ No PR yet | Issue #174 |
| S-5 | `brace-expansion` (transitive) | GHSA-f886-m6hf-6m8v ReDoS | HIGH | ⚠️ Unpatched on `main` | PR #203 |
| S-6 | `next.config.mjs` `hostname: "**"` | Wildcard image hostname (SSRF / open redirect) | MEDIUM | ⚠️ Unpatched on `main` | PR #180 |
| S-7 | `/api/chat`, `/api/lims`, etc. | No `requireAuth()` guard — endpoints publicly callable | HIGH | ⚠️ Unpatched on `main` | PR #177 |
| S-8 | Missing `X-Frame-Options`, CSP, HSTS | Clickjacking, mixed-content, MITM exposure | MEDIUM | ⚠️ Unpatched on `main` | PR #180 |

**Note:** S-1 through S-8 are all patched in feature branches (PRs #203, #180, #177) but **none of those PRs have been merged to `main`**. The production surface currently carries all eight issues.

---

## Technical Debt Register

| # | Item | Impact | Owning PR / Issue |
|---|------|--------|-----------------|
| T-1 | `xlsx@0.18.5` must be replaced with `exceljs` or `@xlsx-js-style` | Supply-chain risk + npm deprecation | Issue #174 |
| T-2 | 381 `@ts-nocheck` directives (down from 400+ after PRs #146, #166, #185) | Masks real type errors | PRs #146 #166 #185 |
| T-3 | Zero E2E tests | No regression guard for multi-step user flows | Milestone M3 |
| T-4 | All data is mock/in-memory — no DB wiring | App cannot persist state across refreshes | Milestone M1 |
| T-5 | `@anthropic-ai/sdk@0.39.0` (main) vs `0.100.0` (feature branch) | 61 minor versions behind; missing streaming improvements, typed params | PR #169 (unmerged) |
| T-6 | `.github/workflows` missing from `main` | CI never runs on `main`; `npm audit` output never surfaced | PR #164 (unmerged) |

---

## Vercel Production Action Plan

The root cause of all `CANCELED` deployments is that **Vercel is watching the repo but no branch is marked as the production target**. Every deployment that fires is a preview-only build for a PR branch, and those get auto-cancelled when a new commit arrives on the same branch.

**Steps to fix (owner action required):**

1. Open [Vercel Dashboard → solar-lab-x → Settings → Git](https://vercel.com/ganeshgowrimitsui-3250s-projects/solar-lab-x/settings/git)
2. Under **Production Branch**, set value to `main`
3. Merge PR #203 (or any commit) to `main`
4. Vercel will trigger its first **production** build (`target: "production"`)
5. Once green, the project will be live at the Vercel production URL

**Prerequisite before step 3:** Confirm `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set in Vercel env vars (Settings → Environment Variables). Without `NEXTAUTH_SECRET`, the NextAuth JWT handler will throw and the first production build will crash at runtime.

---

## Changelog

| Date | Entry |
|------|-------|
| 2026-06-21 | Initial ROADMAP.md — M0–M3 milestones, 8-item security register, 6-item tech-debt register, merge queue, Vercel fix plan |
| 2026-05-31 | Roadmap first sketched in PR #163 commit message (v1.0 milestone map, dep-drift snapshot) |
