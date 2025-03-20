import React, { useState } from "react";
import Sidebar from "../src/Sidebar";
import GrantDetailsModal from "../src/GrantDetailsModal"; // Import modal component
import "../src/styles/DashboardPage.css";

const sampleGrants = [
    { name: "Cancer Research Fund", type: "Donation", amount: 50000, date: "2024-01-15", assignee: "Alice", status: "In Process" },
    { name: "Palliative Care Grant", type: "Sponsorship", amount: 75000, date: "2024-02-01", assignee: "Bob", status: "Obtained" }
];

const DashboardPage = () => {
    const [grants] = useState(sampleGrants);
    const [selectedGrant, setSelectedGrant] = useState(null);

    // Open modal with clicked grant details
    const openGrantDetails = (grant) => {
        setSelectedGrant(grant);
    };

    // Close modal
    const closeGrantDetails = () => {
        setSelectedGrant(null);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <h2 className="dashboard-title">Grants Dashboard</h2>

                {/* Grants Table */}
                <table className="grants-table">
                    <thead>
                        <tr>
                            <th>Grant Name</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Assignee</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grants.map((grant, index) => (
                            <tr key={index}>
                                <td>
                                    <button className="grant-title" onClick={() => openGrantDetails(grant)}>
                                        {grant.name}
                                    </button>
                                </td>
                                <td>{grant.type}</td>
                                <td>${grant.amount.toLocaleString()}</td>
                                <td>{grant.date}</td>
                                <td>{grant.assignee}</td>
                                <td>{grant.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Render the Modal */}
            {selectedGrant && <GrantDetailsModal grant={selectedGrant} onClose={closeGrantDetails} />}
        </div>
    );
};

export default DashboardPage;
