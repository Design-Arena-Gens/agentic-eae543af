import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EstateVoice | Appointment Assistant",
  description: "Voice-driven assistant for real estate appointment scheduling"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950 text-slate-50">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
