import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userBooks, setUserBooks] = useState([]);
  const [bookHistory, setBookHistory] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);

  const userEmail = user?.email;

  const fetchReservedBooks = async (userId) => {
    try {
      const reservedResponse = await fetch(
        `http://127.0.0.1:8001/book_reservation_by_user_id/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (reservedResponse.ok) {
        const reserved = await reservedResponse.json();
        let formattedReserved = [];
        
        if (Array.isArray(reserved)) {
          formattedReserved = reserved.map((book, index) => ({
            id: index + 1,
            bookId: book.book_id,
            title: book.book_title,
            author: book.book_author,
            reservationDate: book.reservation_date,
            expiryDate: book.expiry_date
          }));
        } else if (reserved && typeof reserved === 'object') {
          formattedReserved = [{
            id: 1,
            bookId: reserved.book_id,
            title: reserved.book_title,
            author: reserved.book_author,
            reservationDate: reserved.reservation_date,
            expiryDate: reserved.expiry_date
          }];
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        formattedReserved.sort((a, b) => {
          const expiryA = new Date(a.expiryDate);
          const expiryB = new Date(b.expiryDate);
          const isExpiredA = expiryA < today;
          const isExpiredB = expiryB < today;
          
          if (isExpiredA && !isExpiredB) return 1;
          if (!isExpiredA && isExpiredB) return -1;
          return expiryA - expiryB;
        });

        setReservedBooks(formattedReserved);
      }
    } catch (err) {
      console.error('Ошибка загрузки бронирований:', err);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail || !token) {
        setLoading(false);
        return;
      }

      try {
        const profileResponse = await fetch(
          `http://127.0.0.1:8001/user_email/${encodeURIComponent(userEmail)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error('Не удалось загрузить данные профиля');
        }

        const profile = await profileResponse.json();
        setProfileData(profile);

        if (profile.id && user && !user.id) {
          updateUser({ id: profile.id });
          console.log('Сохранён ID пользователя:', profile.id);
        }

        const loansResponse = await fetch(
          `http://127.0.0.1:8001/user_loan/${encodeURIComponent(userEmail)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        );

        if (loansResponse.ok) {
          const loans = await loansResponse.json();
          const formattedBooks = loans.map((loan, index) => ({
            id: index + 1,
            title: loan.book_title,
            author: loan.authors,
            issueDate: loan.issued_date,
            returnDate: loan.due_date,
            daysRemaining: loan.days_remaining,
            status: 'active'
          }));
          setUserBooks(formattedBooks);
        }

        const historyResponse = await fetch(
          `http://127.0.0.1:8001/user_returned_books/${encodeURIComponent(userEmail)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        );

        if (historyResponse.ok) {
          const history = await historyResponse.json();
          const formattedHistory = history.map((book, index) => ({
            id: index + 1,
            title: book.book_title,
            author: book.authors,
            issueDate: book.issued_date,
            returnDate: book.return_date,
            returnStatus: book.return_status,
            daysOverdue: book.days_overdue,
            status: 'returned'
          }));
          setBookHistory(formattedHistory);
        }

        if (profile.id) {
          await fetchReservedBooks(profile.id);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail, token, updateUser, user]);

  const handleCancelReservation = async (bookId, bookTitle) => {
    if (!user?.id) {
      alert('Ошибка: ID пользователя не найден');
      return;
    }

    if (!window.confirm(`Отменить бронирование книги "${bookTitle}"?`)) {
      return;
    }

    setCancelLoading(bookId);

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/book_reservation/?user_id=${user.id}&book_id=${bookId}`,
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
        throw new Error(responseText || 'Ошибка при отмене бронирования');
      }

      alert(responseText || 'Бронирование успешно отменено');
      
      if (profileData?.id) {
        await fetchReservedBooks(profileData.id);
      }

    } catch (err) {
      console.error('❌ Ошибка отмены бронирования:', err);
      alert(`Не удалось отменить бронирование: ${err.message}`);
    } finally {
      setCancelLoading(null);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="ProfilePage">
        <div className="ProfilePage-loading">Загрузка профиля...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ProfilePage">
        <div className="ProfilePage-error">Ошибка: {error}</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="ProfilePage">
        <div className="ProfilePage-error">Данные профиля не найдены</div>
      </div>
    );
  }

  // Формируем ФИО только с существующими полями
  const fullNameParts = [
    profileData.last_name,
    profileData.first_name,
    profileData.middle_name
  ].filter(Boolean); // Убираем null, undefined, пустые строки
  
  const fullName = fullNameParts.join(' ');

  const activeBooksCount = userBooks.length;

  const renderDaysStatus = (days) => {
    if (days < 0) {
      return <span className="ProfilePage-daysOverdue">Просрочено на {Math.abs(days)} дней</span>;
    } else if (days === 0) {
      return <span className="ProfilePage-daysToday">Сдать сегодня</span>;
    } else {
      return <span className="ProfilePage-daysRemaining">Осталось {days} дней</span>;
    }
  };

  const renderReturnStatus = (status, daysOverdue) => {
    if (status === 'возвращена вовремя') {
      return <span className="ProfilePage-returnStatus ProfilePage-returnStatus--onTime">✓ Вовремя</span>;
    } else if (status === 'возвращена с просрочкой') {
      return <span className="ProfilePage-returnStatus ProfilePage-returnStatus--overdue">⚠ С просрочкой ({daysOverdue} дн.)</span>;
    } else {
      return <span className="ProfilePage-returnStatus">{status}</span>;
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpired = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  return (
    <div className="ProfilePage">
      <div className="ProfilePage-header">
        <div className="ProfilePage-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
      
        <div className="ProfilePage-info">
          <div className="ProfilePage-headerTop">
            <h1 className="ProfilePage-name">{fullName}</h1>
          </div>
          <p className="ProfilePage-infoItem"><i className="fas fa-envelope"></i> {profileData.email}</p>
          <p className="ProfilePage-infoItem"><i className="fas fa-id-card"></i> Паспорт: {profileData.passport_number}</p>
          <p className="ProfilePage-infoItem"><i className="fas fa-birthday-cake"></i> Дата рождения: {profileData.date_of_birth}</p>
          {profileData.address && profileData.address !== null && (
            <p className="ProfilePage-infoItem"><i className="fas fa-home"></i> {profileData.address}</p>
          )}
        </div>
      </div>

      <div className="ProfilePage-stats">
        <div className="ProfilePage-statItem">
          <span className="ProfilePage-statValue">{activeBooksCount}</span>
          <span className="ProfilePage-statLabel">Книг на руках</span>
        </div>
        <div className="ProfilePage-statItem">
          <span className="ProfilePage-statValue">{profileData.total_loans}</span>
          <span className="ProfilePage-statLabel">Всего взято</span>
        </div>
        <div className="ProfilePage-statItem">
          <span className="ProfilePage-statValue">
            {userBooks.filter(book => book.daysRemaining < 0).length}
          </span>
          <span className="ProfilePage-statLabel">Просрочено</span>
        </div>
      </div>

      <div className="ProfilePage-section">
        <h2 className="ProfilePage-sectionTitle">Мои книги</h2>
        <div className="ProfilePage-booksList">
          {userBooks.length > 0 ? (
            userBooks.map(book => (
              <div key={book.id} className={`ProfilePage-bookItem ${book.daysRemaining < 0 ? 'ProfilePage-bookItem--overdue' : ''}`}>
                <div className="ProfilePage-bookInfo">
                  <h3 className="ProfilePage-bookTitle">{book.title}</h3>
                  <p className="ProfilePage-bookAuthor">{book.author}</p>
                  <p className="ProfilePage-bookDates">
                    Выдана: {book.issueDate} | Вернуть до: {book.returnDate}
                  </p>
                  <p className="ProfilePage-daysStatus">
                    {renderDaysStatus(book.daysRemaining)}
                  </p>
                </div>
                <span className={`ProfilePage-statusBadge ${book.daysRemaining < 0 ? 'ProfilePage-statusBadge--overdue' : 'ProfilePage-statusBadge--active'}`}>
                  {book.daysRemaining < 0 ? 'Просрочена' : 'Активна'}
                </span>
              </div>
            ))
          ) : (
            <p className="ProfilePage-emptyText">Нет активных книг</p>
          )}
        </div>
      </div>

      <div className="ProfilePage-section">
        <h2 className="ProfilePage-sectionTitle"><i className="fas fa-bookmark"></i> Забронированные книги</h2>
        <div className="ProfilePage-booksList">
          {reservedBooks.length > 0 ? (
            reservedBooks.map(book => {
              const daysUntilExpiry = getDaysUntilExpiry(book.expiryDate);
              const expired = isExpired(book.expiryDate);
              const currentBookId = book.bookId;
              
              return (
                <div 
                  key={book.id} 
                  className={`ProfilePage-bookItem ProfilePage-bookItem--reserved ${expired ? 'ProfilePage-bookItem--expired' : ''}`}
                >
                  <div className="ProfilePage-bookInfo">
                    <h3 className="ProfilePage-bookTitle">{book.title}</h3>
                    <p className="ProfilePage-bookAuthor">{book.author}</p>
                    <p className="ProfilePage-bookDates">
                      <i className="fas fa-calendar-check"></i> Забронировано: {book.reservationDate}
                    </p>
                    <p className="ProfilePage-bookDates">
                      <i className="fas fa-calendar-times"></i> Бронь истекает: {book.expiryDate}
                    </p>
                    <p className="ProfilePage-reservationStatus">
                      {expired ? (
                        <span className="ProfilePage-expiredText">⚠ Бронь истекла {Math.abs(daysUntilExpiry)} дней назад</span>
                      ) : daysUntilExpiry === 0 ? (
                        <span className="ProfilePage-todayText">📅 Истекает сегодня</span>
                      ) : (
                        <span className="ProfilePage-activeText">⏳ Осталось {daysUntilExpiry} дней</span>
                      )}
                    </p>
                  </div>
                  <div className="ProfilePage-reservationActions">
                    <span className={`ProfilePage-statusBadge ${expired ? 'ProfilePage-statusBadge--expiredBadge' : 'ProfilePage-statusBadge--reserved'}`}>
                      {expired ? (
                        <><i className="fas fa-times-circle"></i> Истекло</>
                      ) : (
                        <><i className="fas fa-bookmark"></i> Забронировано</>
                      )}
                    </span>
                    {!expired && (
                      <button
                        className="ProfilePage-btnCancel"
                        onClick={() => handleCancelReservation(currentBookId, book.title)}
                        disabled={cancelLoading === currentBookId}
                      >
                        {cancelLoading === currentBookId ? (
                          <><i className="fas fa-spinner fa-spin"></i> Отмена...</>
                        ) : (
                          <><i className="fas fa-times"></i> Отменить</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="ProfilePage-emptyText">Нет забронированных книг</p>
          )}
        </div>
      </div>

      <div className="ProfilePage-section">
        <h2 className="ProfilePage-sectionTitle">История чтения</h2>
        <div className="ProfilePage-booksList">
          {bookHistory.length > 0 ? (
            bookHistory.map(book => (
              <div key={book.id} className="ProfilePage-bookItem ProfilePage-bookItem--history">
                <div className="ProfilePage-bookInfo">
                  <h3 className="ProfilePage-bookTitle">{book.title}</h3>
                  <p className="ProfilePage-bookAuthor">{book.author}</p>
                  <p className="ProfilePage-bookDates">
                    Взята: {book.issueDate} | Возвращена: {book.returnDate}
                  </p>
                  <p className="ProfilePage-returnStatusLine">
                    Статус: {renderReturnStatus(book.returnStatus, book.daysOverdue)}
                  </p>
                </div>
                <span className="ProfilePage-statusBadge ProfilePage-statusBadge--returned">Возвращена</span>
              </div>
            ))
          ) : (
            <p className="ProfilePage-emptyText">История пуста</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;