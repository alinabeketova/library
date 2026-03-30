import React, { useState, useEffect } from 'react';
import { validators } from './validators';
import UserDetailsModal from './UserDetailsModal';

const API_BASE_URL = 'http://127.0.0.1:8001';

const UsersManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    email: '',
    passport_number: '',
    password: '',
    address: ''
  });
  const [editUserData, setEditUserData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    passport_number: '',
    address: '',
    password: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/user_student/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  const validateNewUser = (data) => {
    const errors = {};
    
    const firstNameError = validators.user.first_name(data.first_name);
    if (firstNameError) errors.first_name = firstNameError;

    const lastNameError = validators.user.last_name(data.last_name);
    if (lastNameError) errors.last_name = lastNameError;

    const middleNameError = validators.user.middle_name(data.middle_name);
    if (middleNameError) errors.middle_name = middleNameError;

    const dobError = validators.user.date_of_birth(data.date_of_birth);
    if (dobError) errors.date_of_birth = dobError;

    const emailError = validators.user.email(data.email);
    if (emailError) errors.email = emailError;

    const passportError = validators.user.passport_number(data.passport_number);
    if (passportError) errors.passport_number = passportError;

    const passwordError = validators.user.password(data.password);
    if (passwordError) errors.password = passwordError;

    const addressError = validators.user.address(data.address);
    if (addressError) errors.address = addressError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const validateEditUser = (data) => {
    const errors = {};
    
    const firstNameError = validators.user.first_name(data.first_name);
    if (firstNameError) errors.first_name = firstNameError;

    const lastNameError = validators.user.last_name(data.last_name);
    if (lastNameError) errors.last_name = lastNameError;

    const middleNameError = validators.user.middle_name(data.middle_name);
    if (middleNameError) errors.middle_name = middleNameError;

    const passportError = validators.user.passport_number(data.passport_number);
    if (passportError) errors.passport_number = passportError;

    const addressError = validators.user.address(data.address);
    if (addressError) errors.address = addressError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateNewUser(newUser);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setSubmitLoading(true);
    setFormErrors({});

    try {
      const params = new URLSearchParams();
      params.append('first_name', newUser.first_name.trim());
      params.append('last_name', newUser.last_name.trim());
      if (newUser.middle_name.trim()) params.append('middle_name', newUser.middle_name.trim());
      params.append('date_of_birth', newUser.date_of_birth);
      params.append('email', newUser.email.trim());
      params.append('passport_number', newUser.passport_number.trim());
      params.append('password', newUser.password);
      if (newUser.address.trim()) params.append('address', newUser.address.trim());
      params.append('role_id', '1'); 

      const response = await fetch(`${API_BASE_URL}/user?${params.toString()}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
      }

      setShowAddForm(false);
      setNewUser({
        first_name: '',
        last_name: '',
        middle_name: '',
        date_of_birth: '',
        email: '',
        passport_number: '',
        password: '',
        address: ''
      });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Не удалось добавить пользователя');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateEditUser(editUserData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setSubmitLoading(true);
    setFormErrors({});

    try {
      const params = new URLSearchParams();
      params.append('email', editingUser.email);
      params.append('password', editUserData.password);
      
      params.append('first_name', editUserData.first_name.trim());
      params.append('last_name', editUserData.last_name.trim());
      if (editUserData.middle_name.trim()) params.append('middle_name', editUserData.middle_name.trim());
      params.append('passport_number', editUserData.passport_number.trim());
      if (editUserData.address.trim()) params.append('address', editUserData.address.trim());

      const response = await fetch(`${API_BASE_URL}/user?${params.toString()}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
      }

      setShowEditForm(false);
      setEditingUser(null);
      setEditUserData({
        first_name: '',
        last_name: '',
        middle_name: '',
        passport_number: '',
        address: '',
        password: ''
      });
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Не удалось обновить пользователя');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
    setDeleteLoading(userId);
    try {
      const response = await fetch(`${API_BASE_URL}/user_student/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Ошибка HTTP: ${response.status}`);
      }
      
      fetchUsers();
    } catch (err) {
      setError('Не удалось удалить пользователя: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setEditUserData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      middle_name: user.middle_name || '',
      passport_number: user.passport_number || '',
      address: user.address || '',
      password: ''
    });
    setShowEditForm(true);
    setShowAddForm(false);
    setFormErrors({});
    setError(null);
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
  };

  const renderFieldError = (fieldName) => {
    if (formErrors[fieldName]) {
      return (
        <span className="AdminDashboard-fieldError">
          <i className="fas fa-exclamation-circle"></i> {formErrors[fieldName]}
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="AdminDashboard-managementSection">
        <div className="AdminDashboard-loadingSpinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Загрузка пользователей...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminDashboard-managementSection">
      <div className="AdminDashboard-sectionHeader">
        <h2 className="AdminDashboard-sectionTitle">Управление студентами</h2>
        <button 
          className="AdminDashboard-btn AdminDashboard-btn--primary" 
          onClick={() => { 
            setShowAddForm(true); 
            setShowEditForm(false);
            setEditingUser(null);
            setError(null);
            setFormErrors({});
          }}
        >
          <i className="fas fa-plus"></i> Добавить студента
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddUser} className="AdminDashboard-addForm">
          <h3 className="AdminDashboard-formTitle">Добавление нового студента</h3>
          {error && (
            <div className="AdminDashboard-formError">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="AdminDashboard-formGrid">
            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Имя *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.first_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.first_name} 
                onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                placeholder="Иван"
              />
              {renderFieldError('first_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Фамилия *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.last_name} 
                onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                placeholder="Иванов"
              />
              {renderFieldError('last_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Отчество</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.middle_name} 
                onChange={(e) => setNewUser({...newUser, middle_name: e.target.value})}
                placeholder="Иванович"
              />
              {renderFieldError('middle_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Дата рождения *</label>
              <input 
                type="date" 
                className={`AdminDashboard-formInput ${formErrors.date_of_birth ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.date_of_birth} 
                onChange={(e) => setNewUser({...newUser, date_of_birth: e.target.value})}
              />
              {renderFieldError('date_of_birth')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Email *</label>
              <input 
                type="email" 
                className={`AdminDashboard-formInput ${formErrors.email ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="ivan@example.com"
              />
              {renderFieldError('email')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Номер паспорта *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.passport_number} 
                onChange={(e) => setNewUser({...newUser, passport_number: e.target.value})}
                placeholder="1234567890"
              />
              {renderFieldError('passport_number')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Пароль *</label>
              <input 
                type="password" 
                className={`AdminDashboard-formInput ${formErrors.password ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="Минимум 6 символов"
              />
              {renderFieldError('password')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Адрес</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
                value={newUser.address} 
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                placeholder="г. Москва, ул. Ленина, д. 1"
              />
              {renderFieldError('address')}
            </div>
          </div>

          <div className="AdminDashboard-formActions">
            <button 
              type="submit" 
              className="AdminDashboard-btn AdminDashboard-btn--primary" 
              disabled={submitLoading}
            >
              {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Сохранение...</> : 'Сохранить'}
            </button>
            <button 
              type="button" 
              className="AdminDashboard-btn" 
              onClick={() => { 
                setShowAddForm(false); 
                setNewUser({
                  first_name: '',
                  last_name: '',
                  middle_name: '',
                  date_of_birth: '',
                  email: '',
                  passport_number: '',
                  password: '',
                  address: ''
                });
                setError(null); 
                setFormErrors({}); 
              }}
              disabled={submitLoading}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {showEditForm && editingUser && (
        <form onSubmit={handleEditUser} className="AdminDashboard-addForm">
          <h3 className="AdminDashboard-formTitle">Редактирование студента</h3>
          <p className="AdminDashboard-formSubtitle">
            {editingUser.last_name} {editingUser.first_name} {editingUser.middle_name}
          </p>
          <div className="AdminDashboard-readOnlyInfo">
            <p><strong>Email:</strong> {editingUser.email}</p>
            <p><strong>Дата рождения:</strong> {formatDate(editingUser.date_of_birth)}</p>
          </div>
          {error && (
            <div className="AdminDashboard-formError">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="AdminDashboard-formGrid">
            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Имя *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.first_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={editUserData.first_name} 
                onChange={(e) => setEditUserData({...editUserData, first_name: e.target.value})}
              />
              {renderFieldError('first_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Фамилия *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={editUserData.last_name} 
                onChange={(e) => setEditUserData({...editUserData, last_name: e.target.value})}
              />
              {renderFieldError('last_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Отчество</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={editUserData.middle_name} 
                onChange={(e) => setEditUserData({...editUserData, middle_name: e.target.value})}
              />
              {renderFieldError('middle_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Номер паспорта *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
                value={editUserData.passport_number} 
                onChange={(e) => setEditUserData({...editUserData, passport_number: e.target.value})}
              />
              {renderFieldError('passport_number')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Адрес</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
                value={editUserData.address} 
                onChange={(e) => setEditUserData({...editUserData, address: e.target.value})}
              />
              {renderFieldError('address')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Пароль (для подтверждения)</label>
              <input 
                type="password" 
                className="AdminDashboard-formInput"
                value={editUserData.password} 
                onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                placeholder="Введите пароль"
              />
              <small className="AdminDashboard-formHint">Требуется для подтверждения изменений</small>
            </div>
          </div>

          <div className="AdminDashboard-formActions">
            <button 
              type="submit" 
              className="AdminDashboard-btn AdminDashboard-btn--primary" 
              disabled={submitLoading}
            >
              {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Обновление...</> : 'Обновить'}
            </button>
            <button 
              type="button" 
              className="AdminDashboard-btn" 
              onClick={() => { 
                setShowEditForm(false); 
                setEditingUser(null);
                setEditUserData({
                  first_name: '',
                  last_name: '',
                  middle_name: '',
                  passport_number: '',
                  address: '',
                  password: ''
                });
                setError(null); 
                setFormErrors({}); 
              }}
              disabled={submitLoading}
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {error && !showAddForm && !showEditForm && (
        <div className="AdminDashboard-errorMessage">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button className="AdminDashboard-btn AdminDashboard-btn--primary" onClick={fetchUsers}>
            <i className="fas fa-sync"></i>
          </button>
        </div>
      )}

      <table className="AdminDashboard-dataTable">
        <thead className="AdminDashboard-dataTableHead">
          <tr className="AdminDashboard-dataTableRow">
            <th className="AdminDashboard-dataTableHeader">ФИО</th>
            <th className="AdminDashboard-dataTableHeader">Email</th>
            <th className="AdminDashboard-dataTableHeader">Дата рождения</th>
            <th className="AdminDashboard-dataTableHeader">Паспорт</th>
            <th className="AdminDashboard-dataTableHeader">Действия</th>
           </tr>
        </thead>
        <tbody className="AdminDashboard-dataTableBody">
          {users.map(user => (
            <tr key={user.id} className="AdminDashboard-dataTableRow">
              <td className="AdminDashboard-dataTableCell">
                {user.last_name} {user.first_name} {user.middle_name}
              </td>
              <td className="AdminDashboard-dataTableCell">{user.email}</td>
              <td className="AdminDashboard-dataTableCell">{formatDate(user.date_of_birth)}</td>
              <td className="AdminDashboard-dataTableCell">{user.passport_number}</td>
              <td className="AdminDashboard-dataTableCell">
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--view" 
                  title="Подробнее"
                  onClick={() => openUserDetails(user)}
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--edit" 
                  title="Редактировать"
                  onClick={() => openEditForm(user)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete" 
                  title="Удалить"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={deleteLoading === user.id}
                >
                  {deleteLoading === user.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && !loading && (
        <div className="AdminDashboard-emptyState">
          <i className="fas fa-users AdminDashboard-emptyIcon"></i>
          <p className="AdminDashboard-emptyText">Студенты не найдены</p>
        </div>
      )}

      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          userType="student"
        />
      )}
    </div>
  );
};

export default UsersManagement;