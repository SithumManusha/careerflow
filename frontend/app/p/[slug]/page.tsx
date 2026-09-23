"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CandidateProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ats-checker");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center text-xs text-slate-500">
        Redirecting to ATS Scanner...
      </div>
    </div>
  );
}
