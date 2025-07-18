import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { FaSearch, FaPlus, FaChartBar, FaSyncAlt } from 'react-icons/fa';
import Modal from '../Modal';
import './UserStyles.css';
import CreateUser from './CreateUser';
import UpdateUser from './UpdateUser';
import UserStats from './UserStats';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });
  const [modal, setModal] = useState({
    show: false,
    type: '',
    data: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setLoading(false);
      
      setNotification({
        show: true,
        message: 'Failed to load users. Please try again later.',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({
          show: false,
          message: '',
          type: ''
        });
      }, 10000);
    }
  };

  const handleEditUser = (userEmail) => {
    setModal({
      show: true,
      type: 'edit',
      data: userEmail
    });
  };

  const handleCreateUser = () => {
    setModal({
      show: true,
      type: 'create',
      data: null
    });
  };

  const handleViewStats = () => {
    setModal({
      show: true,
      type: 'stats',
      data: users
    });
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: '',
      data: null
    });
  };

  const renderModalContent = () => {
    if (!modal.show) return null;
    
    switch (modal.type) {
      case 'create':
        return (
          <CreateUser 
            onSuccess={() => {
              fetchUsers();
              closeModal();
              setNotification({
                show: true,
                message: 'User created successfully!',
                type: 'success'
              });
            }}
            onClose={closeModal}
          />
        );
      case 'edit':
        return (
          <UpdateUser 
            email={modal.data}
            onSuccess={() => {
              fetchUsers();
              closeModal();
              setNotification({
                show: true,
                message: 'User updated successfully!',
                type: 'success'
              });
            }}
            onClose={closeModal}
          />
        );
      case 'stats':
        return (
          <UserStats 
            users={modal.data}
            onClose={closeModal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-component">
      <div className="user-header">
        <div className="header-left">
          <button 
            className="stats-btn"
            onClick={handleViewStats}
          >
            <FaChartBar className="btn-icon" />
            View Stats
          </button>
        </div>
        
        <h2>User Management</h2>
        
        <div className="header-right">
          <button 
            className="create-btn"
            onClick={handleCreateUser}
          >
            <FaPlus className="btn-icon" />
            Create User
          </button>
        </div>
      </div>
      
      <div className="user-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button 
          className="refresh-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          <FaSyncAlt className={`btn-icon ${loading ? 'spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="close-btn"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            &times;
          </button>
        </div>
      )}
      
      {loading && <div className="loading">Loading users...</div>}
      
      {error && !loading && <div className="error-message">{error}</div>}
      
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="empty-message">
          {searchTerm ? 'No matching users found' : 'No users found'}
        </div>
      )}
      
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditUser(user.email)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal will only render when modal.show is true */}
      {modal.show && (
        <Modal show={modal.show} onClose={closeModal}>
          {renderModalContent()}
        </Modal>
      )}
    </div>
  );
};

export default ListUsers;