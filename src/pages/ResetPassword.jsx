import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import AuthShell from "../components/AuthShell";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import { useTransientErrors } from "../hooks/useTransientErrors";
import { resetPassword } from "../api/authApi";
import { getErrorMessage } from "../lib/validation";
import { resetPasswordSchema } from "../validations/authSchema";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Field errors fade out after a few seconds
  const visibleErrors = useTransientErrors(errors, submitCount);

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password updated successfully");
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Could not update the password");

      // A bad or expired link cannot be fixed on this page
      if (/invalid|expired/i.test(message)) {
        toast.error(`${message}. Please request a new link.`);
        navigate("/forgot-password", { replace: true });
        return;
      }

      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ ...data, token });
  };

  const onInvalid = () => {
    toast.error("Please fix the highlighted fields");
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
    >
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
        className="mt-5 space-y-4"
      >
        <div>
          <PasswordInput
            label="New password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            autoFocus
            error={visibleErrors.password}
            {...register("password")}
          />
          <p className="mt-1.5 text-xs text-slate-400">
            8+ characters with upper &amp; lower case, a number and a symbol.
          </p>
        </div>

        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={visibleErrors.confirmPassword}
          {...register("confirmPassword")}
        />

        <PrimaryButton
          type="submit"
          loading={mutation.isPending}
          loadingText="Updating..."
        >
          Update password
        </PrimaryButton>
      </form>

      <p className="mt-5 text-center text-sm">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
};

export default ResetPassword;
