// pages/BookDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BookDetailsPage.css';

const API_BASE_URL = 'http://127.0.0.1:8001';

const BookDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user, token } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [reservationMessage, setReservationMessage] = useState(null);

  const bookFromState = location.state?.bookData;

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);

      if (bookFromState) {
        setBook(bookFromState);
        setLoading(false);
        
        try {
          const response = await fetch(`${API_BASE_URL}/book_full_info/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          if (response.ok) {
            const freshData = await response.json();
            setBook(freshData);
          }
        } catch (err) {
          console.log('Не удалось обновить данные, используем кэш из навигации');
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/book_full_info/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Книга не найдена');
          }
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        const bookData = await response.json();
        setBook(bookData);
      } catch (err) {
        console.error('❌ Ошибка загрузки книги:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, bookFromState, token]);

  const handleOrderBook = async () => {
    if (!user || !token) {
      setReservationMessage({
        type: 'error',
        text: 'Необходимо авторизоваться для бронирования'
      });
      return;
    }

    console.log('User ID при бронировании:', user.id);
    console.log('User data:', user);

    if (!user.id) {
      setReservationMessage({
        type: 'error',
        text: 'ID пользователя не загружен. Пожалуйста, зайдите в профиль для загрузки данных.'
      });
      return;
    }

    setReservationLoading(true);
    setReservationMessage(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const requestBody = {
        book_id: parseInt(id),
        user_id: user.id,
        reservation_date: today
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/book_reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }

      if (!response.ok) {
        let errorMessage = 'Ошибка при бронировании';
        
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map(err => {
              if (err.loc && err.msg) {
                return `${err.loc.join('.')}: ${err.msg}`;
              }
              return err.msg || String(err);
            }).join('; ');
          } else {
            errorMessage = JSON.stringify(data.detail);
          }
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          errorMessage = JSON.stringify(data);
        }
        
        throw new Error(errorMessage);
      }

      setReservationMessage({
        type: 'success',
        text: 'Книга успешно забронирована! Вы можете забрать её в библиотеке.'
      });
      
    } catch (err) {
      console.error('❌ Ошибка бронирования:', err);
      setReservationMessage({
        type: 'error',
        text: err.message || 'Не удалось забронировать книгу. Попробуйте позже.'
      });
    } finally {
      setReservationLoading(false);
    }
  };

  const isStudent = () => {
    if (!user) return false;
    return user.role === 'student' || 
           user.role === 'студент' || 
           user.user_type === 'student' ||
           user.type === 'student';
  };

  const getAvailableCopies = () => {
    if (!book) return 0;
    const total = book.total_copies || 0;
    const issued = book.issued_count || 0;
    return Math.max(0, total - issued);
  };

  if (loading && !book) {
    return (
      <div className="BookDetailsPage">
        <div className="BookDetailsPage-loadingContainer">
          <div className="BookDetailsPage-loadingSpinner"></div>
          <p className="BookDetailsPage-loadingText">Загрузка информации о книге...</p>
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="BookDetailsPage">
        <Link to="/search" className="BookDetailsPage-backLink">
          <i className="fas fa-arrow-left"></i> Вернуться к поиску
        </Link>
        <div className="BookDetailsPage-errorContainer">
          <h2 className="BookDetailsPage-errorTitle">⚠️ Ошибка загрузки</h2>
          <p className="BookDetailsPage-errorText">{error}</p>
          <p className="BookDetailsPage-errorHint">Проверьте, запущен ли бэкенд на {API_BASE_URL}</p>
          <div className="BookDetailsPage-errorActions">
            <Link to="/" className="BookDetailsPage-btn BookDetailsPage-btn--primary">На главную</Link>
            <Link to="/search" className="BookDetailsPage-btn BookDetailsPage-btn--secondary">К поиску</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="BookDetailsPage">
        <Link to="/search" className="BookDetailsPage-backLink">
          <i className="fas fa-arrow-left"></i> Вернуться к поиску
        </Link>
        <div className="BookDetailsPage-errorContainer">
          <h2 className="BookDetailsPage-errorTitle">Книга не найдена</h2>
          <p className="BookDetailsPage-errorText">К сожалению, мы не смогли найти информацию об этой книге.</p>
          <Link to="/search" className="BookDetailsPage-btn BookDetailsPage-btn--primary">Перейти к поиску</Link>
        </div>
      </div>
    );
  }

  const title = book.title || 'Без названия';
  const authors = book.authors || 'Автор неизвестен';
  const publisher = book.publisher_name || 'Не указано';
  const year = book.publication_year || 'Не указан';
  const pages = book.page_count || 'Не указано';
  const illustrations = book.illustration_count || 0;
  const price = book.price;
  const isbn = book.isbn || 'Не указан';
  const locationsWithCopies = book.locations_with_copies || 'Не указано';
  const totalCopies = book.total_copies || 0;
  const issuedCount = book.issued_count || 0;
  const availableCopies = getAvailableCopies();
  
  let facultiesList = [];
  if (book.faculties) {
    if (typeof book.faculties === 'string') {
      facultiesList = book.faculties.split(',').map(f => f.trim()).filter(f => f);
    } else if (Array.isArray(book.faculties)) {
      facultiesList = book.faculties.map(f => typeof f === 'string' ? f : f.name);
    }
  }

  const canReserve = isStudent() && availableCopies > 0;
  const isAlreadyReserved = reservationMessage?.type === 'success';

  return (
    <div className="BookDetailsPage">
      <Link to="/search" className="BookDetailsPage-backLink">
        <i className="fas fa-arrow-left"></i> Вернуться к поиску
      </Link>

      <div className="BookDetailsPage-container">
        <div className="BookDetailsPage-mainInfo">
          <h1 className="BookDetailsPage-title">{title}</h1>
          <h2 className="BookDetailsPage-authors">{authors}</h2>
          
          <div className="BookDetailsPage-availability">
            <div className={`BookDetailsPage-availabilityStatus ${availableCopies > 0 ? 'BookDetailsPage-availabilityStatus--available' : 'BookDetailsPage-availabilityStatus--unavailable'}`}>
              {availableCopies > 0 ? '✓ Доступна для заказа' : '✗ Нет в наличии'}
            </div>
            <p className="BookDetailsPage-copiesInfo">В наличии: <strong>{availableCopies}</strong> из {totalCopies} экземпляров</p>
            {issuedCount > 0 && <p className="BookDetailsPage-issuedInfo">На руках у читателей: {issuedCount} экз.</p>}
          </div>

          {reservationMessage && (
            <div className={`BookDetailsPage-reservationMessage BookDetailsPage-reservationMessage--${reservationMessage.type}`}>
              <i className={`fas ${reservationMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span className="BookDetailsPage-reservationText">{reservationMessage.text}</span>
            </div>
          )}

          {canReserve && !isAlreadyReserved && (
            <button 
              onClick={handleOrderBook} 
              className="BookDetailsPage-btn BookDetailsPage-btn--primary BookDetailsPage-btn--large"
              disabled={reservationLoading}
            >
              {reservationLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Бронирование...</>
              ) : (
                <><i className="fas fa-bookmark"></i> Забронировать книгу</>
              )}
            </button>
          )}
          
          {isAlreadyReserved && (
            <div className="BookDetailsPage-successHint">
              <i className="fas fa-check"></i> Книга забронирована
            </div>
          )}
          
          {user && !isStudent() && availableCopies > 0 && (
            <div className="BookDetailsPage-authHint">
              <p className="BookDetailsPage-hintText"><i className="fas fa-info-circle"></i> Бронирование доступно только для студентов</p>
            </div>
          )}
          
          {!user && availableCopies > 0 && (
            <div className="BookDetailsPage-authHint">
              <Link to="/login" className="BookDetailsPage-btn BookDetailsPage-btn--secondary">
                <i className="fas fa-sign-in-alt"></i> Войдите, чтобы забронировать
              </Link>
            </div>
          )}
        </div>

        <div className="BookDetailsPage-detailedInfo">
          <div className="BookDetailsPage-infoSection">
            <h3 className="BookDetailsPage-sectionTitle"><i className="fas fa-info-circle"></i> Информация о книге</h3>
            <table className="BookDetailsPage-infoTable">
              <tbody className="BookDetailsPage-tableBody">
                <tr className="BookDetailsPage-tableRow">
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--label">ISBN:</td>
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--value">{isbn}</td>
                </tr>
                <tr className="BookDetailsPage-tableRow">
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--label">Издательство:</td>
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--value">{publisher}</td>
                </tr>
                <tr className="BookDetailsPage-tableRow">
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--label">Год издания:</td>
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--value">{year}</td>
                </tr>
                <tr className="BookDetailsPage-tableRow">
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--label">Количество страниц:</td>
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--value">{pages}</td>
                </tr>
                <tr className="BookDetailsPage-tableRow">
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--label">Количество иллюстраций:</td>
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--value">{illustrations}</td>
                </tr>
                <tr className="BookDetailsPage-tableRow">
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--label">Стоимость:</td>
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--value">{price ? `${price} ₽` : 'Не указана'}</td>
                </tr>
                <tr className="BookDetailsPage-tableRow">
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--label">Место хранения:</td>
                  <td className="BookDetailsPage-tableCell BookDetailsPage-tableCell--value">{locationsWithCopies}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {facultiesList.length > 0 && (
            <div className="BookDetailsPage-infoSection">
              <h3 className="BookDetailsPage-sectionTitle"><i className="fas fa-university"></i> Используется на факультетах</h3>
              <div className="BookDetailsPage-facultiesList">
                {facultiesList.map((faculty, index) => (
                  <span key={index} className="BookDetailsPage-facultyBadge" style={{backgroundColor: getFacultyColor(index)}}>{faculty}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Функция для цветов факультетов
const getFacultyColor = (index) => {
  const colors = ['#DAA520', '#CD853F', '#BC8F8F', '#F4A460', '#DEB887', '#D2B48C', '#B8860B'];
  return colors[index % colors.length];
};

export default BookDetailsPage;