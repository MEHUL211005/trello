import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck, Mail } from "lucide-react";
import toast from "react-hot-toast";

import AuthShell from "../components/AuthShell";
import TextField from "../components/TextField";
import PrimaryButton from "../components/PrimaryButton";
import { useTransientErrors } from "../hooks/useTransientErrors";
import { forgotPassword } from "../api/authApi";
import { getErrorMessage } from "../lib/validation";
import { forgotPasswordSchema } from "../validations/authSchema";

const BackToLogin = () => (
  <p className="mt-5 text-center text-sm">
    <Link
      to="/login"
      className="inline-flex items-center gap-1.5 font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
    >
      <ArrowLeft size={15} />
      Back to sign in
    </Link>
  </p>
);

const ForgotPassword = () => {
  const [sentTo, setSentTo] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Field errors fade out after a few seconds
  const visibleErrors = useTransientErrors(errors, submitCount);

  const mutation = useMutation({
    mutationFn: ({ email }) => forgotPassword(email),
    onSuccess: (_data, { email }) => {
      setSentTo(email);
      toast.success("Reset link sent! Check your email");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not send the reset link"));
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const onInvalid = () => {
    toast.error("Please enter a valid email address");
  };

  if (sentTo) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={
          <>
            If an account exists for{" "}
            <b className="text-slate-700">{sentTo}</b>, we've sent a link to
            reset your password. It expires in 30 minutes.
          </>
        }
      >
        <div className="mt-7 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 ring-8 ring-accent-50/60">
            <MailCheck size={30} />
          </span>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Can't see it? Check your spam folder, or try again with a different
          address.
        </p>

        <button
          type="button"
          onClick={() => setSentTo("")}
          className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-[15px] font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          Use a different email
        </button>

        <BackToLogin />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="No worries. Enter your email and we'll send you a link to set a new one."
    >
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="mt-5 space-y-4"
      >
        <TextField
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          error={visibleErrors.email}
          {...register("email")}
        />

        <PrimaryButton
          type="submit"
          loading={mutation.isPending}
          loadingText="Sending link..."
        >
          Send reset link
        </PrimaryButton>
      </form>

      <BackToLogin />
    </AuthShell>
  );
};

export default ForgotPassword;
