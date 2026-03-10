// @ts-nocheck
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarLabX - Solar PV Lab Operations Suite",
  description:
    "Enterprise-grade platform for solar PV testing laboratories. LIMS, QMS, Audit, Project Management, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
