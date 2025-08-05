import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Style Guide - Prism Health Lab",
  description: "Medical-Grade Design System for Prism Health Lab",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StyleGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {children}
    </div>
  );
}