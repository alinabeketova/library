import React, { useState, useEffect } from 'react';
import { validators } from './validators';

const API_BASE_URL = 'http://127.0.0.1:8001';

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
      params.append('title', editingBook.title);
      params.append('isbn', editingBook.isbn);
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

export default BooksManagement;