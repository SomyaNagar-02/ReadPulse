import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // We keep auth simple by checking for a saved token in localStorage
  const token = localStorage.getItem("token");

  // If there is no token, send the user back to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a token exists, allow access to the protected page
  return children;
}

export default ProtectedRoute;
