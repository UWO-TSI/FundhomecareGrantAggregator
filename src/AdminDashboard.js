import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './DashboardPage.css';

const AdminDashboard = () => {
    const [grants, setGrants] = useState([]);
    const [newGrant, setNewGrant] = useState({ name: '', amount: '', deadline: '', status: '' });

    useEffect(() => {
        const storedGrants = JSON.parse(localStorage.getItem("grants")) || [];
        setGrants(storedGrants);
    }, []);

    const handleChange = (e) => {
        setNewGrant({ ...newGrant, [e.target.name]: e.target.value });
    };

    const addGrant = () => {
        if (newGrant.name && newGrant.amount && newGrant.deadline && newGrant.status) {
            const updatedGrants = [...grants, newGrant];
            setGrants(updatedGrants);
            localStorage.setItem("grants", JSON.stringify(updatedGrants));
            setNewGrant({ name: '', amount: '', deadline: '', status: '' }); // Reset form
        }
    };

    const deleteGrant = (index) => {
        const updatedGrants = grants.filter((_, i) => i !== index);
        setGrants(updatedGrants);
        localStorage.setItem("grants", JSON.stringify(updatedGrants));
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <h2>Admin Dashboard</h2>

                {/* Add New Grant Form */}
                <div className="add-grant-form">
                    <input type="text" name="name" placeholder="Grant Name" value={newGrant.name} onChange={handleChange} />
                    <input type="text" name="amount" placeholder="Amount" value={newGrant.amount} onChange={handleChange} />
                    <input type="date" name="deadline" placeholder="Deadline" value={newGrant.deadline} onChange={handleChange} />
                    <input type="text" name="status" placeholder="Status" value={newGrant.status} onChange={handleChange} />
                    <button onClick={addGrant}>Add Grant</button>
                </div>

                {/* Grant Table */}
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
                        {grants.length > 0 ? (
                            grants.map((grant, index) => (
                                <tr key={index}>
                                    <td>{grant.name}</td>
                                    <td>{grant.amount}</td>
                                    <td>{grant.deadline}</td>
                                    <td>{grant.status}</td>
                                    <td>
                                        <button onClick={() => deleteGrant(index)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No grants available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
