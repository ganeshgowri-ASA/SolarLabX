export const APP_NAME = "SolarLabX";
export const APP_DESCRIPTION = "Solar PV Lab Operations Suite";

export const NAV_MODULES = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    description: "Overview & KPIs",
  },
  {
    title: "LIMS",
    href: "/lims",
    icon: "FlaskConical",
    description: "Lab Information Management",
  },
  {
    title: "QMS",
    href: "/qms",
    icon: "FileCheck",
    description: "Quality Management System",
  },
  {
    title: "Audit",
    href: "/audit",
    icon: "ClipboardCheck",
    description: "Audit Management",
  },
  {
    title: "Projects",
    href: "/projects",
    icon: "FolderKanban",
    description: "Project Management",
  },
  {
    title: "Uncertainty",
    href: "/uncertainty",
    icon: "Calculator",
    description: "Uncertainty Calculator",
  },
  {
    title: "Vision AI",
    href: "/vision-ai",
    icon: "ScanEye",
    description: "AI Defect Detection",
  },
  {
    title: "SOP Gen",
    href: "/sop-gen",
    icon: "BookOpen",
    description: "SOP Generator",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "FileBarChart",
    description: "Test Report Automation",
  },
  {
    title: "Sun Simulator",
    href: "/sun-simulator",
    icon: "Sun",
    description: "IEC 60904-9 Classifier",
  },
  {
    title: "Chamber Config",
    href: "/chamber-config",
    icon: "Thermometer",
    description: "Chamber Configurator",
  },
  {
    title: "Procurement",
    href: "/procurement",
    icon: "ShoppingCart",
    description: "Procurement Management",
  },
] as const;

export const IEC_STANDARDS = [
  "IEC 61215",
  "IEC 61730",
  "IEC 61853",
  "IEC 60904",
  "IEC 62716",
  "IEC 61701",
  "IEC 62804",
] as const;
