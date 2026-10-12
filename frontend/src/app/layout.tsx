import type { Metadata } from "next";
import AppHeader from "@/components/Layout/AppHeader";
import AppShell from "@/components/Layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "MargDrishti — Traffic Digital Twin Platform",
  description:
    "Workflow-driven traffic digital-twin platform: CCTV analysis, SUMO simulation, what-if scenarios, and comparison reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Start without dark class; AppHeader's useEffect will apply the
    // stored or OS preference on the client without a full reload.
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col overflow-hidden" style={{ background: "var(--bg)", color: "var(--text-primary)" }}>
        <AppHeader />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
