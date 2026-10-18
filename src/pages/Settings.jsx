import { createElement, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  KeyRound,
  LogOut,
  Mail,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Sun,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import PageShell, { PageHeader } from "../components/PageShell";
import TextField from "../components/TextField";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import LogoutDialog from "../components/LogoutDialog";
import { useTheme } from "../context/theme";
import { useLogout } from "../hooks/useLogout";
import { useTransientErrors } from "../hooks/useTransientErrors";
import { changePassword, updateProfile } from "../api/authApi";
import { setCredentials } from "../redux/authSlice";
import { getErrorMessage } from "../lib/validation";
import { changePasswordSchema, profileSchema } from "../validations/authSchema";

// A titled card for one group of settings
const Section = ({ icon, title, description, children }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
    <div className="mb-5 flex items-start gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        {createElement(icon, { size: 19 })}
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

function ProfileForm() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, submitCount, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
  });

  const visibleErrors = useTransientErrors(errors, submitCount);

  const mutation = useMutation({
    mutationFn: ({ name }) => updateProfile(name),
    onSuccess: (response) => {
      // The name shows in the navbar, sidebar and cards straight away
      dispatch(
        setCredentials({ user: { ...user, ...response.user }, token }),
      );
      reset({ name: response.user.name });
      toast.success("Profile updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update your profile"));
    },
  });

  return (
    <form
      onSubmit={handleSubmit(
        (values) => mutation.mutate(values),
        () => toast.error("Please fix the highlighted field"),
      )}
      noValidate
      className="space-y-4"
    >
      <TextField
        label="Full name"
        icon={User}
        autoComplete="name"
        error={visibleErrors.name}
        {...register("name")}
      />

      <div>
        <TextField
          label="Email address"
          icon={Mail}
          value={user?.email || ""}
          readOnly
          disabled
          className="cursor-not-allowed opacity-70"
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Your email is your sign-in and can't be changed here.
        </p>
      </div>

      <PrimaryButton
        type="submit"
        loading={mutation.isPending}
        loadingText="Saving..."
        disabled={!isDirty}
        className="sm:w-auto! sm:px-8"
      >
        Save changes
      </PrimaryButton>
    </form>
  );
}

function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, submitCount },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const visibleErrors = useTransientErrors(errors, submitCount);

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      reset();
      toast.success("Password updated");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not change your password"));
    },
  });

  return (
    <form
      onSubmit={handleSubmit(
        (values) => mutation.mutate(values),
        () => toast.error("Please fix the highlighted fields"),
      )}
      noValidate
      className="space-y-4"
    >
      <PasswordInput
        label="Current password"
        placeholder="Enter your current password"
        autoComplete="current-password"
        error={visibleErrors.currentPassword}
        {...register("currentPassword")}
      />

      <div>
        <PasswordInput
          label="New password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={visibleErrors.newPassword}
          {...register("newPassword")}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          8+ characters with upper &amp; lower case, a number and a symbol.
        </p>
      </div>

      <PasswordInput
        label="Confirm new password"
        placeholder="Re-enter the new password"
        autoComplete="new-password"
        error={visibleErrors.confirmPassword}
        {...register("confirmPassword")}
      />

      <div className="flex flex-wrap items-center gap-4">
        <PrimaryButton
          type="submit"
          loading={mutation.isPending}
          loadingText="Updating..."
          className="sm:w-auto! sm:px-8"
        >
          Update password
        </PrimaryButton>

        <Link
          to="/forgot-password"
          className="text-sm font-semibold text-brand-600 transition hover:text-brand-800 hover:underline"
        >
          Forgot your current password?
        </Link>
      </div>
    </form>
  );
}

function Settings() {
  const { theme, setTheme } = useTheme();
  const logout = useLogout();

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const themes = [
    { key: "light", label: "Light", icon: Sun, hint: "Bright and clean" },
    { key: "dark", label: "Dark", icon: Moon, hint: "Easy on the eyes" },
  ];

  return (
    <PageShell width="max-w-3xl">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Manage your account and how TaskSphere looks"
      />

      <div className="space-y-6">
        <Section
          icon={User}
          title="Profile"
          description="How you appear to the people you work with"
        >
          <ProfileForm />
        </Section>

        <Section
          icon={Palette}
          title="Appearance"
          description="Choose a theme for the whole app. It's remembered on this device."
        >
          <div role="radiogroup" aria-label="Theme" className="grid gap-3 sm:grid-cols-2">
            {themes.map((item) => (
              <button
                key={item.key}
                role="radio"
                aria-checked={theme === item.key}
                onClick={() => setTheme(item.key)}
                className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition ${
                  theme === item.key
                    ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                    : "border-slate-200 hover:border-brand-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    item.key === "dark"
                      ? "bg-slate-800 text-amber-300"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <item.icon size={20} />
                </span>
                <span>
                  <span className="block font-bold text-slate-900">{item.label}</span>
                  <span className="block text-sm text-slate-500">{item.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section
          icon={KeyRound}
          title="Password"
          description="Use a strong password you don't use anywhere else"
        >
          <PasswordForm />
        </Section>

        <Section
          icon={LogOut}
          title="Sign out"
          description="End your session on this device"
        >
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-2 rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </Section>
      </div>

      {showLogout && (
        <LogoutDialog
          busy={loggingOut}
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </PageShell>
  );
}

export default Settings;
