import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT */}
        <div className="hidden lg:flex flex-col justify-center bg-blue-600 text-white p-12">
          <h1 className="text-4xl font-bold mb-4">
            Trello Clone
          </h1>
          <p className="text-blue-100 text-lg">
            Organize projects, manage tasks and collaborate with your team.
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md">

            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-gray-500 mt-2">
              Sign in to continue.
            </p>

            {/* ERROR */}
            {error && (
              <div className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* PASSWORD WITH EYE ICON */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-400"
                />

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
                className="w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Login
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