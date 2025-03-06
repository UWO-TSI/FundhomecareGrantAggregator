import React from 'react';
import './DashboardPage.css';
import logo from './assets/fundhomecarelogo.png';

function Sidebar() {
    return (
        <div className="sidebar">
            <img src={logo} alt="Fund Homecare Logo" className="sidebar-logo" />
            <ul className="sidebar-menu">
                <li>📄 Grants</li>
                <li>⭐ Saved</li>
                <li>⚙️ Settings</li>
            </ul>
        </div>
    );
}

export default Sidebar;
