import React from 'react';
import { useNavigate } from 'react-router-dom';
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
                <li>📄 Grants</li>
                <li>⭐ Saved</li>
                <li>⚙️ Settings</li>
            </ul>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Sidebar;
