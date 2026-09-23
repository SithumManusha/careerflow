"use client";

import Link from "next/link";
import { 
  FileSearch, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  Sliders, 
  Check, 
  X,
  FileCheck,
  TrendingUp,
  MessageSquareQuote
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import XYZOptimizer from "@/components/XYZOptimizer";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 bg-gradient-to-b from-white via-blue-50/40 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Industry Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold mb-6 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Enterprise ATS Resume Intelligence & Career Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Land More Tech Interviews with an <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ATS-Optimized Resume</span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Over 75% of resumes are filtered out before reaching a recruiter. Score your CV against live job requirements, identify missing keywords, and quantify your achievements with Google’s XYZ formula.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ats-checker"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <FileSearch className="w-4 h-4" />
              <span>Scan Resume Free</span>
            </Link>

            <Link
              href="/cv-builder"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-all hover:border-slate-400"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Create 1-Page ATS CV</span>
            </Link>

            <Link
              href="/interview-prep"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-2xs transition-all hover:-translate-y-0.5"
            >
              <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
              <span>AI Mock Interview</span>
            </Link>
          </div>

          {/* Platform Performance Metrics */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-2xl font-black text-slate-900">0–100%</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Automated Match Score</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-2xl font-black text-blue-600">&lt; 1 sec</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Instant Semantic Scan</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-2xl font-black text-indigo-600">200+</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Tech Skills Analyzed</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-2xl font-black text-emerald-600">94%</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Higher Callback Rate</p>
            </div>
          </div>
        </div>

        <div className="h-10" />
      </section>

      {/* Product Capabilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Modern Hiring Algorithms
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Automated tools designed to align your experience with recruiter benchmarks and applicant tracking systems.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: ATS Scoring */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Semantic Match Scoring</h3>
            <p className="text-xs text-slate-500 mt-1.5 mb-5">
              Comprehensive compatibility analysis evaluating keyword presence, context, and role relevance.
            </p>
            <div className="my-auto py-2">
              <ScoreGauge score={88} size={150} strokeWidth={12} label="Compatibility" />
            </div>
            <Link
              href="/ats-checker"
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-xl transition-colors"
            >
              <span>Scan Your Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Skill Gap Analysis */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Targeted Skill Gap Detection</h3>
            <p className="text-xs text-slate-500 mt-1.5 mb-4">
              Pinpoints high-priority technical requirements missing from your resume before you submit an application.
            </p>

            <div className="space-y-2.5 my-auto text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-slate-800">Core Languages:</span>
                <span className="text-emerald-700 font-bold">100% Matched</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-slate-800">Frameworks:</span>
                <span className="text-emerald-700 font-bold">95% Matched</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-slate-800">Database & Caching:</span>
                <span className="text-blue-700 font-bold">Action Suggested</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-semibold text-slate-800">DevOps & Cloud:</span>
                <span className="text-emerald-700 font-bold">90% Matched</span>
              </div>
            </div>

            <Link
              href="/ats-checker"
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-2.5 rounded-xl transition-colors"
            >
              <span>Check Missing Keywords</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: 1-Page ATS CV Exporter */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">1-Page ATS Standard CV</h3>
            <p className="text-xs text-slate-500 mt-1.5 mb-4">
              Export clean, single-column vector PDF resumes engineered to achieve 100% parse rates across Workday and Taleo.
            </p>

            <div className="space-y-2 my-auto text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Single-column linear hierarchy readable by all scanners</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Standard section taxonomies expected by recruiters</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Integrated Google XYZ formula metric highlights</span>
              </div>
            </div>

            <Link
              href="/cv-builder"
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-xl transition-colors"
            >
              <span>Build ATS Resume Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Google XYZ Optimizer Component */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <XYZOptimizer />
      </section>

      {/* Industry Comparison Matrix: Traditional vs CareerFlow Resume */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
              Resume Effectiveness Benchmark
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-3">
              Why Traditional Resumes Get Filtered Out
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              See how CareerFlow transforms standard applicant resumes into high-converting application packages.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Evaluation Criteria</th>
                  <th className="pb-3 font-semibold text-blue-400">CareerFlow Optimized Resume</th>
                  <th className="pb-3 font-semibold text-slate-500">Traditional Unoptimized Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 font-medium text-white">ATS Parser Compatibility</td>
                  <td className="py-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>100% Machine-Parseable Linear Layout</span>
                  </td>
                  <td className="py-3 text-rose-400 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Multi-column layouts fail parser scanning</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Impact & Achievement Framing</td>
                  <td className="py-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Quantified Google XYZ Formula metrics</span>
                  </td>
                  <td className="py-3 text-rose-400 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Passive lists of job duties with zero metrics</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Technical Keyword Alignment</td>
                  <td className="py-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Semantic match against target employer JDs</span>
                  </td>
                  <td className="py-3 text-rose-400 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Manual guesswork; critical skills missed</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Candidate Portfolio Verification</td>
                  <td className="py-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Verified public showcase profile</span>
                  </td>
                  <td className="py-3 text-rose-400 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Static document with no proof of work</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Interview Callback Probability</td>
                  <td className="py-3 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Top 10% candidate shortlisting pool</span>
                  </td>
                  <td className="py-3 text-rose-400 flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Over 75% rejected in automated triage</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
