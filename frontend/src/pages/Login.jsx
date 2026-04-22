import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Send the email and password to the backend login API
      const data = await api.loginUser(formData);

      // Save the JWT token so protected routes can use it later
      localStorage.setItem("token", data.token);

      // Move the user to the dashboard after successful login
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-shell login-page">
        <div className="login-card">
          <p className="page-label">Login</p>
          <h1>Welcome back to ReadPulse</h1>
          <p className="page-text">
            Sign in to continue managing your saved reading list.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="login-footer">
            Do not have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
