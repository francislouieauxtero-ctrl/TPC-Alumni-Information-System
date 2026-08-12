import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/tpcL.jpg";

const SECTIONS = {
  terms: {
    label: "Terms of Service",
    updated: "August 12, 2026",
    intro:
      'These Terms govern your use of the TPC Alumni Management System ("TPC AMS"), operated by Talibon Polytechnic College. By creating an account or signing in, you agree to them.',
    groups: [
      {
        heading: "1. Who can use TPC AMS",
        body: [
          "TPC AMS is intended for verified alumni, current students transitioning to alumni status, department heads, and college administrators of Talibon Polytechnic College.",
          "You must provide accurate registration details, including your student number or school ID, so your records can be matched to the correct graduate profile.",
        ],
      },
      {
        heading: "2. Your account",
        body: [
          "You're responsible for keeping your login credentials confidential and for all activity under your account.",
          "Let an administrator know right away if you suspect unauthorized access to your account.",
        ],
      },
      {
        heading: "3. Acceptable use",
        body: [
          "Use TPC AMS only for its intended purpose: maintaining your alumni profile, viewing job and batch history, and connecting with the college's alumni network.",
          "Don't submit false employment or profile information, impersonate another graduate, or attempt to access records outside your assigned role's permissions.",
        ],
      },
      {
        heading: "4. Content you provide",
        body: [
          "Profile details, employment history, and any documents you upload remain yours, but you grant the college a license to store and display them within TPC AMS for alumni-network purposes.",
        ],
      },
      {
        heading: "5. Changes and termination",
        body: [
          "The college may suspend or terminate accounts that violate these Terms or are found to contain fraudulent information.",
          "These Terms may be updated as the system evolves; continued use after an update means you accept the revised Terms.",
        ],
      },
    ],
  },
  privacy: {
    label: "Privacy Policy",
    updated: "August 12, 2026",
    intro:
      "This Policy explains how TPC AMS collects, uses, and protects your personal data, consistent with the Philippine Data Privacy Act of 2012 (RA 10173).",
    groups: [
      {
        heading: "1. Information we collect",
        body: [
          "Registration data: name, student/school ID, batch year, department, and contact details.",
          "Profile data you choose to add: employment history, job title, employer, and profile photo.",
          "System data: login timestamps and role-based activity needed to keep the platform secure.",
        ],
      },
      {
        heading: "2. How we use your information",
        body: [
          "To verify your alumni status and match you to the correct graduate record.",
          "To generate aggregate analytics for the college (e.g., employment rates per batch or department) — these reports do not expose individual profiles outside your assigned role's view.",
          "To send booking-related confirmations, reminders, or alumni event updates you opt into.",
        ],
      },
      {
        heading: "3. Who can see your data",
        body: [
          "Your basic directory info is visible to fellow verified alumni for networking purposes, unless you set your profile to private.",
          "Department heads and the super admin can view records within their department or institution-wide, respectively, for administrative purposes only.",
          "We do not sell or share your personal data with third parties for marketing.",
        ],
      },
      {
        heading: "4. Data retention and security",
        body: [
          "Your data is stored securely and retained for as long as your account is active or as required for institutional alumni records.",
          "Reasonable technical safeguards (access controls, role-based permissions) are in place to prevent unauthorized access.",
        ],
      },
      {
        heading: "5. Your rights",
        body: [
          "Under the Data Privacy Act, you may request access to, correction of, or deletion of your personal data, and may withdraw consent for optional data uses at any time.",
          "To exercise these rights, contact the TPC AMS administrator through the college's official channels.",
        ],
      },
    ],
  },
};

export default function TermsAndPrivacy() {
  const [active, setActive] = useState("terms");
  const section = SECTIONS[active];

  return (
    <div className="min-h-screen bg-tpc-cream font-sans text-tpc-navy">
      {/* Header */}
      <header className="border-b border-tpc-navy/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Talibon Polytechnic College seal"
              className="h-10 w-10 rounded-full border-2 border-tpc-gold object-cover sm:h-12 sm:w-12"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-tpc-navy sm:text-base">
                Talibon Polytechnic College
              </span>
              <span className="text-[11px] uppercase tracking-[0.1em] text-tpc-navy/60 sm:text-xs">
                Alumni System
              </span>
            </div>
          </Link>
          <Link
            to="/"
            className="text-[13px] font-medium text-tpc-navy/70 underline-offset-4 hover:text-tpc-navy hover:underline"
          >
            Back home
          </Link>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold text-tpc-navy sm:text-3xl">
          Terms &amp; Privacy
        </h1>
        <p className="mt-2 max-w-xl text-sm text-tpc-navy/70">
          How the TPC Alumni Management System works, and how your data is
          handled.
        </p>

        {/* Tabs */}
        <div className="mt-8 flex gap-2 border-b border-tpc-navy/10">
          {Object.entries(SECTIONS).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                active === key
                  ? "border-tpc-gold text-tpc-navy"
                  : "border-transparent text-tpc-navy/50 hover:text-tpc-navy/80"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <article className="mt-8">
          <p className="text-xs uppercase tracking-[0.08em] text-tpc-navy/50">
            Last updated {section.updated}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-tpc-navy/85">
            {section.intro}
          </p>

          <div className="mt-8 space-y-8">
            {section.groups.map((group) => (
              <section key={group.heading}>
                <h2 className="text-base font-semibold text-tpc-navy">
                  {group.heading}
                </h2>
                <div className="mt-2 space-y-2">
                  {group.body.map((line, i) => (
                    <p
                      key={i}
                      className="text-[14px] leading-relaxed text-tpc-navy/80"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
