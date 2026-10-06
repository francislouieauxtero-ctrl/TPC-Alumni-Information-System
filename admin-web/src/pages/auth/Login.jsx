import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import logo from "../../assets/tpcL.jpg";
import bg from "../../assets/tpc.png";
import { getDashboardPath } from "../../utils/roleRedirect";
import {
  extractAuthSession,
  storeAuthSession,
} from "../../utils/authSession";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.success || ""
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      return;
    }

    navigate(getDashboardPath(userRole), { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccessMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const completeLogin = (token, user) => {
    storeAuthSession(token, user);
    navigate(getDashboardPath(user?.role), { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data?.status || response.data?.success) {
        const { token, user } = extractAuthSession(response.data);
        if (!token || !user?.role) {
          setError("Login response was incomplete. Please try again.");
          return;
        }
        completeLogin(token, user);
      } else {
        setError(response.data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setLoading(true);

      try {
        const response = await api.post("/auth/google-login", {
          access_token: tokenResponse.access_token,
        });

        if (response.data?.status || response.data?.success) {
          const { token, user } = extractAuthSession(response.data);
          if (!token || !user?.role) {
            setError("Login response was incomplete. Please try again.");
            return;
          }
          completeLogin(token, user);
        } else {
          setError(response.data?.message || "Google login failed.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Google login failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google login failed."),
  });

  const inputClass = (hasError) =>
    `h-12 w-full rounded-full border bg-tpc-cream/40 pl-12 pr-4 text-sm text-tpc-navy outline-none transition placeholder:text-tpc-navy/40 focus:bg-white focus:ring-2 ${
      hasError
        ? "border-text-danger/60 focus:border-text-danger focus:ring-text-danger/20"
        : "border-tpc-navy/15 focus:border-tpc-gold focus:ring-tpc-gold/30"
    }`;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Page background — campus photo with a navy scrim so the white card pops */}
      <div
        className="absolute inset-0 bg-tpc-navyDeep bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-tpc-navyDeep/70" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center py-4 sm:min-h-[calc(100vh-4rem)] sm:py-0">
        <div className="grid w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/40 sm:rounded-[28px] md:grid-cols-[1.15fr_0.85fr]">
          {/* Form panel */}
          <main className="flex items-center justify-center px-5 py-7 sm:px-8 sm:py-10 md:px-10">
            <div className="w-full max-w-sm">
              <h1 className="text-xl font-semibold text-tpc-navy sm:text-2xl">
                Welcome Back
              </h1>

              {successMessage && (
                <div className="mt-4 rounded-md border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-md border border-text-danger/25 bg-text-danger/10 px-4 py-3 text-sm text-text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-3 sm:mt-6">
                <div>
                  <label className="relative block">
                    <span className="sr-only">Email Address or Username</span>
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tpc-navy/40" />
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass(false)}
                      placeholder="E-mail or Username"
                    />
                  </label>
                </div>

                <div>
                  <label className="relative block">
                    <span className="sr-only">Password</span>
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tpc-navy/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={`${inputClass(false)} pr-11`}
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-tpc-navy/40 transition hover:text-tpc-navy"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </label>
                </div>

                <div className="flex flex-col gap-2 pt-1 text-xs text-tpc-navy/60 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-tpc-navy/30 accent-tpc-gold"
                    />
                    Remember me
                  </label>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-tpc-navy underline underline-offset-4 hover:text-tpc-navy/70"
                    >
                      Forgot password?
                    </Link>
                    <Link
                      to="/register"
                      className="font-medium text-tpc-navy underline underline-offset-4 hover:text-tpc-navy/70"
                    >
                      Register as Alumni
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="!mt-5 h-12 w-full rounded-full bg-tpc-navy text-sm font-semibold text-white transition hover:bg-tpc-navy/90 disabled:cursor-not-allowed disabled:bg-tpc-navy/40"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>

              {/* <div className="mt-5 flex items-center gap-3 text-xs text-tpc-navy/40">
                <span className="h-px flex-1 bg-tpc-navy/15" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-tpc-navy/15" />
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-tpc-navy/15 bg-white text-sm font-medium text-tpc-navy transition hover:bg-tpc-cream disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-base">G</span>
                Continue with Google
              </button> */}

              <p className="mt-6 text-center text-xs text-tpc-navy/40">
                Department Heads should use their assigned credentials
              </p>
            </div>
          </main>

          {/* Accent panel */}
          <aside className="relative hidden overflow-hidden bg-tpc-navy md:flex md:flex-col md:items-center md:justify-center md:p-8">
            <div className="absolute -left-10 -top-16 h-56 w-56 rounded-[40%] bg-tpc-gold/25 blur-2xl" />
            <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-[45%] bg-tpc-green/25 blur-2xl" />
            <div className="relative z-10 text-center">
              <img
                src={logo}
                alt="TPC Seal"
                className="mx-auto mb-6 h-30 w-30 rounded-full border-4 border-tpc-gold bg-white p-1 object-contain"
              />
              <h2 className="text-2xl font-semibold text-white">
                Welcome Back
              </h2>
              <p className="mt-2 max-w-[200px] text-sm text-white/70">
                New here?
              </p>
              <Link
                to="/register"
                className="mt-4 inline-block rounded-full border border-white/30 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Sign Up
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
