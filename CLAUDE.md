# CLAUDE.md - SolarLabX Project Context

## Project Overview
SolarLabX is a unified Solar PV Lab Operations Suite combining 11 existing Streamlit apps into a single Next.js application deployed on Vercel. It serves as an enterprise-grade platform for solar PV testing laboratories.

## Tech Stack
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Next.js API routes, Prisma ORM
- Database: PostgreSQL (Supabase/Neon)
- Auth: NextAuth.js with role-based access (Admin, Lab Manager, Technician, Auditor)
- AI: Claude API (SOP gen, reports), Roboflow API (defect detection)
- Charts: Recharts, Plotly
- PDF: @react-pdf/renderer
- Deploy: Vercel

## Module Architecture (11 Modules)

### 1. LIMS Module (/lims)
Source: test-protocols, solar-pv-lab-os
- Sample registration and tracking
- JSON-based dynamic test templates (IEC 61215, 61730, 61853, 60904)
- Test execution workflows with data entry
- Equipment/instrument management with calibration tracking
- Chain of custody and sample lifecycle

### 2. QMS Module (/qms)
Source: test-protocols (QMS features)
- Document control (SOPs, work instructions, forms)
- CAPA management (Corrective/Preventive actions)
- Management review tracking
- ISO 17025 / NABL compliance workflows
- Internal audit scheduling

### 3. Audit Module (/audit)
Source: audit-pro-enterprise
- Audit planning and scheduling (ISO 9001, IATF 16949, VDA 6.3)
- NC/OFI tracking with severity classification
- CAR/8D problem-solving workflow
- Audit findings dashboard with analytics
- Auditor assignment and competency tracking

### 4. Project Management (/projects)
Source: solar-pv-project-management
- Test project creation and tracking
- Gantt charts and milestone management
- Resource allocation (chambers, simulators, staff)
- Client communication and deliverables tracking
- Project costing and invoicing

### 5. Uncertainty Calculator (/uncertainty)
Source: solar-pv-uncertainty-tool, pv-uncertainty-analysis-tool
- ISO/IEC 17025 measurement uncertainty calculation
- GUM (Guide to Uncertainty in Measurement) methodology
- Type A and Type B uncertainty components
- Combined and expanded uncertainty with coverage factors
- Uncertainty budget reports for accreditation

### 6. AI Vision / Defect Detection (/vision-ai)
Source: SolarVisionAI, pv-defect-detection, Vivasvana-Bodha
- AI-powered visual defect detection (EL, IR, visual)
- Roboflow model integration for cell/module defects
- Defect classification (cracks, hotspots, snail trails, PID)
- Image annotation and reporting
- Historical defect trend analysis

### 7. SOP Generator (/sop-gen)
Source: sop-gen
- AI-powered SOP generation from IEC/ISO standards
- Template-based SOP creation with standard references
- Version control and approval workflows
- Multi-format export (PDF, Word, HTML)
- Standard interpretation assistance

### 8. Test Report Automation (/reports)
Source: pv-test-report-automation
- Automated report generation for IEC 61215/61730/61853
- ISO 17025 compliant report templates
- Data pull from LIMS test results
- Digital signatures and approval workflow
- Report archival and retrieval

### 9. Sun Simulator Classifier (/sun-simulator)
Source: SunSim-IEC60904-Classifier
- IEC 60904-9 Ed.3 classification (A+/A/B/C)
- Spectral match analysis
- Spatial uniformity mapping
- Temporal stability assessment
- SPC/MSA quality control charts

### 10. Chamber Configurator (/chamber-config)
Source: pv-chamber-configurator
- Environmental test chamber configuration
- UV + TC + HF + DH combined chamber specs
- CFD simulation visualization
- Virtual HMI interface
- Quote generation and comparison

### 11. Procurement (/procurement)
Source: procure-pro-iso
- ISO-compliant procurement lifecycle
- RFQ creation and vendor evaluation
- Technical Bid Evaluation (TBE)
- PO tracking and FAT/SAT management
- Equipment asset management

