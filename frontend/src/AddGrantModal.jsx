import React, { useState } from "react";
import "../src/styles/GrantDetailsModal.css";

const AddGrantModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Donation",
    amount: "",
    status: "In Process",
    assignee: "",
    date: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      name: "",
      type: "Donation",
      amount: "",
      status: "In Process",
      assignee: "",
      date: "",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Grant</h2>
        <form onSubmit={handleSubmit} className="grant-form">
          <input
            type="text"
            name="name"
            placeholder="Grant Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Donation">Donation</option>
            <option value="Sponsorship">Sponsorship</option>
            <option value="In-Kind">In-Kind</option>
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="In Process">In Process</option>
            <option value="Applied">Applied</option>
            <option value="Granted">Granted</option>
            <option value="Not Granted">Not Granted</option>
          </select>

          <input
            type="text"
            name="assignee"
            placeholder="Assignee Name"
            value={formData.assignee}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <div className="modal-actions">
            <button type="submit" className="form-button">Submit</button>
            <button type="button" onClick={onClose} className="form-button cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGrantModal;
