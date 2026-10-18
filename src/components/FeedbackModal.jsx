import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bug, CheckCircle2, Heart, Lightbulb, MessageCircle, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { sendFeedback } from "../api/feedbackApi";
import { getErrorMessage } from "../lib/validation";

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

const CATEGORIES = [
  { key: "IDEA", label: "Idea", icon: Lightbulb, tone: "text-amber-500" },
  { key: "BUG", label: "Problem", icon: Bug, tone: "text-rose-500" },
  { key: "PRAISE", label: "Praise", icon: Heart, tone: "text-pink-500" },
  { key: "OTHER", label: "Other", icon: MessageCircle, tone: "text-brand-500" },
];

const PLACEHOLDERS = {
  IDEA: "What would make TaskSphere better for you?",
  BUG: "What went wrong? What were you doing when it happened?",
  PRAISE: "What are you enjoying? We'd love to hear it.",
  OTHER: "Tell us what's on your mind...",
};

// "Send feedback": it is emailed to the team (so someone actually reads it),
// and the sender gets a thank-you email as confirmation.
const FeedbackModal = ({ onClose }) => {
  const [category, setCategory] = useState("IDEA");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const errorTimer = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      clearTimeout(errorTimer.current);
    };
  }, [onClose]);

  // The message tells the person what is missing, then steps aside
  const showError = (text) => {
    clearTimeout(errorTimer.current);
    setError(text);
    errorTimer.current = setTimeout(() => setError(""), 4000);
  };

  const mutation = useMutation({
    mutationFn: sendFeedback,

    onSuccess: () => {
      setSent(true);
      toast.success("Thanks! Your feedback was sent");
    },

    onError: (err) => {
      toast.error(getErrorMessage(err, "Could not send your feedback"));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text) {
      showError("Write a few words first");
      return;
    }

    if (text.length < MIN_LENGTH) {
      showError(`Please write at least ${MIN_LENGTH} characters so we can understand`);
      return;
    }

    setError("");
    mutation.mutate({ category, message: text });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Send feedback"
        className="animate-fade-up w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div className="flex flex-col items-center px-8 py-12 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-600 ring-8 ring-accent-50/60">
              <CheckCircle2 size={32} />
            </span>

            <h3 className="text-xl font-bold text-slate-900">Message sent</h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Thank you for helping improve TaskSphere. A real person reads
              every message, and we've emailed you a copy for your records.
            </p>

            <button
              onClick={onClose}
              className="bg-brand-gradient mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="bg-brand-gradient relative px-6 py-5 text-white">
              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 cursor-pointer rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X size={20} />
              </button>
              <h2 className="relative text-lg font-extrabold">Share your thoughts</h2>
              <p className="relative mt-0.5 text-sm text-white/80">
                Your message goes straight to the team behind TaskSphere.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-6 py-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                What kind of feedback is it?
              </p>

              <div role="radiogroup" aria-label="Kind of feedback" className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="radio"
                    aria-checked={category === item.key}
                    onClick={() => setCategory(item.key)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-semibold transition ${
                      category === item.key
                        ? "border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                        : "border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon size={20} className={item.tone} />
                    {item.label}
                  </button>
                ))}
              </div>

              <label
                htmlFor="feedback-message"
                className="mb-1.5 mt-5 block text-sm font-semibold text-slate-700"
              >
                Your message
              </label>

              <textarea
                id="feedback-message"
                value={message}
                maxLength={MAX_LENGTH}
                autoFocus
                onChange={(e) => setMessage(e.target.value)}
                placeholder={PLACEHOLDERS[category]}
                aria-invalid={!!error || undefined}
                className={`h-36 w-full resize-none rounded-xl border bg-slate-50/60 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                  error
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
                }`}
              />

              <div className="mt-1.5 flex items-start justify-between gap-3">
                {error ? (
                  <p role="alert" className="text-sm text-red-500">
                    {error}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">
                    We'll reply to your account email if we have questions.
                  </p>
                )}
                <span className="shrink-0 text-xs text-slate-400">
                  {message.length}/{MAX_LENGTH}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-brand-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:brightness-110 disabled:opacity-60"
                >
                  {mutation.isPending ? "Sending..." : "Send feedback"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default FeedbackModal;
