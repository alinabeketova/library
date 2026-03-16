// pages/LibrarianDashboard.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LibrarianDashboard.css';

const API_BASE_URL = 'http://127.0.0.1:8001';
const LOAN_DAYS_LIMIT = 14;

const LibrarianDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('loans');

  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="LibrarianDashboard">
      <h1 className="LibrarianDashboard-title">Панель библиотекаря</h1>

      <div className="LibrarianDashboard-tabs">
        <button 
          className={`LibrarianDashboard-tabBtn ${activeTab === 'loans' ? 'LibrarianDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          <i className="fas fa-hand-holding-heart"></i> Выдачи
        </button>
        <button 
          className={`LibrarianDashboard-tabBtn ${activeTab === 'returns' ? 'LibrarianDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('returns')}
        >
          <i className="fas fa-undo-alt"></i> Возвраты
        </button>
        <button 
          className={`LibrarianDashboard-tabBtn ${activeTab === 'reservations' ? 'LibrarianDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          <i className="fas fa-bookmark"></i> Бронирования
        </button>
      </div>

      <div className="LibrarianDashboard-tabContent">
        {activeTab === 'loans' && <LoansManagement token={token} />}
        {activeTab === 'returns' && <ReturnsManagement token={token} />}
        {activeTab === 'reservations' && <ReservationsManagement token={token} />}
      </div>
    </div>
  );
};

// Функции утилиты
const calculateDaysOnLoan = (issueDate) => {
  const issue = new Date(issueDate);
  const today = new Date();
  const diffTime = Math.abs(today - issue);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatLoanStatus = (daysOnLoan) => {
  if (daysOnLoan > LOAN_DAYS_LIMIT) {
    const overdueDays = daysOnLoan - LOAN_DAYS_LIMIT;
    return {
      status: 'overdue',
      text: `Просрочена на ${overdueDays} ${getDaysWord(overdueDays)}`,
      daysText: `${daysOnLoan} дн. (лимит ${LOAN_DAYS_LIMIT})`
    };
  } else {
    const remainingDays = LOAN_DAYS_LIMIT - daysOnLoan;
    return {
      status: 'active',
      text: `На руках ${daysOnLoan} ${getDaysWord(daysOnLoan)}`,
      daysText: remainingDays === 0 ? 'Сдать сегодня' : `Осталось ${remainingDays} ${getDaysWord(remainingDays)}`
    };
  }
};

const getDaysWord = (days) => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
  return 'дней';
};

const getDatePlusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Компонент управления бронированиями
const ReservationsManagement = ({ token }) => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);
  const [issueLoading, setIssueLoading] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, [token]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReservations(reservations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = reservations.filter(res => 
      res.userEmail.toLowerCase().includes(query) ||
      res.userName.toLowerCase().includes(query) ||
      res.bookTitle.toLowerCase().includes(query)
    );
    setFilteredReservations(filtered);
  }, [searchQuery, reservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/book_reservation/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      const reservationsArray = Array.isArray(data) ? data : [data];
      
      const reservationsWithIds = await Promise.all(
        reservationsArray.map(async (res, index) => {
          let userId = null;
          
          try {
            const userResponse = await fetch(
              `${API_BASE_URL}/user_email/${encodeURIComponent(res.user_email)}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                },
              }
            );
            if (userResponse.ok) {
              const userData = await userResponse.json();
              userId = userData.id;
            }
          } catch (err) {
            console.warn('Не удалось получить ID пользователя:', err);
          }

          return {
            id: index + 1, // внутренний ID для React key
            bookReservationId: res.book_reservation_id, // реальный ID бронирования для API
            bookId: res.book_id,
            bookTitle: res.book_title,
            bookIsbn: res.isbn,
            userId: userId,
            userName: res.user_full_name,
            userEmail: res.user_email,
            reservationDate: res.reservation_date,
            expiryDate: res.expiry_date
          };
        })
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      reservationsWithIds.sort((a, b) => {
        const expiryA = new Date(a.expiryDate);
        const expiryB = new Date(b.expiryDate);
        const isExpiredA = expiryA < today;
        const isExpiredB = expiryB < today;
        
        if (isExpiredA && !isExpiredB) return 1;
        if (!isExpiredA && isExpiredB) return -1;
        return expiryA - expiryB;
      });

      setReservations(reservationsWithIds);
      setFilteredReservations(reservationsWithIds);
    } catch (err) {
      setError('Не удалось загрузить бронирования: ' + err.message);
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для выдачи забронированной книги
  const handleIssueReservedBook = async (reservation) => {
    if (!reservation.bookReservationId) {
      alert('Ошибка: не удалось определить ID бронирования');
      return;
    }

    if (!window.confirm(`Выдать книгу "${reservation.bookTitle}" читателю ${reservation.userName}?`)) {
      return;
    }

    setIssueLoading(reservation.id);
    setSuccessMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/book_loan_by_book_reservation/${reservation.bookReservationId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || `Ошибка: ${response.status}`);
      }

      setSuccessMessage(responseText || 'Книга успешно выдана по бронированию');
      
      // Обновляем список бронирований (выданная книга должна исчезнуть из списка)
      await fetchReservations();
      setSearchQuery('');
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      alert('Ошибка при выдаче книги: ' + err.message);
    } finally {
      setIssueLoading(null);
    }
  };

  const handleCancelReservation = async (reservation) => {
    if (!reservation.userId) {
      alert('Ошибка: не удалось определить ID пользователя');
      return;
    }

    if (!window.confirm(`Отменить бронирование книги "${reservation.bookTitle}" для ${reservation.userName}?`)) {
      return;
    }

    setCancelLoading(reservation.bookId);
    setSuccessMessage('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/book_reservation/?user_id=${reservation.userId}&book_id=${reservation.bookId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || `Ошибка: ${response.status}`);
      }

      setSuccessMessage(responseText || 'Бронирование успешно отменено');
      
      await fetchReservations();
      setSearchQuery('');
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      alert('Ошибка при отмене бронирования: ' + err.message);
    } finally {
      setCancelLoading(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpired = (expiryDate) => {
    return getDaysUntilExpiry(expiryDate) < 0;
  };

  if (loading) return <div className="LibrarianDashboard-loading">Загрузка бронирований...</div>;
  if (error) return <div className="LibrarianDashboard-error">{error}</div>;

  return (
    <div className="LibrarianDashboard-managementSection">
      <div className="LibrarianDashboard-sectionHeader">
        <h2 className="LibrarianDashboard-sectionTitle">Управление бронированиями</h2>
        <button onClick={fetchReservations} className="LibrarianDashboard-btn LibrarianDashboard-btn--secondary">
          <i className="fas fa-sync"></i> Обновить
        </button>
      </div>

      {successMessage && (
        <div className="LibrarianDashboard-successMessage">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}

      <div className="LibrarianDashboard-searchBar">
        <i className="fas fa-search LibrarianDashboard-searchIcon"></i>
        <input
          type="text"
          className="LibrarianDashboard-searchInput"
          placeholder="Поиск по email, имени или названию книги..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button type="button" className="LibrarianDashboard-searchClear" onClick={clearSearch}>
            <i className="fas fa-times"></i>
          </button>
        )}
        <span className="LibrarianDashboard-searchResultsCount">
          {filteredReservations.length} из {reservations.length}
        </span>
      </div>

      <div className="LibrarianDashboard-reservationsTable">
        <h3 className="LibrarianDashboard-tableTitle">
          Активные бронирования 
          {searchQuery && <span className="LibrarianDashboard-filterIndicator"> (отфильтровано)</span>}
        </h3>
        <table className="LibrarianDashboard-dataTable">
          <thead className="LibrarianDashboard-tableHead">
            <tr className="LibrarianDashboard-tableRow">
              <th className="LibrarianDashboard-tableHeader">Книга</th>
              <th className="LibrarianDashboard-tableHeader">Читатель</th>
              <th className="LibrarianDashboard-tableHeader">Email</th>
              <th className="LibrarianDashboard-tableHeader">Дата бронирования</th>
              <th className="LibrarianDashboard-tableHeader">Истекает</th>
              <th className="LibrarianDashboard-tableHeader">Статус</th>
              <th className="LibrarianDashboard-tableHeader">Действия</th>
            </tr>
          </thead>
          <tbody className="LibrarianDashboard-tableBody">
            {filteredReservations.map(res => {
              const daysUntilExpiry = getDaysUntilExpiry(res.expiryDate);
              const expired = isExpired(res.expiryDate);
              
              return (
                <tr key={res.id} className={`LibrarianDashboard-tableRow ${expired ? 'LibrarianDashboard-tableRow--expired' : ''}`}>
                  <td className="LibrarianDashboard-tableCell">
                    {expired && <span className="LibrarianDashboard-expiredLabel">[ИСТЕКЛО] </span>}
                    {res.bookTitle}
                  </td>
                  <td className="LibrarianDashboard-tableCell">{res.userName}</td>
                  <td className="LibrarianDashboard-tableCell">{res.userEmail}</td>
                  <td className="LibrarianDashboard-tableCell">{res.reservationDate}</td>
                  <td className="LibrarianDashboard-tableCell">
                    <span className={expired ? 'LibrarianDashboard-expiredText' : 'LibrarianDashboard-activeText'}>
                      {res.expiryDate}
                      {expired && ` (${Math.abs(daysUntilExpiry)} дн. назад)`}
                    </span>
                  </td>
                  <td className="LibrarianDashboard-tableCell">
                    {expired ? (
                      <span className="LibrarianDashboard-statusBadge LibrarianDashboard-statusBadge--expired">Истекло</span>
                    ) : daysUntilExpiry === 0 ? (
                      <span className="LibrarianDashboard-statusBadge LibrarianDashboard-statusBadge--today">Истекает сегодня</span>
                    ) : (
                      <span className="LibrarianDashboard-statusBadge LibrarianDashboard-statusBadge--reserved">
                        Осталось {daysUntilExpiry} {getDaysWord(daysUntilExpiry)}
                      </span>
                    )}
                  </td>
                  <td className="LibrarianDashboard-tableCell">
                    <div className="LibrarianDashboard-actionButtons">
                      <button
                        className="LibrarianDashboard-actionBtn LibrarianDashboard-actionBtn--issue"
                        onClick={() => handleIssueReservedBook(res)}
                        disabled={issueLoading === res.id || !res.bookReservationId || expired}
                        title={expired ? 'Бронирование истекло' : !res.bookReservationId ? 'Не удалось определить ID бронирования' : 'Выдать книгу по бронированию'}
                      >
                        {issueLoading === res.id ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <><i className="fas fa-book"></i> Выдать</>
                        )}
                      </button>
                      
                      <button
                        className="LibrarianDashboard-actionBtn LibrarianDashboard-actionBtn--cancel"
                        onClick={() => handleCancelReservation(res)}
                        disabled={cancelLoading === res.bookId || !res.userId}
                        title={!res.userId ? 'Не удалось определить ID пользователя' : 'Отменить бронирование'}
                      >
                        {cancelLoading === res.bookId ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <><i className="fas fa-times"></i> Отменить</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredReservations.length === 0 && (
          <p className="LibrarianDashboard-emptyMessage">
            {searchQuery ? 'Ничего не найдено по вашему запросу' : 'Нет активных бронирований'}
          </p>
        )}
      </div>
    </div>
  );
};
const LoansManagement = ({ token }) => {
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedReader, setSelectedReader] = useState('');
  const [activeLoans, setActiveLoans] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [viewMode, setViewMode] = useState('active');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [loansRes, booksRes, readersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/book_loan_by_user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/book_full_info/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/user_student/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
      ]);

      if (!loansRes.ok || !booksRes.ok || !readersRes.ok) {
        throw new Error('Ошибка загрузки данных. Проверьте авторизацию.');
      }

      const loansData = await loansRes.json();
      const booksData = await booksRes.json();
      const readersData = await readersRes.json();

      const active = [];
      const returned = [];

      loansData.forEach((loan, index) => {
        const loanItem = {
          id: index + 1,
          book: loan.title,
          reader: loan.full_name,
          email: loan.email,
          date: loan.issue_date,
          returnDate: loan.return_date,
          daysOnLoan: calculateDaysOnLoan(loan.issue_date)
        };

        if (loan.return_date === null || loan.return_date === undefined) {
          const statusInfo = formatLoanStatus(loanItem.daysOnLoan);
          loanItem.status = statusInfo.status;
          loanItem.statusText = statusInfo.text;
          loanItem.daysInfo = statusInfo.daysText;
          active.push(loanItem);
        } else {
          loanItem.status = 'returned';
          loanItem.statusText = 'Возвращена';
          loanItem.daysInfo = `Была на руках ${loanItem.daysOnLoan} ${getDaysWord(loanItem.daysOnLoan)}`;
          returned.push(loanItem);
        }
      });

      active.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (a.status !== 'overdue' && b.status === 'overdue') return 1;
        return b.daysOnLoan - a.daysOnLoan;
      });

      setActiveLoans(active);
      setReturnedBooks(returned);

      const formattedBooks = booksData.map(book => ({
        id: book.id,
        title: book.title,
        available: book.total_copies || 0
      }));

      const formattedReaders = readersData.map(reader => ({
        id: reader.id,
        name: `${reader.last_name} ${reader.first_name} ${reader.middle_name || ''}`.trim(),
        group: reader.faculty_name || 'Не указано'
      }));

      setAvailableBooks(formattedBooks);
      setReaders(formattedReaders);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    
    if (!selectedReader || !selectedBook) {
      alert('Пожалуйста, выберите читателя и книгу');
      return;
    }

    setIssuing(true);
    setSuccessMessage('');
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/book_loan?book_id=${selectedBook}&user_id=${selectedReader}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Такой книги нет в наличии');
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const message = await response.text();
      setSuccessMessage(message);
      
      await fetchData();
      
      setSelectedReader('');
      setSelectedBook('');
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      alert('Ошибка при выдаче книги: ' + err.message);
      console.error('Error issuing book:', err);
    } finally {
      setIssuing(false);
    }
  };

  if (loading) return <div className="LibrarianDashboard-loading">Загрузка данных...</div>;
  if (error) return <div className="LibrarianDashboard-error">{error}</div>;

  const currentList = viewMode === 'active' ? activeLoans : returnedBooks;

  return (
    <div className="LibrarianDashboard-managementSection">
      <div className="LibrarianDashboard-sectionHeader">
        <h2 className="LibrarianDashboard-sectionTitle">Управление выдачами</h2>
        <button onClick={fetchData} className="LibrarianDashboard-btn LibrarianDashboard-btn--secondary">
          <i className="fas fa-sync"></i> Обновить
        </button>
      </div>

      {successMessage && (
        <div className="LibrarianDashboard-successMessage">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}

      <form onSubmit={handleIssueBook} className="LibrarianDashboard-issueForm">
        <h3 className="LibrarianDashboard-formTitle">Оформление выдачи</h3>
        <div className="LibrarianDashboard-formRow">
          <div className="LibrarianDashboard-formGroup">
            <label className="LibrarianDashboard-formLabel">Читатель:</label>
            <select 
              className="LibrarianDashboard-formSelect"
              value={selectedReader} 
              onChange={(e) => setSelectedReader(e.target.value)}
              required
              disabled={issuing}
            >
              <option value="">Выберите читателя</option>
              {readers.map(reader => (
                <option key={reader.id} value={reader.id}>
                  {reader.name} ({reader.group})
                </option>
              ))}
            </select>
          </div>

          <div className="LibrarianDashboard-formGroup">
            <label className="LibrarianDashboard-formLabel">Книга:</label>
            <select 
              className="LibrarianDashboard-formSelect"
              value={selectedBook} 
              onChange={(e) => setSelectedBook(e.target.value)}
              required
              disabled={issuing}
            >
              <option value="">Выберите книгу</option>
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title} (доступно: {book.available})
                </option>
              ))}
            </select>
          </div>

          <div className="LibrarianDashboard-formGroup">
            <label className="LibrarianDashboard-formLabel">Срок возврата:</label>
            <input 
              type="date" 
              className="LibrarianDashboard-formInput LibrarianDashboard-formInput--disabled"
              value={getDatePlusDays(LOAN_DAYS_LIMIT)}
              disabled
            />
            <small className="LibrarianDashboard-inputHint">Автоматически: через {LOAN_DAYS_LIMIT} дней ({getDatePlusDays(LOAN_DAYS_LIMIT)})</small>
          </div>
        </div>

        <button type="submit" className="LibrarianDashboard-btn LibrarianDashboard-btn--primary" disabled={issuing}>
          {issuing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Выдача...
            </>
          ) : (
            'Выдать книгу'
          )}
        </button>
      </form>

      <div className="LibrarianDashboard-loansTabs">
        <button 
          className={`LibrarianDashboard-tabBtn ${viewMode === 'active' ? 'LibrarianDashboard-tabBtn--active' : ''}`}
          onClick={() => setViewMode('active')}
        >
          На руках ({activeLoans.length})
        </button>
        <button 
          className={`LibrarianDashboard-tabBtn ${viewMode === 'returned' ? 'LibrarianDashboard-tabBtn--active' : ''}`}
          onClick={() => setViewMode('returned')}
        >
          Возвращенные ({returnedBooks.length})
        </button>
      </div>

      <div className="LibrarianDashboard-loansTable">
        <h3 className="LibrarianDashboard-tableTitle">{viewMode === 'active' ? 'Книги на руках' : 'История возвратов'}</h3>
        <table className="LibrarianDashboard-dataTable">
          <thead className="LibrarianDashboard-tableHead">
            <tr className="LibrarianDashboard-tableRow">
              <th className="LibrarianDashboard-tableHeader">Книга</th>
              <th className="LibrarianDashboard-tableHeader">Читатель</th>
              <th className="LibrarianDashboard-tableHeader">Дата выдачи</th>
              <th className="LibrarianDashboard-tableHeader">На руках</th>
              <th className="LibrarianDashboard-tableHeader">Статус</th>
            </tr>
          </thead>
          <tbody className="LibrarianDashboard-tableBody">
            {currentList.map(loan => (
              <tr key={loan.id} className={`LibrarianDashboard-tableRow LibrarianDashboard-tableRow--${loan.status}`}>
                <td className="LibrarianDashboard-tableCell">{loan.book}</td>
                <td className="LibrarianDashboard-tableCell">{loan.reader}</td>
                <td className="LibrarianDashboard-tableCell">{loan.date}</td>
                <td className="LibrarianDashboard-tableCell">
                  <span className={loan.daysOnLoan > LOAN_DAYS_LIMIT ? 'LibrarianDashboard-overdueDays' : 'LibrarianDashboard-normalDays'}>
                    {loan.daysOnLoan} {getDaysWord(loan.daysOnLoan)}
                  </span>
                </td>
                <td className="LibrarianDashboard-tableCell">
                  <span className={`LibrarianDashboard-statusBadge LibrarianDashboard-statusBadge--${loan.status}`} title={loan.daysInfo}>
                    {loan.statusText}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {currentList.length === 0 && (
          <p className="LibrarianDashboard-emptyMessage">
            {viewMode === 'active' ? 'Нет книг на руках' : 'Нет возвращенных книг'}
          </p>
        )}
      </div>
    </div>
  );
};

const ReturnsManagement = ({ token }) => {
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedReader, setSelectedReader] = useState('');
  const [activeLoans, setActiveLoans] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returning, setReturning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [loansRes, booksRes, readersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/book_loan_by_user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/book_full_info/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/user_student/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
      ]);

      if (!loansRes.ok || !booksRes.ok || !readersRes.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const loansData = await loansRes.json();
      const booksData = await booksRes.json();
      const readersData = await readersRes.json();

      const active = loansData
        .filter(loan => loan.return_date === null || loan.return_date === undefined)
        .map((loan, index) => ({
          id: index + 1,
          bookId: loan.book_id,
          book: loan.title,
          readerId: loan.user_id,
          reader: loan.full_name,
          date: loan.issue_date,
        }));

      setActiveLoans(active);

      const formattedBooks = booksData.map(book => ({
        id: book.id,
        title: book.title,
      }));

      const formattedReaders = readersData.map(reader => ({
        id: reader.id,
        name: `${reader.last_name} ${reader.first_name} ${reader.middle_name || ''}`.trim(),
      }));

      setAvailableBooks(formattedBooks);
      setReaders(formattedReaders);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить данные: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    
    if (!selectedReader || !selectedBook) {
      alert('Пожалуйста, выберите читателя и книгу');
      return;
    }

    setReturning(true);
    setSuccessMessage('');
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/book_loan?book_id=${selectedBook}&user_id=${selectedReader}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const message = await response.text();
      setSuccessMessage(message);
      
      await fetchData();
      
      setSelectedReader('');
      setSelectedBook('');
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      alert('Ошибка при возврате книги: ' + err.message);
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <div className="LibrarianDashboard-loading">Загрузка данных...</div>;
  if (error) return <div className="LibrarianDashboard-error">{error}</div>;

  return (
    <div className="LibrarianDashboard-managementSection">
      <div className="LibrarianDashboard-sectionHeader">
        <h2 className="LibrarianDashboard-sectionTitle">Оформление возврата</h2>
        <button onClick={fetchData} className="LibrarianDashboard-btn LibrarianDashboard-btn--secondary">
          <i className="fas fa-sync"></i> Обновить
        </button>
      </div>

      {successMessage && (
        <div className="LibrarianDashboard-successMessage">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}

      <form onSubmit={handleReturn} className="LibrarianDashboard-returnForm">
        <h3 className="LibrarianDashboard-formTitle">Выберите книгу для возврата</h3>
        <div className="LibrarianDashboard-formRow">
          <div className="LibrarianDashboard-formGroup">
            <label className="LibrarianDashboard-formLabel">Читатель:</label>
            <select 
              className="LibrarianDashboard-formSelect"
              value={selectedReader} 
              onChange={(e) => setSelectedReader(e.target.value)}
              required
              disabled={returning}
            >
              <option value="">Выберите читателя</option>
              {readers.map(reader => (
                <option key={reader.id} value={reader.id}>
                  {reader.name}
                </option>
              ))}
            </select>
          </div>

          <div className="LibrarianDashboard-formGroup">
            <label className="LibrarianDashboard-formLabel">Книга:</label>
            <select 
              className="LibrarianDashboard-formSelect"
              value={selectedBook} 
              onChange={(e) => setSelectedBook(e.target.value)}
              required
              disabled={returning}
            >
              <option value="">Выберите книгу</option>
              {availableBooks.map(book => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="LibrarianDashboard-btn LibrarianDashboard-btn--primary" disabled={returning}>
          {returning ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Возврат...
            </>
          ) : (
            'Оформить возврат'
          )}
        </button>
      </form>

      <div className="LibrarianDashboard-activeLoansList">
        <h3 className="LibrarianDashboard-tableTitle">Книги на руках у читателей</h3>
        <table className="LibrarianDashboard-dataTable">
          <thead className="LibrarianDashboard-tableHead">
            <tr className="LibrarianDashboard-tableRow">
              <th className="LibrarianDashboard-tableHeader">Книга</th>
              <th className="LibrarianDashboard-tableHeader">Читатель</th>
              <th className="LibrarianDashboard-tableHeader">Дата выдачи</th>
            </tr>
          </thead>
          <tbody className="LibrarianDashboard-tableBody">
            {activeLoans.map(loan => (
              <tr key={loan.id} className="LibrarianDashboard-tableRow">
                <td className="LibrarianDashboard-tableCell">{loan.book}</td>
                <td className="LibrarianDashboard-tableCell">{loan.reader}</td>
                <td className="LibrarianDashboard-tableCell">{loan.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeLoans.length === 0 && (
          <p className="LibrarianDashboard-emptyMessage">Нет книг на руках</p>
        )}
      </div>
    </div>
  );
};

export default LibrarianDashboard;