import React, { useState, useEffect } from 'react';

const RegistrationCodesManagement = ({ token }) => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Загружаем коды из localStorage при монтировании
  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = () => {
    try {
      const savedCodes = localStorage.getItem('registration_codes');
      if (savedCodes) {
        setCodes(JSON.parse(savedCodes));
      }
    } catch (err) {
      console.error('Ошибка загрузки кодов:', err);
    } finally {
      setLoading(false);
    }
  };

  // Сохраняем коды в localStorage
  const saveCodes = (updatedCodes) => {
    try {
      localStorage.setItem('registration_codes', JSON.stringify(updatedCodes));
      setCodes(updatedCodes);
    } catch (err) {
      console.error('Ошибка сохранения кодов:', err);
    }
  };

  // Генерация нового кода
  const generateCode = () => {
    // Формат: LIB-XXXX-XXXX-XXXX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'LIB-';
    
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const newCode = {
      id: Date.now().toString(),
      code: code,
      created_at: new Date().toISOString(),
      used: false,
      used_by: null,
      used_at: null,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 дней
    };
    
    const updatedCodes = [newCode, ...codes];
    saveCodes(updatedCodes);
    setGeneratedCode(newCode);
    
    // Автоматически скрываем уведомление через 5 секунд
    setTimeout(() => {
      setGeneratedCode(null);
    }, 5000);
  };

  // Копирование кода в буфер обмена
  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    }).catch(err => {
      console.error('Ошибка копирования:', err);
    });
  };

  // Отметить код как использованный (вручную)
  const markAsUsed = (codeId) => {
    const updatedCodes = codes.map(c => 
      c.id === codeId 
        ? { ...c, used: true, used_at: new Date().toISOString() }
        : c
    );
    saveCodes(updatedCodes);
  };

  // Удалить код
  const deleteCode = (codeId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот код?')) return;
    
    const updatedCodes = codes.filter(c => c.id !== codeId);
    saveCodes(updatedCodes);
  };

  // Очистить все использованные коды
  const clearUsedCodes = () => {
    if (!window.confirm('Удалить все использованные коды?')) return;
    
    const updatedCodes = codes.filter(c => !c.used);
    saveCodes(updatedCodes);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="AdminDashboard-managementSection">
        <div className="AdminDashboard-loadingSpinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Загрузка кодов...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminDashboard-managementSection">
      <div className="AdminDashboard-sectionHeader">
        <h2 className="AdminDashboard-sectionTitle">Регистрационные коды</h2>
        <div className="AdminDashboard-headerActions">
          <button 
            className="AdminDashboard-btn AdminDashboard-btn--secondary"
            onClick={clearUsedCodes}
            disabled={!codes.some(c => c.used)}
          >
            <i className="fas fa-trash"></i> Очистить использованные
          </button>
          <button 
            className="AdminDashboard-btn AdminDashboard-btn--primary"
            onClick={generateCode}
          >
            <i className="fas fa-plus"></i> Сгенерировать код
          </button>
        </div>
      </div>

      {/* Таблица кодов */}
      <table className="AdminDashboard-dataTable">
        <thead className="AdminDashboard-dataTableHead">
          <tr className="AdminDashboard-dataTableRow">
            <th className="AdminDashboard-dataTableHeader">Код</th>
            <th className="AdminDashboard-dataTableHeader">Создан</th>
            <th className="AdminDashboard-dataTableHeader">Истекает</th>
            <th className="AdminDashboard-dataTableHeader">Статус</th>
            <th className="AdminDashboard-dataTableHeader">Использован</th>
            <th className="AdminDashboard-dataTableHeader">Действия</th>
           </tr>
        </thead>
        <tbody className="AdminDashboard-dataTableBody">
          {codes.map(code => {
            const isExpired = !code.used && new Date(code.expires_at) < new Date();
            
            return (
              <tr key={code.id} className="AdminDashboard-dataTableRow">
                <td className="AdminDashboard-dataTableCell">
                  <code className="AdminDashboard-codeValue">{code.code}</code>
                 </td>
                <td className="AdminDashboard-dataTableCell">{formatDate(code.created_at)}</td>
                <td className="AdminDashboard-dataTableCell">{formatDate(code.expires_at)}</td>
                <td className="AdminDashboard-dataTableCell">
                  {code.used ? (
                    <span className="AdminDashboard-badge AdminDashboard-badge--used">
                      Использован
                    </span>
                  ) : isExpired ? (
                    <span className="AdminDashboard-badge AdminDashboard-badge--expired">
                      Просрочен
                    </span>
                  ) : (
                    <span className="AdminDashboard-badge AdminDashboard-badge--active">
                      Активен
                    </span>
                  )}
                 </td>
                <td className="AdminDashboard-dataTableCell">
                  {code.used ? (
                    <span title={code.used_by || 'Использован'}>
                      {formatDate(code.used_at)}
                    </span>
                  ) : '-'}
                 </td>
                <td className="AdminDashboard-dataTableCell">
                  <button 
                    className="AdminDashboard-actionBtn AdminDashboard-actionBtn--copy"
                    title="Копировать код"
                    onClick={() => copyCode(code.code)}
                  >
                    {copiedCode === code.code ? (
                      <i className="fas fa-check"></i>
                    ) : (
                      <i className="fas fa-copy"></i>
                    )}
                  </button>
                  
                  {!code.used && !isExpired && (
                    <button 
                      className="AdminDashboard-actionBtn AdminDashboard-actionBtn--check"
                      title="Отметить как использованный"
                      onClick={() => markAsUsed(code.id)}
                    >
                      <i className="fas fa-check-circle"></i>
                    </button>
                  )}
                  
                  <button 
                    className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete"
                    title="Удалить"
                    onClick={() => deleteCode(code.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                 </td>
               </tr>
            );
          })}
        </tbody>
       </table>

      {codes.length === 0 && (
        <div className="AdminDashboard-emptyState">
          <i className="fas fa-key AdminDashboard-emptyIcon"></i>
          <p className="AdminDashboard-emptyText">Нет сгенерированных кодов</p>
          <button 
            className="AdminDashboard-btn AdminDashboard-btn--primary"
            onClick={generateCode}
          >
            Сгенерировать первый код
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrationCodesManagement;