import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/DashboardPage.css';
import logo from '../assets/fundhomecarelogo.png';
import { UserAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { session, signOut } = UserAuth();
    const navigate = useNavigate();
    
    const handleLogout = async (e) => {
        e.preventDefault();
        try{
            await signOut();
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleNavigation = (path) => {
        navigate(path);
    };
    
    return (
        <div className="sidebar">
            <img src={logo} alt="Fund Homecare Logo" className="sidebar-logo" />
            <ul className="sidebar-menu">
                <li onClick={() => handleNavigation('/dashboard')}>
                    <a className="sidebar-link">📄 Grants</a>
                </li>
                {/* Note: No Saved page yet, but keeping the UI element */}
                <li onClick={() => handleNavigation('/dashboard')}>
                    <a className="sidebar-link">⭐ Saved</a>
                </li>
                <li onClick={() => handleNavigation('/settings')}>
                    <a className="sidebar-link">⚙️ Settings</a>
                </li>
            </ul>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Sidebar;