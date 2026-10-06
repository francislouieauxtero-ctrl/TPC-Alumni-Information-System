import { useState } from "react";
import {
  ArrowRight,
  UserCheck,
  Briefcase,
  ShieldCheck,
  BellRing,
} from "lucide-react";
import api from "../../services/api";
import logo from "../../assets/tpcL.jpg";

export default function AlumniOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);

  const nextSteps = [
    {
      num: "①",
      icon: UserCheck,
      title: "COMPLETE YOUR PROFILE",
      desc: "Review and complete your personal and contact information to keep your alumni profile accurate.",
      accent: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      num: "②",
      icon: Briefcase,
      title: "UPDATE YOUR EMPLOYMENT INFORMATION",
      desc: "Keep your employment status and career details updated whenever there are changes.",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      num: "③",
      icon: ShieldCheck,
      title: "KEEP YOUR ACCOUNT SECURE",
      desc: "Make sure your email and contact information are correct, and keep your password secure.",
      accent: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      num: "④",
      icon: BellRing,
      title: "STAY CONNECTED",
      desc: "Check announcements, events, and other updates to stay connected with the TPC Alumni community.",
      accent: "text-purple-600 bg-purple-50 border-purple-100",
    },
  ];

  const handleComplete = () => {
    // 1. Close modal IMMEDIATELY and show the already-rendered Dashboard
    localStorage.setItem("onboardingCompleted", "true");
    window.dispatchEvent(new Event("user-profile-updated"));
    if (typeof onComplete === "function") {
      onComplete();
    }

    // 2. Persist completion in the background without blocking the UI
    api.post("/student/onboarding/complete").catch((err) => {
      console.error("Background onboarding completion error:", err);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={step === 1 ? "welcome-title" : "whats-next-title"}
    >
      <div className="relative w-full max-w-lg md:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-900/30 border border-slate-100 overflow-hidden flex flex-col my-auto animate-fadeUp">
        {/* Scrollable container for card body */}
        <div className="overflow-y-auto p-5 sm:p-7 md:p-9 flex-1">
          {step === 1 ? (
            /* ── PAGE 1: WELCOME ── */
            <div className="flex flex-col items-center text-center">
              {/* Actual official TPC logo */}
              <div className="relative mb-3.5 sm:mb-4">
                <img
                  src={logo}
                  alt="Talibon Polytechnic College Seal"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-[2.5px] border-tpc-gold object-cover shadow-sm ring-4 ring-slate-100 shrink-0 aspect-square mx-auto"
                />
              </div>

              <h2 className="text-xs sm:text-sm font-bold tracking-[0.22em] text-tpc-navy uppercase">
                TPC ALUMNI
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 italic">
                &ldquo;Reconnect, Reminisce, Reunite.&rdquo;
              </p>

              <div className="mt-5 sm:mt-6 w-full pt-5 sm:pt-6 border-t border-slate-100">
                <h1
                  id="welcome-title"
                  className="text-xl sm:text-2xl md:text-3xl font-extrabold text-tpc-navy tracking-tight"
                >
                  WELCOME TO TPC ALUMNI!
                </h1>
                <p className="mt-1.5 sm:mt-2 text-sm sm:text-base md:text-lg font-semibold text-[#1877F2]">
                  We&apos;re glad to have you back.
                </p>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
                  Your alumni journey continues here. Keep your information updated,
                  stay connected with your fellow alumni, and remain informed about
                  opportunities and activities from Talibon Polytechnic College.
                </p>
              </div>
            </div>
          ) : (
            /* ── PAGE 2: WHAT'S NEXT? ── */
            <div className="flex flex-col">
              <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img
                    src={logo}
                    alt="TPC Seal"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-tpc-gold object-cover shrink-0 aspect-square"
                  />
                  <div>
                    <h2
                      id="whats-next-title"
                      className="text-base sm:text-lg md:text-xl font-extrabold text-tpc-navy tracking-tight uppercase"
                    >
                      WHAT&apos;S NEXT?
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      Essential steps to get started
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs sm:text-sm text-slate-500 hover:text-tpc-navy font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              </div>

              <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 md:space-y-3.5">
                {nextSteps.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.accent}`}
                      >
                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm md:text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                          <span className="text-slate-400 font-semibold">
                            {item.num}
                          </span>
                          <span>{item.title}</span>
                        </h3>
                        <p className="mt-0.5 text-[11px] sm:text-xs md:text-xs text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Fixed card footer with navigation */}
        <div className="p-4 sm:p-5 md:p-6 md:px-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 shrink-0">
          {/* Step indicator */}
          <div
            className="flex items-center gap-1.5"
            aria-label={`Step ${step} of 2`}
          >
            <span
              className={`h-2 rounded-full transition-all ${
                step === 1 ? "w-6 bg-tpc-navy" : "w-2 bg-slate-300"
              }`}
            />
            <span
              className={`h-2 rounded-full transition-all ${
                step === 2 ? "w-6 bg-tpc-navy" : "w-2 bg-slate-300"
              }`}
            />
          </div>

          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto min-w-[130px] sm:min-w-[150px] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-tpc-navy hover:bg-tpc-navyDeep active:scale-[0.98] text-white font-semibold text-sm sm:text-base shadow-md shadow-tpc-navy/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-tpc-navy/40"
            >
              <span>NEXT</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="w-full sm:w-auto min-w-[130px] sm:min-w-[150px] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-tpc-navy hover:bg-tpc-navyDeep active:scale-[0.98] text-white font-semibold text-sm sm:text-base shadow-md shadow-tpc-navy/20 transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-tpc-navy/40"
            >
              <span>OKAY</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
