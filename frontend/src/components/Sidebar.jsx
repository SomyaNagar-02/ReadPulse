import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the saved JWT token so protected pages become inaccessible
    localStorage.removeItem("token");

    // Send the user back to the login page
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <p className="sidebar-brand">ReadPulse</p>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/all-articles"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          All Articles
        </NavLink>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
