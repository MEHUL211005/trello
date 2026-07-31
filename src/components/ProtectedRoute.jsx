import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const auth = useSelector((state) => state.auth);

  console.log("PROTECTED AUTH =", auth);

  if (!auth.isAuthenticated || !auth.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;