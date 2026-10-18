import { Link, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LogIn, Mail } from "lucide-react";
import toast from "react-hot-toast";

import AuthShell from "../components/AuthShell";
import TextField from "../components/TextField";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import { useTransientErrors } from "../hooks/useTransientErrors";
import { setCredentials } from "../redux/authSlice";
import { loginUser } from "../api/authApi";
import { getErrorMessage } from "../lib/validation";
import { loginSchema } from "../validations/authSchema";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // Field errors fade out after a few seconds
  const visibleErrors = useTransientErrors(errors, submitCount);

  const mutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (response) => {
      // The login response already contains the access token and user.
      dispatch(
        setCredentials({
          user: response.user,
          token: response.accessToken,
        }),
      );

      toast.success(`Welcome back, ${response.user.name.split(" ")[0]}!`);
      navigate("/dashboard", { replace: true });
    },

    onError: (error) => {
      const data = error.response?.data;

      // Account exists but the email was never verified: send a new OTP
      if (data?.code === "EMAIL_NOT_VERIFIED") {
        toast("Please verify your email to continue", { icon: "✉️" });
        navigate("/verify-otp", {
          state: { email: data.email, resend: true },
        });
        return;
      }

      if (error.response?.status === 401) {
        toast.error("Incorrect email or password");
        return;
      }

      toast.error(getErrorMessage(error, "Login failed"));
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  // Toast what is wrong when the form is submitted with invalid values
  const onInvalid = () => {
    toast.error("Please fix the highlighted fields");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where your team left off."
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
          error={visibleErrors.email}
          {...register("email")}
        />

        <div>
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={visibleErrors.password}
            {...register("password")}
          />

          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <PrimaryButton
          type="submit"
          loading={mutation.isPending}
          loadingText="Signing in..."
          icon={LogIn}
        >
          Sign in
        </PrimaryButton>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        New to TaskSphere?{" "}
        <Link
          to="/signup"
          className="font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
        >
          Create a free account
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
