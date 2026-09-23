"use client";

import React from "react";
import Link from "next/link";
import { Github, Linkedin, Cpu } from "lucide-react";

export default function Footer() {

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">CareerFlow Enterprise</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Intelligent ATS compatibility analysis, Google XYZ resume bullet optimization, and verified candidate showcases designed to help engineers pass modern screening algorithms and land top technical roles.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200 mb-3">Platform Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ats-checker" className="hover:text-white transition-colors">ATS Resume Scanner</Link>
              </li>
              <li>
                <Link href="/cv-builder" className="hover:text-white transition-colors">1-Page ATS CV Builder</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-200 mb-3">Platform Standards</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-1">
                <span>Semantic ATS Scoring (0–100%)</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Workday & Taleo Linear Layouts</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Google XYZ Formula Optimizer</span>
              </li>
              <li className="flex items-center gap-1">
                <span>100% Data Privacy & Single-Column Parsability</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>
            Engineered with technical rigor by <strong className="text-slate-300">CareerFlow Enterprise Team</strong> • Open Source Distributed Architecture
          </p>
          <p className="mt-2 sm:mt-0 text-[11px] text-slate-600">
            © {new Date().getFullYear()} CareerFlow Enterprise
          </p>
        </div>
      </div>

    </footer>
  );
}
