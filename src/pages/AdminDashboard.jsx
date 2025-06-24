import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/DashboardPage.css";
import GrantDetailsModal from './GrantDetailsModal';
import AddGrantModal from './AddGrantModal'; // ✅ new import
import GrantStatusChart from '../components/GrantStatusChart';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect } from "react";
import supabase from "../supabase-client";

const handleExport = (type, grants) => {
  if (type === "pdf") {
    const doc = new jsPDF();

    const totalAmount = grants.reduce((sum, g) => sum + Number(g.amount || 0), 0);
    doc.setFontSize(22);
    doc.setTextColor(123, 44, 191);
    doc.text("Grant Status Overview", 60, 20);

    const now = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${now}`, 14, 30);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Total Grant Amount: $${totalAmount.toLocaleString()}`, 14, 40);

    autoTable(doc, {
      startY: 50,
      head: [["Grant Name", "Amount", "Status"]],
      body: grants.map((g) => [g.name, `$${g.amount.toLocaleString()}`, g.status]),
      headStyles: { fillColor: [123, 44, 191], textColor: "#fff", fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 240, 255] },
    });

    doc.save("admin-dashboard-report.pdf");
  }

  if (type === "excel") {
    const worksheet = XLSX.utils.json_to_sheet(
      grants.map((g) => ({
        Name: g.name,
        Amount: g.amount,
        Status: g.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grants");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "admin-grants.xlsx");
  }
};

const AdminDashboard = () => {
    const [grants, setGrants] = useState([]);
    useEffect(() => {
        const fetchGrants = async () => {
            const { data, error } = await supabase.from('Grant').select('*');
            if (error) console.error("Error fetching grants:", error);
            else setGrants(data);
  };
  fetchGrants();
}, []);

    const handleEdit = (id) => {
        alert(`Edit grant with ID: ${id}`);
    };

    const handleDelete = (id) => {
        setGrants(grants.filter(grant => grant.id !== id));
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // ✅ new modal state

    const handleAddGrant = async (newGrant) => {
        const { data, error } = await supabase.from('Grant').insert([{
            title: newGrant.name,
            amount: parseFloat(newGrant.amount),
            funding_agency: newGrant.type,
            assignee: newGrant.assignee,
            is_active: true, // or based on status
            deadline: newGrant.date,
        }]);
  if (error) console.error("Error adding grant:", error);
  else {
    setGrants(prev => [...prev, ...data]);
  }
};


    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="dashboard-content">
                <h2>Admin Dashboard</h2>
                <p>Admins can add, edit, and manage grants here.</p>

                <GrantStatusChart 
                grants={grants.map(g => ({
                    ...g,
                    status: g.is_active ? "In Process" : "Closed",
                }))}
                />

                <div className="export-button-row">
                    <button className="add-grant-button" onClick={() => setIsAddModalOpen(true)}>
                    ➕ Add New Grant
                </button>
                    <button onClick={() => handleExport("pdf", grants)} className="action-button print-pdf-button">
                        <i className="fas fa-file-pdf"></i> Print / PDF
                    </button>
                    <button onClick={() => handleExport("excel", grants)} className="action-button export-button">
                        <i className="fas fa-file-export"></i> Export
                    </button>
                </div>

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
                                <td>{grant.title}</td>
                                <td>${Number(grant.amount).toLocaleString()}</td>
                                <td>{grant.is_active ? "In Process" : "Closed"}</td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => {
                                            setSelectedGrant(grant);
                                            setShowModal(true);
                                        }}
                                    >
                                        ✏️ View
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(grant.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ View Grant Modal */}
            {showModal && (
                <GrantDetailsModal
                    grant={selectedGrant}
                    onClose={() => setShowModal(false)}
                />
            )}

            {/* ✅ Add Grant Modal */}
            {isAddModalOpen && (
                <AddGrantModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddGrant}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
