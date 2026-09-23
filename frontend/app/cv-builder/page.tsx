"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Printer, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  Copy,
  Zap,
  ShieldCheck,
  AlertCircle,
  X,
  Palette,
  Sliders,
  FileCheck,
  Cloud
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import { 
  scanResumeATS, 
  rewriteBulletXYZ, 
  saveUserDraft,
  ATSScanResult, 
  XYZResult 
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SAMPLE_JOB_DESCRIPTIONS } from "@/lib/mockData";

export default function CVBuilderPage() {
  const { user, token, openAuthModal } = useAuth();
  // Core Contact Info
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Section Contents
  const [summaryText, setSummaryText] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [educationText, setEducationText] = useState("");
  const [certificationsText, setCertificationsText] = useState("");
  const [activitiesText, setActivitiesText] = useState("");

  // Section Ordering & Visibility
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    "summary", "skills", "experience", "education", "certifications", "activities"
  ]);
  const [showSummary, setShowSummary] = useState(true);
  const [showCertifications, setShowCertifications] = useState(true);
  const [showActivities, setShowActivities] = useState(true);

  // Typography & Themes
  const [fontFamily, setFontFamily] = useState<"font-sans" | "font-serif" | "font-mono">("font-sans");
  const [accentColor, setAccentColor] = useState<"slate" | "blue" | "indigo" | "emerald">("slate");
  const [showPreflightDetails, setShowPreflightDetails] = useState(true);

  // In-Builder ATS Audit Modal
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<ATSScanResult | null>(null);

  // In-Builder Google XYZ Assistant Modal
  const [showXyzModal, setShowXyzModal] = useState(false);
  const [xyzInput, setXyzInput] = useState("");
  const [xyzSkill, setXyzSkill] = useState("");
  const [xyzLoading, setXyzLoading] = useState(false);
  const [xyzResult, setXyzResult] = useState<XYZResult | null>(null);

  // Toast notification & Transfer Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importedAlert, setImportedAlert] = useState<{
    name: string;
    role: string;
    missingSkillsCount: number;
  } | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1-Click Auto-Transfer Listener from ATS Scanner
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem("careerflow_transfer_data");
      const urlParams = new URLSearchParams(window.location.search);
      const fromScan = urlParams.get("fromScan");

      if (stored && fromScan) {
        const data = JSON.parse(stored);
        if (data.fullName && !fullName) setFullName(data.fullName);
        if (data.title && !title) setTitle(data.title);
        if (data.email && !email) setEmail(data.email);
        if (data.phone && !phone) setPhone(data.phone);

        if (data.missingSkills && Array.isArray(data.missingSkills) && data.missingSkills.length > 0) {
          const missingFormatted = data.missingSkills.join(", ");
          setSkillsText(prev => {
            if (!prev.trim()) {
              return `Languages & Core: Java, Python, TypeScript, SQL\nFrameworks & Libraries: Spring Boot, React, Next.js, Node.js\nDatabases & Cloud: PostgreSQL, Redis, Docker, Git\nTarget Focus / Added Skills: ${missingFormatted}`;
            } else if (!prev.includes(missingFormatted)) {
              return `${prev}\n\n[Injected from ATS Scan]: ${missingFormatted}`;
            }
            return prev;
          });
        }

        setImportedAlert({
          name: data.fullName || "Candidate Profile",
          role: data.title || "Target Role",
          missingSkillsCount: data.missingSkills?.length || 0
        });

        showToast(`Imported profile and injected ${data.missingSkills?.length || 0} target keywords!`);
        sessionStorage.removeItem("careerflow_transfer_data");
      }

      // Check for loaded draft from Dashboard
      const loadedDraft = sessionStorage.getItem("careerflow_loaded_draft");
      const fromDraft = urlParams.get("fromDraft");
      if (loadedDraft && fromDraft) {
        const d = JSON.parse(loadedDraft);
        if (d.fullName !== undefined) setFullName(d.fullName);
        if (d.title !== undefined) setTitle(d.title);
        if (d.location !== undefined) setLocation(d.location);
        if (d.email !== undefined) setEmail(d.email);
        if (d.phone !== undefined) setPhone(d.phone);
        if (d.githubUrl !== undefined) setGithubUrl(d.githubUrl);
        if (d.linkedinUrl !== undefined) setLinkedinUrl(d.linkedinUrl);
        if (d.portfolioUrl !== undefined) setPortfolioUrl(d.portfolioUrl);
        if (d.summaryText !== undefined) setSummaryText(d.summaryText);
        if (d.skillsText !== undefined) setSkillsText(d.skillsText);
        if (d.experienceText !== undefined) setExperienceText(d.experienceText);
        if (d.educationText !== undefined) setEducationText(d.educationText);
        if (d.certificationsText !== undefined) setCertificationsText(d.certificationsText);
        if (d.activitiesText !== undefined) setActivitiesText(d.activitiesText);
        if (d.sectionOrder) setSectionOrder(d.sectionOrder);
        if (d.fontFamily) setFontFamily(d.fontFamily);
        if (d.accentColor) setAccentColor(d.accentColor);
        if (d.showSummary !== undefined) setShowSummary(d.showSummary);
        if (d.showCertifications !== undefined) setShowCertifications(d.showCertifications);
        if (d.showActivities !== undefined) setShowActivities(d.showActivities);
        showToast("Cloud draft loaded successfully!");
        sessionStorage.removeItem("careerflow_loaded_draft");
      }
    } catch (e) {
      console.error("Error reading transfer or draft data:", e);
    }
  }, []);

  const handleSaveToCloud = async () => {
    if (!token) {
      openAuthModal();
      return;
    }
    const data = {
      fullName,
      title,
      location,
      email,
      phone,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      summaryText,
      skillsText,
      experienceText,
      educationText,
      certificationsText,
      activitiesText,
      sectionOrder,
      showSummary,
      showCertifications,
      showActivities,
      fontFamily,
      accentColor
    };
    try {
      await saveUserDraft(token, {
        draftTitle: title ? `${title} (Cloud Draft)` : "Software Engineer CV Draft",
        targetRole: title || "Software Engineer",
        resumeDataJson: JSON.stringify(data)
      });
      showToast("Draft successfully saved to your CareerFlow account!");
    } catch {
      showToast("Error saving draft to cloud");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    setFullName("");
    setTitle("");
    setLocation("");
    setEmail("");
    setPhone("");
    setGithubUrl("");
    setLinkedinUrl("");
    setPortfolioUrl("");
    setSummaryText("");
    setSkillsText("");
    setExperienceText("");
    setEducationText("");
    setCertificationsText("");
    setActivitiesText("");
    showToast("All fields cleared.");
  };

  // Section Reordering Helper
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...sectionOrder];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionOrder(newOrder);
  };

  // JSON Save Backup
  const handleSaveJson = () => {
    const data = {
      version: "1.0",
      savedAt: new Date().toISOString(),
      fullName,
      title,
      location,
      email,
      phone,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      summaryText,
      skillsText,
      experienceText,
      educationText,
      certificationsText,
      activitiesText,
      sectionOrder,
      showSummary,
      showCertifications,
      showActivities,
      fontFamily,
      accentColor
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `careerflow-cv-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CV Backup saved as JSON file!");
  };

  // JSON Load Backup
  const handleLoadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.fullName !== undefined) setFullName(data.fullName);
        if (data.title !== undefined) setTitle(data.title);
        if (data.location !== undefined) setLocation(data.location);
        if (data.email !== undefined) setEmail(data.email);
        if (data.phone !== undefined) setPhone(data.phone);
        if (data.githubUrl !== undefined) setGithubUrl(data.githubUrl);
        if (data.linkedinUrl !== undefined) setLinkedinUrl(data.linkedinUrl);
        if (data.portfolioUrl !== undefined) setPortfolioUrl(data.portfolioUrl);
        if (data.summaryText !== undefined) setSummaryText(data.summaryText);
        if (data.skillsText !== undefined) setSkillsText(data.skillsText);
        if (data.experienceText !== undefined) setExperienceText(data.experienceText);
        if (data.educationText !== undefined) setEducationText(data.educationText);
        if (data.certificationsText !== undefined) setCertificationsText(data.certificationsText);
        if (data.activitiesText !== undefined) setActivitiesText(data.activitiesText);
        if (data.sectionOrder) setSectionOrder(data.sectionOrder);
        if (data.fontFamily) setFontFamily(data.fontFamily);
        if (data.accentColor) setAccentColor(data.accentColor);
        if (data.showSummary !== undefined) setShowSummary(data.showSummary);
        if (data.showCertifications !== undefined) setShowCertifications(data.showCertifications);
        if (data.showActivities !== undefined) setShowActivities(data.showActivities);
        showToast("CV Backup successfully loaded!");
      } catch {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Plaintext ATS Copy
  const handleCopyPlaintext = () => {
    const lines = [
      fullName.toUpperCase() || "CANDIDATE NAME",
      title.toUpperCase() || "SOFTWARE ENGINEER INTERN",
      [location, email, phone, githubUrl, linkedinUrl, portfolioUrl].filter(Boolean).join(" | "),
      "",
      showSummary && summaryText ? `ABOUT ME\n${summaryText}\n` : "",
      `TECHNICAL SKILLS\n${skillsText}\n`,
      `FEATURED PROJECTS & EXPERIENCE\n${experienceText}\n`,
      `EDUCATION\n${educationText}\n`,
      showCertifications && certificationsText ? `CERTIFICATIONS & COURSEWORK\n${certificationsText}\n` : "",
      showActivities && activitiesText ? `LEADERSHIP & ACTIVITIES\n${activitiesText}\n` : ""
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(lines);
    showToast("Plaintext ATS Vector copied to clipboard!");
  };

  // Instant In-Builder ATS Audit
  const handleRunAtsAudit = async () => {
    setIsAuditing(true);
    setShowAtsModal(true);
    try {
      const fullText = [
        fullName || "Candidate",
        title || "Software Engineer Intern",
        skillsText,
        experienceText,
        educationText,
        summaryText
      ].join("\n");
      const defaultJd = SAMPLE_JOB_DESCRIPTIONS[0].text;
      const res = await scanResumeATS(fullText, defaultJd, fullName || "Candidate", title || "Software Engineer Intern");
      setAuditResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  // In-Builder Google XYZ Bullet Optimizer
  const handleRunXyzTransform = async () => {
    if (!xyzInput.trim()) return;
    setXyzLoading(true);
    try {
      const res = await rewriteBulletXYZ(xyzInput, title || "Software Engineer Intern", xyzSkill || "Core Engineering");
      setXyzResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setXyzLoading(false);
    }
  };

  // Real-Time 1-Page Height Budget Calculation
  const allText = [
    fullName, title, location, email, phone, githubUrl, linkedinUrl, portfolioUrl,
    showSummary ? summaryText : "",
    skillsText,
    experienceText,
    educationText,
    showCertifications ? certificationsText : "",
    showActivities ? activitiesText : ""
  ].join(" ");

  const wordCount = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const targetWords = 420;
  const budgetPercentage = Math.min(135, Math.round((wordCount / targetWords) * 100));

  let budgetStatus = {
    label: "Optimal 1-Page A4 Fit",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    barColor: "bg-emerald-500"
  };

  if (wordCount < 180) {
    budgetStatus = {
      label: "Light / Under-filled (Space available for more metrics)",
      color: "text-blue-700 bg-blue-50 border-blue-200",
      barColor: "bg-blue-500"
    };
  } else if (wordCount > 460) {
    budgetStatus = {
      label: `Page Overflow Alert (Exceeds 1-Page by ~${wordCount - 440} words)`,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      barColor: "bg-amber-500"
    };
  }

  // 2. Real-Time ATS Pre-flight Checklist State & Calculations
  const checkContact = Boolean(email.trim() && phone.trim());
  const checkSingleColumn = true; // Guaranteed by single-column linear layout
  const checkPageBudget = budgetPercentage <= 105; // Fits cleanly on 1 page without overflow
  const checkSkillDensity = skillsText.trim().split(/[,;\n]+/).filter(s => s.trim().length > 1).length >= 4;
  const checkMetrics = (experienceText.match(/(\d+[\d,.]*%?|\$\d+)/g) || []).length >= 3;
  const checkStandardHeaders = Boolean(skillsText.trim() && experienceText.trim() && educationText.trim());

  const preflightChecks = [
    {
      id: "contact",
      label: "Contact Information Complete",
      detail: checkContact ? "Email & Phone detected for recruiter callback" : "Missing Email or Phone number",
      passed: checkContact
    },
    {
      id: "layout",
      label: "Single-Column Architecture",
      detail: "100% linear text flow — Taleo, Workday & Greenhouse safe (no tables/columns)",
      passed: checkSingleColumn
    },
    {
      id: "budget",
      label: "1-Page A4 Height Budget",
      detail: checkPageBudget ? `${budgetPercentage}% A4 capacity used — strictly 1-page fit` : `Overflow alert (${budgetPercentage}% capacity) — reduce length to fit 1 page`,
      passed: checkPageBudget
    },
    {
      id: "skills",
      label: "Core Tech Skill Density",
      detail: checkSkillDensity ? "4+ technical skills indexed for search matching" : "Add at least 4 technical skills in Skills section",
      passed: checkSkillDensity
    },
    {
      id: "xyz_metrics",
      label: "Google XYZ Quantified Metrics",
      detail: checkMetrics ? "3+ quantified metrics/percentages detected in Experience" : "Add measurable numbers or % to bullet points",
      passed: checkMetrics
    },
    {
      id: "sections",
      label: "Standard ATS Section Taxonomy",
      detail: checkStandardHeaders ? "Technical Skills, Experience, and Education present" : "Ensure Skills, Experience, and Education sections are filled",
      passed: checkStandardHeaders
    }
  ];

  const passedChecksCount = preflightChecks.filter(c => c.passed).length;
  const isPreflightAllGreen = passedChecksCount === preflightChecks.length;

  // Accent Styles
  const accentStyles = {
    slate: {
      border: "border-slate-300",
      heading: "text-slate-900 border-slate-300",
      subheading: "text-slate-700",
      badge: "text-blue-700"
    },
    blue: {
      border: "border-blue-300",
      heading: "text-blue-900 border-blue-300",
      subheading: "text-blue-700",
      badge: "text-blue-700"
    },
    indigo: {
      border: "border-indigo-300",
      heading: "text-indigo-900 border-indigo-300",
      subheading: "text-indigo-700",
      badge: "text-indigo-700"
    },
    emerald: {
      border: "border-emerald-300",
      heading: "text-emerald-900 border-emerald-300",
      subheading: "text-emerald-700",
      badge: "text-emerald-700"
    }
  }[accentColor];

  // Section Names Map
  const sectionLabels: Record<string, string> = {
    summary: "About Me (Summary)",
    skills: "Technical Skills",
    experience: "Featured Projects & Experience",
    education: "Education",
    certifications: "Certifications & Coursework",
    activities: "Leadership & Activities"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for JSON Restore */}
      <input
        type="file"
        ref={jsonInputRef}
        accept=".json"
        className="hidden"
        onChange={handleLoadJson}
      />

      {/* 1-Click Import Notification Banner from ATS Scanner */}
      {importedAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-indigo-900 text-white shadow-md print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Imported from ATS Compatibility Scan</span>
              </h4>
              <p className="text-xs text-slate-200 mt-0.5">
                Loaded profile for <strong className="text-white">{importedAlert.name}</strong> ({importedAlert.role}) with <strong className="text-emerald-300">{importedAlert.missingSkillsCount} target keywords</strong> auto-injected into Technical Skills.
              </p>
            </div>
          </div>
          <button
            onClick={() => setImportedAlert(null)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner (Hidden in print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              ATS Standard Single-Column
            </span>
            <span className="text-xs text-slate-400">Workday, Taleo & Greenhouse Safe</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            1-Page ATS CV Generator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build and export a clean, machine-parseable single-column resume formatted with Google’s XYZ formula.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveToCloud}
            title={user ? "Save draft directly to your CareerFlow account" : "Sign in to save draft to cloud"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition-colors cursor-pointer shadow-xs"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Save to Cloud</span>
          </button>

          <button
            onClick={handleSaveJson}
            title="Save your work as a private JSON file"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Save JSON</span>
          </button>

          <button
            onClick={() => jsonInputRef.current?.click()}
            title="Restore previously saved JSON file"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Load JSON</span>
          </button>

          <button
            onClick={handleCopyPlaintext}
            title="Copy unformatted text for Workday plain text box"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span>Copy ATS Text</span>
          </button>

          <button
            onClick={handleRunAtsAudit}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200 transition-colors cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Instant ATS Audit</span>
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 px-3 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Export 1-Page PDF</span>
          </button>
        </div>
      </div>

      {/* 1-Page Height Budget & Real-Time Overflow Meter (Hidden in print) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs print:hidden space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">1-Page A4 Budget:</span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${budgetStatus.color}`}>
              {budgetStatus.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span><strong>{wordCount}</strong> / {targetWords} words</span>
            <span>•</span>
            <span><strong>{budgetPercentage}%</strong> capacity</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${budgetStatus.barColor}`}
            style={{ width: `${Math.min(100, budgetPercentage)}%` }}
          />
        </div>
      </div>

      {/* ATS Pre-flight Readiness Checklist (Recruiter Confidence Badge) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${isPreflightAllGreen ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200"}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">ATS Pre-flight Readiness Checklist</h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${isPreflightAllGreen ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
                  {passedChecksCount} / {preflightChecks.length} Checks Passed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPreflightAllGreen 
                  ? "All systems green! Your CV is 100% Taleo, Workday & Greenhouse recruiter-safe." 
                  : "Resolve remaining items below to maximize your interview callback rate."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPreflightDetails(prev => !prev)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
          >
            {showPreflightDetails ? "Hide Checks" : "Show All Checks"}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${isPreflightAllGreen ? "bg-emerald-500" : "bg-indigo-500"}`}
            style={{ width: `${(passedChecksCount / preflightChecks.length) * 100}%` }}
          />
        </div>

        {/* 6 Automated Pre-flight Checks Grid */}
        {showPreflightDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {preflightChecks.map((chk) => (
              <div
                key={chk.id}
                className={`p-3 rounded-xl border text-xs transition-all ${chk.passed ? "bg-emerald-50/40 border-emerald-100" : "bg-amber-50/40 border-amber-200"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${chk.passed ? "text-slate-900" : "text-amber-900"}`}>
                    {chk.label}
                  </span>
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </div>
                <p className={`text-[11px] leading-relaxed ${chk.passed ? "text-slate-600" : "text-amber-800 font-medium"}`}>
                  {chk.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Styling & Typography Customizer Bar (Hidden in print) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs print:hidden flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">ATS Font:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => setFontFamily("font-sans")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${fontFamily === "font-sans" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"}`}
            >
              Modern Sans (Inter)
            </button>
            <button
              onClick={() => setFontFamily("font-serif")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${fontFamily === "font-serif" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"}`}
            >
              Executive Serif (Georgia)
            </button>
            <button
              onClick={() => setFontFamily("font-mono")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${fontFamily === "font-mono" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"}`}
            >
              Compact Mono
            </button>
          </div>
        </div>

        {/* Accent Color Palette */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Accent:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: "slate", label: "Slate", bg: "bg-slate-700" },
              { id: "blue", label: "Navy", bg: "bg-blue-800" },
              { id: "indigo", label: "Indigo", bg: "bg-indigo-800" },
              { id: "emerald", label: "Forest", bg: "bg-emerald-800" }
            ].map((col) => (
              <button
                key={col.id}
                onClick={() => setAccentColor(col.id as any)}
                className={`w-5 h-5 rounded-full ${col.bg} transition-all cursor-pointer ${accentColor === col.id ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "opacity-75 hover:opacity-100"}`}
                title={col.label}
              />
            ))}
          </div>
        </div>

        {/* Section Visibility Toggles */}
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-700">Toggles:</span>
          <button
            onClick={() => setShowSummary(!showSummary)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${showSummary ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}
          >
            Summary {showSummary ? "✓" : "✗"}
          </button>
          <button
            onClick={() => setShowCertifications(!showCertifications)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${showCertifications ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}
          >
            Certs {showCertifications ? "✓" : "✗"}
          </button>
          <button
            onClick={() => setShowActivities(!showActivities)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${showActivities ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}
          >
            Activities {showActivities ? "✓" : "✗"}
          </button>
        </div>
      </div>

      {/* Editor & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form Controls (Hidden in print) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 print:hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Resume Content Editor</h3>
            <span className="text-xs text-slate-400">Auto-updates preview</span>
          </div>

          <div className="space-y-4">
            {/* Contact Information Group */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Contact Details</span>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Candidate Full Name"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Role:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Location:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Colombo, Sri Lanka"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email:</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@domain.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 7X XXX XXXX"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">GitHub:</label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="github.com/profile"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">LinkedIn:</label>
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="linkedin.com/in/profile"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Portfolio Link:</label>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="portfolio.dev"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Section Ordering Cards */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Resume Sections (Reorderable)</span>

              {sectionOrder.map((secKey, idx) => (
                <div key={secKey} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>{sectionLabels[secKey]}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSection(idx, "up")}
                        disabled={idx === 0}
                        title="Move section up"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSection(idx, "down")}
                        disabled={idx === sectionOrder.length - 1}
                        title="Move section down"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {secKey === "summary" && showSummary && (
                    <textarea
                      rows={2}
                      value={summaryText}
                      onChange={(e) => setSummaryText(e.target.value)}
                      placeholder="2-3 sentence impactful executive summary highlighting key domain strengths and engineering focus..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  )}

                  {secKey === "skills" && (
                    <textarea
                      rows={4}
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="• Programming Languages: Java, TypeScript, Python&#10;• Frontend: Next.js, React, Tailwind CSS&#10;• Backend & APIs: Spring Boot, Node.js, RESTful APIs&#10;• Databases & Caching: PostgreSQL, Redis&#10;• Testing & Tools: Playwright, JUnit, Docker, Git"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono"
                    />
                  )}

                  {secKey === "experience" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Projects & Experience Bullets</span>
                        <button
                          type="button"
                          onClick={() => setShowXyzModal(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Google XYZ Assistant</span>
                        </button>
                      </div>
                      <textarea
                        rows={7}
                        value={experienceText}
                        onChange={(e) => setExperienceText(e.target.value)}
                        placeholder="Project Name — Role / Classification | Tech Stack&#10;• Accomplished [X] as measured by [Y], by doing [Z]&#10;• Architected high-throughput microservice handling [X], cutting latency by [Y]% using [Z]"
                        className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  )}

                  {secKey === "education" && (
                    <textarea
                      rows={3}
                      value={educationText}
                      onChange={(e) => setEducationText(e.target.value)}
                      placeholder="University / Institute name, Degree Programme (CGPA / Honours)&#10;G.C.E. Advanced Level (Stream, Results)"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  )}

                  {secKey === "certifications" && showCertifications && (
                    <textarea
                      rows={2}
                      value={certificationsText}
                      onChange={(e) => setCertificationsText(e.target.value)}
                      placeholder="• AWS Certified Cloud Practitioner&#10;• Core Coursework: Data Structures, Distributed Systems, DBMS"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  )}

                  {secKey === "activities" && showActivities && (
                    <textarea
                      rows={2}
                      value={activitiesText}
                      onChange={(e) => setActivitiesText(e.target.value)}
                      placeholder="• Organizing Committee Member — University Career Fair&#10;• Club / Society leadership or volunteering contributions"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live A4 Printable ATS Paper Preview */}
        <div className="lg:col-span-7">
          <div className={`bg-white p-8 sm:p-10 rounded-2xl border ${accentStyles.border} shadow-md min-h-[820px] text-slate-900 ${fontFamily} print:border-none print:shadow-none print:p-0 print:m-0`}>
            {/* Header */}
            <div className={`text-center border-b pb-3 mb-3 ${accentStyles.border}`}>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                {fullName || "YOUR FULL NAME"}
              </h1>
              <p className={`text-xs font-bold ${accentStyles.subheading} mt-1 uppercase tracking-wide`}>
                {title || "Target Software Engineer Title"}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600 mt-2">
                {location && (
                  <>
                    <span>{location}</span>
                    <span>•</span>
                  </>
                )}
                <span>{email || "email@example.com"}</span>
                <span>•</span>
                <span>{phone || "+94 7X XXX XXXX"}</span>
                <span>•</span>
                <span>{githubUrl ? githubUrl.replace(/^https?:\/\//, "") : "github.com/profile"}</span>
                <span>•</span>
                <span>{linkedinUrl ? linkedinUrl.replace(/^https?:\/\//, "") : "linkedin.com/in/profile"}</span>
                {portfolioUrl && (
                  <>
                    <span>•</span>
                    <span className={`font-semibold ${accentStyles.badge}`}>{portfolioUrl.replace(/^https?:\/\//, "")}</span>
                  </>
                )}
              </div>
            </div>

            {/* Render Sections Dynamically Based on sectionOrder */}
            {sectionOrder.map((secKey) => {
              if (secKey === "summary" && showSummary && (summaryText || !fullName)) {
                return (
                  <div key="summary" className="mb-4">
                    <h2 className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1.5 ${accentStyles.heading}`}>
                      About Me
                    </h2>
                    <p className="text-[11px] leading-relaxed text-slate-800">
                      {summaryText || "Software engineering undergraduate specializing in high-throughput backend systems, cloud architectures, and automated testing. Dedicated to building reliable, high-performance web applications."}
                    </p>
                  </div>
                );
              }

              if (secKey === "skills") {
                return (
                  <div key="skills" className="mb-4">
                    <h2 className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1.5 ${accentStyles.heading}`}>
                      Technical Skills
                    </h2>
                    <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-line">
                      {skillsText || "• Programming Languages: Java, TypeScript, JavaScript, Python\n• Frontend: React, Next.js, Tailwind CSS\n• Backend & APIs: Spring Boot 3, Node.js, RESTful APIs\n• Databases & Caching: PostgreSQL, Redis, MySQL\n• Testing & DevOps: Playwright, JUnit, Docker, Git, CI/CD"}
                    </div>
                  </div>
                );
              }

              if (secKey === "experience") {
                return (
                  <div key="experience" className="mb-4">
                    <h2 className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1.5 ${accentStyles.heading}`}>
                      Featured Projects & Experience
                    </h2>
                    <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-line">
                      {experienceText || "1. Enterprise Distributed Microservice — High-Concurrency Backend\n• Built an event-driven task queue handling 5,000+ RPS using Spring Boot, Redis, and PostgreSQL.\n• Wrote automated unit and integration tests with 90%+ branch coverage, deploying via Docker.\n\n2. Real-Time Offline-First Retail Platform — Web Application\n• Engineered offline sync engine using IndexedDB and Service Workers with batch reconciliation.\n• Developed responsive UI in Next.js 14 and verified REST endpoints with automated testing."}
                    </div>
                  </div>
                );
              }

              if (secKey === "education") {
                return (
                  <div key="education" className="mb-4">
                    <h2 className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1.5 ${accentStyles.heading}`}>
                      Education
                    </h2>
                    <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-line">
                      {educationText || "University / Institute Name — B.Sc. (Hons) in Information Technology\n2024 – Present | CGPA: 3.5 / 4.0"}
                    </div>
                  </div>
                );
              }

              if (secKey === "certifications" && showCertifications && (certificationsText || !fullName)) {
                return (
                  <div key="certifications" className="mb-4">
                    <h2 className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1.5 ${accentStyles.heading}`}>
                      Certifications & Coursework
                    </h2>
                    <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-line">
                      {certificationsText || "• AWS Cloud Practitioner Essentials (AWS)\n• Core Coursework: Data Structures & Algorithms, Distributed Systems, Database Management"}
                    </div>
                  </div>
                );
              }

              if (secKey === "activities" && showActivities && activitiesText) {
                return (
                  <div key="activities" className="mb-4">
                    <h2 className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1.5 ${accentStyles.heading}`}>
                      Leadership & Extracurriculars
                    </h2>
                    <div className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-line">
                      {activitiesText}
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* ATS Compliance Stamp (Hidden in print) */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 print:hidden">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Single-column linear parsing format verified</span>
              </div>
              <span>Generated via CareerFlow Enterprise</span>
            </div>
          </div>
        </div>
      </div>

      {/* In-Builder Instant ATS Audit Modal */}
      {showAtsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn print:hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">In-Builder ATS Audit Results</h3>
              </div>
              <button
                onClick={() => setShowAtsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAuditing ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <span className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-600">Running TF-IDF Vector & ATS Structural Analysis...</p>
              </div>
            ) : auditResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block mb-1">Blended ATS Score</span>
                    <span className="text-3xl font-black text-indigo-600">{auditResult.ats_score}%</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block mb-1">Job Match Rate</span>
                    <span className="text-3xl font-black text-emerald-600">{auditResult.job_match_score || auditResult.match_percentage}%</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold block mb-1">Format Health</span>
                    <span className="text-3xl font-black text-blue-600">{auditResult.format_health_score || 85}%</span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommendations to Improve</h4>
                  <div className="space-y-1.5">
                    {auditResult.actionable_recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowAtsModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Back to CV Editor
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Audit could not be completed. Please try again.
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-Builder Google XYZ Bullet Assistant Modal */}
      {showXyzModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn print:hidden">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Google XYZ Bullet Enhancer</h3>
              </div>
              <button
                onClick={() => setShowXyzModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Draft Bullet Point:</label>
                <input
                  type="text"
                  value={xyzInput}
                  onChange={(e) => setXyzInput(e.target.value)}
                  placeholder="e.g. Created backend APIs and handled database queries"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Skill / Tool (Optional):</label>
                <input
                  type="text"
                  value={xyzSkill}
                  onChange={(e) => setXyzSkill(e.target.value)}
                  placeholder="e.g. Spring Boot 3 & Redis"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                onClick={handleRunXyzTransform}
                disabled={xyzLoading || !xyzInput.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
              >
                {xyzLoading ? "Generating XYZ Impact Bullet..." : "Transform with Google XYZ Formula"}
              </button>
            </div>

            {xyzResult && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-3">
                <span className="text-xs font-bold text-emerald-800 block">Optimized Bullet Point:</span>
                <p className="text-xs text-slate-900 font-mono leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {xyzResult.rewritten_bullet}
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setExperienceText((prev) => (prev ? `${prev}\n• ${xyzResult.rewritten_bullet}` : `• ${xyzResult.rewritten_bullet}`));
                      setShowXyzModal(false);
                      showToast("Appended to Experience bullets!");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Insert into Experience</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
