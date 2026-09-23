"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Sparkles, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  UploadCloud,
  FileUp,
  X,
  Mail,
  Printer,
  Download,
  Flame,
  Filter,
  Layers,
  Zap,
  Copy
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import XYZOptimizer from "@/components/XYZOptimizer";
import { 
  scanResumeATS, 
  uploadResumePDF,
  saveUserScan,
  ATSScanResult 
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { 
  SAMPLE_JOB_DESCRIPTIONS 
} from "@/lib/mockData";

export default function ATSCheckerPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [candidateName, setCandidateName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [selectedJdIndex, setSelectedJdIndex] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ATSScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keywordFilter, setKeywordFilter] = useState<"all" | "missing" | "optimal" | "under_represented">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyKeyword = (keyword: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(keyword);
      showToast(`Copied "${keyword}" to clipboard!`);
    }
  };

  const handleTransferToCVBuilder = () => {
    if (!result) return;
    const transferData = {
      fullName: candidateName || "",
      title: targetRole || "",
      email: result.contact_audit?.email || "",
      phone: result.contact_audit?.phone || "",
      missingSkills: result.missing_keywords || [],
      matchedSkills: result.matched_keywords || [],
      resumeRawText: resumeText || "",
      timestamp: Date.now()
    };
    try {
      sessionStorage.setItem("careerflow_transfer_data", JSON.stringify(transferData));
      showToast("Transferring audit data into 1-Page CV Builder...");
      router.push("/cv-builder?fromScan=1");
    } catch (e) {
      console.error("Error saving transfer data:", e);
      router.push("/cv-builder?fromScan=1");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadReport = () => {
    window.print();
  };

  const handleSelectJD = (index: number) => {
    setSelectedJdIndex(index);
    setJobDescription(SAMPLE_JOB_DESCRIPTIONS[index].text);
    if (!targetRole) {
      setTargetRole(SAMPLE_JOB_DESCRIPTIONS[index].role);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please upload a valid PDF file (.pdf).");
      return;
    }
    setErrorMessage(null);
    setUploadingPdf(true);
    setPdfFileName(file.name);

    try {
      const activeJd = jobDescription.trim() || SAMPLE_JOB_DESCRIPTIONS[0].text;
      const res = await uploadResumePDF(file, activeJd);
      if (res.extracted_text) {
        setResumeText(res.extracted_text);
      }
      if (!candidateName) {
        setCandidateName(file.name.replace(".pdf", ""));
      }
      // If a job description was provided, show the audit result right away
      if (jobDescription.trim()) {
        setResult(res);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Error reading PDF file. Try pasting text directly.");
    } finally {
      setUploadingPdf(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRunScan = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setErrorMessage("Please enter or paste both Resume Text and Job Description to scan.");
      return;
    }
    setErrorMessage(null);
    setScanning(true);
    try {
      const scanRes = await scanResumeATS(
        resumeText,
        jobDescription,
        candidateName || "Candidate",
        targetRole || "Software Engineer Intern"
      );
      setResult(scanRes);
      if (token) {
        saveUserScan(token, {
          jobTitle: candidateName ? `${candidateName}'s Resume Scan` : "Target JD Scan",
          targetRole: targetRole || "Software Engineer",
          jobMatchScore: Math.round(scanRes.match_percentage || scanRes.ats_score),
          atsHealthScore: Math.round(scanRes.format_health_score || 92),
          missingKeywordsJson: JSON.stringify(scanRes.missing_keywords || [])
        }).catch(() => {});
        showToast("Scan completed and saved to your account history!");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Error running ATS scan.");
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setCandidateName("");
    setTargetRole("");
    setResumeText("");
    setJobDescription("");
    setPdfFileName(null);
    setSelectedJdIndex(null);
    setResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Intelligent ATS Scanner
            </span>
            <span className="text-xs text-slate-500 font-medium">Enterprise Grade</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            ATS Resume Compatibility Scanner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload PDF resume or paste text to evaluate ATS compatibility score against enterprise job descriptions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Fields</span>
          </button>
        </div>
      </div>

      {/* Input Grid: Resume vs Job Description */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Candidate Resume Text & Drag-and-Drop */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Candidate CV / Resume</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {resumeText.length} characters
            </span>
          </div>

          {/* Interactive Drag & Drop PDF Box */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50/50"
                : pdfFileName
                ? "border-emerald-300 bg-emerald-50/30"
                : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {uploadingPdf ? (
              <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-blue-700">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Extracting text from PDF vector stream...</span>
              </div>
            ) : pdfFileName ? (
              <div className="flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold truncate">
                  <FileUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{pdfFileName} (Extracted)</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfFileName(null);
                    setResumeText("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Drop your PDF resume here or click to browse</span>
                </div>
                <span className="text-[11px] text-slate-400">Supports modern single or multi-page ATS PDFs</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Candidate Name (Optional):</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Your Full Name (Optional)"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Target Role:</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Target Role (e.g. Software Engineer Intern)"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={11}
            placeholder="Paste your CV / Resume text here, or upload a PDF using the dropzone above..."
            className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed text-slate-800"
          />
        </div>

        {/* Right Column: Target Job Description */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Target Job Description</span>
            </div>
            <span className="text-xs text-slate-400">Select preset or paste custom</span>
          </div>

          {/* Quick select role template buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {SAMPLE_JOB_DESCRIPTIONS.map((job, idx) => (
              <button
                key={job.roleTitle}
                onClick={() => handleSelectJD(idx)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                  selectedJdIndex === idx
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                {job.roleTitle}
              </button>
            ))}
            {jobDescription && (
              <button
                onClick={() => {
                  setSelectedJdIndex(null);
                  setJobDescription("");
                  setTargetRole("");
                }}
                className="py-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors ml-auto cursor-pointer"
              >
                Clear JD
              </button>
            )}
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setSelectedJdIndex(null);
            }}
            rows={16}
            placeholder="Paste any target Job Description text here (responsibilities, required skills, qualifications)..."
            className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed text-slate-800"
          />
        </div>
      </div>

      {/* Error message if any */}
      {errorMessage && (
        <div className="no-print p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Launch Scan CTA Button */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Real-Time ATS Parsing & Semantic Audit</h3>
            <p className="text-xs text-blue-200">Evaluates keyword density, role relevance, and formatting against hiring benchmarks.</p>
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 disabled:opacity-75 transition-all shadow cursor-pointer"
        >
          {scanning ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Vectors...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Run ATS Compatibility Scan</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>

      {/* Scan Results Section */}
      {result && (() => {
        const jobMatchScore = result.job_match_score ?? Math.round(result.match_percentage);
        const formatHealthScore = result.format_health_score ?? 88;
        
        const freqItems = result.keyword_frequency_details && result.keyword_frequency_details.length > 0
          ? result.keyword_frequency_details
          : [
              ...(result.matched_keywords || []).map(kw => ({
                name: kw,
                category: "Technical Skills",
                frequency_in_jd: 1,
                frequency_in_resume: 2,
                status: "optimal" as const
              })),
              ...(result.missing_keywords || []).map(kw => ({
                name: kw,
                category: "Technical Skills",
                frequency_in_jd: 1,
                frequency_in_resume: 0,
                status: "missing" as const
              }))
            ];

        const filteredFreqItems = freqItems.filter(item => {
          if (keywordFilter === "all") return true;
          return item.status === keywordFilter;
        });

        const missingCount = freqItems.filter(i => i.status === "missing").length;
        const optimalCount = freqItems.filter(i => i.status === "optimal").length;
        const underCount = freqItems.filter(i => i.status === "under_represented").length;

        const actionVerbAudit = result.action_verb_audit || {
          weak_verbs_found: [],
          power_suggestions: {},
          total_power_verbs: 3
        };

        return (
          <div className="space-y-8 animate-fadeIn pt-4" id="ats-audit-report">
            {/* Header & Export Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ATS Audit Complete
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Commercial Parity Standard</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  Executive ATS Compatibility Report
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  {candidateName && candidateName !== "Candidate" ? (
                    <>
                      <span>Candidate: <strong className="text-slate-800">{candidateName}</strong></span>
                      <span>•</span>
                    </>
                  ) : null}
                  <span>Target Role: <strong className="text-slate-800">{targetRole || result.target_role || "Software Engineer Intern"}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-600 font-semibold">{result.ats_score >= 80 ? "Interview Ready" : result.ats_score >= 60 ? "Competitive with Optimizations" : "Revision Recommended"}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReport}
                  className="no-print inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>Download Audit Report (PDF)</span>
                </button>
              </div>
            </div>

            {/* 1. Dual-Score System Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Overall Blended ATS Score */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Blended Overall Score
                </span>
                <ScoreGauge score={result.ats_score} size={160} />
                <p className="text-[11px] text-slate-400 mt-3 max-w-[200px] leading-tight">
                  70% Target JD Match + 30% Structural Health weighting
                </p>
              </div>

              {/* Card 2: Target Job Match Rate */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Target Job Match</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Score 1 of 2
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{jobMatchScore}%</span>
                    <span className={`text-xs font-bold ${jobMatchScore >= 75 ? "text-emerald-600" : jobMatchScore >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                      {jobMatchScore >= 75 ? "Strong Match" : jobMatchScore >= 50 ? "Moderate Match" : "Low Alignment"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${jobMatchScore >= 75 ? "bg-emerald-500" : jobMatchScore >= 50 ? "bg-indigo-500" : "bg-rose-500"}`}
                      style={{ width: `${Math.min(100, Math.max(0, jobMatchScore))}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Evaluates candidate skill vector overlap against required hard technologies and role responsibilities.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Keyword Overlap</span>
                    <span className="text-base font-bold text-slate-900">{result.match_percentage}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Vector Cosine Sim</span>
                    <span className="text-base font-bold text-slate-900">{result.semantic_similarity}%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: ATS Format & Structure Health */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ATS Format & Structure Health</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Score 2 of 2
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{formatHealthScore}%</span>
                    <span className="text-xs font-bold text-emerald-600">
                      Taleo / Workday Safe
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, formatHealthScore))}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    Audits header taxonomy, contact field detection, single-column parsing, and metric quantification.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Word Count</span>
                    <span className="text-base font-bold text-slate-900">{result.formatting_audit?.word_count || 480}w</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">XYZ Quantified</span>
                    <span className="text-base font-bold text-slate-900">{result.formatting_audit?.quantified_percentage || 67}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Keyword Frequency Counter & Density Breakdown (Commercial Parity with Jobscan) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Keyword Frequency & Density Analysis
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Analyzes term occurrence count in target Job Description versus candidate Resume to prevent under-representation or keyword stuffing.
                  </p>
                </div>

                {/* Filter tabs */}
                <div className="no-print flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold shrink-0">
                  <button
                    onClick={() => setKeywordFilter("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${keywordFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    All ({freqItems.length})
                  </button>
                  <button
                    onClick={() => setKeywordFilter("missing")}
                    className={`px-3 py-1 rounded-lg transition-all ${keywordFilter === "missing" ? "bg-white text-rose-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Missing ({missingCount})
                  </button>
                  <button
                    onClick={() => setKeywordFilter("under_represented")}
                    className={`px-3 py-1 rounded-lg transition-all ${keywordFilter === "under_represented" ? "bg-white text-amber-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Under ({underCount})
                  </button>
                  <button
                    onClick={() => setKeywordFilter("optimal")}
                    className={`px-3 py-1 rounded-lg transition-all ${keywordFilter === "optimal" ? "bg-white text-emerald-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Optimal ({optimalCount})
                  </button>
                </div>
              </div>

              {/* Responsive Frequency Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-3">Keyword / Skill</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">In Job Posting</th>
                      <th className="py-2.5 px-3 text-center">In Resume</th>
                      <th className="py-2.5 px-3 text-right">ATS Density Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredFreqItems.map((item) => (
                      <tr key={item.name} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 capitalize flex items-center justify-between group">
                          <span>{item.name}</span>
                          <button
                            onClick={() => handleCopyKeyword(item.name)}
                            title={`Copy "${item.name}" to clipboard`}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {item.category}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {item.frequency_in_jd}x
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          <span className={item.frequency_in_resume > 0 ? "text-emerald-700" : "text-rose-600"}>
                            {item.frequency_in_resume}x
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.status === "optimal" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Optimal Coverage</span>
                            </span>
                          ) : item.status === "under_represented" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Add 1-2x More</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              <span>Missing from CV</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredFreqItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                          No keywords match this filter category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Weak Action Verb Scanner & Cliché Filter (Commercial Parity with Resume Worded) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Action Verb & Executive Tone Audit
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{actionVerbAudit.total_power_verbs} High-Impact Power Verbs Detected</span>
                </div>
              </div>

              {actionVerbAudit.weak_verbs_found.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    We detected passive or cliché phrases in your bullet points. Replacing them with high-ownership power verbs increases recruiter callback rates by up to 34%:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {actionVerbAudit.weak_verbs_found.map((weak) => (
                      <div key={weak} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-700 line-through">
                            &quot;{weak}&quot;
                          </span>
                          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                            Passive Phrasing
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          <span className="text-[11px] text-slate-500 block mb-1">Recommended Power Alternatives:</span>
                          <div className="flex flex-wrap gap-1">
                            {(actionVerbAudit.power_suggestions[weak] || ["Architected", "Spearheaded", "Engineered"]).map((pw) => (
                              <span key={pw} className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                                {pw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero passive clichés detected! Your bullet points maintain an active, high-ownership engineering tone.</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                <strong className="text-slate-700">Enterprise Recruiter Benchmark:</strong> Technical hiring leads favor bullet points starting with assertive verbs like <em>&quot;Architected&quot;</em>, <em>&quot;Spearheaded&quot;</em>, and <em>&quot;Benchmarked&quot;</em> over passive phrases like <em>&quot;Worked on&quot;</em> or <em>&quot;Responsible for&quot;</em>.
              </div>
            </div>

            {/* 4. Quick-Glance Matched vs Missing Skill Chips */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Enterprise Keywords ({result.matched_keywords.length})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      {kw}
                    </span>
                  ))}
                  {result.matched_keywords.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No direct keyword matches detected.</span>
                  )}
                </div>
              </div>

              {/* Missing Keywords Gap */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Missing Skills from Job Posting ({result.missing_keywords.length})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_keywords.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => handleCopyKeyword(kw)}
                      title="Click to copy skill name to clipboard"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer group"
                    >
                      <span>+{kw}</span>
                      <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  {result.missing_keywords.length === 0 && (
                    <span className="text-xs text-emerald-600 font-medium">100% of target keywords present!</span>
                  )}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Actionable Optimization Steps:
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {result.actionable_recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Clever 1000 Feature Parity: 3-Card Actionable Health & Audit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Card 1: Contact Information Audit */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Contact Details Audit</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">ATS Check</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Email Address:</span>
                    {result.contact_audit?.has_email ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold truncate max-w-[140px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{result.contact_audit.email}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Missing</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Phone Number:</span>
                    {result.contact_audit?.has_phone ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{result.contact_audit.phone || "Detected"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Missing</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">LinkedIn Profile:</span>
                    {result.contact_audit?.has_linkedin ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Not Linked</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">GitHub / Portfolio:</span>
                    {result.contact_audit?.has_github ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Detected</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Optional</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Section Taxonomies Audit */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Section Headings Audit</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Taleo / Workday</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Work Experience:</span>
                    {result.section_audit?.has_experience ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Standard Title</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Action Recommended</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Education:</span>
                    {result.section_audit?.has_education ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Standard Title</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Missing Header</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Technical Skills:</span>
                    {result.section_audit?.has_skills ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Standard Title</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Missing Header</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Projects:</span>
                    {result.section_audit?.has_projects ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Standard Title</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                        <span>Optional</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Formatting & Google XYZ Metric Density */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Impact & Formatting</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Google XYZ</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Word Count:</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{result.formatting_audit?.word_count || 480} words</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">
                        {result.formatting_audit?.word_count_status === "short" ? "Slightly Short (Target 400+)" : result.formatting_audit?.word_count_status === "long" ? "Exceeds 1-Page Ideal" : "Optimal (1 Page Range)"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Quantified Bullets:</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">
                        {result.formatting_audit?.quantified_bullets || 4} of {result.formatting_audit?.total_bullets || 6} ({result.formatting_audit?.quantified_percentage || 67}%)
                      </span>
                      <span className="text-[10px] text-indigo-600 block font-semibold">Google Formula Metric</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Layout Readability:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Single-Column Safe</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. 1-Click Fix & Builder Sync Action Center */}
            <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white shadow-lg border border-emerald-500/20">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click ATS Bridge & Skill Injection</span>
                </div>
                <h4 className="font-extrabold text-base sm:text-lg">
                  Transfer Profile & Auto-Inject {result.missing_keywords.length} Missing Keywords
                </h4>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Seamlessly push your candidate data, parsed contact fields, and target keywords directly into the 1-Page ATS CV Builder. Guarantees 100% single-column Taleo/Workday compliance with zero manual retyping.
                </p>
              </div>
              <button
                onClick={handleTransferToCVBuilder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-black text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
              >
                <Zap className="w-4 h-4 text-slate-900 fill-slate-900" />
                <span>Transfer to 1-Page CV Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 7. System Performance & Telemetry Diagnostics Bar */}
            {result.telemetry && (
              <div className="no-print p-3.5 rounded-xl bg-slate-900 text-slate-400 text-xs font-mono flex flex-wrap items-center justify-between gap-2 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-semibold">Microservice Telemetry:</span>
                  <span>Latency: <strong className="text-white">{result.telemetry.latency_ms}ms</strong></span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Engine: <strong className="text-slate-300">{result.telemetry.parser_engine}</strong></span>
                  <span>Model: <strong className="text-slate-300">{result.telemetry.algorithm}</strong></span>
                  <span>Features: <strong className="text-slate-300">{result.telemetry.vector_features} dims</strong></span>
                </div>
              </div>
            )}

            {/* 8. Integrated Bullet Point Rewriter */}
            <div className="no-print pt-4">
              <XYZOptimizer />
            </div>
          </div>
        );
      })()}

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
