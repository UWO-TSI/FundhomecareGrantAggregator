import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/SettingsStyles.css';
import supabase from '../supabase-client';

const SettingsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('User')
        .select('user_id, email, role');

        console.log('Fetched users:', data);

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        console.log('Fetched users:', data);
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (user_id, newRole) => {
  console.log(`Updating user ${user_id} to role: ${newRole}`);

  const { error, data } = await supabase
    .from('User')
    .update({ role: newRole })
    .eq('user_id', user_id)

  if (error) {
    console.error('❌ Error updating role:', error);
  } else {
    console.log('✅ Role updated successfully:', data);
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.user_id === user_id ? { ...user, role: newRole } : user
      )
    );
  }
};


  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h2>Settings: Manage Assignee Roles</h2>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table className="settings-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Current Role</th>
                <th>Assign New Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id}>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const newRole = e.target.value;

                        setUsers(prevUsers =>
                          prevUsers.map(u =>
                            u.user_id === user.user_id ? { ...u, role: newRole } : u
                          )
                        );

                        handleRoleChange(user.user_id, newRole);
                      }}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
