import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import logo from "../../assets/tpcL.jpg";
import bg from "../../assets/tpc.png";
import api from "../../services/api";

export default function StudentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department_id: "",
    school_id: "",
    password: "",
    password_confirmation: "",
  });
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments");
        setDepartments(response.data.data || []);
      } catch (err) {
        setError("Unable to load departments. Please try again later.");
      }
    };

    fetchDepartments();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Full name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.department_id) newErrors.department_id = "Department is required";
    if (!form.school_id) newErrors.school_id = "School ID is required";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password && form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const finishRegistration = (email) => {
    setForm({
      name: "",
      email: "",
      department_id: "",
      school_id: "",
      password: "",
      password_confirmation: "",
    });
    setError("");
    localStorage.setItem("studentEmail", email);
    navigate("/pending-approval", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        ...form,
      });
      finishRegistration(form.email);
    } catch (err) {
      const backendMessage =
        err.response?.data?.errors?.school_id?.[0] ||
        err.response?.data?.message ||
        "Registration failed";
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!form.department_id) {
        setErrors({ department_id: "Department is required" });
        setError(
          "Please select a department before using Google registration.",
        );
        return;
      }

      if (!form.school_id) {
        setErrors({ school_id: "School ID is required" });
        setError(
          "Please enter your School ID before using Google registration.",
        );
        return;
      }

      setLoading(true);
      setError("");

      try {
        await api.post("/auth/google-register", {
          access_token: tokenResponse.access_token,
          department_id: form.department_id,
          school_id: form.school_id,
        });

        finishRegistration(form.email);
      } catch (err) {
        const backendMessage =
          err.response?.data?.errors?.school_id?.[0] ||
          err.response?.data?.message ||
          "Google registration failed";
        setError(backendMessage);
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google registration failed. Please try again."),
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

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-start justify-center py-4 sm:min-h-[calc(100vh-4rem)] sm:items-center sm:py-0">
        <div className="grid w-full overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/40 sm:rounded-[28px] md:grid-cols-[1.15fr_0.85fr]">
          {/* Form panel */}
          <main className="flex items-center justify-center px-5 py-7 sm:px-8 sm:py-10 md:px-10">
            <div className="w-full max-w-sm">
              <h1 className="text-xl font-semibold text-tpc-navy sm:text-2xl">
                Create Account
              </h1>

              {error && (
                <div className="mt-4 rounded-md border border-text-danger/25 bg-text-danger/10 px-4 py-3 text-sm text-text-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-3 sm:mt-6">
                <div>
                  <label className="relative block">
                    <span className="sr-only">Full name</span>
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tpc-navy/40" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      required
                      className={inputClass(errors.name)}
                      placeholder="Username"
                    />
                  </label>
                  {errors.name && (
                    <p className="mt-1 pl-4 text-xs text-text-danger">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="relative block">
                    <span className="sr-only">Email</span>
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tpc-navy/40" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      required
                      className={inputClass(errors.email)}
                      placeholder="E-mail"
                    />
                  </label>
                  {errors.email && (
                    <p className="mt-1 pl-4 text-xs text-text-danger">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="relative block">
                    <span className="sr-only">Department</span>
                    <select
                      value={form.department_id}
                      onChange={(e) =>
                        updateForm("department_id", e.target.value)
                      }
                      required
                      className={`${inputClass(errors.department_id)} appearance-none pl-4`}
                    >
                      <option value="">Select department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {errors.department_id && (
                    <p className="mt-1 pl-4 text-xs text-text-danger">
                      {errors.department_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="relative block">
                    <span className="sr-only">School ID</span>
                    <input
                      type="text"
                      value={form.school_id}
                      onChange={(e) => updateForm("school_id", e.target.value)}
                      required
                      className={`${inputClass(errors.school_id)} pl-4`}
                      placeholder="School ID"
                    />
                  </label>
                  {errors.school_id && (
                    <p className="mt-1 pl-4 text-xs text-text-danger">
                      {errors.school_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="relative block">
                    <span className="sr-only">Password</span>
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tpc-navy/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      required
                      className={`${inputClass(errors.password)} pr-11`}
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
                  {errors.password && (
                    <p className="mt-1 pl-4 text-xs text-text-danger">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="relative block">
                    <span className="sr-only">Confirm password</span>
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-tpc-navy/40" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.password_confirmation}
                      onChange={(e) =>
                        updateForm("password_confirmation", e.target.value)
                      }
                      required
                      className={`${inputClass(errors.password_confirmation)} pr-11`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-tpc-navy/40 transition hover:text-tpc-navy"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </label>
                  {errors.password_confirmation && (
                    <p className="mt-1 pl-4 text-xs text-text-danger">
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>

                <label className="flex items-start gap-2 pt-1 pl-1 text-xs leading-relaxed text-tpc-navy/60 sm:items-center">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-tpc-navy/30 accent-tpc-gold sm:mt-0"
                  />
                  I accept the terms of the agreement
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="!mt-5 h-12 w-full rounded-full bg-tpc-navy text-sm font-semibold text-white transition hover:bg-tpc-navy/90 disabled:cursor-not-allowed disabled:bg-tpc-navy/40"
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </form>

              {/* Mobile-only login link — the accent panel with this link is hidden below md */}
              <p className="mt-5 text-center text-xs text-tpc-navy/60 md:hidden">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-tpc-navy underline underline-offset-2"
                >
                  Log In
                </Link>
              </p>

              {/* <div className="mt-5 flex items-center gap-3 text-xs text-tpc-navy/40">
                <span className="h-px flex-1 bg-tpc-navy/15" />
                <span>or register with</span>
                <span className="h-px flex-1 bg-tpc-navy/15" />
              </div> */}

              {/* <button
                type="button"
                onClick={() => handleGoogleRegister()}
                disabled={loading}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-tpc-navy/15 bg-white text-sm font-medium text-tpc-navy transition hover:bg-tpc-cream disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-base">G</span>
                Continue with Google
              </button> */}
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
              <h2 className="text-2xl font-semibold text-white">Get Started</h2>
              <p className="mt-2 max-w-[200px] text-sm text-white/70">
                Already have an account?
              </p>
              <Link
                to="/login"
                className="mt-4 inline-block rounded-full border border-white/30 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Log In
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
