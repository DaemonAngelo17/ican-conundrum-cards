import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ICAN Conundrum Cards — Interdisciplinary Curriculum Workspace",
  description:
    "Explore, search, and teach all 84 ICAN Conundrum Cards (CON-001 through CON-084) with differentiated Lower, Middle, and Upper Elementary worksheets connected to Google Sheets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
