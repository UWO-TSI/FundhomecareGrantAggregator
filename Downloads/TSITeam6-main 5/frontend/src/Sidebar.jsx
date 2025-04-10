import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../src/styles/DashboardPage.css';
import logo from '/fundhomecarelogo.png';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo-container">
        <img src={logo} alt="Fund Homecare Logo" className="sidebar-logo" />
      </div>

      <ul className="sidebar-menu">
        <li>
          <Link to="/dashboard" className="sidebar-link">📄 Grants</Link>
        </li>
        <li>
          <Link to="/analytics" className="sidebar-link">📊 Statistics</Link>
        </li>
        <li>
          <Link to="/settings" className="sidebar-link">⚙️ Settings</Link>
        </li>
      </ul>

      <button onClick={handleLogout} className="logout-button">Logout</button>
    </div>
  );
};

export default Sidebar;
