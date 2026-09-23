"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MessageSquareQuote, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  ShieldCheck, 
  Award, 
  Zap, 
  Lightbulb, 
  Copy, 
  FileText, 
  HelpCircle,
  Briefcase,
  Layers,
  Send,
  Printer
} from "lucide-react";
import ScoreGauge from "@/components/ScoreGauge";
import { 
  generateInterviewQuestions, 
  evaluateInterviewAnswer, 
  InterviewQuestionItem, 
  InterviewEvaluationResult 
} from "@/lib/api";
import { SAMPLE_JOB_DESCRIPTIONS } from "@/lib/mockData";

const BENCHMARK_ROLES = [
  { id: "backend", title: "Backend Engineer (Java / Cloud)", badge: "Spring Boot / Redis" },
  { id: "fullstack", title: "Full-Stack Developer (React / Java)", badge: "Next.js / TypeScript" },
  { id: "cloud", title: "Cloud & APIs Engineer (Next.js / Python)", badge: "FastAPI / Docker" }
];

export default function InterviewPrepPage() {
  const [selectedRole, setSelectedRole] = useState(BENCHMARK_ROLES[0].title);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewMode, setInterviewMode] = useState<"mixed" | "technical" | "behavioral">("mixed");

  // Session State
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<Record<string, InterviewEvaluationResult>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if there is data transferred from ATS Scanner
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem("careerflow_transfer_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.title) {
          setSelectedRole(parsed.title);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartInterview = async () => {
    const activeRole = isCustomRole && customRoleInput.trim() ? customRoleInput.trim() : selectedRole;
    setIsGenerating(true);
    try {
      const res = await generateInterviewQuestions(activeRole, jobDescription, "", interviewMode);
      if (res && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setCurrentIndex(0);
        setUserAnswers({});
        setEvaluations({});
        setSessionStarted(true);
        showToast("5 tailored interview questions generated!");
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating questions. Using resilient backup.");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? (userAnswers[currentQ.id] || "") : "";
  const currentEval = currentQ ? evaluations[currentQ.id] : null;

  const handleAnswerChange = (val: string) => {
    if (!currentQ) return;
    setUserAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const handleEvaluateCurrentAnswer = async () => {
    if (!currentQ) return;
    const ans = userAnswers[currentQ.id] || "";
    if (!ans.trim()) {
      showToast("Please type your answer before submitting.");
      return;
    }

    setIsEvaluating(true);
    try {
      const activeRole = isCustomRole && customRoleInput.trim() ? customRoleInput.trim() : selectedRole;
      const res = await evaluateInterviewAnswer(
        currentQ.id,
        currentQ.question,
        currentQ.category,
        ans,
        activeRole
      );
      setEvaluations(prev => ({ ...prev, [currentQ.id]: res }));
      showToast(`Answer evaluated! Scored ${res.score}%`);
    } catch (err) {
      console.error(err);
      showToast("Error evaluating answer.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Copied ${label} to clipboard!`);
    }
  };

  // Star Helper injection
  const injectStarTemplate = () => {
    const template = "Situation: \nTask: \nAction: \nResult: ";
    handleAnswerChange(currentAnswer ? `${currentAnswer}\n\n${template}` : template);
  };

  // Overall Session Score
  const answeredEvals = Object.values(evaluations);
  const averageScore = answeredEvals.length > 0
    ? Math.round(answeredEvals.reduce((acc, curr) => acc + curr.score, 0) / answeredEvals.length)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
              AI Mock Interview Studio
            </span>
            <span className="text-xs text-slate-500 font-medium">Technical & Behavioral Simulation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">
            Interactive AI Mock Interview Practice
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Practice realistic technical architecture and STAR behavioral questions tailored to your target job role. Receive instant AI scoring, identify missing architectural concepts, and inspect senior engineer model answers.
          </p>
        </div>

        {sessionStarted && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={() => {
                setSessionStarted(false);
                setQuestions([]);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Setup Section (Visible before session starts) */}
      {!sessionStarted ? (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Select Target Engineering Role</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose an enterprise role benchmark or input your specific job description.
              </p>
            </div>

            {/* Benchmark Role Presets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BENCHMARK_ROLES.map((role) => {
                const isSelected = !isCustomRole && selectedRole === role.title;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role.title);
                      setIsCustomRole(false);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs"
                        : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                    }`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                      {role.badge}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-2">{role.title}</h3>
                  </button>
                );
              })}
            </div>

            {/* Custom Role Option */}
            <div className="pt-2">
              <button
                onClick={() => setIsCustomRole(true)}
                className={`text-xs font-semibold transition-colors cursor-pointer ${isCustomRole ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
              >
                + Or specify a custom target role
              </button>

              {isCustomRole && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="e.g., Senior Distributed Systems Engineer or DevOps Cloud Architect"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              )}
            </div>

            {/* Mode Selector */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Interview Question Mode:
                </span>
                <span className="text-xs text-slate-500">Tailors the question distribution</span>
              </div>
              <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 text-xs font-semibold">
                <button
                  onClick={() => setInterviewMode("mixed")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${interviewMode === "mixed" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Mixed (3 Tech + 2 STAR)
                </button>
                <button
                  onClick={() => setInterviewMode("technical")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${interviewMode === "technical" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Technical & Architecture
                </button>
                <button
                  onClick={() => setInterviewMode("behavioral")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${interviewMode === "behavioral" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Behavioral (STAR Only)
                </button>
              </div>
            </div>

            {/* Launch CTA Button */}
            <div className="pt-4">
              <button
                onClick={handleStartInterview}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Orchestrating AI Interview Scenario...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Launch AI Mock Interview Session (5 Rounds)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Interview Simulator Canvas */
        <div className="space-y-8">
          {/* Question Stepper Bar */}
          <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(evaluations[q.id]);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-xs scale-105"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
              <span className="text-xs text-slate-400 font-medium ml-2">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {answeredEvals.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Session Average:</span>
                <span className={`font-black text-sm px-2 py-0.5 rounded ${averageScore >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>
                  {averageScore}%
                </span>
              </div>
            )}
          </div>

          {currentQ && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interviewer Prompt Card & Answer Studio (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Interviewer Question Box */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                      {currentQ.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Round #{currentIndex + 1}</span>
                  </div>

                  <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                    "{currentQ.question}"
                  </h2>

                  {/* Recruiter Intent Insight */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-amber-900">What the Hiring Team is Evaluating:</strong>
                      <p className="mt-0.5 leading-relaxed text-amber-900/90">{currentQ.recruiter_intent}</p>
                    </div>
                  </div>

                  {/* Expected Keywords Chips */}
                  {currentQ.suggested_keywords && currentQ.suggested_keywords.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Key Architectural Concepts Expected:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentQ.suggested_keywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Answer Studio */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-sm font-bold text-slate-900">Your Response</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentQ.category.includes("Behavioral") && (
                        <button
                          onClick={injectStarTemplate}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          + Insert STAR Template
                        </button>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        {currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={6}
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your response here... Tip: For technical questions, mention trade-offs, concurrency, and failure recovery. For behavioral questions, structure by Situation, Task, Action, and Result."
                    className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 leading-relaxed font-sans"
                  />

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <button
                        disabled={currentIndex === questions.length - 1}
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={handleEvaluateCurrentAnswer}
                      disabled={isEvaluating || !currentAnswer.trim()}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Evaluate Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Feedback, Model Answer & Follow-up (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                {currentEval ? (
                  <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in">
                    {/* Score Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Evaluation Result
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {currentEval.score >= 80 ? "Strong Technical Answer" : currentEval.score >= 60 ? "Moderate Answer" : "Needs More Depth"}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className={`text-3xl font-black ${currentEval.score >= 75 ? "text-emerald-600" : currentEval.score >= 55 ? "text-indigo-600" : "text-amber-600"}`}>
                          {currentEval.score}%
                        </span>
                      </div>
                    </div>

                    {/* Key Strengths */}
                    {currentEval.strengths && currentEval.strengths.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Key Strengths Identified:</span>
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {currentEval.strengths.map((str, i) => (
                            <li key={i} className="pl-4 border-l-2 border-emerald-400 leading-relaxed">
                              {str}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Concepts */}
                    {currentEval.missing_key_concepts && currentEval.missing_key_concepts.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Areas for Improvement:</span>
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {currentEval.missing_key_concepts.map((item, i) => (
                            <li key={i} className="pl-4 border-l-2 border-amber-400 leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Model Answer Breakdown */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>Senior Staff Model Answer:</span>
                        </span>
                        <button
                          onClick={() => handleCopyText(currentEval.model_answer, "Model Answer")}
                          className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 p-1 rounded hover:bg-slate-50 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 leading-relaxed font-serif">
                        {currentEval.model_answer}
                      </div>
                    </div>

                    {/* Follow-up Question */}
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        <span>Recruiter Follow-up Question:</span>
                      </span>
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                        "{currentEval.follow_up_question}"
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Waiting for Answer placeholder */
                  <div className="bg-slate-50/80 p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center font-bold">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">AI Feedback Ready</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Type your answer on the left and click <strong>Evaluate Answer</strong> to receive a detailed evaluation score, strengths, and a senior engineer model answer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Complete Final Summary Banner */}
          {answeredEvals.length === questions.length && questions.length > 0 && (
            <div className="p-7 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1 border border-emerald-500/30">
                    <Award className="w-3.5 h-3.5" />
                    <span>Mock Interview Complete!</span>
                  </div>
                  <h3 className="text-xl font-black">All 5 Interview Rounds Completed</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Overall session readiness score: <strong className="text-emerald-300">{averageScore}%</strong>. You have demonstrated solid architectural fundamentals and behavioral narrative structure.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/ats-checker"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow cursor-pointer"
                  >
                    <span>Check CV Alignment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
