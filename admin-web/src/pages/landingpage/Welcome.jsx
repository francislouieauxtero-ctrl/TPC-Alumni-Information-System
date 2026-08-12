import { Link } from "react-router-dom";
import logo from "../../assets/tpcL.jpg";
import bg from "../../assets/tpc.png";
export default function Welcome() {
  return (
    <div className="relative min-h-screen overflow-hidden font-sans text-white">
      {/* Background photo — campus shot */}
      <div
        className="absolute inset-0 bg-tpc-navyDeep bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Scrim for legibility — stronger on the left where the text sits,
          fading out on the right so the photo still reads behind it. */}
      <div className="absolute inset-0 bg-gradient-to-r from-tpc-navyDeep/95 via-tpc-navyDeep/75 to-tpc-navyDeep/20" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-6 sm:py-10 md:px-10">
        {/* Top nav */}
        <div className="flex animate-fadeUp items-center opacity-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Circular seal logo */}
            <img
              src={logo}
              alt="Talibon Polytechnic College seal"
              className="h-14 w-14 rounded-full border-4 border-tpc-gold object-cover shadow-lg shadow-black/40 sm:h-20 sm:w-20 md:h-24 md:w-24"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-wide text-white sm:text-xl md:text-2xl">
                Talibon Polytechnic College
              </span>
              <span className="text-xs uppercase tracking-[0.12em] text-tpc-gold sm:text-sm">
                Alumni System
              </span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="grid flex-1 items-center gap-8 py-10 sm:gap-10 sm:py-14 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:py-16">
          <div className="max-w-xl animate-fadeUp opacity-0 [animation-delay:150ms]">
            <span className="inline-block text-[11px] font-medium uppercase tracking-[0.14em] text-tpc-gold sm:text-[12px]">
              Alumni network — all class years
            </span>

            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.15] text-white sm:text-[2.5rem] sm:leading-[1.1] md:text-[3.1rem]">
              Your network
              <br />
              didn&apos;t end at graduation.
            </h1>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80 sm:mt-5 sm:text-[16px]">
              Sign in to connect with classmates, and keep up with reunions and
              chapter events — or register to join the alumni network.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Link
                to="/login"
                className="rounded-md bg-white px-6 py-3 text-center text-[14px] font-medium text-tpc-navy transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tpc-gold"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-white/40 px-6 py-3 text-center text-[14px] font-medium text-white transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tpc-gold"
              >
                Join the alumni network
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/20 pt-6 text-[13px] text-white/70 sm:mt-10">
              <span>Alumni directory</span>
              <span>Reunions & events</span>
              <Link
                to="/terms-privacy"
                className="underline-offset-4 hover:text-white hover:underline"
              >
                Terms &amp; Privacy
              </Link>
            </div>
          </div>

          <div className="mt-5 hidden h-6 w-full rounded-sm bg-[repeating-linear-gradient(90deg,#0F3A5C_0px,#0F3A5C_2px,transparent_2px,transparent_5px)] opacity-50 md:block" />
        </div>
      </div>
    </div>
  );
}
