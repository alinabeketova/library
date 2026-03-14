// pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const API_BASE_URL = 'http://127.0.0.1:8001';

// Валидационные функции
const validators = {
  book: {
    title: (value) => {
      if (!value || value.trim().length === 0) return 'Название обязательно';
      if (value.trim().length > 255) return 'Название не должно превышать 255 символов';
      return null;
    },
    isbn: (value) => {
      if (!value || value.trim().length === 0) return 'ISBN обязателен';
      if (value.trim().length > 30) return 'ISBN не должен превышать 30 символов';
      if (!/^[0-9\-Xx]+$/.test(value.trim())) return 'ISBN содержит недопустимые символы';
      return null;
    },
    publisher_id: (value) => {
      if (!value) return 'Издательство обязательно';
      return null;
    },
    publication_year: (value) => {
      if (!value) return 'Год издания обязателен';
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear + 1) return `Год должен быть между 1800 и ${currentYear + 1}`;
      return null;
    },
    page_count: (value) => {
      if (!value) return 'Количество страниц обязательно';
      const pages = parseInt(value);
      if (isNaN(pages) || pages < 1) return 'Количество страниц должно быть больше 0';
      if (pages > 10000) return 'Количество страниц не должно превышать 10000';
      return null;
    },
    price: (value) => {
      if (!value && value !== 0) return 'Цена обязательна';
      const price = parseFloat(value);
      if (isNaN(price) || price < 0) return 'Цена не может быть отрицательной';
      if (price > 1000000) return 'Цена не должна превышать 1 000 000';
      return null;
    },
    illustration_count: (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const count = parseInt(value);
      if (isNaN(count) || count < 0) return 'Количество иллюстраций не может быть отрицательным';
      if (count > 10000) return 'Количество иллюстраций не должно превышать 10000';
      return null;
    },
    copies_count: (value) => {
      if (!value) return 'Количество экземпляров обязательно';
      const count = parseInt(value);
      if (isNaN(count) || count < 1) return 'Количество экземпляров должно быть не менее 1';
      if (count > 1000) return 'Количество экземпляров не должно превышать 1000';
      return null;
    }
  },
  user: {
    first_name: (value, isEdit = false) => {
      if (isEdit && (!value || !value.trim())) return null; // Необязательно при редактировании
      if (!value || value.trim().length === 0) return 'Имя обязательно';
      if (value.trim().length > 50) return 'Имя не должно превышать 50 символов';
      if (!/^[а-яА-ЯёЁa-zA-Z\s\-]+$/.test(value.trim())) return 'Имя содержит недопустимые символы';
      return null;
    },
    last_name: (value, isEdit = false) => {
      if (isEdit && (!value || !value.trim())) return null;
      if (!value || value.trim().length === 0) return 'Фамилия обязательна';
      if (value.trim().length > 50) return 'Фамилия не должна превышать 50 символов';
      if (!/^[а-яА-ЯёЁa-zA-Z\s\-]+$/.test(value.trim())) return 'Фамилия содержит недопустимые символы';
      return null;
    },
    middle_name: (value) => {
      if (!value || value.trim().length === 0) return null;
      if (value.trim().length > 50) return 'Отчество не должно превышать 50 символов';
      if (!/^[а-яА-ЯёЁa-zA-Z\s\-]+$/.test(value.trim())) return 'Отчество содержит недопустимые символы';
      return null;
    },
    date_of_birth: (value, isEdit = false) => {
      if (isEdit) return null; // Не валидируем при редактировании
      if (!value) return 'Дата рождения обязательна';
      const date = new Date(value);
      const now = new Date();
      const minDate = new Date('1900-01-01');
      if (isNaN(date.getTime())) return 'Некорректная дата';
      if (date > now) return 'Дата рождения не может быть в будущем';
      if (date < minDate) return 'Дата рождения не может быть раньше 1900 года';
      const age = now.getFullYear() - date.getFullYear();
      if (age < 16) return 'Пользователь должен быть старше 16 лет';
      return null;
    },
    email: (value) => {
      if (!value || value.trim().length === 0) return 'Email обязателен';
      if (value.trim().length > 100) return 'Email не должен превышать 100 символов';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) return 'Некорректный формат email';
      return null;
    },
    passport_number: (value, isEdit = false) => {
      if (isEdit && (!value || !value.trim())) return null;
      if (!value || value.trim().length === 0) return 'Номер паспорта обязателен';
      if (value.trim().length > 20) return 'Номер паспорта не должен превышать 20 символов';
      if (!/^[0-9A-Za-z]+$/.test(value.trim())) return 'Паспорт содержит недопустимые символы';
      return null;
    },
    password: (value) => {
      if (!value || value.length === 0) return 'Пароль обязателен';
      if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
      if (value.length > 100) return 'Пароль не должен превышать 100 символов';
      return null;
    },
    address: (value) => {
      if (!value || value.trim().length === 0) return null;
      if (value.trim().length > 200) return 'Адрес не должен превышать 200 символов';
      return null;
    }
  },
  location: {
    name: (value) => {
      if (!value || value.trim().length === 0) return 'Название обязательно';
      if (value.trim().length > 100) return 'Название не должно превышать 100 символов';
      return null;
    },
    address: (value) => {
      if (!value || value.trim().length === 0) return 'Адрес обязателен';
      if (value.trim().length > 200) return 'Адрес не должен превышать 200 символов';
      return null;
    }
  },
  secretCode: {
    code: (value) => {
      if (!value || value.trim().length === 0) return 'Код обязателен';
      if (value.trim().length < 3) return 'Код должен содержать минимум 3 символа';
      if (value.trim().length > 20) return 'Код не должен превышать 20 символов';
      if (!/^[a-zA-Z0-9]+$/.test(value.trim())) return 'Код может содержать только буквы и цифры';
      return null;
    },
    description: (value) => {
      if (value && value.trim().length > 200) return 'Описание не должно превышать 200 символов';
      return null;
    }
  }
};

