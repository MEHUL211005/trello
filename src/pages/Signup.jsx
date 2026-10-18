import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail, User, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import AuthShell from "../components/AuthShell";
import TextField from "../components/TextField";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import { useTransientErrors } from "../hooks/useTransientErrors";
import { signupSchema } from "../validations/authSchema";
import { signupUser } from "../api/authApi";
import { getErrorMessage } from "../lib/validation";

const Signup = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // Field errors fade out after a few seconds
  const visibleErrors = useTransientErrors(errors, submitCount);

  const mutation = useMutation({
    mutationFn: signupUser,

    onSuccess: (response) => {
      reset();
      toast.success("Account created! We've emailed you a 6-digit OTP");
      navigate("/verify-otp", {
        replace: true,
        state: { email: response.data.email },
      });
    },

    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error("An account with this email already exists. Try logging in.");
        return;
      }

      toast.error(getErrorMessage(error, "Signup failed"));
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const onInvalid = () => {
    toast.error("Please fix the highlighted fields");
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organising projects and collaborating with your team."
    >
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="mt-5 space-y-4"
      >
        <TextField
          label="Full name"
          icon={User}
          type="text"
          placeholder="Jane Cooper"
          autoComplete="name"
          error={visibleErrors.name}
          {...register("name")}
        />

        <TextField
          label="Work email"
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={visibleErrors.email}
          {...register("email")}
        />

        <div>
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={visibleErrors.password}
            {...register("password")}
          />
          <p className="mt-1.5 text-xs text-slate-400">
            8+ characters with upper &amp; lower case, a number and a symbol.
          </p>
        </div>

        <PrimaryButton
          type="submit"
          loading={mutation.isPending}
          loadingText="Creating account..."
          icon={UserPlus}
        >
          Create account
        </PrimaryButton>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Signup;
