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
import AddGrantModal from './AddGrantModal';

const sampleGrants = [
    { name: "Cancer Research Fund", type: "Donation", amount: 50000, date: "2024-01-15", assignee: "Alice", status: "In Process" },
    { name: "Palliative Care Grant", type: "Sponsorship", amount: 75000, date: "2024-02-01", assignee: "Bob", status: "Obtained" }
  ];
  
  const DashboardPage = () => {
    const { userRole } = UserAuth();
    const [grants, setGrants] = useState([]);
    const [grantDetails, setGrantDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGrant, setSelectedGrant] = useState(null);
    const [shouldScrollToNotes, setShouldScrollToNotes] = useState(false);
    const [search, setSearch] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterAssignee, setFilterAssignee] = useState("");
    const [showAddGrantModal, setShowAddGrantModal] = useState(false);
    const [grantToEdit, setGrantToEdit] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [grantToDelete, setGrantToDelete] = useState(null);
  
    useEffect(() => {
      fetchGrants();
    }, []);
  
    const fetchGrants = async () => {
      try {
        setLoading(true);
        
        console.log("Fetching grants from Supabase...");
        
        const { data, error } = await supabase
          .from('Grant')
          .select('*');
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Grants fetched:", data);
        
        const formattedGrants = data.map(grant => ({
          name: grant.title || "Untitled Grant",
          type: grant.funding_agency || "Unknown",
          amount: grant.amount || 0,
          date: grant.deadline || formatDate(grant.crawled_date) || "No Date",
          assignee: grant.assignee || "Unassigned",
          status: grant.is_active ? "In Process" : "Closed",
          original: grant
        }));
        
        setGrants(formattedGrants);
        
        await fetchAllGrantDetails(data);
      } catch (err) {
        console.error("Failed to fetch grants:", err);
        setError('Failed to fetch grants: ' + (err.message || err));
        setGrants(sampleGrants);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchAllGrantDetails = async (grantsData) => {
      try {
        if (!grantsData || grantsData.length === 0) return;
        
        const grantIds = grantsData.map(grant => grant.grant_id);
        
        const { data, error } = await supabase
          .from('GrantDetails')
          .select('*')
          .in('grant_id', grantIds);
        
        if (error) {
          console.error("Error fetching grant details:", error);
          return;
        }
        
        const detailsMap = {};
        if (data) {
          data.forEach(detail => {
            detailsMap[detail.grant_id] = detail;
          });
        }
        
        setGrantDetails(detailsMap);
      } catch (error) {
        console.error("Error fetching all grant details:", error);
      }
    };
  
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
    const openGrantDetails = (grant, scrollToNotes = false) => {
      setSelectedGrant(grant.original || grant);
      setShouldScrollToNotes(scrollToNotes);
    };
  
    const closeGrantDetails = async () => {
      if (selectedGrant) {
        // Refresh grant details for this specific grant
        try {
          const grantId = selectedGrant.id || selectedGrant.grant_id;
          
          if (grantId) {
            const { data, error } = await supabase
              .from('GrantDetails')
              .select('*')
              .eq('grant_id', grantId)
              .single();
            
            if (!error && data) {
              // Update the local state with the new details
              setGrantDetails(prev => ({
                ...prev,
                [grantId]: data
              }));
            }
          }
        } catch (error) {
          console.error("Error refreshing grant details:", error);
        }
      }
      
      setSelectedGrant(null);
    };
  
    // Calculate total grant amounts
    const totalAmount = grants.reduce((sum, grant) => sum + Number(grant.amount || 0), 0);
  
    const filteredGrants = grants.filter(grant => 
      grant.name?.toLowerCase().includes(search.toLowerCase()) &&
      (filterDate ? grant.date === filterDate : true) &&
      (filterType ? grant.type === filterType : true) &&
      (filterAssignee ? grant.assignee?.toLowerCase().includes(filterAssignee.toLowerCase()) : true)
    );
  
    // Handlers for the add/edit modal
    const handleOpenAddGrantModal = () => {
      setGrantToEdit(null);
      setShowAddGrantModal(true);
    };

    const handleEditGrant = (grant) => {
      setGrantToEdit(grant.original || grant);
      setShowAddGrantModal(true);
    };

    const handleCloseAddGrantModal = () => {
      setShowAddGrantModal(false);
      setGrantToEdit(null);
    };

    const handleGrantSubmit = async (updatedGrant) => {
      console.log("Grant saved:", updatedGrant);
      // Refresh the grants list
      await fetchGrants();
    };

    const handleDeleteGrant = (grant) => {
      setGrantToDelete(grant.original || grant);
      setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteGrant = async () => {
      if (!grantToDelete) return;
      
      try {
        setLoading(true);
        const { error } = await supabase
          .from('Grant')
          .delete()
          .eq('grant_id', grantToDelete.grant_id);
          
        if (error) {
          console.error("Error deleting grant:", error);
          alert("Failed to delete grant: " + error.message);
        } else {
          console.log("Grant deleted successfully");
          // Also delete related details if they exist
          await supabase
            .from('GrantDetails')
            .delete()
            .eq('grant_id', grantToDelete.grant_id);
            
          // Refresh grant list
          await fetchGrants();
        }
      } catch (err) {
        console.error("Error during delete:", err);
      } finally {
        setIsDeleteConfirmOpen(false);
        setGrantToDelete(null);
        setLoading(false);
      }
    };

    const cancelDelete = () => {
      setIsDeleteConfirmOpen(false);
      setGrantToDelete(null);
    };

    const handleExport = (type) => {
      if (type === "pdf") {
        try {
          const doc = new jsPDF();
          let pdfGenerated = false;
    
          const chartElement = document.querySelector('canvas');
          let chartDataURL = null;
    
          if (chartElement) {
            try {
              chartDataURL = chartElement.toDataURL('image/png');
            } catch (err) {
              console.error("Error capturing chart:", err);
            }
          }
    
          const logoPath = import.meta.env.BASE_URL + "src/assets/fundhomecarelogo.png";
          const img = new Image();
          img.crossOrigin = "Anonymous"; 
          img.src = "/src/assets/fundhomecarelogo.png"; 
    
          const generatePDF = () => {
            if (pdfGenerated) return;
            pdfGenerated = true;
            
            try {
              if (img.complete && img.naturalHeight !== 0) {
                try {
                  doc.addImage(img, "PNG", 14, 10, 40, 15);
                } catch (err) {
                  console.error("Error adding logo to PDF:", err);
                }
              }
    
              doc.setFontSize(22);
              doc.setTextColor(123, 44, 191); 
              doc.text("Grant Status Overview", 60, 20);
    
              const now = new Date();
              const formattedDate = now.toLocaleString();
              doc.setFontSize(10);
              doc.setTextColor(100);
              doc.text(`Generated: ${formattedDate}`, 14, 30);
    
              doc.setFontSize(14);
              doc.setTextColor(0);
              doc.text(`Total Grant Amount: $${totalAmount.toLocaleString()}`, 14, 40);
              
              let yPosition = 45;
              if (chartDataURL) {
                try {
                  doc.addImage(chartDataURL, 'PNG', 60, yPosition, 80, 80);
                  yPosition += 90;
                } catch (err) {
                  console.error("Error adding chart to PDF:", err);
                  yPosition += 10;
                }
              } else {
                yPosition += 10;
              }
    
              // Table
              autoTable(doc, {
                startY: yPosition,
                head: [["Grant Name", "Type", "Amount", "Date", "Assignee", "Status"]],
                body: filteredGrants.map((g) => [
                  g.name,
                  g.type,
                  `$${Number(g.amount || 0).toLocaleString()}`,
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
                  fillColor: [123, 44, 191], // Purple color
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
              doc.text("Fund Home Care Canada", 14, doc.lastAutoTable.finalY + 20);
              doc.text("Approved by: _______________________", 120, doc.lastAutoTable.finalY + 20);
    
              // Save the PDF
              doc.save("grant-dashboard-report.pdf");
            } catch (err) {
              console.error("Error generating PDF:", err);
              alert("There was an error generating the PDF. Please try again.");
            }
          };
    
          img.onload = generatePDF;
          
          img.onerror = () => {
            console.error("Failed to load logo image");
            generatePDF(); 
          };
          
          setTimeout(generatePDF, 1000);
        } catch (err) {
          console.error("Error in PDF generation:", err);
          alert("There was an error generating the PDF. Please try again.");
        }
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
              <div className="filter-export-buttons">
                <button onClick={() => handleExport("pdf")} className="action-button print-pdf-button">
                  <i className="fas fa-print"></i> PRINT / PDF
                </button>
                <button onClick={() => handleExport("excel")} className="action-button export-button">
                  <i className="fas fa-file-excel"></i> EXPORT
                </button>
                {userRole === 'admin' && (
                  <button onClick={handleOpenAddGrantModal} className="action-button add-grant-button">
                    <i className="fas fa-plus"></i> ADD GRANT
                  </button>
                )}
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
                    <th>Notes</th>
                    {userRole === 'admin' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredGrants.length > 0 ? (
                    filteredGrants.map((grant, index) => {
                      const grantId = grant.original?.grant_id;
                      const hasNotes = grantId && grantDetails[grantId];
                      
                      return (
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
                          <td>
                            {hasNotes ? (
                              <span 
                                className="notes-indicator" 
                                title="Click to view notes"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click from triggering
                                  openGrantDetails(grant, true);
                                }}
                              >
                                📝
                              </span>
                            ) : (
                              <span 
                                className="notes-indicator" 
                                title="No notes yet - click to add"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click from triggering
                                  openGrantDetails(grant, true);
                                }}
                                style={{ opacity: 0.4 }}
                              >
                                📝
                              </span>
                            )}
                          </td>
                          {userRole === 'admin' && (
                            <td className="action-buttons">
                              <button 
                                className="edit-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditGrant(grant);
                                }}
                                title="Edit Grant"
                              >
                                ✏️
                              </button>
                              <button 
                                className="delete-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGrant(grant);
                                }}
                                title="Delete Grant"
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={userRole === 'admin' ? "8" : "7"} style={{textAlign: 'center'}}>No grants found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
  
        {/* Render the Grant Details Modal */}
        {selectedGrant && (
          <GrantDetailsModal 
            grant={selectedGrant} 
            onClose={closeGrantDetails}
            scrollToNotes={shouldScrollToNotes}
          />
        )}

        {/* Render the Add/Edit Grant Modal */}
        {showAddGrantModal && (
          <AddGrantModal
            isOpen={showAddGrantModal}
            onClose={handleCloseAddGrantModal}
            onSubmit={handleGrantSubmit}
            existingGrant={grantToEdit}
          />
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <h2>Confirm Delete</h2>
              <p>Are you sure you want to delete the grant "{grantToDelete?.title || 'Unknown'}"?</p>
              <p>This action cannot be undone.</p>
              
              <div className="modal-actions">
                <button onClick={confirmDeleteGrant} className="form-button delete">Delete</button>
                <button onClick={cancelDelete} className="form-button cancel">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default DashboardPage;