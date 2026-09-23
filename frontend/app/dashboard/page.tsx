"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getUserScans,
  deleteUserScan,
  getUserDrafts,
  deleteUserDraft,
  UserScanDTO,
  UserCVDraftDTO
} from "@/lib/api";
import {
  History,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  LogOut,
  FolderOpen
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, logout, openAuthModal, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"scans" | "drafts">("scans");
  const [scans, setScans] = useState<UserScanDTO[]>([]);
  const [drafts, setDrafts] = useState<UserCVDraftDTO[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (token) {
      setLoadingData(true);
      Promise.all([getUserScans(token), getUserDrafts(token)])
        .then(([s, d]) => {
          setScans(s);
          setDrafts(d);
        })
        .finally(() => setLoadingData(false));
    }
  }, [token]);

  const handleDeleteScan = async (id?: number) => {
    if (!id || !token) return;
    await deleteUserScan(token, id);
    setScans((prev) => prev.filter((s) => s.id !== id));
    showToast("Scan record deleted");
  };

  const handleDeleteDraft = async (id?: number) => {
    if (!id || !token) return;
    await deleteUserDraft(token, id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast("CV draft deleted");
  };

  const handleLoadDraftIntoBuilder = (draft: UserCVDraftDTO) => {
    try {
      sessionStorage.setItem("careerflow_loaded_draft", draft.resumeDataJson);
      router.push("/cv-builder?fromDraft=1");
    } catch {
      router.push("/cv-builder");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Member Dashboard</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Sign in to your CareerFlow account to view your ATS scan history, saved CV drafts, and track your keyword match improvements.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg cursor-pointer inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Sign In / 1-Click Demo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* User Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">{user.fullName}</h1>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="w-3 h-3" /> Candidate Account
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ats-checker"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <span>New ATS Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <button
          onClick={() => setActiveTab("scans")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "scans"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span>ATS Scan History ({scans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("drafts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "drafts"
              ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Saved Cloud CVs ({drafts.length})</span>
        </button>
      </div>

      {/* Tab 1: Scans */}
      {activeTab === "scans" && (
        <div className="space-y-4">
          {scans.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No past scan records yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Run an ATS scan against your target job description to track keyword density and format health here.
              </p>
              <Link
                href="/ats-checker"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Scan Resume Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {scans.map((scan) => {
                let missing: string[] = [];
                try {
                  missing = JSON.parse(scan.missingKeywordsJson || "[]");
                } catch {}

                return (
                  <div
                    key={scan.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{scan.jobTitle || "Job Description Scan"}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                          {scan.targetRole || "Backend / Cloud"}
                        </span>
                        {scan.scannedAt && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(scan.scannedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Missing keywords chips */}
                      {missing.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-500 font-medium">Missing Skills:</span>
                          {missing.slice(0, 5).map((kw, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono"
                            >
                              {kw}
                            </span>
                          ))}
                          {missing.length > 5 && (
                            <span className="text-[10px] text-slate-500">+{missing.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Scores & Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Match Score</div>
                        <div className={`text-lg font-extrabold font-mono ${
                          scan.jobMatchScore >= 80 ? "text-emerald-400" : scan.jobMatchScore >= 60 ? "text-amber-400" : "text-rose-400"
                        }`}>
                          {scan.jobMatchScore}%
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400">ATS Health</div>
                        <div className={`text-lg font-extrabold font-mono ${
                          scan.atsHealthScore >= 85 ? "text-blue-400" : "text-amber-400"
                        }`}>
                          {scan.atsHealthScore}%
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                        <Link
                          href="/ats-checker"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Re-run Scanner"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteScan(scan.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Drafts */}
      {activeTab === "drafts" && (
        <div className="space-y-4">
          {drafts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <FolderOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-300">No saved CV drafts yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Build your 1-page ATS CV and click &quot;Save to Cloud&quot; to manage multiple role-tailored versions here.
              </p>
              <Link
                href="/cv-builder"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Open CV Builder
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                        {draft.targetRole || "Software Engineer"}
                      </span>
                      {draft.updatedAt && (
                        <span className="text-[11px] text-slate-500">
                          Updated {new Date(draft.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{draft.draftTitle}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      Single-column linear Taleo/Workday ATS layout with Google XYZ bullet optimizations.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleLoadDraftIntoBuilder(draft)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open in CV Builder</span>
                    </button>

                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
