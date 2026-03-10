// pages/HomePage.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [popularBooks, setPopularBooks] = useState([]);
  const [locations, setLocations] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ books: null, locations: null, faculties: null });
  
  const booksSectionRef = useRef(null);
  const locationsSectionRef = useRef(null);
  const facultiesSectionRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const newErrors = { books: null, locations: null, faculties: null };

      try {
        const booksResponse = await fetch('http://127.0.0.1:8001/book_full_info/ ');
        if (!booksResponse.ok) throw new Error(`HTTP ${booksResponse.status}`);
        const booksData = await booksResponse.json();
        setPopularBooks(booksData);
      } catch (err) {
        console.error('❌ Ошибка загрузки книг:', err);
        newErrors.books = err.message;
        setPopularBooks([]);
      }

      try {
        const locationsResponse = await fetch('http://127.0.0.1:8001/location/ ');
        if (!locationsResponse.ok) {
          throw new Error(`HTTP ${locationsResponse.status}: ${locationsResponse.statusText}`);
        }
        const locationsData = await locationsResponse.json();
        
        if (!Array.isArray(locationsData)) {
          throw new Error('Неверный формат данных');
        }
        
        setLocations(locationsData);
        console.log('✅ Филиалы загружены:', locationsData.length);
      } catch (err) {
        console.error('❌ Ошибка загрузки филиалов:', err);
        newErrors.locations = err.message;
        setLocations([]);
      }

      try {
        const facultiesResponse = await fetch('http://127.0.0.1:8001/faculty/ ');
        if (!facultiesResponse.ok) {
          throw new Error(`HTTP ${facultiesResponse.status}: ${facultiesResponse.statusText}`);
        }
        const facultiesData = await facultiesResponse.json();
        
        if (!Array.isArray(facultiesData)) {
          throw new Error('Неверный формат данных: ожидался массив');
        }
        
        setFaculties(facultiesData);
        console.log('✅ Факультеты загружены:', facultiesData.length);
      } catch (err) {
        console.error('❌ Ошибка загрузки факультетов:', err);
        newErrors.faculties = err.message;
        setFaculties([]);
      }

      setErrors(newErrors);
      setLoading(false);
    };

    fetchData();
  }, []);

  const scrollToBooks = () => {
    booksSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToLocations = () => {
    locationsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToFaculties = () => {
    facultiesSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const totalBookTitles = popularBooks.length;
  const hasAnyError = errors.books || errors.locations || errors.faculties;

  return (
    <div className="HomePage">
      <section className="HomePage-hero">
        <h1 className="HomePage-hero-title">Добро пожаловать в библиотеку!</h1>
        <p className="HomePage-hero-subtitle">Здесь вы найдете тысячи книг для учебы и отдыха</p>
        <Link to="/search" className="HomePage-btn HomePage-btn-primary">Начать поиск</Link>
      </section>

      {hasAnyError && (
        <section className="HomePage-error-banner">
          <h3 className="HomePage-error-title">⚠️ Проблемы с загрузкой данных:</h3>
          <ul className="HomePage-error-list">
            {errors.books && <li className="HomePage-error-item">Книги: {errors.books}</li>}
            {errors.locations && <li className="HomePage-error-item">Филиалы: {errors.locations}</li>}
            {errors.faculties && <li className="HomePage-error-item">Факультеты: {errors.faculties}</li>}
          </ul>
          <p className="HomePage-error-hint">Проверьте, запущен ли бэкенд на http://127.0.0.1:8001 </p>
        </section>
      )}

      <section className="HomePage-stats">
        <h2 className="HomePage-stats-title">Библиотека в цифрах</h2>
        <div className="HomePage-stats-grid">
          <div 
            className={`HomePage-stat-card ${!errors.books ? 'HomePage-stat-card--clickable' : 'HomePage-stat-card--error'}`}
            onClick={!errors.books ? scrollToBooks : undefined}
            title={errors.books ? `Ошибка: ${errors.books}` : "Нажмите, чтобы увидеть книги"}
          >
            <i className="fas fa-book HomePage-stat-icon"></i>
            <h3 className="HomePage-stat-number">{totalBookTitles}</h3>
            <p className="HomePage-stat-label">Книг в фонде</p>
            {!errors.books && <span className="HomePage-click-hint">↓ Нажмите</span>}
            {errors.books && <span className="HomePage-error-hint">✗ Ошибка</span>}
          </div>
          
          <div 
            className={`HomePage-stat-card ${!errors.locations ? 'HomePage-stat-card--clickable' : 'HomePage-stat-card--error'}`}
            onClick={!errors.locations ? scrollToLocations : undefined}
            title={errors.locations ? `Ошибка: ${errors.locations}` : "Нажмите, чтобы увидеть филиалы"}
          >
            <i className="fas fa-building HomePage-stat-icon"></i>
            <h3 className="HomePage-stat-number">{locations.length}</h3>
            <p className="HomePage-stat-label">Филиалов</p>
            {!errors.locations && <span className="HomePage-click-hint">↓ Нажмите</span>}
            {errors.locations && <span className="HomePage-error-hint">✗ Ошибка</span>}
          </div>
          
          <div 
            className={`HomePage-stat-card ${!errors.faculties ? 'HomePage-stat-card--clickable' : 'HomePage-stat-card--error'}`}
            onClick={!errors.faculties ? scrollToFaculties : undefined}
            title={errors.faculties ? `Ошибка: ${errors.faculties}` : "Нажмите, чтобы увидеть факультеты"}
          >
            <i className="fas fa-graduation-cap HomePage-stat-icon"></i>
            <h3 className="HomePage-stat-number">{faculties.length}</h3>
            <p className="HomePage-stat-label">Факультетов</p>
            {!errors.faculties && <span className="HomePage-click-hint">↓ Нажмите</span>}
            {errors.faculties && <span className="HomePage-error-hint">✗ Ошибка</span>}
          </div>
        </div>
      </section>

      {!errors.books && (
        <section className="HomePage-books" ref={booksSectionRef}>
          <h2 className="HomePage-section-title">Книги</h2>
          {loading ? (
            <div className="HomePage-loading">Загрузка...</div>
          ) : (
            <div className="HomePage-books-grid">
              {popularBooks.map(book => (
                <div key={book.id} className="HomePage-book-card">
                  <h3 className="HomePage-book-title">{book.title}</h3>
                  <p className="HomePage-book-author">{book.authors}</p>
                  <p className="HomePage-book-year">{book.publication_year} г.</p>
                  <div className="HomePage-book-stats">
                    <span className="HomePage-book-stat">📚 {book.total_copies} экз.</span>
                    <span className="HomePage-book-stat">📖 {book.page_count} стр.</span>
                  </div>
                  <Link 
                    to={`/book/${book.id}`} 
                    state={{ 
                      bookData: {
                        id: book.id,
                        title: book.title,
                        isbn: book.isbn,
                        publication_year: book.publication_year,
                        page_count: book.page_count,
                        illustration_count: book.illustration_count,
                        price: book.price,
                        publisher_name: book.publisher_name,
                        authors: book.authors,
                        locations_with_copies: book.locations_with_copies,
                        total_copies: book.total_copies,
                        issued_count: book.issued_count,
                        faculties: book.faculties
                      }
                    }}
                    className="HomePage-btn HomePage-btn-small"
                  >
                    Подробнее
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!errors.locations && (
        <section className="HomePage-locations" ref={locationsSectionRef}>
          <h2 className="HomePage-section-title">Наши филиалы</h2>
          {loading ? (
            <div className="HomePage-loading">Загрузка...</div>
          ) : (
            <div className="HomePage-locations-grid">
              {locations.map(location => (
                <div key={location.id} className="HomePage-location-card">
                  <div className="HomePage-location-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <h3 className="HomePage-location-name">{location.name}</h3>
                  <p className="HomePage-location-address">
                    <i className="fas fa-home"></i> {location.address || 'Адрес не указан'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!errors.faculties && (
        <section className="HomePage-faculties" ref={facultiesSectionRef}>
          <h2 className="HomePage-section-title">Факультеты</h2>
          {loading ? (
            <div className="HomePage-loading">Загрузка...</div>
          ) : (
            <div className="HomePage-faculties-grid">
              {faculties.map(faculty => (
                <div key={faculty.id} className="HomePage-faculty-card">
                  <div className="HomePage-faculty-icon">
                    <i className="fas fa-university"></i>
                  </div>
                  <h3 className="HomePage-faculty-name">{faculty.name}</h3>
                  <p className="HomePage-faculty-description">
                    {faculty.description || 'Описание отсутствует'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default HomePage;