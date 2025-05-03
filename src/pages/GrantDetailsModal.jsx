import React, { useState, useEffect, useRef } from "react";
import "../styles/GrantDetailsModal.css";
import supabase from "../supabase-client";

const GrantDetailsModal = ({ grant, onClose, scrollToNotes = false }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("");
    const [reasonNotes, setReasonNotes] = useState("");
    const [isClosing, setIsClosing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'success', 'error'
    const modalRef = useRef(null);
    const notesRef = useRef(null);

    const getGrantId = () => {
        if (grant.grant_id) return grant.grant_id;
        if (grant.id) return grant.id;
        if (grant.original && grant.original.grant_id) return grant.original.grant_id;
        
        console.error("Could not find grant_id in:", grant);
        return null;
    };

    useEffect(() => {
        if (grant) {
            fetchGrantDetails();
        }
    }, [grant]);

    useEffect(() => {
        if (scrollToNotes && notesRef.current) {
            setTimeout(() => {
                notesRef.current.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }, [scrollToNotes]);

    const fetchGrantDetails = async () => {
        try {
            const grantId = getGrantId();
            
            if (!grantId) {
                console.error("Grant ID not found");
                return;
            }
            
            console.log("Fetching details for grant ID:", grantId);
            
            const { data, error } = await supabase
                .from('GrantDetails')
                .select('*')
                .eq('grant_id', grantId)
                .single();
            
            if (error && error.code !== 'PGRST116') { 
                console.error("Error fetching grant details:", error);
                return;
            }
            
            if (data) {
                setNotes(data.notes || "");
                setCategory(data.category || "");
                setReasonNotes(data.reason_notes || "");
                console.log("Loaded grant details:", data);
            } else {
                console.log("No existing details found for grant ID:", grantId);
            }
        } catch (error) {
            console.error("Error loading saved data:", error);
        }
    };

    const saveGrantDetails = async () => {
        try {
            setIsSaving(true);
            setSaveStatus('saving');
            
            const grantId = getGrantId();
            
            if (!grantId) {
                console.error("Grant ID not found");
                setIsSaving(false);
                setSaveStatus('error');
                return;
            }
            
            console.log("Saving details for grant ID:", grantId);
            
            const { data: existingData, error: checkError } = await supabase
                .from('GrantDetails')
                .select('id')
                .eq('grant_id', grantId)
                .single();
                
            const detailsData = {
                grant_id: grantId,
                notes,
                category,
                reason_notes: reasonNotes,
                last_updated: new Date().toISOString()
            };
            
            let saveError;
            
            if (existingData) {
                console.log("Updating existing record:", existingData.id);
                const { error } = await supabase
                    .from('GrantDetails')
                    .update(detailsData)
                    .eq('grant_id', grantId);
                    
                saveError = error;
            } else {
                console.log("Inserting new record for grant ID:", grantId);
                const { error } = await supabase
                    .from('GrantDetails')
                    .insert([detailsData]);
                    
                saveError = error;
            }
            
            if (saveError) {
                console.error("Error saving grant details:", saveError);
                setSaveStatus('error');
                alert("Failed to save grant details. Please try again.");
            } else {
                console.log("Grant details saved successfully");
                setSaveStatus('success');
                
                setTimeout(() => {
                    if (setSaveStatus) {
                        setSaveStatus(null);
                    }
                }, 3000);
            }
        } catch (error) {
            console.error("Error saving data:", error);
            setSaveStatus('error');
            alert("An unexpected error occurred. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle escape key press
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleEscKey);
        
        // Cleanup event listener when component unmounts
        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, []);

    // Handle closing with animation
    const handleClose = () => {
        // Save the data before closing
        if (notes || category || reasonNotes) {
            saveGrantDetails();
        }
        
        setIsClosing(true);
        // Wait for animation to complete before actually closing
        setTimeout(() => {
            onClose();
        }, 300); 
    };

    // Handle outside click
    const handleOverlayClick = (event) => {
        // Only close if clicking the overlay, not the modal content
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            handleClose();
        }
    };

    // apply button 
    const handleApplyClick = () => {
        if (grant && grant.application_url) {
            let url = grant.application_url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert('Application URL is not available for this grant.');
        }
    };

    if (!grant) return null; 

    const styles = {
        heading: {
            color: "#333", 
            backgroundColor: "#7B2CBF",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            display: "inline-block",
            marginTop: "15px",
            marginBottom: "10px"
        },
        paragraph: {
            color: "#333",
            marginBottom: "15px"
        },
        closeButton: {
            color: "#333",
            backgroundColor: "transparent",
            fontSize: "24px"
        },
        title: {
            color: "#7B2CBF",
            fontSize: "22px",
            fontWeight: "bold",
            marginTop: "15px",
            marginBottom: "15px"
        },
        saveButton: {
            backgroundColor: "#7B2CBF",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            border: "none",
            fontSize: "14px",
            marginTop: "15px"
        },
        saveStatus: {
            marginLeft: "10px",
            fontSize: "14px",
            fontStyle: "italic"
        }
    };

    // Determine save button text and style based on status
    let saveButtonText = "Save Notes";
    let saveStatusElement = null;
    
    if (isSaving) {
        saveButtonText = "Saving...";
    } else if (saveStatus === 'success') {
        saveStatusElement = <span style={{...styles.saveStatus, color: 'green'}}>Saved successfully!</span>;
    } else if (saveStatus === 'error') {
        saveStatusElement = <span style={{...styles.saveStatus, color: 'red'}}>Save failed!</span>;
    }

    return (
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleOverlayClick}>
            <div ref={modalRef} className={`modal-content ${isFullScreen ? "fullscreen" : ""} ${isClosing ? 'closing' : ''}`}>
                {/* Modal Header */}
                <div className="modal-header">
                    <button 
                        className="close-button" 
                        onClick={handleClose} 
                        style={styles.closeButton}
                    >
                        ✖
                    </button>
                    <button 
                        className="fullscreen-button" 
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? "Exit Fullscreen" : "Full Screen"}
                    </button>
                </div>
    
                <h2 style={styles.title}>{grant.title || grant.name}</h2>
                <button 
                    className="apply-button" 
                    onClick={handleApplyClick}
                    disabled={!grant.application_url}
                    title={grant.application_url ? "Click to apply" : "Application URL not available"}
                >
                    Apply Now
                </button>
    
                <h3 style={styles.heading}>About the Grant Program</h3>
                <p style={styles.paragraph}>{grant.description || "*Insert program info here*"}</p>
    
                <h3 style={styles.heading}>Eligibility</h3>
                <p style={styles.paragraph}>{grant.eligibility_criteria || "*Insert eligibility info here*"}</p>
    
                <h3 style={styles.heading}>Award Information</h3>
                <p style={styles.paragraph}>
                    {grant.amount ? `Amount: $${Number(grant.amount).toLocaleString()}` : ""}
                    {grant.deadline ? `\nDeadline: ${grant.deadline}` : ""}
                    {!grant.amount && !grant.deadline && "*Insert info here*"}
                </p>
    
                <h3 style={styles.heading}>Contact Information</h3>
                <p style={styles.paragraph}>
                    {grant.funding_agency ? `Organization: ${grant.funding_agency}` : ""}
                    {grant.application_url ? (
                        <>
                            Website: <a 
                                href={grant.application_url.startsWith('http') ? grant.application_url : `https://${grant.application_url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                {grant.application_url}
                            </a>
                        </>
                    ) : ""}
                    {!grant.funding_agency && !grant.application_url && "*Insert info here*"}
                </p>
    
                {/* Notes Section - with ref for scrolling */}
                <div id="notes-section" ref={notesRef}>
                    <h3 style={styles.heading}>Capture Notes</h3>
                    <textarea 
                        placeholder="Enter follow-up notes here..." 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        className="notes-textarea"
                        style={{color: "#333", backgroundColor: "#f8f8f8"}}
                    ></textarea>
        
                    {/* New Section: Select Category */}
                    <h3 style={styles.heading}>Select Category of Reason for Success/Loss</h3>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="category-dropdown"
                        style={{color: "#333", backgroundColor: "#f8f8f8"}}
                    >
                        <option value="">Select a category</option>
                        <option value="Relationship">Relationship</option>
                        <option value="FHC too small for sponsor">FHC too small for sponsor</option>
                        <option value="Lack of FHC social presence">Lack of FHC social presence</option>
                        <option value="Persistent follow-up">Persistent follow-up</option>
                        <option value="Alignment to cause">Alignment to cause</option>
                        <option value="Added to Budget in time">Added to Budget in time</option>
                        <option value="Missed being added to budget">Missed being added to budget</option>
                    </select>
        
                    {/* New Section: Reason Notes */}
                    <h3 style={styles.heading}>Capture Notes for Reason of Success/Loss</h3>
                    <textarea 
                        placeholder="Enter reason details here..." 
                        value={reasonNotes} 
                        onChange={(e) => setReasonNotes(e.target.value)} 
                        className="notes-textarea"
                        style={{color: "#333", backgroundColor: "#f8f8f8"}}
                    ></textarea>
                    
                    {/* Save Button */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                            onClick={saveGrantDetails} 
                            disabled={isSaving}
                            style={styles.saveButton}
                        >
                            {saveButtonText}
                        </button>
                        {saveStatusElement}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrantDetailsModal;
