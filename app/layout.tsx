import type { Metadata } from "next";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import InstallPWA from '@/components/InstallPWA';
import { inter } from './fonts'

export const metadata: Metadata = {
  title: "Modern E-commerce Store",
  description: "A modern e-commerce store built with Next.js and Shopify",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} bg-white text-black overflow-x-hidden`}>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <InstallPWA />
      </body>
    </html>
  );
}
