import React from 'react';

const UserDetailsModal = ({ user, onClose, userType }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="AdminDashboard-modalOverlay" onClick={onClose}>
      <div className="AdminDashboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="AdminDashboard-modalHeader">
          <h3 className="AdminDashboard-modalTitle">
            {userType === 'librarian' ? 'Данные библиотекаря' : 'Данные студента'}
          </h3>
          <button className="AdminDashboard-modalClose" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="AdminDashboard-modalBody">
          <div className="AdminDashboard-detailRow">
            <span className="AdminDashboard-detailLabel">ФИО:</span>
            <span className="AdminDashboard-detailValue">
              {user.last_name} {user.first_name} {user.middle_name}
            </span>
          </div>
          <div className="AdminDashboard-detailRow">
            <span className="AdminDashboard-detailLabel">Email:</span>
            <span className="AdminDashboard-detailValue">{user.email}</span>
          </div>
          <div className="AdminDashboard-detailRow">
            <span className="AdminDashboard-detailLabel">Дата рождения:</span>
            <span className="AdminDashboard-detailValue">{formatDate(user.date_of_birth)}</span>
          </div>
          <div className="AdminDashboard-detailRow">
            <span className="AdminDashboard-detailLabel">Паспорт:</span>
            <span className="AdminDashboard-detailValue">{user.passport_number}</span>
          </div>
          {user.address && (
            <div className="AdminDashboard-detailRow">
              <span className="AdminDashboard-detailLabel">Адрес:</span>
              <span className="AdminDashboard-detailValue">{user.address}</span>
            </div>
          )}
          {userType === 'student' && user.faculty_id && (
            <div className="AdminDashboard-detailRow">
              <span className="AdminDashboard-detailLabel">Факультет ID:</span>
              <span className="AdminDashboard-detailValue">{user.faculty_id}</span>
            </div>
          )}
          {userType === 'librarian' && user.location_id && (
            <div className="AdminDashboard-detailRow">
              <span className="AdminDashboard-detailLabel">Филиал ID:</span>
              <span className="AdminDashboard-detailValue">{user.location_id}</span>
            </div>
          )}
        </div>
        <div className="AdminDashboard-modalFooter">
          <button className="AdminDashboard-btn" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;