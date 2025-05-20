import React, { useState } from "react";
import "../styles/GrantDetailsModal.css";
import supabase from "../supabase-client";

const AddGrantModal = ({ isOpen, onClose, onSubmit, existingGrant = null }) => {
  const [formData, setFormData] = useState({
    title: existingGrant?.title || "",
    funding_agency: existingGrant?.funding_agency || "",
    amount: existingGrant?.amount || "",
    deadline: existingGrant?.deadline || "",
    assignee: existingGrant?.assignee || "",
    description: existingGrant?.description || "",
    eligibility_criteria: existingGrant?.eligibility_criteria || "",
    application_url: existingGrant?.application_url || "",
    is_active: existingGrant?.is_active ?? true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format data properly for the database
      const grantData = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        is_active: !!formData.is_active,
        last_updated: new Date().toISOString()
      };
      
      let result;
      
      // Update existing grant or create a new one
      if (existingGrant?.grant_id) {
        const { data, error } = await supabase
          .from('Grant')
          .update(grantData)
          .eq('grant_id', existingGrant.grant_id)
          .select();
          
        if (error) throw error;
        result = data[0];
      } else {
        // Add new grant
        grantData.crawled_date = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('Grant')
          .insert([grantData])
          .select();
          
        if (error) throw error;
        result = data[0];
      }
      
      onSubmit && onSubmit(result);
      onClose();
    } catch (err) {
      console.error("Error saving grant:", err);
      setError(err.message || "Failed to save grant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{existingGrant ? 'Edit Grant' : 'Add New Grant'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="grant-form">
          <label>
            Grant Title
            <input
              type="text"
              name="title"
              placeholder="Grant Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Funding Agency
            <input
              type="text"
              name="funding_agency"
              placeholder="Funding Agency"
              value={formData.funding_agency}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Amount
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </label>

          <label>
            Deadline
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </label>

          <label>
            Assignee
            <input
              type="text"
              name="assignee"
              placeholder="Assignee Name"
              value={formData.assignee}
              onChange={handleChange}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              placeholder="Grant Description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Eligibility Criteria
            <textarea
              name="eligibility_criteria"
              placeholder="Eligibility criteria"
              value={formData.eligibility_criteria}
              onChange={handleChange}
              rows={3}
            />
          </label>

          <label>
            Application URL
            <input
              type="text"
              name="application_url"
              placeholder="Application URL"
              value={formData.application_url}
              onChange={handleChange}
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active/In Process
          </label>

          <div className="modal-actions">
            <button type="submit" className="form-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose} className="form-button cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGrantModal;
