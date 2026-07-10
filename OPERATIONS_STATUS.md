# Operations Status — 2026-07-10

Consolidated snapshot for whoever next has time to clear the backlog. Written
by the automated weekly health-check routine (Friday docs+ideation angle)
after 9 consecutive days of reporting the same three blockers with no code
fix available for the top one. Superseded the moment any of the three
"Next actions" below happen — delete or rewrite this file at that point
rather than layering another status doc on top.

## 1. Production is down (day 9, not a code problem)

`https://solar-lab-x.vercel.app` returns `402 Payment Required` /
`x-vercel-error: DEPLOYMENT_DISABLED` since 2026-07-02. Vercel project
`solar-lab-x` (`prj_AHZlhDfpU33SZbdtylTvEtBgoL1l`) reports `"live": false`;
the latest deployment shows `readyState: CANCELED`. This is an
account-level gate (billing / spend-management) on team
`ganeshgowrimitsui-3250's projects` — no PR or commit can fix it.

**Next action:** someone with dashboard access needs to open
Settings → Billing for that Vercel team and clear whatever payment/spend
block is active. Tracked in #229 (daily confirmation comments since 07-02).

## 2. `main` has zero CI — every fix has been sitting in draft

`main` has no `.github/workflows/` directory at all, so nothing has run on
a schedule or on push in months. The fix already exists and has been ready
since 2026-06-01:

- **PR #164** — adds `ci.yml` (lint, type-check, `npm audit`, tests) and a
  daily 02:00 UTC cron. Currently failing its own audit step, which is
  expected — see §3.

**Next action:** merge #164. It will start failing loudly on the CVEs
below until #203/#217 land, which is the intended behavior, not a
regression.

## 3. Dependency security — fixes already written, just unmerged

Current `npm audit` on `main`: **2 critical, 8 high, 6 moderate** (16
total), unchanged since 06-25.

| CVE source | Draft PR with the fix | Notes |
|---|---|---|
| `next@14.2.18` (critical) | **#203** | Bumps to `14.2.25`, adds `brace-expansion` override |
| `jspdf@4.2.0` (critical, CVSS 9.6) | **#217** | Patch bump within existing `^4.2.0` range |
| `xlsx@0.18.5` (high) | none | No upstream fix exists; would need a library swap (tracked in #221 — replace with `exceljs`) |

**Next action:** merge #203 and #217 to clear both CRITICAL findings; they
don't touch overlapping files and can land independently.

## 4. The backlog itself is the real bottleneck

56 open draft PRs (oldest, #85, is 9+ weeks old) / ~90 open issues. Most
issues are duplicate daily/weekly health-check reports of the same three
items above. Most PRs are small, isolated, single-concern changes
(refactor / bulk-removal / test / security, one per weekday angle) that
were never reviewed. None of the three next-actions above require new
code — they require someone to open the PR list and click merge, roughly
in this order: **#229's billing fix (external) → #164 (CI) → #203 + #217
(criticals) → work backward through the rest by age.**

No numerical/solver module has changed on `main` since PR #84
(2026-03-25, UI-only), so there is nothing to benchmark this week. No
Hugging Face Space is connected to this repo.
