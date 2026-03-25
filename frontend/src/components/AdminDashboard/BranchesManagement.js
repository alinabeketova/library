import React, { useState, useEffect } from 'react';
import { validateForm } from './validators';

const API_BASE_URL = 'http://127.0.0.1:8001';

const BranchesManagement = ({ token }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchData, setBranchData] = useState({
    name: '',
    address: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, [token]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/location`);
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      const data = await response.json();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить филиалы');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingBranch(null);
    setBranchData({ name: '', address: '' });
    setFormErrors({});
    setShowAddForm(true);
  };

  const handleEditClick = (branch) => {
    setEditingBranch(branch);
    setBranchData({
      name: branch.name || '',
      address: branch.address || ''
    });
    setFormErrors({});
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validation = validateForm(branchData, 'location');
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setSubmitLoading(true);
    setFormErrors({});

    try {
      let response;
      
      if (editingBranch) {
        const params = new URLSearchParams();
        params.append('name', branchData.name.trim());
        params.append('address', branchData.address.trim());

        response = await fetch(`${API_BASE_URL}/location/${editingBranch.id}`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        });
      } else {
        const params = new URLSearchParams();
        params.append('name', branchData.name.trim());
        params.append('address', branchData.address.trim());

        response = await fetch(`${API_BASE_URL}/location?${params.toString()}`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
      }

      setShowAddForm(false);
      setEditingBranch(null);
      fetchBranches();
    } catch (err) {
      setError(err.message || `Не удалось ${editingBranch ? 'обновить' : 'добавить'} филиал`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (branchId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот филиал?')) return;
    
    setDeleteLoading(branchId);
    try {
      const response = await fetch(`${API_BASE_URL}/location/${branchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      fetchBranches();
    } catch (err) {
      setError('Не удалось удалить филиал: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
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

  if (loading) {
    return (
      <div className="AdminDashboard-managementSection">
        <div className="AdminDashboard-loadingSpinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Загрузка филиалов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminDashboard-managementSection">
      <div className="AdminDashboard-sectionHeader">
        <h2 className="AdminDashboard-sectionTitle">Управление филиалами</h2>
        <button 
          className="AdminDashboard-btn AdminDashboard-btn--primary" 
          onClick={handleAddClick}
        >
          <i className="fas fa-plus"></i> Добавить филиал
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="AdminDashboard-addForm">
          <h3 className="AdminDashboard-formTitle">
            {editingBranch ? 'Редактировать филиал' : 'Добавить новый филиал'}
          </h3>
          
          {error && (
            <div className="AdminDashboard-formError">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="AdminDashboard-formGrid">
            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Название *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.name ? 'AdminDashboard-formInput--error' : ''}`}
                value={branchData.name} 
                onChange={(e) => setBranchData({...branchData, name: e.target.value})}
                placeholder="Главный филиал"
              />
              {renderFieldError('name')}
            </div>

            <div className="AdminDashboard-formGroup AdminDashboard-formGroup--fullWidth">
              <label className="AdminDashboard-formLabel">Адрес *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
                value={branchData.address} 
                onChange={(e) => setBranchData({...branchData, address: e.target.value})}
                placeholder="ул. Ленина, д. 1"
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
                setEditingBranch(null);
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

      {error && !showAddForm && (
        <div className="AdminDashboard-errorMessage">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button className="AdminDashboard-btn AdminDashboard-btn--primary" onClick={fetchBranches}>
            <i className="fas fa-sync"></i>
          </button>
        </div>
      )}

      <table className="AdminDashboard-dataTable">
        <thead className="AdminDashboard-dataTableHead">
          <tr className="AdminDashboard-dataTableRow">
            <th className="AdminDashboard-dataTableHeader">Название</th>
            <th className="AdminDashboard-dataTableHeader">Адрес</th>
            <th className="AdminDashboard-dataTableHeader">Действия</th>
          </tr>
        </thead>
        <tbody className="AdminDashboard-dataTableBody">
          {branches.map(branch => (
            <tr key={branch.id} className="AdminDashboard-dataTableRow">
              <td className="AdminDashboard-dataTableCell">{branch.name}</td>
              <td className="AdminDashboard-dataTableCell">{branch.address}</td>
              <td className="AdminDashboard-dataTableCell">
                <button 
                  className="AdminDashboard-actionBtn" 
                  title="Редактировать"
                  onClick={() => handleEditClick(branch)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete" 
                  title="Удалить"
                  onClick={() => handleDelete(branch.id)}
                  disabled={deleteLoading === branch.id}
                >
                  {deleteLoading === branch.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {branches.length === 0 && !loading && (
        <div className="AdminDashboard-emptyState">
          <i className="fas fa-building AdminDashboard-emptyIcon"></i>
          <p className="AdminDashboard-emptyText">Филиалы не найдены</p>
        </div>
      )}
    </div>
  );
};

export default BranchesManagement;