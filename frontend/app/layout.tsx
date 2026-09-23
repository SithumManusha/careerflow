import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "CareerFlow Enterprise | ATS Resume Optimizer & Candidate Showcase",
  description: "Enterprise ATS Resume Compatibility Analyzer & Candidate Showcase platform powered by Java 21 Spring Boot 3, Redis Rate Limiting, and Python RAG Worker.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
