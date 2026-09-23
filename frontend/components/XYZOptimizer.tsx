"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Check, Copy, TrendingUp } from "lucide-react";
import { rewriteBulletXYZ, XYZResult } from "@/lib/api";

export default function XYZOptimizer() {
  const [inputBullet, setInputBullet] = useState("");
  const [targetSkill, setTargetSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<XYZResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRewrite = async () => {
    if (!inputBullet.trim()) return;
    setLoading(true);
    try {
      const res = await rewriteBulletXYZ(inputBullet, "Software Engineer Intern", targetSkill);
      setResult(res);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Google XYZ Bullet Point Optimizer</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transform passive bullets into high-impact format: <span className="font-semibold text-slate-700">Accomplished [X] as measured by [Y], by doing [Z]</span>.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>+45% Impact Boost</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Original Unquantified Bullet Point:
          </label>
          <textarea
            value={inputBullet}
            onChange={(e) => setInputBullet(e.target.value)}
            rows={2}
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 resize-none"
            placeholder="e.g., Developed API endpoints using Spring Boot..."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Core Skill:</span>
            <input
              type="text"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
              placeholder="e.g. Java 21, Redis, Docker"
            />
          </div>

          <button
            onClick={handleRewrite}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-sm shadow-indigo-500/25 cursor-pointer"
          >
            {loading ? (
              <span>Optimizing...</span>
            ) : (
              <>
                <span>Generate Google XYZ Bullet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Rewritten Output Card */}
        {result && (
          <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Optimized Bullet Point
              </span>
              <button
                onClick={() => handleCopy(result.rewritten_bullet)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm font-medium text-slate-900 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
              {result.rewritten_bullet}
            </p>

            {/* XYZ Breakdown pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-blue-700 block mb-0.5">[X] Accomplished:</span>
                <span className="text-slate-600">{result.formula_x}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-0.5">[Y] Measured by:</span>
                <span className="text-slate-600">{result.formula_y}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-indigo-700 block mb-0.5">[Z] By doing:</span>
                <span className="text-slate-600">{result.formula_z}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