## Source Repositories (GitHub: ganeshgowri-ASA)
1. test-protocols - https://github.com/ganeshgowri-ASA/test-protocols
2. audit-pro-enterprise - https://github.com/ganeshgowri-ASA/audit-pro-enterprise
3. solar-pv-project-management - https://github.com/ganeshgowri-ASA/solar-pv-project-management (if exists, check Streamlit app)
4. solar-pv-uncertainty-tool - https://github.com/ganeshgowri-ASA/solar-pv-uncertainty-tool
5. SolarVisionAI - https://github.com/ganeshgowri-ASA/SolarVisionAI
6. sop-gen - https://github.com/ganeshgowri-ASA/sop-gen
7. solar-pv-lab-os - https://github.com/ganeshgowri-ASA/solar-pv-lab-os
8. pv-test-report-automation - https://github.com/ganeshgowri-ASA/pv-test-report-automation
9. SunSim-IEC60904-Classifier - https://github.com/ganeshgowri-ASA/SunSim-IEC60904-Classifier
10. pv-chamber-configurator - https://github.com/ganeshgowri-ASA/pv-chamber-configurator
11. procure-pro-iso - https://github.com/ganeshgowri-ASA/procure-pro-iso
12. pv-defect-detection - https://github.com/ganeshgowri-ASA/pv-defect-detection
13. pv-uncertainty-analysis-tool - https://github.com/ganeshgowri-ASA/pv-uncertainty-analysis-tool
14. Vivasvana-Bodha - https://github.com/ganeshgowri-ASA/Vivasvana-Bodha

## Directory Structure
```
SolarLabX/
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (dashboard)/layout.tsx
    (dashboard)/page.tsx           # Main dashboard
    (dashboard)/lims/page.tsx
    (dashboard)/qms/page.tsx
    (dashboard)/audit/page.tsx
    (dashboard)/projects/page.tsx
    (dashboard)/uncertainty/page.tsx
    (dashboard)/vision-ai/page.tsx
    (dashboard)/sop-gen/page.tsx
    (dashboard)/reports/page.tsx
    (dashboard)/sun-simulator/page.tsx
    (dashboard)/chamber-config/page.tsx
    (dashboard)/procurement/page.tsx
    api/
      auth/[...nextauth]/route.ts
      lims/route.ts
      reports/route.ts
      vision/route.ts
      sop/route.ts
    layout.tsx
    globals.css
  components/
    ui/            # shadcn/ui components
    layout/        # Sidebar, Header, Navigation
    dashboard/     # Dashboard widgets
    lims/          # LIMS-specific components
    audit/         # Audit-specific components
    charts/        # Reusable chart components
  lib/
    db.ts          # Prisma client
    auth.ts        # NextAuth config
    utils.ts
    constants.ts
  prisma/
    schema.prisma
  public/
  CLAUDE.md
  package.json
  tsconfig.json
  tailwind.config.ts
  next.config.ts
  vercel.json
```

## Key Commands
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false
npx prisma init
npx prisma db push
npx prisma generate
npm run dev
npm run build
```

## Claude Code Session Strategy
Launch parallel sessions for faster development:

Session 1 - Core Setup: Next.js init, Prisma schema, Auth, Layout, Dashboard
Session 2 - LIMS + QMS + Test Protocols: Core lab operations modules
Session 3 - Audit + Projects + Procurement: Management modules
Session 4 - Uncertainty + Sun Simulator + Chamber: Technical calculators
Session 5 - Vision AI + SOP Gen + Reports: AI-powered modules

## Standards Reference
- IEC 61215 (PV module design qualification)
- IEC 61730 (PV module safety)
- IEC 61853 (PV module energy rating)
- IEC 60904 (PV device measurement)
- IEC 62716, 61701, 62804 (Environmental tests)
- ISO 17025 (Lab competence)
- ISO 9001 (Quality management)
- NABL, ILAC, BIS compliance

## Environment Variables (.env.local)
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
CLAUDE_API_KEY=
ROBOFLOW_API_KEY=
```
