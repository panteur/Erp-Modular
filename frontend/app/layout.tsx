import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERP Modular",
  description: "Sistema de gestión empresarial modular",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}