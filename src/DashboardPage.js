import React from 'react';
import Sidebar from './Sidebar';
import './DashboardPage.css';

function DashboardPage() {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <h2>Main Dashboard</h2>
                <input className="search-bar" type="text" placeholder="Search for Grants..." />
                <table className="grants-table">
                    <thead>
                        <tr>
                            <th>Grant Name</th>
                            <th>Amount</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Add rows dynamically later */}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DashboardPage;
