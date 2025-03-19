import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/DashboardPage.css";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const sampleGrants = [
    { name: "Cancer Research Fund", type: "Donation", amount: 50000, date: "2024-01-15", assignee: "Alice", status: "In Process" },
    { name: "Palliative Care Grant", type: "Sponsorship", amount: 75000, date: "2024-02-01", assignee: "Bob", status: "Obtained" }
];

const DashboardPage = () => {

    

    const [grants, setGrants] = useState(sampleGrants);
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");


    // Calculate total grant amounts
    const totalAmount = grants.reduce((sum, grant) => sum + grant.amount, 0);

    const filteredGrants = grants.filter(grant => 
        grant.name.toLowerCase().includes(search.toLowerCase()) &&
        (filterDate ? grant.date === filterDate : true) &&
        (filterType ? grant.type === filterType : true) &&
        (filterAssignee ? grant.assignee.toLowerCase().includes(filterAssignee.toLowerCase()) : true)
    );

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <h2>Welcome, {session?.user?.email}</h2>

                {/* Total Grant Amount */}
                <p><strong>Total Grant Amount:</strong> ${totalAmount.toLocaleString()}</p>

                {/* Search & Filters */}
                <div className="filter-container">
                    <input 
                        type="text" 
                        placeholder="Search grants..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="filter-input"
                    />
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)} 
                        className="filter-input"
                    />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-input">
                        <option value="">All Types</option>
                        <option value="Donation">Donation</option>
                        <option value="Sponsorship">Sponsorship</option>
                        <option value="In-Kind">In-Kind</option>
                    </select>
                    <input 
                        type="text" 
                        placeholder="Filter by Assignee..." 
                        value={filterAssignee} 
                        onChange={(e) => setFilterAssignee(e.target.value)} 
                        className="filter-input"
                    />
                </div>

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
                        {filteredGrants.map((grant, index) => (
                            <tr key={index}>
                                <td>{grant.name}</td>
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
        </div>
    );
};

export default DashboardPage;