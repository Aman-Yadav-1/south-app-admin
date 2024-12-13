import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ModalProvider } from "@/providers/modal-provider";
import { ToastProvider } from "@/providers/toast-provider";

const poppins = Poppins({subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"]});

export const metadata: Metadata = {
  title: {
    template: '%s | South Food Admin',
    default: 'South Food Admin'
  },
  description: "Admin dashboard for South Food restaurant management",
  keywords: ['restaurant', 'admin', 'food', 'management', 'south food'],
  authors: [{ name: 'South Food' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: false,
    follow: false
  }
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={poppins.className}
      >
        <ModalProvider/>
        <ToastProvider/>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
