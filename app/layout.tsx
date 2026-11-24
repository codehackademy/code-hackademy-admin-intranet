import type { Metadata, Viewport } from "next";
import { archivo, jetbrains } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Code Hackademy Admin", template: "%s | Code Hackademy Admin" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#FD5000", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jetbrains.variable}`}>
      <body data-app="admin">{children}</body>
    </html>
  );
}
