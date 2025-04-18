import React, { useState, useEffect, useRef } from "react";
import "../styles/GrantDetailsModal.css";

const GrantDetailsModal = ({ grant, onClose }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("");
    const [reasonNotes, setReasonNotes] = useState("");
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef(null);

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
        }
    };

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
                <button className="apply-button">Apply Now</button>
    
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
                    {grant.application_url ? `\nWebsite: ${grant.application_url}` : ""}
                    {!grant.funding_agency && !grant.application_url && "*Insert info here*"}
                </p>
    
                {/* New Section: Capture Notes */}
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
            </div>
        </div>
    );
};

export default GrantDetailsModal;
