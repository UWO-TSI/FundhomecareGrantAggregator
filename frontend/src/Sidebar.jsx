import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../src/styles/DashboardPage.css';
import logo from '../src/assets/fundhomecarelogo.png';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="sidebar">
            <img src={logo} alt="Fund Homecare Logo" className="sidebar-logo" />
            <ul className="sidebar-menu">
                <li>
                    <Link to="/dashboard">📄 Grants</Link>
                </li>
                <li>
                    <Link to="/analytics">⭐ Statistics</Link>
                </li>
                <li>
                    <Link to="/settings">⚙️ Settings</Link>
                </li>
            </ul>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Sidebar;
