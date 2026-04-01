export const validators = {
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
      if (isEdit && (!value || !value.trim())) return null;
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
      if (isEdit) return null;
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

export const validateForm = (data, type, options = {}) => {
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