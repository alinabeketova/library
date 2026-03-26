import React, { useState, useEffect } from 'react';
import { validators } from './validators';
import UserDetailsModal from './UserDetailsModal';

const API_BASE_URL = 'http://127.0.0.1:8001';

const LibrariansManagement = ({ token }) => {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLibrarian, setEditingLibrarian] = useState(null);
  const [newLibrarian, setNewLibrarian] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    date_of_birth: '',
    email: '',
    passport_number: '',
    password: '',
    address: ''
  });
  const [editLibrarianData, setEditLibrarianData] = useState({
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
  const [selectedLibrarian, setSelectedLibrarian] = useState(null);

  useEffect(() => {
    fetchLibrarians();
  }, [token]);

  const fetchLibrarians = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/user_librarian/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      
      const data = await response.json();
      setLibrarians(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить список библиотекарей');
    } finally {
      setLoading(false);
    }
  };

  const validateNewLibrarian = (data) => {
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

  const validateEditLibrarian = (data) => {
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

  const handleAddLibrarian = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateNewLibrarian(newLibrarian);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setSubmitLoading(true);
    setFormErrors({});

    try {
      const params = new URLSearchParams();
      params.append('first_name', newLibrarian.first_name.trim());
      params.append('last_name', newLibrarian.last_name.trim());
      if (newLibrarian.middle_name.trim()) params.append('middle_name', newLibrarian.middle_name.trim());
      params.append('date_of_birth', newLibrarian.date_of_birth);
      params.append('email', newLibrarian.email.trim());
      params.append('passport_number', newLibrarian.passport_number.trim());
      params.append('password', newLibrarian.password);
      if (newLibrarian.address.trim()) params.append('address', newLibrarian.address.trim());
      params.append('role_id', '2');

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
      setNewLibrarian({
        first_name: '',
        last_name: '',
        middle_name: '',
        date_of_birth: '',
        email: '',
        passport_number: '',
        password: '',
        address: ''
      });
      fetchLibrarians();
    } catch (err) {
      setError(err.message || 'Не удалось добавить библиотекаря');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditLibrarian = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateEditLibrarian(editLibrarianData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setSubmitLoading(true);
    setFormErrors({});

    try {
      const params = new URLSearchParams();
      params.append('email', editingLibrarian.email);
      params.append('password', editLibrarianData.password);
      
      params.append('first_name', editLibrarianData.first_name.trim());
      params.append('last_name', editLibrarianData.last_name.trim());
      if (editLibrarianData.middle_name.trim()) params.append('middle_name', editLibrarianData.middle_name.trim());
      params.append('passport_number', editLibrarianData.passport_number.trim());
      if (editLibrarianData.address.trim()) params.append('address', editLibrarianData.address.trim());

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
      setEditingLibrarian(null);
      setEditLibrarianData({
        first_name: '',
        last_name: '',
        middle_name: '',
        passport_number: '',
        address: '',
        password: ''
      });
      fetchLibrarians();
    } catch (err) {
      setError(err.message || 'Не удалось обновить библиотекаря');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteLibrarian = async (librarianId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого библиотекаря?')) return;
    
    setDeleteLoading(librarianId);
    try {
      const response = await fetch(`${API_BASE_URL}/user_librarian/${librarianId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Ошибка HTTP: ${response.status}`);
      }
      
      fetchLibrarians();
    } catch (err) {
      setError('Не удалось удалить библиотекаря: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditForm = (librarian) => {
    setEditingLibrarian(librarian);
    setEditLibrarianData({
      first_name: librarian.first_name || '',
      last_name: librarian.last_name || '',
      middle_name: librarian.middle_name || '',
      passport_number: librarian.passport_number || '',
      address: librarian.address || '',
      password: ''
    });
    setShowEditForm(true);
    setShowAddForm(false);
    setFormErrors({});
    setError(null);
  };

  const openLibrarianDetails = (librarian) => {
    setSelectedLibrarian(librarian);
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
          <span>Загрузка библиотекарей...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminDashboard-managementSection">
      <div className="AdminDashboard-sectionHeader">
        <h2 className="AdminDashboard-sectionTitle">Управление библиотекарями</h2>
        <button 
          className="AdminDashboard-btn AdminDashboard-btn--primary" 
          onClick={() => { 
            setShowAddForm(true); 
            setShowEditForm(false);
            setEditingLibrarian(null);
            setError(null);
            setFormErrors({});
          }}
        >
          <i className="fas fa-plus"></i> Добавить библиотекаря
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLibrarian} className="AdminDashboard-addForm">
          <h3 className="AdminDashboard-formTitle">Добавление нового библиотекаря</h3>
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
                value={newLibrarian.first_name} 
                onChange={(e) => setNewLibrarian({...newLibrarian, first_name: e.target.value})}
                placeholder="Иван"
              />
              {renderFieldError('first_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Фамилия *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={newLibrarian.last_name} 
                onChange={(e) => setNewLibrarian({...newLibrarian, last_name: e.target.value})}
                placeholder="Иванов"
              />
              {renderFieldError('last_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Отчество</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={newLibrarian.middle_name} 
                onChange={(e) => setNewLibrarian({...newLibrarian, middle_name: e.target.value})}
                placeholder="Иванович"
              />
              {renderFieldError('middle_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Дата рождения *</label>
              <input 
                type="date" 
                className={`AdminDashboard-formInput ${formErrors.date_of_birth ? 'AdminDashboard-formInput--error' : ''}`}
                value={newLibrarian.date_of_birth} 
                onChange={(e) => setNewLibrarian({...newLibrarian, date_of_birth: e.target.value})}
              />
              {renderFieldError('date_of_birth')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Email *</label>
              <input 
                type="email" 
                className={`AdminDashboard-formInput ${formErrors.email ? 'AdminDashboard-formInput--error' : ''}`}
                value={newLibrarian.email} 
                onChange={(e) => setNewLibrarian({...newLibrarian, email: e.target.value})}
                placeholder="ivan@example.com"
              />
              {renderFieldError('email')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Номер паспорта *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
                value={newLibrarian.passport_number} 
                onChange={(e) => setNewLibrarian({...newLibrarian, passport_number: e.target.value})}
                placeholder="1234567890"
              />
              {renderFieldError('passport_number')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Пароль *</label>
              <input 
                type="password" 
                className={`AdminDashboard-formInput ${formErrors.password ? 'AdminDashboard-formInput--error' : ''}`}
                value={newLibrarian.password} 
                onChange={(e) => setNewLibrarian({...newLibrarian, password: e.target.value})}
                placeholder="Минимум 6 символов"
              />
              {renderFieldError('password')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Адрес</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
                value={newLibrarian.address} 
                onChange={(e) => setNewLibrarian({...newLibrarian, address: e.target.value})}
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
                setNewLibrarian({
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

      {showEditForm && editingLibrarian && (
        <form onSubmit={handleEditLibrarian} className="AdminDashboard-addForm">
          <h3 className="AdminDashboard-formTitle">Редактирование библиотекаря</h3>
          <p className="AdminDashboard-formSubtitle">
            {editingLibrarian.last_name} {editingLibrarian.first_name} {editingLibrarian.middle_name}
          </p>
          <div className="AdminDashboard-readOnlyInfo">
            <p><strong>Email:</strong> {editingLibrarian.email}</p>
            <p><strong>Дата рождения:</strong> {formatDate(editingLibrarian.date_of_birth)}</p>
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
                value={editLibrarianData.first_name} 
                onChange={(e) => setEditLibrarianData({...editLibrarianData, first_name: e.target.value})}
              />
              {renderFieldError('first_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Фамилия *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={editLibrarianData.last_name} 
                onChange={(e) => setEditLibrarianData({...editLibrarianData, last_name: e.target.value})}
              />
              {renderFieldError('last_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Отчество</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
                value={editLibrarianData.middle_name} 
                onChange={(e) => setEditLibrarianData({...editLibrarianData, middle_name: e.target.value})}
              />
              {renderFieldError('middle_name')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Номер паспорта *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
                value={editLibrarianData.passport_number} 
                onChange={(e) => setEditLibrarianData({...editLibrarianData, passport_number: e.target.value})}
              />
              {renderFieldError('passport_number')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Адрес</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
                value={editLibrarianData.address} 
                onChange={(e) => setEditLibrarianData({...editLibrarianData, address: e.target.value})}
              />
              {renderFieldError('address')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Пароль (для подтверждения)</label>
              <input 
                type="password" 
                className="AdminDashboard-formInput"
                value={editLibrarianData.password} 
                onChange={(e) => setEditLibrarianData({...editLibrarianData, password: e.target.value})}
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
                setEditingLibrarian(null);
                setEditLibrarianData({
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
          <button className="AdminDashboard-btn AdminDashboard-btn--primary" onClick={fetchLibrarians}>
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
            <th className="AdminDashboard-dataTableHeader">Действия</th>
           </tr>
        </thead>
        <tbody className="AdminDashboard-dataTableBody">
          {librarians.map(librarian => (
            <tr key={librarian.id} className="AdminDashboard-dataTableRow">
              <td className="AdminDashboard-dataTableCell">
                {librarian.last_name} {librarian.first_name} {librarian.middle_name}
               </td>
              <td className="AdminDashboard-dataTableCell">{librarian.email}</td>
              <td className="AdminDashboard-dataTableCell">{formatDate(librarian.date_of_birth)}</td>
              <td className="AdminDashboard-dataTableCell">
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--view" 
                  title="Подробнее"
                  onClick={() => openLibrarianDetails(librarian)}
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--edit" 
                  title="Редактировать"
                  onClick={() => openEditForm(librarian)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete" 
                  title="Удалить"
                  onClick={() => handleDeleteLibrarian(librarian.id)}
                  disabled={deleteLoading === librarian.id}
                >
                  {deleteLoading === librarian.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                </button>
               </td>
             </tr>
          ))}
        </tbody>
       </table>
      
      {librarians.length === 0 && !loading && (
        <div className="AdminDashboard-emptyState">
          <i className="fas fa-user-tie AdminDashboard-emptyIcon"></i>
          <p className="AdminDashboard-emptyText">Библиотекари не найдены</p>
        </div>
      )}

      {selectedLibrarian && (
        <UserDetailsModal 
          user={selectedLibrarian} 
          onClose={() => setSelectedLibrarian(null)} 
          userType="librarian"
        />
      )}
    </div>
  );
};

export default LibrariansManagement;