import React, { useState } from "react";
import "./GrantDetailsModal.css";

const GrantDetailsModal = ({ grant, onClose }) => {
    const [isFullScreen, setIsFullScreen] = useState(false); // ✅ Fix: Add this state
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("");
    const [reasonNotes, setReasonNotes] = useState("");

    if (!grant) return null; 

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${isFullScreen ? "fullscreen" : ""}`}>
                {/* Modal Header */}
                <div className="modal-header">
                    <button className="close-button" onClick={onClose}>✖</button>
                    <button 
                        className="fullscreen-button" 
                        onClick={() => setIsFullScreen(!isFullScreen)}
                    >
                        {isFullScreen ? "Exit Fullscreen" : "Full Screen"}
                    </button>
                </div>
    
                <h2 className="modal-title">{grant.name}</h2>
                <button className="apply-button">Apply Now</button>
    
                <h3>About the Grant Program</h3>
                <p>*Insert program info here*</p>
    
                <h3>Eligibility</h3>
                <p>*Insert eligibility info here*</p>
    
                <h3>Award Information</h3>
                <p>*Insert info here*</p>
    
                <h3>Contact Information</h3>
                <p>*Insert info here*</p>
    
                {/* New Section: Capture Notes */}
                <h3>Capture Notes</h3>
                <textarea 
                    placeholder="Enter follow-up notes here..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="notes-textarea"
                ></textarea>
    
                {/* New Section: Select Category */}
                <h3>Select Category of Reason for Success/Loss</h3>
                <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="category-dropdown"
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
                <h3>Capture Notes for Reason of Success/Loss</h3>
                <textarea 
                    placeholder="Enter reason details here..." 
                    value={reasonNotes} 
                    onChange={(e) => setReasonNotes(e.target.value)} 
                    className="notes-textarea"
                ></textarea>
            </div>
        </div>
    );
};

export default GrantDetailsModal;
