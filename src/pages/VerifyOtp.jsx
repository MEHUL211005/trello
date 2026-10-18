import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ArrowLeft, ShieldCheck } from "lucide-react";

import AuthShell from "../components/AuthShell";
import PrimaryButton from "../components/PrimaryButton";
import { resendOtp, verifyOtp } from "../api/authApi";
import { getErrorMessage } from "../lib/validation";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;
const STORAGE_KEY = "pendingVerificationEmail";

const readStoredEmail = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // The email comes from signup / login; sessionStorage keeps it across a refresh
  const email = location.state?.email || readStoredEmail();

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const otpErrorTimer = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputs = useRef([]);
  const resendOnLoad = useRef(false);

  useEffect(() => {
    if (!location.state?.email) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, location.state.email);
    } catch {
      // storage unavailable - the email stays in router state only
    }
  }, [location.state?.email]);

  useEffect(() => () => clearTimeout(otpErrorTimer.current), []);

  // Resend countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const resendMutation = useMutation({
    mutationFn: () => resendOtp(email),
    onSuccess: () => {
      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setSecondsLeft(RESEND_SECONDS);
      inputs.current[0]?.focus();
      toast.success("A new OTP has been sent to your email");
    },
    onError: (error) => {
      const data = error.response?.data;
      if (data?.retryAfter) setSecondsLeft(data.retryAfter);
      toast.error(getErrorMessage(error, "Could not resend the OTP"));
    },
  });

  // Coming from the login page with an unverified account: send a fresh OTP
  useEffect(() => {
    if (location.state?.resend && email && !resendOnLoad.current) {
      resendOnLoad.current = true;
      resendMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // nothing to clear
      }
      toast.success("OTP verification successful");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Verification failed"));
      // Start over so the next attempt is a clean 6 digits
      setDigits(Array(OTP_LENGTH).fill(""));
      inputs.current[0]?.focus();
    },
  });

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const otp = digits.join("");

  const setDigit = (index, value) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (!value) {
      setDigit(index, "");
      return;
    }

    // Typing a digit moves on; more than one char (autofill) spreads out
    const chars = value.slice(0, OTP_LENGTH - index).split("");
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((char, offset) => {
        next[index + offset] = char;
      });
      return next;
    });
    inputs.current[Math.min(index + chars.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // Validation message that clears itself after a few seconds
  const showOtpError = (message) => {
    clearTimeout(otpErrorTimer.current);
    setOtpError(message);
    otpErrorTimer.current = setTimeout(() => setOtpError(""), 4000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (otp.length !== OTP_LENGTH) {
      showOtpError(
        otp.length === 0
          ? "Please enter the 6-digit OTP"
          : "OTP must be exactly 6 digits",
      );
      return;
    }

    verifyMutation.mutate({ email, otp });
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digit OTP to <b className="text-slate-700">{email}</b>.
          Enter it below to activate your account.
        </>
      }
    >
      <div className="mt-6 flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-8 ring-brand-50/60">
          <ShieldCheck size={28} />
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              value={digit}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onFocus={(event) => event.target.select()}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={index === 0}
              aria-label={`Digit ${index + 1}`}
              className={`h-14 w-12 rounded-xl border bg-slate-50/60 text-center text-2xl font-bold text-slate-800 outline-none transition focus:bg-white focus:ring-4 ${
                otpError
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : digit
                    ? "border-brand-400 bg-brand-50/60 focus:border-brand-500 focus:ring-brand-100"
                    : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
              }`}
            />
          ))}
        </div>

        {otpError && (
          <p role="alert" className="mt-2 text-sm text-red-500">
            {otpError}
          </p>
        )}

        <PrimaryButton
          type="submit"
          className="mt-6"
          loading={verifyMutation.isPending}
          loadingText="Verifying..."
        >
          Verify &amp; continue
        </PrimaryButton>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Didn't get the code?{" "}
        {secondsLeft > 0 ? (
          <span className="font-semibold text-slate-400">
            Resend in {secondsLeft}s
          </span>
        ) : (
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="cursor-pointer font-semibold text-brand-600 hover:text-brand-800 hover:underline disabled:opacity-60"
          >
            Resend OTP
          </button>
        )}
      </p>

      <p className="mt-3 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default VerifyOtp;
