import React, { useState } from 'react';
import Sidebar from './Sidebar'; // ✅ Import the Sidebar
import './styles/SettingsStyles.css';

const initialUsers = [
  { id: 1, name: 'Rohit', role: 'Assignee' },
  { id: 2, name: 'Denise', role: 'Viewer' },
  { id: 3, name: 'Alex', role: 'Admin' },
];

const SettingsPage = () => {
  const [users, setUsers] = useState(initialUsers);

  const handleRoleChange = (id, newRole) => {
    const updatedUsers = users.map(user =>
      user.id === id ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers);
  };

  return (
    <div className="dashboard-container"> {/* ✅ reuse layout container */}
      <Sidebar /> {/* ✅ Add the sidebar */}
      <div className="dashboard-content">  {/* ✅ mimic layout for consistency */}
        <h2>Settings: Manage Assignee Roles</h2>
        <table className="settings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Current Role</th>
              <th>Assign New Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Assignee">Assignee</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SettingsPage;
