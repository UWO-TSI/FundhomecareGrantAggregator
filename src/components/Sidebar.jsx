import React from 'react';
import { useNavigate } from 'react-router-dom';
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