import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/DashboardPage.css";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import GrantDetailsModal from './GrantDetailsModal';
import GrantStatusChart from '../components/GrantStatusChart';

const sampleGrants = [
    { name: "Cancer Research Fund", type: "Donation", amount: 50000, date: "2024-01-15", assignee: "Alice", status: "In Process" },
    { name: "Palliative Care Grant", type: "Sponsorship", amount: 75000, date: "2024-02-01", assignee: "Bob", status: "Obtained" }
  ];
  
  const DashboardPage = () => {
    const [grants, setGrants] = useState([]);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");
  
    useEffect(() => {
      setGrants(sampleGrants);
    }, []);
  
   // Open modal with clicked grant details
   const openGrantDetails = (grant) => {
    setSelectedGrant(grant);
  };
  
  // Close modal
  const closeGrantDetails = () => {
    setSelectedGrant(null);
  }
  
    // Calculate total grant amounts
    const totalAmount = grants.reduce((sum, grant) => sum + grant.amount, 0);
  
    const filteredGrants = grants.filter(grant => 
      grant.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDate ? grant.date === filterDate : true) &&
      (filterType ? grant.type === filterType : true) &&
      (filterAssignee ? grant.assignee.toLowerCase().includes(filterAssignee.toLowerCase()) : true)
    );
  
    const handleExport = (type) => {
      if (type === "pdf") {
        const doc = new jsPDF();
    
        // Load image
        const img = new Image();
        img.src = "/fundhomecarelogo.png"; 
    
        img.onload = function () {
          // Add the logo to the PDF
          doc.addImage(img, "PNG", 14, 10, 40, 15); // (image, format, x, y, width, height)
    
          // Title
          doc.setFontSize(18);
          doc.setTextColor(80, 0, 140);
          doc.text("Grants Report", 60, 20);
    
          // Timestamp
          const now = new Date();
          const formattedDate = now.toLocaleString();
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Generated: ${formattedDate}`, 14, 30);
    
          // Table
          autoTable(doc, {
            startY: 35,
            head: [["Grant Name", "Type", "Amount", "Date", "Assignee", "Status"]],
            body: filteredGrants.map((g) => [
              g.name,
              g.type,
              `$${g.amount.toLocaleString()}`,
              g.date,
              g.assignee,
              g.status,
            ]),
            theme: "grid",
            styles: {
              font: "helvetica",
              fontSize: 10,
              textColor: "#333333",
            },
            headStyles: {
              fillColor: [138, 43, 226],
              textColor: "#ffffff",
              fontStyle: "bold",
            },
            alternateRowStyles: {
              fillColor: [245, 240, 255],
            },
          });
    
          // Footer
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.text("Approved by: _______________________", 14, doc.lastAutoTable.finalY + 20);
    
          doc.save("grants-report.pdf");
        };
      }
    
      if (type === "excel") {
        const worksheetData = filteredGrants.map((g) => ({
          Name: g.name,
          Type: g.type,
          Amount: g.amount,
          Date: g.date,
          Assignee: g.assignee,
          Status: g.status,
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Grants");
    
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "grants-report.xlsx");
      }
    };
    
    
  
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-content">
          <h2>Grants Dashboard</h2>
  
          <p><strong>Total Grant Amount:</strong> ${totalAmount.toLocaleString()}</p>
  
          <GrantStatusChart grants={filteredGrants} />  {/* ✅ Insert chart */}
  
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
          <div className="export-buttons"> 
            <button onClick={() => handleExport("pdf")} className="export-button pdf">📄 PRINT / PDF</button>
            <button onClick={() => handleExport("excel")} className="export-button excel">⬇️ EXPORT</button>
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