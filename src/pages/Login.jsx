import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { setCredentials } from "../redux/authSlice";
import { loginUser } from "../api/authApi";
import axiosInstance from "../api/axios";
import { loginSchema } from "../validations/authSchema";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,

    onSuccess: (response) => {
      // After login the server may set a refresh cookie instead of
      // returning an access token. Call refresh to obtain accessToken
      // and then fetch profile to populate redux.
      (async () => {
        try {
          const refreshRes = await axiosInstance.post("/auth/refresh");
          const { accessToken } = refreshRes.data;

          const profileRes = await axiosInstance.get("/auth/profile", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          dispatch(
            setCredentials({
              user: profileRes.data.user,
              token: accessToken,
            }),
          );

          navigate("/dashboard", { replace: true });
        } catch (err) {
          setServerError(err.response?.data?.message || "Login failed");
        }
      })();
    },

    onError: (error) => {
      setServerError(error.response?.data?.message || "Login failed");
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

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
            Organize projects, manage tasks and collaborate with your team.
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>

            <p className="text-gray-500 mt-2">Sign in to continue.</p>

            {/* ERROR */}
            {serverError && (
              <div className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              {/* EMAIL */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  {...register("email")}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
                />

                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* PASSWORD WITH EYE ICON */}
              <div className="relative">
                <>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    {...register("password")}
                    className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </>

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
