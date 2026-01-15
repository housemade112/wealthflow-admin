import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WealthBridg Admin",
  description: "Admin Dashboard for WealthBridg Investment Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
