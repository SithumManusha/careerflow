"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Cpu, UserCheck, Sparkles, MessageSquareQuote, LayoutDashboard, LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const links = [
    { href: "/ats-checker", label: "ATS Resume Scanner", icon: FileText },
    { href: "/cv-builder", label: "1-Page ATS CV Builder", icon: Sparkles },
    { href: "/interview-prep", label: "AI Mock Interview", icon: MessageSquareQuote },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">CareerFlow</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">Enterprise</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">ATS Optimization & Career Platform</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${pathname === "/dashboard" ? "text-blue-600" : "text-slate-400"}`} />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Auth & Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden sm:inline">{user.fullName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs animate-fadeIn"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-slate-500 truncate">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span>My Dashboard</span>
                  </Link>
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <Link
            href="/ats-checker"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all hover:shadow"
          >
            Scan Resume Free
          </Link>
        </div>
      </div>
    </header>
  );
}
