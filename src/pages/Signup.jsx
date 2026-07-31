import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { signupSchema } from "../validations/authSchema";
import { signupUser } from "../api/authApi";

const Signup = () => {
  
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

const {
  register,
  handleSubmit,
  formState: { errors },
  reset,
} = useForm({
  resolver: zodResolver(signupSchema),
});
const mutation = useMutation({
  mutationFn: signupUser,

  onSuccess: () => {
    reset();
    navigate("/login", { replace: true });
  },

  onError: (error) => {
    setServerError(
      error.response?.data?.message || "Signup failed"
    );
  },
});
  

const onSubmit = (data) => {
  setServerError("");
  mutation.mutate(data);
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-center bg-blue-600 text-white p-12">
          <h1 className="text-4xl font-bold mb-4">Trello Clone</h1>
          <p className="text-blue-100 text-lg">
            Create your account and start managing your projects.
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">

            <h2 className="text-3xl font-bold text-gray-800">
              Create Account
            </h2>

            <p className="text-gray-500 mt-2">
              Sign up to continue.
            </p>

            {/* ERROR */}
           {serverError && (
            <div className="mt-4 bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">
              {serverError}
            </div>
          )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">

              <div>
              <input
                type="text"
                placeholder="Full Name"
                {...register("name")}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
              />

              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition cursor-pointer"
          >
            {mutation.isPending ? "Creating Account..." : "Create Account"}
          </button>

            </form>

            <p className="text-center mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-semibold">
                Login
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;