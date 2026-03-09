import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarLabX - Solar PV Lab Operations Suite",
  description: "Enterprise-grade platform for solar PV testing laboratories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
