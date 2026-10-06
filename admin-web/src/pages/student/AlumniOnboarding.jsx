import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  Briefcase,
  ShieldCheck,
  BellRing,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import logo from "../../assets/tpcL.jpg";
import { getDashboardPath } from "../../utils/roleRedirect";

export default function AlumniOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Role restriction: ALUMNI USERS ONLY
    if (userRole !== "user") {
      navigate(getDashboardPath(userRole), { replace: true });
      return;
    }

    // If onboarding is already completed, go directly to dashboard
    if (onboardingCompleted === "true") {
      navigate("/student/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleNext = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/student/onboarding/complete");

      if (response.data?.status || response.data?.success) {
        localStorage.setItem("onboardingCompleted", "true");
        window.dispatchEvent(new Event("user-profile-updated"));
        navigate("/student/dashboard", { replace: true });
      } else {
        setError(
          response.data?.message ||
            "Unable to complete onboarding. Please try again."
        );
      }
    } catch (err) {
      console.error("Onboarding completion error:", err);
      const serverMessage =
        err.response?.data?.message ||
        "Unable to complete onboarding. Please check your connection and try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen min-h-dvh w-full bg-gradient-to-br from-slate-50 via-[#f0f7ff] to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Background ambient accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-50/70 rounded-full blur-3xl" />
      </div>

      {/* Main card */}
      <main className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-[#0f3a5c]/8 border border-slate-100 p-6 sm:p-9 md:p-11 transition-all">
        {/* Top / Branding Area */}
        <header className="flex flex-col items-center text-center">
          {/* Actual official TPC logo */}
          <div className="relative">
            <img
              src={logo}
              alt="Talibon Polytechnic College Seal"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[2.5px] border-tpc-gold object-cover shadow-sm ring-4 ring-slate-100 shrink-0 aspect-square"
            />
          </div>

          <h2 className="mt-3.5 text-xs sm:text-sm font-bold tracking-[0.22em] text-tpc-navy uppercase">
            TPC ALUMNI
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 italic">
            &ldquo;Reconnect, Reminisce, Reunite.&rdquo;
          </p>

          {/* Welcome Message */}
          <h1 className="mt-5 text-xl sm:text-2xl md:text-3xl font-extrabold text-tpc-navy tracking-tight">
            WELCOME TO TPC ALUMNI!
          </h1>
          <p className="mt-1 text-sm sm:text-base font-semibold text-[#1877F2]">
            We&apos;re glad to have you back.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
            Your alumni journey continues here. Keep your information updated,
            stay connected with your fellow alumni, and remain informed about
            opportunities and activities from Talibon Polytechnic College.
          </p>
        </header>

        {/* What's Next Section */}
        <section
          aria-labelledby="whats-next-heading"
          className="mt-7 sm:mt-8 pt-6 sm:pt-7 border-t border-slate-100"
        >
          <h3
            id="whats-next-heading"
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 text-left"
          >
            WHAT&apos;S NEXT?
          </h3>

          <div className="space-y-3 sm:space-y-3.5">
            {nextSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-100/90 hover:bg-slate-50 transition-colors text-left"
                >
                  {/* Number Badge with Icon */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${step.accent}`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                      <span className="text-slate-400 font-semibold">
                        {step.num}
                      </span>
                      <span>{step.title}</span>
                    </h4>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Error message if API fails */}
        {error && (
          <div
            role="alert"
            className="mt-5 p-3.5 rounded-xl border border-red-200 bg-red-50/90 text-xs sm:text-sm text-red-700 flex items-center gap-2.5 animate-fadeUp"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* Bottom Area: Progress Indicator + Primary Next Button */}
        <footer className="mt-8 sm:mt-9 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Progress Indicator: ● ○ ○ ○ */}
          <div
            className="flex items-center gap-2.5"
            aria-label="Progress: step 1 of 4"
            role="status"
          >
            <span
              className="w-3 h-3 rounded-full bg-tpc-navy shadow-sm ring-2 ring-tpc-navy/20"
              title="Step 1 active"
            />
            <span
              className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white"
              title="Step 2"
            />
            <span
              className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white"
              title="Step 3"
            />
            <span
              className="w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-white"
              title="Step 4"
            />
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleNext}
            disabled={loading}
            type="button"
            className="w-full sm:w-auto min-w-[150px] px-7 py-3 rounded-full bg-tpc-navy hover:bg-tpc-navyDeep active:scale-[0.98] text-white font-semibold text-sm sm:text-base shadow-md shadow-tpc-navy/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-tpc-navy/40 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>NEXT</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </>
            )}
          </button>
        </footer>
      </main>
    </div>
  );
}
