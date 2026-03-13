import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SearchPage.css';

const API_BASE_URL = 'http://127.0.0.1:8001';

const SearchPage = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [filters, setFilters] = useState({
    faculty: '',
    yearFrom: '',
    yearTo: '',
    publisher: ''
  });

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [lastSearchResults, setLastSearchResults] = useState([]);
  
  const [faculties, setFaculties] = useState([]);
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    fetchAllBooks();
    fetchFaculties();
    fetchPublishers();
  }, [token]);

  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/book_full_info/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Ошибка загрузки книг');
      
      const data = await response.json();
      setAllBooks(data);
      setSearchResults(data);
      setLastSearchResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faculty`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFaculties(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки факультетов:', err);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/publisher`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPublishers(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки издательств:', err);
    }
  };

  const searchByTitle = async (title) => {
    try {
      const encodedTitle = encodeURIComponent(title);
      const response = await fetch(`${API_BASE_URL}/book_by_title/${encodedTitle}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Ошибка поиска');
      return await response.json();
    } catch (err) {
      console.error('Ошибка поиска по названию:', err);
      return [];
    }
  };

  const searchByAuthor = async (author) => {
    try {
      const encodedAuthor = encodeURIComponent(author);
      const response = await fetch(`${API_BASE_URL}/book_by_author/${encodedAuthor}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Ошибка поиска');
      return await response.json();
    } catch (err) {
      console.error('Ошибка поиска по автору:', err);
      return [];
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setSearchResults(allBooks);
      setLastSearchResults(allBooks);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let results = [];
      
      switch (searchType) {
        case 'title':
          results = await searchByTitle(searchTerm);
          break;
        case 'author':
          results = await searchByAuthor(searchTerm);
          break;
        default:
          results = allBooks;
      }

      setLastSearchResults(results);
      
      const filteredResults = applyFilters(results, filters);
      setSearchResults(filteredResults);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (books, currentFilters) => {
    if (!books || books.length === 0) return [];
    
    return books.filter(book => {
      if (currentFilters.faculty && book.faculties) {
        const facultyMatch = book.faculties.toLowerCase().includes(currentFilters.faculty.toLowerCase());
        if (!facultyMatch) return false;
      }

      if (currentFilters.yearFrom && book.publication_year) {
        if (book.publication_year < parseInt(currentFilters.yearFrom)) return false;
      }

      if (currentFilters.yearTo && book.publication_year) {
        if (book.publication_year > parseInt(currentFilters.yearTo)) return false;
      }

      if (currentFilters.publisher && book.publisher_name) {
        const publisherMatch = book.publisher_name.toLowerCase().includes(currentFilters.publisher.toLowerCase());
        if (!publisherMatch) return false;
      }

      return true;
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    
    const filtered = applyFilters(lastSearchResults, newFilters);
    setSearchResults(filtered);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      faculty: '',
      yearFrom: '',
      yearTo: '',
      publisher: ''
    };
    setFilters(resetFilters);
    setSearchResults(lastSearchResults);
  };

  if (loading && searchResults.length === 0) {
    return (
      <div className="SearchPage">
        <div className="SearchPage-loadingSpinner">
          <i className="fas fa-spinner fa-spin"></i>
          <span className="SearchPage-loadingText">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="SearchPage">
      <h1 className="SearchPage-title">Поиск книг</h1>
      
      <div className="SearchPage-container">
        <form onSubmit={handleSearch} className="SearchPage-form">
          <div className="SearchPage-inputGroup">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="SearchPage-select SearchPage-select--type"
            >
              <option value="title">По названию</option>
              <option value="author">По автору</option>
            </select>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Введите поисковый запрос..."
              className="SearchPage-input"
            />
            <button type="submit" className="SearchPage-btn SearchPage-btn--primary" disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Найти'}
            </button>
          </div>
        </form>

        <div className="SearchPage-filters">
          <h3 className="SearchPage-filtersTitle">Фильтры</h3>
          <div className="SearchPage-filtersGrid">
            <div className="SearchPage-filterItem">
              <label className="SearchPage-filterLabel">Факультет:</label>
              <select
                name="faculty"
                value={filters.faculty}
                onChange={handleFilterChange}
                className="SearchPage-select SearchPage-select--filter"
              >
                <option value="">Все факультеты</option>
                {faculties.map(faculty => (
                  <option key={faculty.id} value={faculty.name}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="SearchPage-filterItem">
              <label className="SearchPage-filterLabel">Издательство:</label>
              <select
                name="publisher"
                value={filters.publisher}
                onChange={handleFilterChange}
                className="SearchPage-select SearchPage-select--filter"
              >
                <option value="">Все издательства</option>
                {publishers.map(publisher => (
                  <option key={publisher.id} value={publisher.name}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="SearchPage-filterItem">
              <label className="SearchPage-filterLabel">Год от:</label>
              <input
                type="number"
                name="yearFrom"
                value={filters.yearFrom}
                onChange={handleFilterChange}
                placeholder="1800"
                className="SearchPage-input SearchPage-input--number"
              />
            </div>
            <div className="SearchPage-filterItem">
              <label className="SearchPage-filterLabel">Год до:</label>
              <input
                type="number"
                name="yearTo"
                value={filters.yearTo}
                onChange={handleFilterChange}
                placeholder="2024"
                className="SearchPage-input SearchPage-input--number"
              />
            </div>
          </div>
          <button type="button" onClick={handleResetFilters} className="SearchPage-btn SearchPage-btn--secondary">
            Сбросить фильтры
          </button>
        </div>
      </div>

      {error && (
        <div className="SearchPage-error">
          <i className="fas fa-exclamation-circle"></i> 
          <span className="SearchPage-errorText">{error}</span>
        </div>
      )}

      <div className="SearchPage-results">
        <h2 className="SearchPage-resultsTitle">Результаты поиска ({searchResults.length})</h2>
        
        {searchResults.length > 0 ? (
          <div className="SearchPage-resultsGrid">
            {searchResults.map(book => (
              <div key={book.id} className="SearchPage-bookCard">
                <h3 className="SearchPage-bookTitle">{book.title}</h3>
                <p className="SearchPage-bookAuthor">{book.authors}</p>
                <p className="SearchPage-bookYear">{book.publication_year} г.</p>
                <div className="SearchPage-bookStats">
                  <span className="SearchPage-bookStat">📚 {book.total_copies} экз.</span>
                  <span className="SearchPage-bookStat">📖 {book.page_count} стр.</span>
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
                  className="SearchPage-btn SearchPage-btn--small"
                >
                  Подробнее
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="SearchPage-noResults">
            <p className="SearchPage-noResultsText">Книги не найдены. Попробуйте изменить параметры поиска.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;