// Функция для валидации всей формы
const validateForm = (data, type, options = {}) => {
  const errors = {};
  const validator = validators[type];
  
  if (!validator) return { isValid: true, errors: {} };

  for (const [field, validateFn] of Object.entries(validator)) {
    const error = validateFn(data[field], options.isEdit);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('books');
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalLibrarians: 0,
    totalBranches: 0,
    activeLoans: 1289,
    overdueLoans: 43,
    totalSecretCodes: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      const [booksRes, usersRes, librariansRes, branchesRes, codesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/book_full_info/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/user_student/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/user_librarian/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/location`),
        fetch(`${API_BASE_URL}/secret_codes/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ ok: false }))
      ]);

      const [books, users, librarians, branches, codes] = await Promise.all([
        booksRes.ok ? booksRes.json() : [],
        usersRes.ok ? usersRes.json() : [],
        librariansRes.ok ? librariansRes.json() : [],
        branchesRes.ok ? branchesRes.json() : [],
        codesRes.ok ? codesRes.json() : []
      ]);

      setStats({
        totalBooks: Array.isArray(books) ? books.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalLibrarians: Array.isArray(librarians) ? librarians.length : 0,
        totalBranches: Array.isArray(branches) ? branches.length : 0,
        activeLoans: 1289,
        overdueLoans: 43,
        totalSecretCodes: Array.isArray(codes) ? codes.length : 0
      });
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  if (!user || !token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="AdminDashboard-container">
      <h1 className="AdminDashboard-title">Панель администратора</h1>
      
      <div className="AdminDashboard-statsGrid">
        <div className="AdminDashboard-statCard">
          <i className="fas fa-book AdminDashboard-statIcon"></i>
          <div className="AdminDashboard-statInfo">
            <span className="AdminDashboard-statValue">
              {statsLoading ? <i className="fas fa-spinner fa-spin"></i> : stats.totalBooks}
            </span>
            <span className="AdminDashboard-statLabel">Всего книг</span>
          </div>
        </div>
        <div className="AdminDashboard-statCard">
          <i className="fas fa-users AdminDashboard-statIcon"></i>
          <div className="AdminDashboard-statInfo">
            <span className="AdminDashboard-statValue">
              {statsLoading ? <i className="fas fa-spinner fa-spin"></i> : stats.totalUsers}
            </span>
            <span className="AdminDashboard-statLabel">Читателей</span>
          </div>
        </div>
        <div className="AdminDashboard-statCard">
          <i className="fas fa-user-tie AdminDashboard-statIcon"></i>
          <div className="AdminDashboard-statInfo">
            <span className="AdminDashboard-statValue">
              {statsLoading ? <i className="fas fa-spinner fa-spin"></i> : stats.totalLibrarians}
            </span>
            <span className="AdminDashboard-statLabel">Библиотекарей</span>
          </div>
        </div>
        <div className="AdminDashboard-statCard">
          <i className="fas fa-building AdminDashboard-statIcon"></i>
          <div className="AdminDashboard-statInfo">
            <span className="AdminDashboard-statValue">
              {statsLoading ? <i className="fas fa-spinner fa-spin"></i> : stats.totalBranches}
            </span>
            <span className="AdminDashboard-statLabel">Филиалов</span>
          </div>
        </div>
      </div>

      <div className="AdminDashboard-tabs">
        <button 
          className={`AdminDashboard-tabBtn ${activeTab === 'books' ? 'AdminDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          Книги
        </button>
        <button 
          className={`AdminDashboard-tabBtn ${activeTab === 'users' ? 'AdminDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button 
          className={`AdminDashboard-tabBtn ${activeTab === 'branches' ? 'AdminDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('branches')}
        >
          Филиалы
        </button>
        <button 
          className={`AdminDashboard-tabBtn ${activeTab === 'librarians' ? 'AdminDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('librarians')}
        >
          Библиотекари
        </button>
        <button 
          className={`AdminDashboard-tabBtn ${activeTab === 'codes' ? 'AdminDashboard-tabBtn--active' : ''}`}
          onClick={() => setActiveTab('codes')}
        >
          Коды регистрации
        </button>
      </div>

      <div className="AdminDashboard-tabContent">
        {activeTab === 'books' && <BooksManagement token={token} />}
        {activeTab === 'users' && <UsersManagement token={token} />}
        {activeTab === 'branches' && <BranchesManagement token={token} />}
        {activeTab === 'librarians' && <LibrariansManagement token={token} />}
        {activeTab === 'codes' && <RegistrationCodesManagement token={token} />}
      </div>
    </div>
  );
};

// Компонент управления книгами (ИЗМЕНЕННЫЙ)
const BooksManagement = ({ token }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    publisher_id: '',
    publication_year: '',
    page_count: '',
    price: '',
    illustration_count: '',
    copies_count: ''
  });
  const [editPrice, setEditPrice] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchBooks();
  }, [token]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/book_full_info/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить список книг');
    } finally {
      setLoading(false);
    }
  };

  const validateNewBook = (data) => {
    const errors = {};
    
    const titleError = validators.book.title(data.title);
    if (titleError) errors.title = titleError;

    const isbnError = validators.book.isbn(data.isbn);
    if (isbnError) errors.isbn = isbnError;

    const publisherError = validators.book.publisher_id(data.publisher_id);
    if (publisherError) errors.publisher_id = publisherError;

    const yearError = validators.book.publication_year(data.publication_year);
    if (yearError) errors.publication_year = yearError;

    const pagesError = validators.book.page_count(data.page_count);
    if (pagesError) errors.page_count = pagesError;

    const priceError = validators.book.price(data.price);
    if (priceError) errors.price = priceError;

    const illError = validators.book.illustration_count(data.illustration_count);
    if (illError) errors.illustration_count = illError;

    const copiesError = validators.book.copies_count(data.copies_count);
    if (copiesError) errors.copies_count = copiesError;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const validateEditPrice = (value) => {
    const errors = {};
    const priceError = validators.book.price(value);
    if (priceError) errors.price = priceError;
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateNewBook(newBook);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setSubmitLoading(true);
    setFormErrors({});

    try {
      const params = new URLSearchParams();
      params.append('title', newBook.title.trim());
      params.append('isbn', newBook.isbn.trim());
      params.append('publisher_id', newBook.publisher_id);
      params.append('publication_year', newBook.publication_year);
      params.append('page_count', newBook.page_count);
      params.append('price', newBook.price);
      if (newBook.illustration_count) params.append('illustration_count', newBook.illustration_count);
      params.append('copies_count', newBook.copies_count);

      const response = await fetch(`${API_BASE_URL}/book?${params.toString()}`, {
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
      setNewBook({
        title: '',
        isbn: '',
        publisher_id: '',
        publication_year: '',
        page_count: '',
        price: '',
        illustration_count: '',
        copies_count: ''
      });
      fetchBooks();
    } catch (err) {
      setError(err.message || 'Не удалось добавить книгу');
    } finally {
      setSubmitLoading(false);
    }
  };

    const handleEditBook = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateEditPrice(editPrice);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setSubmitLoading(true);
    setFormErrors({});

    try {
      const params = new URLSearchParams();
      // Обязательные параметры - текущие значения книги
      params.append('title', editingBook.title);
      params.append('isbn', editingBook.isbn);
      // Изменяемое поле
      params.append('price', editPrice);

      const response = await fetch(`${API_BASE_URL}/book/?${params.toString()}`, {
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
      setEditingBook(null);
      setEditPrice('');
      fetchBooks();
    } catch (err) {
      setError(err.message || 'Не удалось обновить цену');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту книгу?')) return;
    
    setDeleteLoading(bookId);
    try {
      const response = await fetch(`${API_BASE_URL}/book/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Ошибка HTTP: ${response.status}`);
      }
      
      fetchBooks();
    } catch (err) {
      setError('Не удалось удалить книгу: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const openEditForm = (book) => {
    setEditingBook(book);
    setEditPrice(book.price.toString());
    setShowEditForm(true);
    setShowAddForm(false);
    setFormErrors({});
    setError(null);
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
          <span>Загрузка книг...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminDashboard-managementSection">
      <div className="AdminDashboard-sectionHeader">
        <h2 className="AdminDashboard-sectionTitle">Управление книгами</h2>
        <button 
          className="AdminDashboard-btn AdminDashboard-btn--primary" 
          onClick={() => { 
            setShowAddForm(true); 
            setShowEditForm(false);
            setEditingBook(null);
            setError(null);
            setFormErrors({});
          }}
        >
          <i className="fas fa-plus"></i> Добавить книгу
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddBook} className="AdminDashboard-addForm">
          <h3 className="AdminDashboard-formTitle">Добавление новой книги</h3>
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
                className={`AdminDashboard-formInput ${formErrors.title ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.title} 
                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                placeholder="Введите название книги"
              />
              {renderFieldError('title')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">ISBN *</label>
              <input 
                type="text" 
                className={`AdminDashboard-formInput ${formErrors.isbn ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.isbn} 
                onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                placeholder="978-3-16-148410-0"
              />
              {renderFieldError('isbn')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Издательство ID *</label>
              <input 
                type="number" 
                className={`AdminDashboard-formInput ${formErrors.publisher_id ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.publisher_id} 
                onChange={(e) => setNewBook({...newBook, publisher_id: e.target.value})}
                placeholder="1"
              />
              {renderFieldError('publisher_id')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Год издания *</label>
              <input 
                type="number" 
                className={`AdminDashboard-formInput ${formErrors.publication_year ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.publication_year} 
                onChange={(e) => setNewBook({...newBook, publication_year: e.target.value})}
                placeholder="2024"
              />
              {renderFieldError('publication_year')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Количество страниц *</label>
              <input 
                type="number" 
                className={`AdminDashboard-formInput ${formErrors.page_count ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.page_count} 
                onChange={(e) => setNewBook({...newBook, page_count: e.target.value})}
                placeholder="300"
              />
              {renderFieldError('page_count')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Цена *</label>
              <input 
                type="number" 
                step="0.01"
                className={`AdminDashboard-formInput ${formErrors.price ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.price} 
                onChange={(e) => setNewBook({...newBook, price: e.target.value})}
                placeholder="599.99"
              />
              {renderFieldError('price')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Количество иллюстраций</label>
              <input 
                type="number" 
                className={`AdminDashboard-formInput ${formErrors.illustration_count ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.illustration_count} 
                onChange={(e) => setNewBook({...newBook, illustration_count: e.target.value})}
                placeholder="10"
              />
              {renderFieldError('illustration_count')}
            </div>

            <div className="AdminDashboard-formGroup">
              <label className="AdminDashboard-formLabel">Количество экземпляров *</label>
              <input 
                type="number" 
                className={`AdminDashboard-formInput ${formErrors.copies_count ? 'AdminDashboard-formInput--error' : ''}`}
                value={newBook.copies_count} 
                onChange={(e) => setNewBook({...newBook, copies_count: e.target.value})}
                placeholder="5"
              />
              {renderFieldError('copies_count')}
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
                setNewBook({
                  title: '',
                  isbn: '',
                  publisher_id: '',
                  publication_year: '',
                  page_count: '',
                  price: '',
                  illustration_count: '',
                  copies_count: ''
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

      {showEditForm && editingBook && (
        <form onSubmit={handleEditBook} className="AdminDashboard-addForm">
          <h3 className="AdminDashboard-formTitle">Изменение цены книги</h3>
          <p className="AdminDashboard-formSubtitle">
            <strong>{editingBook.title}</strong> (ISBN: {editingBook.isbn})
          </p>
          {error && (
            <div className="AdminDashboard-formError">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="AdminDashboard-formGrid">
            <div className="AdminDashboard-formGroup AdminDashboard-formGroup--fullWidth">
              <label className="AdminDashboard-formLabel">Новая цена *</label>
              <input 
                type="number" 
                step="0.01"
                className={`AdminDashboard-formInput ${formErrors.price ? 'AdminDashboard-formInput--error' : ''}`}
                value={editPrice} 
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="599.99"
              />
              {renderFieldError('price')}
            </div>
          </div>

          <div className="AdminDashboard-formActions">
            <button 
              type="submit" 
              className="AdminDashboard-btn AdminDashboard-btn--primary" 
              disabled={submitLoading}
            >
              {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Обновление...</> : 'Обновить цену'}
            </button>
            <button 
              type="button" 
              className="AdminDashboard-btn" 
              onClick={() => { 
                setShowEditForm(false); 
                setEditingBook(null);
                setEditPrice('');
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
          <button className="AdminDashboard-btn AdminDashboard-btn--primary" onClick={fetchBooks}>
            <i className="fas fa-sync"></i>
          </button>
        </div>
      )}

      <table className="AdminDashboard-dataTable">
        <thead className="AdminDashboard-dataTableHead">
          <tr className="AdminDashboard-dataTableRow">
            <th className="AdminDashboard-dataTableHeader">Название</th>
            <th className="AdminDashboard-dataTableHeader">ISBN</th>
            <th className="AdminDashboard-dataTableHeader">Год</th>
            <th className="AdminDashboard-dataTableHeader">Страниц</th>
            <th className="AdminDashboard-dataTableHeader">Цена</th>
            <th className="AdminDashboard-dataTableHeader">Экземпляров</th>
            <th className="AdminDashboard-dataTableHeader">Действия</th>
          </tr>
        </thead>
        <tbody className="AdminDashboard-dataTableBody">
          {books.map(book => (
            <tr key={book.id} className="AdminDashboard-dataTableRow">
              <td className="AdminDashboard-dataTableCell">{book.title}</td>
              <td className="AdminDashboard-dataTableCell">{book.isbn}</td>
              <td className="AdminDashboard-dataTableCell">{book.publication_year}</td>
              <td className="AdminDashboard-dataTableCell">{book.page_count}</td>
              <td className="AdminDashboard-dataTableCell">{book.price} ₽</td>
              <td className="AdminDashboard-dataTableCell">{book.copies_count}</td>
              <td className="AdminDashboard-dataTableCell">
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--edit" 
                  title="Изменить цену"
                  onClick={() => openEditForm(book)}
                >
                  <i className="fas fa-tag"></i>
                </button>
                <button 
                  className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete" 
                  title="Удалить"
                  onClick={() => handleDeleteBook(book.id)}
                  disabled={deleteLoading === book.id}
                >
                  {deleteLoading === book.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {books.length === 0 && !loading && (
        <div className="AdminDashboard-emptyState">
          <i className="fas fa-book AdminDashboard-emptyIcon"></i>
          <p className="AdminDashboard-emptyText">Книги не найдены</p>
        </div>
      )}
    </div>
  );
};

// Компонент управления пользователями-студентами (ИЗМЕНЕННЫЙ)
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

    // Пароль не валидируется при редактировании

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

      const response = await fetch(`${API_BASE_URL}/user_student?${params.toString()}`, {
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
      // Обязательные параметры для идентификации
      params.append('email', editingUser.email);
      params.append('password', editUserData.password); // Пароль из формы без валидации
      
      // Изменяемые поля
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
      password: '' // Пустое поле для ввода пароля
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

// Компонент управления библиотекарями (ИЗМЕНЕННЫЙ)
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

    // Пароль не валидируется при редактировании

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

      const response = await fetch(`${API_BASE_URL}/user_librarian?${params.toString()}`, {
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
      // Обязательные параметры для идентификации
      params.append('email', editingLibrarian.email);
      params.append('password', editLibrarianData.password); // Пароль из формы без валидации
      
      // Изменяемые поля
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
      password: '' // Пустое поле для ввода пароля
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

// ==================== BRANCHES MANAGEMENT ====================
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

// НОВЫЙ КОМПОНЕНТ: Управление регистрационными кодами
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


// Компонент модального окна деталей пользователя (добавьте перед BooksManagement)
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

// // Компонент управления книгами (ИЗМЕНЕННЫЙ)
// const BooksManagement = ({ token }) => {
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [editingBook, setEditingBook] = useState(null);
//   const [newBook, setNewBook] = useState({
//     title: '',
//     isbn: '',
//     publisher_id: '',
//     publication_year: '',
//     page_count: '',
//     price: '',
//     illustration_count: '',
//     copies_count: ''
//   });
//   const [editPrice, setEditPrice] = useState('');
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(null);
//   const [formErrors, setFormErrors] = useState({});

//   useEffect(() => {
//     fetchBooks();
//   }, [token]);

//   const fetchBooks = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch(`${API_BASE_URL}/book_full_info/`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      
//       const data = await response.json();
//       setBooks(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.message || 'Не удалось загрузить список книг');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateNewBook = (data) => {
//     const errors = {};
    
//     const titleError = validators.book.title(data.title);
//     if (titleError) errors.title = titleError;

//     const isbnError = validators.book.isbn(data.isbn);
//     if (isbnError) errors.isbn = isbnError;

//     const publisherError = validators.book.publisher_id(data.publisher_id);
//     if (publisherError) errors.publisher_id = publisherError;

//     const yearError = validators.book.publication_year(data.publication_year);
//     if (yearError) errors.publication_year = yearError;

//     const pagesError = validators.book.page_count(data.page_count);
//     if (pagesError) errors.page_count = pagesError;

//     const priceError = validators.book.price(data.price);
//     if (priceError) errors.price = priceError;

//     const illError = validators.book.illustration_count(data.illustration_count);
//     if (illError) errors.illustration_count = illError;

//     const copiesError = validators.book.copies_count(data.copies_count);
//     if (copiesError) errors.copies_count = copiesError;

//     return {
//       isValid: Object.keys(errors).length === 0,
//       errors
//     };
//   };

//   const validateEditPrice = (value) => {
//     const errors = {};
//     const priceError = validators.book.price(value);
//     if (priceError) errors.price = priceError;
//     return {
//       isValid: Object.keys(errors).length === 0,
//       errors
//     };
//   };

//   const handleAddBook = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     const validation = validateNewBook(newBook);
//     if (!validation.isValid) {
//       setFormErrors(validation.errors);
//       return;
//     }
    
//     setSubmitLoading(true);
//     setFormErrors({});

//     try {
//       const params = new URLSearchParams();
//       params.append('title', newBook.title.trim());
//       params.append('isbn', newBook.isbn.trim());
//       params.append('publisher_id', newBook.publisher_id);
//       params.append('publication_year', newBook.publication_year);
//       params.append('page_count', newBook.page_count);
//       params.append('price', newBook.price);
//       if (newBook.illustration_count) params.append('illustration_count', newBook.illustration_count);
//       params.append('copies_count', newBook.copies_count);

//       const response = await fetch(`${API_BASE_URL}/book?${params.toString()}`, {
//         method: 'POST',
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
//       }

//       setShowAddForm(false);
//       setNewBook({
//         title: '',
//         isbn: '',
//         publisher_id: '',
//         publication_year: '',
//         page_count: '',
//         price: '',
//         illustration_count: '',
//         copies_count: ''
//       });
//       fetchBooks();
//     } catch (err) {
//       setError(err.message || 'Не удалось добавить книгу');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleEditBook = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     const validation = validateEditPrice(editPrice);
//     if (!validation.isValid) {
//       setFormErrors(validation.errors);
//       return;
//     }
    
//     setSubmitLoading(true);
//     setFormErrors({});

//     try {
//       const params = new URLSearchParams();
//       params.append('price', editPrice);

//       const response = await fetch(`${API_BASE_URL}/book/${editingBook.id}?${params.toString()}`, {
//         method: 'PATCH',
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
//       }

//       setShowEditForm(false);
//       setEditingBook(null);
//       setEditPrice('');
//       fetchBooks();
//     } catch (err) {
//       setError(err.message || 'Не удалось обновить цену');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleDeleteBook = async (bookId) => {
//     if (!window.confirm('Вы уверены, что хотите удалить эту книгу?')) return;
    
//     setDeleteLoading(bookId);
//     try {
//       const response = await fetch(`${API_BASE_URL}/book/${bookId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || `Ошибка HTTP: ${response.status}`);
//       }
      
//       fetchBooks();
//     } catch (err) {
//       setError('Не удалось удалить книгу: ' + err.message);
//     } finally {
//       setDeleteLoading(null);
//     }
//   };

//   const openEditForm = (book) => {
//     setEditingBook(book);
//     setEditPrice(book.price.toString());
//     setShowEditForm(true);
//     setShowAddForm(false);
//     setFormErrors({});
//     setError(null);
//   };

//   const renderFieldError = (fieldName) => {
//     if (formErrors[fieldName]) {
//       return (
//         <span className="AdminDashboard-fieldError">
//           <i className="fas fa-exclamation-circle"></i> {formErrors[fieldName]}
//         </span>
//       );
//     }
//     return null;
//   };

//   if (loading) {
//     return (
//       <div className="AdminDashboard-managementSection">
//         <div className="AdminDashboard-loadingSpinner">
//           <i className="fas fa-spinner fa-spin"></i>
//           <span>Загрузка книг...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="AdminDashboard-managementSection">
//       <div className="AdminDashboard-sectionHeader">
//         <h2 className="AdminDashboard-sectionTitle">Управление книгами</h2>
//         <button 
//           className="AdminDashboard-btn AdminDashboard-btn--primary" 
//           onClick={() => { 
//             setShowAddForm(true); 
//             setShowEditForm(false);
//             setEditingBook(null);
//             setError(null);
//             setFormErrors({});
//           }}
//         >
//           <i className="fas fa-plus"></i> Добавить книгу
//         </button>
//       </div>

//       {showAddForm && (
//         <form onSubmit={handleAddBook} className="AdminDashboard-addForm">
//           <h3 className="AdminDashboard-formTitle">Добавление новой книги</h3>
//           {error && (
//             <div className="AdminDashboard-formError">
//               <i className="fas fa-exclamation-circle"></i>
//               <span>{error}</span>
//             </div>
//           )}

//           <div className="AdminDashboard-formGrid">
//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Название *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.title ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.title} 
//                 onChange={(e) => setNewBook({...newBook, title: e.target.value})}
//                 placeholder="Введите название книги"
//               />
//               {renderFieldError('title')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">ISBN *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.isbn ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.isbn} 
//                 onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
//                 placeholder="978-3-16-148410-0"
//               />
//               {renderFieldError('isbn')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Издательство ID *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.publisher_id ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.publisher_id} 
//                 onChange={(e) => setNewBook({...newBook, publisher_id: e.target.value})}
//                 placeholder="1"
//               />
//               {renderFieldError('publisher_id')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Год издания *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.publication_year ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.publication_year} 
//                 onChange={(e) => setNewBook({...newBook, publication_year: e.target.value})}
//                 placeholder="2024"
//               />
//               {renderFieldError('publication_year')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Количество страниц *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.page_count ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.page_count} 
//                 onChange={(e) => setNewBook({...newBook, page_count: e.target.value})}
//                 placeholder="300"
//               />
//               {renderFieldError('page_count')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Цена *</label>
//               <input 
//                 type="number" 
//                 step="0.01"
//                 className={`AdminDashboard-formInput ${formErrors.price ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.price} 
//                 onChange={(e) => setNewBook({...newBook, price: e.target.value})}
//                 placeholder="599.99"
//               />
//               {renderFieldError('price')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Количество иллюстраций</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.illustration_count ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.illustration_count} 
//                 onChange={(e) => setNewBook({...newBook, illustration_count: e.target.value})}
//                 placeholder="10"
//               />
//               {renderFieldError('illustration_count')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Количество экземпляров *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.copies_count ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newBook.copies_count} 
//                 onChange={(e) => setNewBook({...newBook, copies_count: e.target.value})}
//                 placeholder="5"
//               />
//               {renderFieldError('copies_count')}
//             </div>
//           </div>

//           <div className="AdminDashboard-formActions">
//             <button 
//               type="submit" 
//               className="AdminDashboard-btn AdminDashboard-btn--primary" 
//               disabled={submitLoading}
//             >
//               {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Сохранение...</> : 'Сохранить'}
//             </button>
//             <button 
//               type="button" 
//               className="AdminDashboard-btn" 
//               onClick={() => { 
//                 setShowAddForm(false); 
//                 setNewBook({
//                   title: '',
//                   isbn: '',
//                   publisher_id: '',
//                   publication_year: '',
//                   page_count: '',
//                   price: '',
//                   illustration_count: '',
//                   copies_count: ''
//                 });
//                 setError(null); 
//                 setFormErrors({}); 
//               }}
//               disabled={submitLoading}
//             >
//               Отмена
//             </button>
//           </div>
//         </form>
//       )}

//       {showEditForm && editingBook && (
//         <form onSubmit={handleEditBook} className="AdminDashboard-addForm">
//           <h3 className="AdminDashboard-formTitle">Изменение цены книги</h3>
//           <p className="AdminDashboard-formSubtitle">
//             <strong>{editingBook.title}</strong> (ISBN: {editingBook.isbn})
//           </p>
//           {error && (
//             <div className="AdminDashboard-formError">
//               <i className="fas fa-exclamation-circle"></i>
//               <span>{error}</span>
//             </div>
//           )}

//           <div className="AdminDashboard-formGrid">
//             <div className="AdminDashboard-formGroup AdminDashboard-formGroup--fullWidth">
//               <label className="AdminDashboard-formLabel">Новая цена *</label>
//               <input 
//                 type="number" 
//                 step="0.01"
//                 className={`AdminDashboard-formInput ${formErrors.price ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editPrice} 
//                 onChange={(e) => setEditPrice(e.target.value)}
//                 placeholder="599.99"
//               />
//               {renderFieldError('price')}
//             </div>
//           </div>

//           <div className="AdminDashboard-formActions">
//             <button 
//               type="submit" 
//               className="AdminDashboard-btn AdminDashboard-btn--primary" 
//               disabled={submitLoading}
//             >
//               {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Обновление...</> : 'Обновить цену'}
//             </button>
//             <button 
//               type="button" 
//               className="AdminDashboard-btn" 
//               onClick={() => { 
//                 setShowEditForm(false); 
//                 setEditingBook(null);
//                 setEditPrice('');
//                 setError(null); 
//                 setFormErrors({}); 
//               }}
//               disabled={submitLoading}
//             >
//               Отмена
//             </button>
//           </div>
//         </form>
//       )}

//       {error && !showAddForm && !showEditForm && (
//         <div className="AdminDashboard-errorMessage">
//           <i className="fas fa-exclamation-circle"></i>
//           <span>{error}</span>
//           <button className="AdminDashboard-btn AdminDashboard-btn--primary" onClick={fetchBooks}>
//             <i className="fas fa-sync"></i>
//           </button>
//         </div>
//       )}

//       <table className="AdminDashboard-dataTable">
//         <thead className="AdminDashboard-dataTableHead">
//           <tr className="AdminDashboard-dataTableRow">
//             <th className="AdminDashboard-dataTableHeader">Название</th>
//             <th className="AdminDashboard-dataTableHeader">ISBN</th>
//             <th className="AdminDashboard-dataTableHeader">Год</th>
//             <th className="AdminDashboard-dataTableHeader">Страниц</th>
//             <th className="AdminDashboard-dataTableHeader">Цена</th>
//             <th className="AdminDashboard-dataTableHeader">Экземпляров</th>
//             <th className="AdminDashboard-dataTableHeader">Действия</th>
//           </tr>
//         </thead>
//         <tbody className="AdminDashboard-dataTableBody">
//           {books.map(book => (
//             <tr key={book.id} className="AdminDashboard-dataTableRow">
//               <td className="AdminDashboard-dataTableCell">{book.title}</td>
//               <td className="AdminDashboard-dataTableCell">{book.isbn}</td>
//               <td className="AdminDashboard-dataTableCell">{book.publication_year}</td>
//               <td className="AdminDashboard-dataTableCell">{book.page_count}</td>
//               <td className="AdminDashboard-dataTableCell">{book.price} ₽</td>
//               <td className="AdminDashboard-dataTableCell">{book.copies_count}</td>
//               <td className="AdminDashboard-dataTableCell">
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--edit" 
//                   title="Изменить цену"
//                   onClick={() => openEditForm(book)}
//                 >
//                   <i className="fas fa-tag"></i>
//                 </button>
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete" 
//                   title="Удалить"
//                   onClick={() => handleDeleteBook(book.id)}
//                   disabled={deleteLoading === book.id}
//                 >
//                   {deleteLoading === book.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
      
//       {books.length === 0 && !loading && (
//         <div className="AdminDashboard-emptyState">
//           <i className="fas fa-book AdminDashboard-emptyIcon"></i>
//           <p className="AdminDashboard-emptyText">Книги не найдены</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // Компонент управления пользователями-студентами (ИЗМЕНЕННЫЙ)
// const UsersManagement = ({ token }) => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [newUser, setNewUser] = useState({
//     first_name: '',
//     last_name: '',
//     middle_name: '',
//     date_of_birth: '',
//     email: '',
//     passport_number: '',
//     password: '',
//     address: '',
//     faculty_id: ''
//   });
//   const [editUserData, setEditUserData] = useState({
//     first_name: '',
//     last_name: '',
//     middle_name: '',
//     passport_number: '',
//     address: '',
//     faculty_id: ''
//   });
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(null);
//   const [formErrors, setFormErrors] = useState({});
//   const [selectedUser, setSelectedUser] = useState(null);

//   useEffect(() => {
//     fetchUsers();
//   }, [token]);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch(`${API_BASE_URL}/user_student/`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      
//       const data = await response.json();
//       setUsers(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.message || 'Не удалось загрузить список пользователей');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateNewUser = (data) => {
//     return validateForm(data, 'user', { faculty_id: true });
//   };

//   const validateEditUser = (data) => {
//     const errors = {};
    
//     const firstNameError = validators.user.first_name(data.first_name);
//     if (firstNameError) errors.first_name = firstNameError;

//     const lastNameError = validators.user.last_name(data.last_name);
//     if (lastNameError) errors.last_name = lastNameError;

//     const middleNameError = validators.user.middle_name(data.middle_name);
//     if (middleNameError) errors.middle_name = middleNameError;

//     const passportError = validators.user.passport_number(data.passport_number);
//     if (passportError) errors.passport_number = passportError;

//     const addressError = validators.user.address(data.address);
//     if (addressError) errors.address = addressError;

//     const facultyError = validators.user.faculty_id(data.faculty_id, true);
//     if (facultyError) errors.faculty_id = facultyError;

//     return {
//       isValid: Object.keys(errors).length === 0,
//       errors
//     };
//   };

//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     const validation = validateNewUser(newUser);
//     if (!validation.isValid) {
//       setFormErrors(validation.errors);
//       return;
//     }
    
//     setSubmitLoading(true);
//     setFormErrors({});

//     try {
//       const params = new URLSearchParams();
//       params.append('first_name', newUser.first_name.trim());
//       params.append('last_name', newUser.last_name.trim());
//       if (newUser.middle_name.trim()) params.append('middle_name', newUser.middle_name.trim());
//       params.append('date_of_birth', newUser.date_of_birth);
//       params.append('email', newUser.email.trim());
//       params.append('passport_number', newUser.passport_number.trim());
//       params.append('password', newUser.password);
//       if (newUser.address.trim()) params.append('address', newUser.address.trim());
//       params.append('faculty_id', newUser.faculty_id);

//       const response = await fetch(`${API_BASE_URL}/user_student?${params.toString()}`, {
//         method: 'POST',
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
//       }

//       setShowAddForm(false);
//       setNewUser({
//         first_name: '',
//         last_name: '',
//         middle_name: '',
//         date_of_birth: '',
//         email: '',
//         passport_number: '',
//         password: '',
//         address: '',
//         faculty_id: ''
//       });
//       fetchUsers();
//     } catch (err) {
//       setError(err.message || 'Не удалось добавить пользователя');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleEditUser = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     const validation = validateEditUser(editUserData);
//     if (!validation.isValid) {
//       setFormErrors(validation.errors);
//       return;
//     }
    
//     setSubmitLoading(true);
//     setFormErrors({});

//     try {
//       const params = new URLSearchParams();
//       params.append('first_name', editUserData.first_name.trim());
//       params.append('last_name', editUserData.last_name.trim());
//       if (editUserData.middle_name.trim()) params.append('middle_name', editUserData.middle_name.trim());
//       params.append('passport_number', editUserData.passport_number.trim());
//       if (editUserData.address.trim()) params.append('address', editUserData.address.trim());
//       params.append('faculty_id', editUserData.faculty_id);

//       const response = await fetch(`${API_BASE_URL}/user_student/${editingUser.id}?${params.toString()}`, {
//         method: 'PATCH',
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
//       }

//       setShowEditForm(false);
//       setEditingUser(null);
//       setEditUserData({
//         first_name: '',
//         last_name: '',
//         middle_name: '',
//         passport_number: '',
//         address: '',
//         faculty_id: ''
//       });
//       fetchUsers();
//     } catch (err) {
//       setError(err.message || 'Не удалось обновить пользователя');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    
//     setDeleteLoading(userId);
//     try {
//       const response = await fetch(`${API_BASE_URL}/user_student/${userId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || `Ошибка HTTP: ${response.status}`);
//       }
      
//       fetchUsers();
//     } catch (err) {
//       setError('Не удалось удалить пользователя: ' + err.message);
//     } finally {
//       setDeleteLoading(null);
//     }
//   };

//   const openEditForm = (user) => {
//     setEditingUser(user);
//     setEditUserData({
//       first_name: user.first_name || '',
//       last_name: user.last_name || '',
//       middle_name: user.middle_name || '',
//       passport_number: user.passport_number || '',
//       address: user.address || '',
//       faculty_id: user.faculty_id || ''
//     });
//     setShowEditForm(true);
//     setShowAddForm(false);
//     setFormErrors({});
//     setError(null);
//   };

//   const openUserDetails = (user) => {
//     setSelectedUser(user);
//   };

//   const renderFieldError = (fieldName) => {
//     if (formErrors[fieldName]) {
//       return (
//         <span className="AdminDashboard-fieldError">
//           <i className="fas fa-exclamation-circle"></i> {formErrors[fieldName]}
//         </span>
//       );
//     }
//     return null;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('ru-RU');
//   };

//   if (loading) {
//     return (
//       <div className="AdminDashboard-managementSection">
//         <div className="AdminDashboard-loadingSpinner">
//           <i className="fas fa-spinner fa-spin"></i>
//           <span>Загрузка пользователей...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="AdminDashboard-managementSection">
//       <div className="AdminDashboard-sectionHeader">
//         <h2 className="AdminDashboard-sectionTitle">Управление студентами</h2>
//         <button 
//           className="AdminDashboard-btn AdminDashboard-btn--primary" 
//           onClick={() => { 
//             setShowAddForm(true); 
//             setShowEditForm(false);
//             setEditingUser(null);
//             setError(null);
//             setFormErrors({});
//           }}
//         >
//           <i className="fas fa-plus"></i> Добавить студента
//         </button>
//       </div>

//       {showAddForm && (
//         <form onSubmit={handleAddUser} className="AdminDashboard-addForm">
//           <h3 className="AdminDashboard-formTitle">Добавление нового студента</h3>
//           {error && (
//             <div className="AdminDashboard-formError">
//               <i className="fas fa-exclamation-circle"></i>
//               <span>{error}</span>
//             </div>
//           )}

//           <div className="AdminDashboard-formGrid">
//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Имя *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.first_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.first_name} 
//                 onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
//                 placeholder="Иван"
//               />
//               {renderFieldError('first_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Фамилия *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.last_name} 
//                 onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
//                 placeholder="Иванов"
//               />
//               {renderFieldError('last_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Отчество</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.middle_name} 
//                 onChange={(e) => setNewUser({...newUser, middle_name: e.target.value})}
//                 placeholder="Иванович"
//               />
//               {renderFieldError('middle_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Дата рождения *</label>
//               <input 
//                 type="date" 
//                 className={`AdminDashboard-formInput ${formErrors.date_of_birth ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.date_of_birth} 
//                 onChange={(e) => setNewUser({...newUser, date_of_birth: e.target.value})}
//               />
//               {renderFieldError('date_of_birth')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Email *</label>
//               <input 
//                 type="email" 
//                 className={`AdminDashboard-formInput ${formErrors.email ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.email} 
//                 onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//                 placeholder="ivan@example.com"
//               />
//               {renderFieldError('email')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Номер паспорта *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.passport_number} 
//                 onChange={(e) => setNewUser({...newUser, passport_number: e.target.value})}
//                 placeholder="1234567890"
//               />
//               {renderFieldError('passport_number')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Пароль *</label>
//               <input 
//                 type="password" 
//                 className={`AdminDashboard-formInput ${formErrors.password ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.password} 
//                 onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//                 placeholder="Минимум 6 символов"
//               />
//               {renderFieldError('password')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Адрес</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.address} 
//                 onChange={(e) => setNewUser({...newUser, address: e.target.value})}
//                 placeholder="г. Москва, ул. Ленина, д. 1"
//               />
//               {renderFieldError('address')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Факультет ID *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.faculty_id ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newUser.faculty_id} 
//                 onChange={(e) => setNewUser({...newUser, faculty_id: e.target.value})}
//                 placeholder="1"
//               />
//               {renderFieldError('faculty_id')}
//             </div>
//           </div>

//           <div className="AdminDashboard-formActions">
//             <button 
//               type="submit" 
//               className="AdminDashboard-btn AdminDashboard-btn--primary" 
//               disabled={submitLoading}
//             >
//               {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Сохранение...</> : 'Сохранить'}
//             </button>
//             <button 
//               type="button" 
//               className="AdminDashboard-btn" 
//               onClick={() => { 
//                 setShowAddForm(false); 
//                 setNewUser({
//                   first_name: '',
//                   last_name: '',
//                   middle_name: '',
//                   date_of_birth: '',
//                   email: '',
//                   passport_number: '',
//                   password: '',
//                   address: '',
//                   faculty_id: ''
//                 });
//                 setError(null); 
//                 setFormErrors({}); 
//               }}
//               disabled={submitLoading}
//             >
//               Отмена
//             </button>
//           </div>
//         </form>
//       )}

//       {showEditForm && editingUser && (
//         <form onSubmit={handleEditUser} className="AdminDashboard-addForm">
//           <h3 className="AdminDashboard-formTitle">Редактирование студента</h3>
//           <p className="AdminDashboard-formSubtitle">
//             {editingUser.last_name} {editingUser.first_name} {editingUser.middle_name}
//           </p>
//           <div className="AdminDashboard-readOnlyInfo">
//             <p><strong>Email:</strong> {editingUser.email}</p>
//             <p><strong>Дата рождения:</strong> {formatDate(editingUser.date_of_birth)}</p>
//           </div>
//           {error && (
//             <div className="AdminDashboard-formError">
//               <i className="fas fa-exclamation-circle"></i>
//               <span>{error}</span>
//             </div>
//           )}

//           <div className="AdminDashboard-formGrid">
//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Имя *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.first_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editUserData.first_name} 
//                 onChange={(e) => setEditUserData({...editUserData, first_name: e.target.value})}
//               />
//               {renderFieldError('first_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Фамилия *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editUserData.last_name} 
//                 onChange={(e) => setEditUserData({...editUserData, last_name: e.target.value})}
//               />
//               {renderFieldError('last_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Отчество</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editUserData.middle_name} 
//                 onChange={(e) => setEditUserData({...editUserData, middle_name: e.target.value})}
//               />
//               {renderFieldError('middle_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Номер паспорта *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editUserData.passport_number} 
//                 onChange={(e) => setEditUserData({...editUserData, passport_number: e.target.value})}
//               />
//               {renderFieldError('passport_number')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Адрес</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editUserData.address} 
//                 onChange={(e) => setEditUserData({...editUserData, address: e.target.value})}
//               />
//               {renderFieldError('address')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Факультет ID *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.faculty_id ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editUserData.faculty_id} 
//                 onChange={(e) => setEditUserData({...editUserData, faculty_id: e.target.value})}
//               />
//               {renderFieldError('faculty_id')}
//             </div>
//           </div>

//           <div className="AdminDashboard-formActions">
//             <button 
//               type="submit" 
//               className="AdminDashboard-btn AdminDashboard-btn--primary" 
//               disabled={submitLoading}
//             >
//               {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Обновление...</> : 'Обновить'}
//             </button>
//             <button 
//               type="button" 
//               className="AdminDashboard-btn" 
//               onClick={() => { 
//                 setShowEditForm(false); 
//                 setEditingUser(null);
//                 setEditUserData({
//                   first_name: '',
//                   last_name: '',
//                   middle_name: '',
//                   passport_number: '',
//                   address: '',
//                   faculty_id: ''
//                 });
//                 setError(null); 
//                 setFormErrors({}); 
//               }}
//               disabled={submitLoading}
//             >
//               Отмена
//             </button>
//           </div>
//         </form>
//       )}

//       {error && !showAddForm && !showEditForm && (
//         <div className="AdminDashboard-errorMessage">
//           <i className="fas fa-exclamation-circle"></i>
//           <span>{error}</span>
//           <button className="AdminDashboard-btn AdminDashboard-btn--primary" onClick={fetchUsers}>
//             <i className="fas fa-sync"></i>
//           </button>
//         </div>
//       )}

//       <table className="AdminDashboard-dataTable">
//         <thead className="AdminDashboard-dataTableHead">
//           <tr className="AdminDashboard-dataTableRow">
//             <th className="AdminDashboard-dataTableHeader">ФИО</th>
//             <th className="AdminDashboard-dataTableHeader">Email</th>
//             <th className="AdminDashboard-dataTableHeader">Дата рождения</th>
//             <th className="AdminDashboard-dataTableHeader">Паспорт</th>
//             <th className="AdminDashboard-dataTableHeader">Действия</th>
//           </tr>
//         </thead>
//         <tbody className="AdminDashboard-dataTableBody">
//           {users.map(user => (
//             <tr key={user.id} className="AdminDashboard-dataTableRow">
//               <td className="AdminDashboard-dataTableCell">
//                 {user.last_name} {user.first_name} {user.middle_name}
//               </td>
//               <td className="AdminDashboard-dataTableCell">{user.email}</td>
//               <td className="AdminDashboard-dataTableCell">{formatDate(user.date_of_birth)}</td>
//               <td className="AdminDashboard-dataTableCell">{user.passport_number}</td>
//               <td className="AdminDashboard-dataTableCell">
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--view" 
//                   title="Подробнее"
//                   onClick={() => openUserDetails(user)}
//                 >
//                   <i className="fas fa-eye"></i>
//                 </button>
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--edit" 
//                   title="Редактировать"
//                   onClick={() => openEditForm(user)}
//                 >
//                   <i className="fas fa-edit"></i>
//                 </button>
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete" 
//                   title="Удалить"
//                   onClick={() => handleDeleteUser(user.id)}
//                   disabled={deleteLoading === user.id}
//                 >
//                   {deleteLoading === user.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
      
//       {users.length === 0 && !loading && (
//         <div className="AdminDashboard-emptyState">
//           <i className="fas fa-users AdminDashboard-emptyIcon"></i>
//           <p className="AdminDashboard-emptyText">Студенты не найдены</p>
//         </div>
//       )}

//       {selectedUser && (
//         <UserDetailsModal 
//           user={selectedUser} 
//           onClose={() => setSelectedUser(null)} 
//           userType="student"
//         />
//       )}
//     </div>
//   );
// };

// // Компонент управления библиотекарями (ИЗМЕНЕННЫЙ)
// const LibrariansManagement = ({ token }) => {
//   const [librarians, setLibrarians] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [editingLibrarian, setEditingLibrarian] = useState(null);
//   const [newLibrarian, setNewLibrarian] = useState({
//     first_name: '',
//     last_name: '',
//     middle_name: '',
//     date_of_birth: '',
//     email: '',
//     passport_number: '',
//     password: '',
//     address: '',
//     location_id: ''
//   });
//   const [editLibrarianData, setEditLibrarianData] = useState({
//     first_name: '',
//     last_name: '',
//     middle_name: '',
//     passport_number: '',
//     address: '',
//     location_id: ''
//   });
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(null);
//   const [formErrors, setFormErrors] = useState({});
//   const [selectedLibrarian, setSelectedLibrarian] = useState(null);

//   useEffect(() => {
//     fetchLibrarians();
//   }, [token]);

//   const fetchLibrarians = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch(`${API_BASE_URL}/user_librarian/`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      
//       const data = await response.json();
//       setLibrarians(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err.message || 'Не удалось загрузить список библиотекарей');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateNewLibrarian = (data) => {
//     const errors = {};
    
//     const firstNameError = validators.user.first_name(data.first_name);
//     if (firstNameError) errors.first_name = firstNameError;

//     const lastNameError = validators.user.last_name(data.last_name);
//     if (lastNameError) errors.last_name = lastNameError;

//     const middleNameError = validators.user.middle_name(data.middle_name);
//     if (middleNameError) errors.middle_name = middleNameError;

//     const dobError = validators.user.date_of_birth(data.date_of_birth);
//     if (dobError) errors.date_of_birth = dobError;

//     const emailError = validators.user.email(data.email);
//     if (emailError) errors.email = emailError;

//     const passportError = validators.user.passport_number(data.passport_number);
//     if (passportError) errors.passport_number = passportError;

//     const passwordError = validators.user.password(data.password);
//     if (passwordError) errors.password = passwordError;

//     const addressError = validators.user.address(data.address);
//     if (addressError) errors.address = addressError;

//     if (!data.location_id) errors.location_id = 'Филиал обязателен';

//     return {
//       isValid: Object.keys(errors).length === 0,
//       errors
//     };
//   };

//   const validateEditLibrarian = (data) => {
//     const errors = {};
    
//     const firstNameError = validators.user.first_name(data.first_name);
//     if (firstNameError) errors.first_name = firstNameError;

//     const lastNameError = validators.user.last_name(data.last_name);
//     if (lastNameError) errors.last_name = lastNameError;

//     const middleNameError = validators.user.middle_name(data.middle_name);
//     if (middleNameError) errors.middle_name = middleNameError;

//     const passportError = validators.user.passport_number(data.passport_number);
//     if (passportError) errors.passport_number = passportError;

//     const addressError = validators.user.address(data.address);
//     if (addressError) errors.address = addressError;

//     if (!data.location_id) errors.location_id = 'Филиал обязателен';

//     return {
//       isValid: Object.keys(errors).length === 0,
//       errors
//     };
//   };

//   const handleAddLibrarian = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     const validation = validateNewLibrarian(newLibrarian);
//     if (!validation.isValid) {
//       setFormErrors(validation.errors);
//       return;
//     }
    
//     setSubmitLoading(true);
//     setFormErrors({});

//     try {
//       const params = new URLSearchParams();
//       params.append('first_name', newLibrarian.first_name.trim());
//       params.append('last_name', newLibrarian.last_name.trim());
//       if (newLibrarian.middle_name.trim()) params.append('middle_name', newLibrarian.middle_name.trim());
//       params.append('date_of_birth', newLibrarian.date_of_birth);
//       params.append('email', newLibrarian.email.trim());
//       params.append('passport_number', newLibrarian.passport_number.trim());
//       params.append('password', newLibrarian.password);
//       if (newLibrarian.address.trim()) params.append('address', newLibrarian.address.trim());
//       params.append('location_id', newLibrarian.location_id);

//       const response = await fetch(`${API_BASE_URL}/user_librarian?${params.toString()}`, {
//         method: 'POST',
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
//       }

//       setShowAddForm(false);
//       setNewLibrarian({
//         first_name: '',
//         last_name: '',
//         middle_name: '',
//         date_of_birth: '',
//         email: '',
//         passport_number: '',
//         password: '',
//         address: '',
//         location_id: ''
//       });
//       fetchLibrarians();
//     } catch (err) {
//       setError(err.message || 'Не удалось добавить библиотекаря');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleEditLibrarian = async (e) => {
//     e.preventDefault();
//     setError(null);
    
//     const validation = validateEditLibrarian(editLibrarianData);
//     if (!validation.isValid) {
//       setFormErrors(validation.errors);
//       return;
//     }
    
//     setSubmitLoading(true);
//     setFormErrors({});

//     try {
//       const params = new URLSearchParams();
//       params.append('first_name', editLibrarianData.first_name.trim());
//       params.append('last_name', editLibrarianData.last_name.trim());
//       if (editLibrarianData.middle_name.trim()) params.append('middle_name', editLibrarianData.middle_name.trim());
//       params.append('passport_number', editLibrarianData.passport_number.trim());
//       if (editLibrarianData.address.trim()) params.append('address', editLibrarianData.address.trim());
//       params.append('location_id', editLibrarianData.location_id);

//       const response = await fetch(`${API_BASE_URL}/user_librarian/${editingLibrarian.id}?${params.toString()}`, {
//         method: 'PATCH',
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => null);
//         throw new Error(errorData?.detail || `Ошибка HTTP: ${response.status}`);
//       }

//       setShowEditForm(false);
//       setEditingLibrarian(null);
//       setEditLibrarianData({
//         first_name: '',
//         last_name: '',
//         middle_name: '',
//         passport_number: '',
//         address: '',
//         location_id: ''
//       });
//       fetchLibrarians();
//     } catch (err) {
//       setError(err.message || 'Не удалось обновить библиотекаря');
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleDeleteLibrarian = async (librarianId) => {
//     if (!window.confirm('Вы уверены, что хотите удалить этого библиотекаря?')) return;
    
//     setDeleteLoading(librarianId);
//     try {
//       const response = await fetch(`${API_BASE_URL}/user_librarian/${librarianId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || `Ошибка HTTP: ${response.status}`);
//       }
      
//       fetchLibrarians();
//     } catch (err) {
//       setError('Не удалось удалить библиотекаря: ' + err.message);
//     } finally {
//       setDeleteLoading(null);
//     }
//   };

//   const openEditForm = (librarian) => {
//     setEditingLibrarian(librarian);
//     setEditLibrarianData({
//       first_name: librarian.first_name || '',
//       last_name: librarian.last_name || '',
//       middle_name: librarian.middle_name || '',
//       passport_number: librarian.passport_number || '',
//       address: librarian.address || '',
//       location_id: librarian.location_id || ''
//     });
//     setShowEditForm(true);
//     setShowAddForm(false);
//     setFormErrors({});
//     setError(null);
//   };

//   const openLibrarianDetails = (librarian) => {
//     setSelectedLibrarian(librarian);
//   };

//   const renderFieldError = (fieldName) => {
//     if (formErrors[fieldName]) {
//       return (
//         <span className="AdminDashboard-fieldError">
//           <i className="fas fa-exclamation-circle"></i> {formErrors[fieldName]}
//         </span>
//       );
//     }
//     return null;
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     return new Date(dateString).toLocaleDateString('ru-RU');
//   };

//   if (loading) {
//     return (
//       <div className="AdminDashboard-managementSection">
//         <div className="AdminDashboard-loadingSpinner">
//           <i className="fas fa-spinner fa-spin"></i>
//           <span>Загрузка библиотекарей...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="AdminDashboard-managementSection">
//       <div className="AdminDashboard-sectionHeader">
//         <h2 className="AdminDashboard-sectionTitle">Управление библиотекарями</h2>
//         <button 
//           className="AdminDashboard-btn AdminDashboard-btn--primary" 
//           onClick={() => { 
//             setShowAddForm(true); 
//             setShowEditForm(false);
//             setEditingLibrarian(null);
//             setError(null);
//             setFormErrors({});
//           }}
//         >
//           <i className="fas fa-plus"></i> Добавить библиотекаря
//         </button>
//       </div>

//       {showAddForm && (
//         <form onSubmit={handleAddLibrarian} className="AdminDashboard-addForm">
//           <h3 className="AdminDashboard-formTitle">Добавление нового библиотекаря</h3>
//           {error && (
//             <div className="AdminDashboard-formError">
//               <i className="fas fa-exclamation-circle"></i>
//               <span>{error}</span>
//             </div>
//           )}

//           <div className="AdminDashboard-formGrid">
//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Имя *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.first_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.first_name} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, first_name: e.target.value})}
//                 placeholder="Иван"
//               />
//               {renderFieldError('first_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Фамилия *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.last_name} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, last_name: e.target.value})}
//                 placeholder="Иванов"
//               />
//               {renderFieldError('last_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Отчество</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.middle_name} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, middle_name: e.target.value})}
//                 placeholder="Иванович"
//               />
//               {renderFieldError('middle_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Дата рождения *</label>
//               <input 
//                 type="date" 
//                 className={`AdminDashboard-formInput ${formErrors.date_of_birth ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.date_of_birth} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, date_of_birth: e.target.value})}
//               />
//               {renderFieldError('date_of_birth')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Email *</label>
//               <input 
//                 type="email" 
//                 className={`AdminDashboard-formInput ${formErrors.email ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.email} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, email: e.target.value})}
//                 placeholder="ivan@example.com"
//               />
//               {renderFieldError('email')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Номер паспорта *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.passport_number} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, passport_number: e.target.value})}
//                 placeholder="1234567890"
//               />
//               {renderFieldError('passport_number')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Пароль *</label>
//               <input 
//                 type="password" 
//                 className={`AdminDashboard-formInput ${formErrors.password ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.password} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, password: e.target.value})}
//                 placeholder="Минимум 6 символов"
//               />
//               {renderFieldError('password')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Адрес</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.address} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, address: e.target.value})}
//                 placeholder="г. Москва, ул. Ленина, д. 1"
//               />
//               {renderFieldError('address')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Филиал ID *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.location_id ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={newLibrarian.location_id} 
//                 onChange={(e) => setNewLibrarian({...newLibrarian, location_id: e.target.value})}
//                 placeholder="1"
//               />
//               {renderFieldError('location_id')}
//             </div>
//           </div>

//           <div className="AdminDashboard-formActions">
//             <button 
//               type="submit" 
//               className="AdminDashboard-btn AdminDashboard-btn--primary" 
//               disabled={submitLoading}
//             >
//               {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Сохранение...</> : 'Сохранить'}
//             </button>
//             <button 
//               type="button" 
//               className="AdminDashboard-btn" 
//               onClick={() => { 
//                 setShowAddForm(false); 
//                 setNewLibrarian({
//                   first_name: '',
//                   last_name: '',
//                   middle_name: '',
//                   date_of_birth: '',
//                   email: '',
//                   passport_number: '',
//                   password: '',
//                   address: '',
//                   location_id: ''
//                 });
//                 setError(null); 
//                 setFormErrors({}); 
//               }}
//               disabled={submitLoading}
//             >
//               Отмена
//             </button>
//           </div>
//         </form>
//       )}

//       {showEditForm && editingLibrarian && (
//         <form onSubmit={handleEditLibrarian} className="AdminDashboard-addForm">
//           <h3 className="AdminDashboard-formTitle">Редактирование библиотекаря</h3>
//           <p className="AdminDashboard-formSubtitle">
//             {editingLibrarian.last_name} {editingLibrarian.first_name} {editingLibrarian.middle_name}
//           </p>
//           <div className="AdminDashboard-readOnlyInfo">
//             <p><strong>Email:</strong> {editingLibrarian.email}</p>
//             <p><strong>Дата рождения:</strong> {formatDate(editingLibrarian.date_of_birth)}</p>
//           </div>
//           {error && (
//             <div className="AdminDashboard-formError">
//               <i className="fas fa-exclamation-circle"></i>
//               <span>{error}</span>
//             </div>
//           )}

//           <div className="AdminDashboard-formGrid">
//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Имя *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.first_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editLibrarianData.first_name} 
//                 onChange={(e) => setEditLibrarianData({...editLibrarianData, first_name: e.target.value})}
//               />
//               {renderFieldError('first_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Фамилия *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.last_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editLibrarianData.last_name} 
//                 onChange={(e) => setEditLibrarianData({...editLibrarianData, last_name: e.target.value})}
//               />
//               {renderFieldError('last_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Отчество</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.middle_name ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editLibrarianData.middle_name} 
//                 onChange={(e) => setEditLibrarianData({...editLibrarianData, middle_name: e.target.value})}
//               />
//               {renderFieldError('middle_name')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Номер паспорта *</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.passport_number ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editLibrarianData.passport_number} 
//                 onChange={(e) => setEditLibrarianData({...editLibrarianData, passport_number: e.target.value})}
//               />
//               {renderFieldError('passport_number')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Адрес</label>
//               <input 
//                 type="text" 
//                 className={`AdminDashboard-formInput ${formErrors.address ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editLibrarianData.address} 
//                 onChange={(e) => setEditLibrarianData({...editLibrarianData, address: e.target.value})}
//               />
//               {renderFieldError('address')}
//             </div>

//             <div className="AdminDashboard-formGroup">
//               <label className="AdminDashboard-formLabel">Филиал ID *</label>
//               <input 
//                 type="number" 
//                 className={`AdminDashboard-formInput ${formErrors.location_id ? 'AdminDashboard-formInput--error' : ''}`}
//                 value={editLibrarianData.location_id} 
//                 onChange={(e) => setEditLibrarianData({...editLibrarianData, location_id: e.target.value})}
//               />
//               {renderFieldError('location_id')}
//             </div>
//           </div>

//           <div className="AdminDashboard-formActions">
//             <button 
//               type="submit" 
//               className="AdminDashboard-btn AdminDashboard-btn--primary" 
//               disabled={submitLoading}
//             >
//               {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Обновление...</> : 'Обновить'}
//             </button>
//             <button 
//               type="button" 
//               className="AdminDashboard-btn" 
//               onClick={() => { 
//                 setShowEditForm(false); 
//                 setEditingLibrarian(null);
//                 setEditLibrarianData({
//                   first_name: '',
//                   last_name: '',
//                   middle_name: '',
//                   passport_number: '',
//                   address: '',
//                   location_id: ''
//                 });
//                 setError(null); 
//                 setFormErrors({}); 
//               }}
//               disabled={submitLoading}
//             >
//               Отмена
//             </button>
//           </div>
//         </form>
//       )}

//       {error && !showAddForm && !showEditForm && (
//         <div className="AdminDashboard-errorMessage">
//           <i className="fas fa-exclamation-circle"></i>
//           <span>{error}</span>
//           <button className="AdminDashboard-btn AdminDashboard-btn--primary" onClick={fetchLibrarians}>
//             <i className="fas fa-sync"></i>
//           </button>
//         </div>
//       )}

//       <table className="AdminDashboard-dataTable">
//         <thead className="AdminDashboard-dataTableHead">
//           <tr className="AdminDashboard-dataTableRow">
//             <th className="AdminDashboard-dataTableHeader">ФИО</th>
//             <th className="AdminDashboard-dataTableHeader">Email</th>
//             <th className="AdminDashboard-dataTableHeader">Дата рождения</th>
//             <th className="AdminDashboard-dataTableHeader">Филиал</th>
//             <th className="AdminDashboard-dataTableHeader">Действия</th>
//           </tr>
//         </thead>
//         <tbody className="AdminDashboard-dataTableBody">
//           {librarians.map(librarian => (
//             <tr key={librarian.id} className="AdminDashboard-dataTableRow">
//               <td className="AdminDashboard-dataTableCell">
//                 {librarian.last_name} {librarian.first_name} {librarian.middle_name}
//               </td>
//               <td className="AdminDashboard-dataTableCell">{librarian.email}</td>
//               <td className="AdminDashboard-dataTableCell">{formatDate(librarian.date_of_birth)}</td>
//               <td className="AdminDashboard-dataTableCell">{librarian.location_id}</td>
//               <td className="AdminDashboard-dataTableCell">
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--view" 
//                   title="Подробнее"
//                   onClick={() => openLibrarianDetails(librarian)}
//                 >
//                   <i className="fas fa-eye"></i>
//                 </button>
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--edit" 
//                   title="Редактировать"
//                   onClick={() => openEditForm(librarian)}
//                 >
//                   <i className="fas fa-edit"></i>
//                 </button>
//                 <button 
//                   className="AdminDashboard-actionBtn AdminDashboard-actionBtn--delete" 
//                   title="Удалить"
//                   onClick={() => handleDeleteLibrarian(librarian.id)}
//                   disabled={deleteLoading === librarian.id}
//                 >
//                   {deleteLoading === librarian.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
      
//       {librarians.length === 0 && !loading && (
//         <div className="AdminDashboard-emptyState">
//           <i className="fas fa-user-tie AdminDashboard-emptyIcon"></i>
//           <p className="AdminDashboard-emptyText">Библиотекари не найдены</p>
//         </div>
//       )}

//       {selectedLibrarian && (
//         <UserDetailsModal 
//           user={selectedLibrarian} 
//           onClose={() => setSelectedLibrarian(null)} 
//           userType="librarian"
//         />
//       )}
//     </div>
//   );
// };
export default AdminDashboard;