import React, { useState, useEffect } from "react";
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
import supabase from '../supabase-client';

const sampleGrants = [
    { name: "Cancer Research Fund", type: "Donation", amount: 50000, date: "2024-01-15", assignee: "Alice", status: "In Process" },
    { name: "Palliative Care Grant", type: "Sponsorship", amount: 75000, date: "2024-02-01", assignee: "Bob", status: "Obtained" }
  ];
  
  const DashboardPage = () => {
    const [grants, setGrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");
  
    // Fetch grants from Supabase
    useEffect(() => {
      const fetchGrants = async () => {
        try {
          setLoading(true);
          
          // Make sure to log any errors in the console
          console.log("Fetching grants from Supabase...");
          
          const { data, error } = await supabase
            .from('Grant')
            .select('*');
          
          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }
          
          console.log("Grants fetched:", data);
          
          // Transform data for dashboard display
          const formattedGrants = data.map(grant => ({
            name: grant.title || "Untitled Grant",
            type: grant.funding_agency || "Unknown",
            amount: grant.amount || 0,
            date: grant.deadline || formatDate(grant.crawled_date) || "No Date",
            assignee: grant.assignee || "Unassigned",
            status: grant.is_active ? "In Process" : "Closed",
            // Keep original data for modal
            original: grant
          }));
          
          setGrants(formattedGrants);
        } catch (err) {
          console.error("Failed to fetch grants:", err);
          setError('Failed to fetch grants: ' + (err.message || err));
          // Fall back to sample data
          setGrants(sampleGrants);
        } finally {
          setLoading(false);
        }
      };

      fetchGrants();
    }, []);
  
    // Helper function to format dates
    const formatDate = (dateString) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch (e) {
        return null;
      }
    };
  
    // Open modal with clicked grant details
    const openGrantDetails = (grant) => {
      setSelectedGrant(grant.original || grant);
    };
  
    // Close modal
    const closeGrantDetails = () => {
      setSelectedGrant(null);
    }
  
    // Calculate total grant amounts
    const totalAmount = grants.reduce((sum, grant) => sum + Number(grant.amount || 0), 0);
  
    const filteredGrants = grants.filter(grant => 
      grant.name?.toLowerCase().includes(search.toLowerCase()) &&
      (filterDate ? grant.date === filterDate : true) &&
      (filterType ? grant.type === filterType : true) &&
      (filterAssignee ? grant.assignee?.toLowerCase().includes(filterAssignee.toLowerCase()) : true)
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
  
          {/* Show loading state */}
          {loading && <p>Loading grants...</p>}
          
          {/* Show error if any */}
          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <p>Showing sample data instead.</p>
            </div>
          )}
  
          {/* Only show data when not loading */}
          {!loading && (
            <>
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
                  <option value="Public Health Agency of Canada">Health Canada</option>
                  <option value="Kindred Foundation">Kindred Foundation</option>
                  <option value="Ontario Trillium Foundation">Ontario Trillium</option>
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
                  {filteredGrants.length > 0 ? (
                    filteredGrants.map((grant, index) => (
                      <tr key={index}>
                        <td>
                          <button className="grant-title" onClick={() => openGrantDetails(grant)}>
                            {grant.name}
                          </button>
                        </td>
                        <td>{grant.type}</td>
                        <td>${Number(grant.amount).toLocaleString()}</td>
                        <td>{grant.date}</td>
                        <td>{grant.assignee}</td>
                        <td>{grant.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center'}}>No grants found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
  
        {/* Render the Modal */}
        {selectedGrant && <GrantDetailsModal grant={selectedGrant} onClose={closeGrantDetails} />}
      </div>
    );
  };
  
  export default DashboardPage;