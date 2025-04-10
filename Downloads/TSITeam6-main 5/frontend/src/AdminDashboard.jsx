import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../src/styles/DashboardPage.css";
import GrantDetailsModal from './GrantDetailsModal';


const AdminDashboard = () => {
    const [grants, setGrants] = useState([
        { id: 1, name: "Cancer Research Fund", amount: 50000, status: "Applied" },
        { id: 2, name: "Palliative Care Grant", amount: 75000, status: "Granted" }
    ]);

    const handleEdit = (id) => {
        alert(`Edit grant with ID: ${id}`);
    };

    const handleDelete = (id) => {
        setGrants(grants.filter(grant => grant.id !== id));
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState(null);


    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <h2>Admin Dashboard</h2>
                <p>Admins can add, edit, and manage grants here.</p>

                <button className="add-grant-button">➕ Add New Grant</button>

                <table className="grants-table">
                    <thead>
                        <tr>
                            <th>Grant Name</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grants.map((grant) => (
                            <tr key={grant.id}>
                                <td>{grant.name}</td>
                                <td>${grant.amount.toLocaleString()}</td>
                                <td>{grant.status}</td>
                                <td>
                                    <button className="edit-button" onClick={() => {
                                        setSelectedGrant(grant);
                                        setShowModal(true);
                                    }}>✏️ View</button>
                                    <button className="delete-button" onClick={() => handleDelete(grant.id)}>🗑️ Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <GrantDetailsModal
                  grant={selectedGrant}
                  onClose={() => setShowModal(false)}
                />  
            )}
        </div>
    );
};

export default AdminDashboard;
