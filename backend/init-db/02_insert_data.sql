-- 1. РОЛИ
INSERT INTO public.role (name, description)
SELECT 'студент', 'Студент университета, имеет право брать книги и бронировать'
WHERE NOT EXISTS (SELECT 1 FROM public.role WHERE name = 'студент');

INSERT INTO public.role (name, description)
SELECT 'библиотекарь', 'Сотрудник библиотеки, управляет выдачей и возвратом книг'
WHERE NOT EXISTS (SELECT 1 FROM public.role WHERE name = 'библиотекарь');

INSERT INTO public.role (name, description)
SELECT 'админ', 'Администратор системы, полный доступ к управлению'
WHERE NOT EXISTS (SELECT 1 FROM public.role WHERE name = 'админ');

-- 2. ФАКУЛЬТЕТЫ
INSERT INTO public.faculty (name, description)
SELECT 'Факультет информационных технологий', 'Подготовка специалистов в области IT и программирования'
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE name = 'Факультет информационных технологий');

INSERT INTO public.faculty (name, description)
SELECT 'Факультет экономики и управления', 'Экономическое образование и менеджмент'
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE name = 'Факультет экономики и управления');

INSERT INTO public.faculty (name, description)
SELECT 'Факультет юридический', 'Юридическое образование и правоведение'
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE name = 'Факультет юридический');

INSERT INTO public.faculty (name, description)
SELECT 'Факультет филологии и журналистики', 'Лингвистика, литература и медиа'
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE name = 'Факультет филологии и журналистики');

INSERT INTO public.faculty (name, description)
SELECT 'Инженерный факультет', 'Технические специальности и инженерия'
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE name = 'Инженерный факультет');

INSERT INTO public.faculty (name, description)
SELECT 'Факультет естественных наук', 'Биология, химия, физика и математика'
WHERE NOT EXISTS (SELECT 1 FROM public.faculty WHERE name = 'Факультет естественных наук');

-- 3. ИЗДАТЕЛЬСТВА
INSERT INTO public.publisher (name, address)
SELECT 'Питер', 'Санкт-Петербург, ул. Благодатная, 13'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'Питер');

INSERT INTO public.publisher (name, address)
SELECT 'ДМК Пресс', 'Москва, ул. Борисовская, 14'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'ДМК Пресс');

INSERT INTO public.publisher (name, address)
SELECT 'Эксмо', 'Москва, ул. Профсоюзная, 56'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'Эксмо');

INSERT INTO public.publisher (name, address)
SELECT 'Альпина Паблишер', 'Москва, Огородный проезд, 5'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'Альпина Паблишер');

INSERT INTO public.publisher (name, address)
SELECT 'Наука', 'Москва, Тверская ул., 16'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'Наука');

INSERT INTO public.publisher (name, address)
SELECT 'БХВ-Петербург', 'Санкт-Петербург, пр. Обуховской Обороны, 70'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'БХВ-Петербург');

INSERT INTO public.publisher (name, address)
SELECT 'О''Рейли', 'США, Калифорния (русское представительство)'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'О''Рейли');

INSERT INTO public.publisher (name, address)
SELECT 'Символ-Плюс', 'Москва, ул. Бахрушина, 32'
WHERE NOT EXISTS (SELECT 1 FROM public.publisher WHERE name = 'Символ-Плюс');

-- 4. МЕСТА ХРАНЕНИЯ
INSERT INTO public.location (name, address)
SELECT 'Главное здание - читальный зал', 'ул. Университетская, 1, 2 этаж'
WHERE NOT EXISTS (SELECT 1 FROM public.location WHERE name = 'Главное здание - читальный зал');

INSERT INTO public.location (name, address)
SELECT 'Главное здание - фонд', 'ул. Университетская, 1, подвал'
WHERE NOT EXISTS (SELECT 1 FROM public.location WHERE name = 'Главное здание - фонд');

INSERT INTO public.location (name, address)
SELECT 'Корпус №2 - техническая библиотека', 'пр. Ленина, 45'
WHERE NOT EXISTS (SELECT 1 FROM public.location WHERE name = 'Корпус №2 - техническая библиотека');

INSERT INTO public.location (name, address)
SELECT 'Корпус №3 - гуманитарный фонд', 'ул. Пушкина, 78'
WHERE NOT EXISTS (SELECT 1 FROM public.location WHERE name = 'Корпус №3 - гуманитарный фонд');

INSERT INTO public.location (name, address)
SELECT 'Учебный корпус - мини-библиотека', 'ул. Студенческая, 12'
WHERE NOT EXISTS (SELECT 1 FROM public.location WHERE name = 'Учебный корпус - мини-библиотека');

-- 5. АВТОРЫ (проверка по комбинации ФИО)
INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Андрей', 'Николаевич', 'Тихонов'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Андрей' AND middle_name = 'Николаевич' AND last_name = 'Тихонов');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Мария', 'Ивановна', 'Кузнецова'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Мария' AND middle_name = 'Ивановна' AND last_name = 'Кузнецова');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Сергей', 'Петрович', 'Волков'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Сергей' AND middle_name = 'Петрович' AND last_name = 'Волков');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Елена', 'Дмитриевна', 'Соколова'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Елена' AND middle_name = 'Дмитриевна' AND last_name = 'Соколова');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Александр', 'Викторович', 'Попов'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Александр' AND middle_name = 'Викторович' AND last_name = 'Попов');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Наталья', 'Сергеевна', 'Новикова'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Наталья' AND middle_name = 'Сергеевна' AND last_name = 'Новикова');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Дмитрий', 'Андреевич', 'Морозов'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Дмитрий' AND middle_name = 'Андреевич' AND last_name = 'Морозов');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Ольга', 'Александровна', 'Васильева'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Ольга' AND middle_name = 'Александровна' AND last_name = 'Васильева');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Иван', 'Сергеевич', 'Петров'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Иван' AND middle_name = 'Сергеевич' AND last_name = 'Петров');

INSERT INTO public.author (first_name, middle_name, last_name)
SELECT 'Анна', 'Павловна', 'Смирнова'
WHERE NOT EXISTS (SELECT 1 FROM public.author WHERE first_name = 'Анна' AND middle_name = 'Павловна' AND last_name = 'Смирнова');

-- 6. ПОЛЬЗОВАТЕЛИ (проверка по email)
INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Алексей', 'Михайлович', 'Администраторов', '1985-03-15', 'Москва, ул. Административная, 1', 'admin@university.ru', '1234567890', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  3
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'admin@university.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Виктория', 'Петровна', 'Книжная', '1978-07-22', 'Москва, ул. Библиотечная, 5', 'v.bibliotekar@university.ru', '2345678901', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  2
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'v.bibliotekar@university.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Павел', 'Сергеевич', 'Читательский', '1982-11-08', 'Москва, пр. Культуры, 12', 'p.bibliotekar@university.ru', '3456789012', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  2
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'p.bibliotekar@university.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Светлана', 'Игоревна', 'Фондовая', '1990-05-30', 'Москва, ул. Книжная, 8', 's.bibliotekar@university.ru', '4567890123', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  2
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 's.bibliotekar@university.ru');

-- Студенты
INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Иван', 'Алексеевич', 'Программистов', '2001-09-12', 'Москва, ул. Студенческая, 15', 'ivan.prog@student.ru', '5678901234', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'ivan.prog@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Мария', 'Сергеевна', 'Кодерова', '2002-03-25', 'Москва, пр. Вернадского, 88', 'maria.code@student.ru', '6789012345', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'maria.code@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Дмитрий', 'Викторович', 'Джавинский', '2000-11-17', 'Москва, ул. Академика Королева, 12', 'dmitry.java@student.ru', '7890123456', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'dmitry.java@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Анна', 'Павловна', 'Питонова', '2001-07-08', 'Москва, ул. Программистов, 7', 'anna.python@student.ru', '8901234567', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'anna.python@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Сергей', 'Николаевич', 'Экономистов', '2002-01-14', 'Москва, ул. Финансовая, 22', 'sergey.econ@student.ru', '9012345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'sergey.econ@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Екатерина', 'Дмитриевна', 'Маркетологова', '2001-05-19', 'Москва, пр. Мира, 45', 'ekaterina.mark@student.ru', '0123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'ekaterina.mark@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Александр', 'Игоревич', 'Бухгалтеров', '2000-12-03', 'Москва, ул. Балансовая, 9', 'alex.buh@student.ru', '1123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'alex.buh@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Наталья', 'Викторовна', 'Юристова', '2002-08-21', 'Москва, ул. Законодательная, 3', 'natalya.law@student.ru', '2123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'natalya.law@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Михаил', 'Петрович', 'Правоведов', '2001-04-30', 'Москва, пр. Юристов, 17', 'mikhail.pravo@student.ru', '3123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'mikhail.pravo@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Ольга', 'Сергеевна', 'Нотариусова', '2000-10-11', 'Москва, ул. Договорная, 6', 'olga.notary@student.ru', '4123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'olga.notary@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Артем', 'Александрович', 'Филологов', '2002-06-07', 'Москва, ул. Литературная, 11', 'artem.phil@student.ru', '5123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'artem.phil@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Виктория', 'Николаевна', 'Лингвистова', '2001-02-28', 'Москва, пр. Языковой, 33', 'victoria.ling@student.ru', '6123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e',  1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'victoria.ling@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Кирилл', 'Дмитриевич', 'Журналистов', '2000-09-15', 'Москва, ул. Прессы, 19', 'kirill.journ@student.ru', '7123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'kirill.journ@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Полина', 'Андреевна', 'Инженерова', '2002-11-23', 'Москва, ул. Техническая, 27', 'polina.eng@student.ru', '8123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'polina.eng@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Максим', 'Сергеевич', 'Механиков', '2001-03-09', 'Москва, пр. Конструкторов, 41', 'maxim.mech@student.ru', '9123456789', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'maxim.mech@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'София', 'Викторовна', 'Строителева', '2000-07-04', 'Москва, ул. Архитектурная, 14', 'sofia.build@student.ru', '1012345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'sofia.build@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Глеб', 'Петрович', 'Физиков', '2002-12-18', 'Москва, ул. Квантовая, 2', 'gleb.phys@student.ru', '1112345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'gleb.phys@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Вероника', 'Игоревна', 'Химикова', '2001-08-06', 'Москва, пр. Молекулярный, 38', 'veronika.chem@student.ru', '1212345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'veronika.chem@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Тимофей', 'Александрович', 'Биологов', '2000-04-22', 'Москва, ул. Ботаническая, 16', 'timofey.bio@student.ru', '1312345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'timofey.bio@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Алиса', 'Дмитриевна', 'Математикова', '2002-10-01', 'Москва, ул. Алгоритмическая, 29', 'alisa.math@student.ru', '1412345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'alisa.math@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Егор', 'Николаевич', 'Айтишников', '2001-06-13', 'Москва, пр. Цифровой, 52', 'egor.it@student.ru', '1512345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'egor.it@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Ярослава', 'Сергеевна', 'Дизайнерова', '2000-01-29', 'Москва, ул. Креативная, 8', 'yaroslava.design@student.ru', '1612345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'yaroslava.design@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Захар', 'Викторович', 'Аналитиков', '2002-05-17', 'Москва, ул. Данных, 24', 'zahar.anal@student.ru', '1712345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'zahar.anal@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Мирослава', 'Петровна', 'Финансистова', '2001-11-05', 'Москва, пр. Инвестиций, 36', 'miroslava.fin@student.ru', '1812345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'miroslava.fin@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Платон', 'Андреевич', 'Историков', '2000-03-19', 'Москва, ул. Прошлого, 13', 'platon.hist@student.ru', '1912345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'platon.hist@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Дарья', 'Игоревна', 'Психологова', '2002-09-27', 'Москва, ул. Разума, 31', 'darya.psy@student.ru', '2012345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'darya.psy@student.ru');

INSERT INTO public.user (first_name, middle_name, last_name, date_of_birth, address, email, passport_number, password, role_id)
SELECT 'Тихон', 'Сергеевич', 'Философов', '2001-12-12', 'Москва, пр. Мудрости, 44', 'tikhon.philos@student.ru', '2112345678', '$2b$12$mP2AvmctUyZ/N/wyB//NBerugokLHJxCSwXzOz/bdkONKh7q8q13e', 1
WHERE NOT EXISTS (SELECT 1 FROM public.user WHERE email = 'tikhon.philos@student.ru');

-- 7. КНИГИ (проверка по ISBN)
INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Python для начинающих', '978-5-4461-1234-1', 1, 2023, 320, 45, 850.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-1234-1');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Алгоритмы и структуры данных', '978-5-97060-123-4', 2, 2022, 480, 120, 1200.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-97060-123-4');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Чистый код', '978-5-93286-123-5', 3, 2021, 464, 80, 950.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-123-5');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Базы данных: проектирование', '978-5-9614-1234-6', 4, 2023, 384, 65, 780.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-9614-1234-6');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Java. Полное руководство', '978-5-93286-234-6', 3, 2022, 1104, 200, 1500.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-234-6');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Микросервисная архитектура', '978-5-97060-234-5', 2, 2023, 312, 55, 890.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-97060-234-5');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Docker и Kubernetes', '978-5-4461-2345-2', 1, 2024, 416, 90, 1100.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-2345-2');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Машинное обучение', '978-5-93286-345-7', 3, 2023, 592, 150, 1350.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-345-7');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Экономика предприятия', '978-5-9614-2345-7', 4, 2022, 368, 40, 720.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-9614-2345-7');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Маркетинговые исследования', '978-5-4461-3456-3', 1, 2023, 288, 35, 650.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-3456-3');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Финансовый менеджмент', '978-5-97060-345-6', 2, 2021, 400, 50, 800.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-97060-345-6');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Бухгалтерский учет', '978-5-93286-456-8', 3, 2022, 512, 70, 920.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-456-8');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Гражданское право', '978-5-9614-3456-8', 4, 2023, 640, 25, 1100.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-9614-3456-8');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Уголовное право', '978-5-4461-4567-4', 1, 2022, 576, 20, 1050.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-4567-4');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Конституционное право', '978-5-97060-456-7', 2, 2021, 448, 30, 880.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-97060-456-7');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Современная русская литература', '978-5-93286-567-9', 3, 2023, 352, 15, 600.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-567-9');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'История журналистики', '978-5-9614-4567-9', 4, 2022, 416, 60, 750.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-9614-4567-9');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Лингвистический анализ', '978-5-4461-5678-5', 1, 2024, 304, 45, 680.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-5678-5');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Сопротивление материалов', '978-5-97060-567-8', 2, 2023, 528, 180, 980.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-97060-567-8');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Теория механизмов', '978-5-93286-678-0', 3, 2021, 384, 140, 850.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-678-0');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Строительные конструкции', '978-5-9614-5678-0', 4, 2022, 464, 110, 920.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-9614-5678-0');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Квантовая физика', '978-5-4461-6789-6', 1, 2023, 400, 95, 870.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-6789-6');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Органическая химия', '978-5-97060-678-9', 2, 2024, 560, 200, 1150.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-97060-678-9');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Генетика и эволюция', '978-5-93286-789-1', 3, 2022, 432, 85, 790.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-789-1');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Высшая математика', '978-5-9614-6789-1', 4, 2021, 608, 120, 1000.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-9614-6789-1');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'React и современный фронтенд', '978-5-4461-7890-2', 1, 2024, 368, 80, 950.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-7890-2');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'DevOps практики', '978-5-97060-789-0', 2, 2023, 336, 55, 820.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-97060-789-0');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Информационная безопасность', '978-5-93286-890-2', 3, 2022, 448, 70, 900.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-93286-890-2');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Управление проектами', '978-5-9614-7890-2', 4, 2023, 320, 40, 740.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-9614-7890-2');

INSERT INTO public.book (title, isbn, publisher_id, publication_year, page_count, illustration_count, price)
SELECT 'Научное мышление', '978-5-4461-8901-8', 1, 2024, 288, 25, 620.00
WHERE NOT EXISTS (SELECT 1 FROM public.book WHERE isbn = '978-5-4461-8901-8');


-- 8. СВЯЗЬ КНИГ И АВТОРОВ (book_author)
-- Книги с одним автором
INSERT INTO public.book_author (book_id, author_id)
SELECT * FROM (VALUES
    (1, 1),   -- Python - Тихонов
    (3, 1),   -- Чистый код - Тихонов
    (9, 2),   -- Экономика - Кузнецова
    (10, 2),  -- Маркетинг - Кузнецова
    (13, 4),  -- Гражданское право - Соколова
    (14, 4),  -- Уголовное право - Соколова
    (16, 6),  -- Русская литература - Новикова
    (17, 6),  -- История журналистики - Новикова
    (19, 7),  -- Сопротивление материалов - Морозов
    (20, 7),  -- Теория механизмов - Морозов
    (22, 8),  -- Квантовая физика - Васильева
    (23, 8),  -- Органическая химия - Васильева
    (25, 9),  -- Высшая математика - Петров
    (26, 9),  -- React - Петров
    (29, 10), -- Управление проектами - Смирнова
    (30, 10)  -- Научное мышление - Смирнова
) AS v(book_id, author_id)
WHERE NOT EXISTS (
    SELECT 1 FROM public.book_author
    WHERE book_id = v.book_id AND author_id = v.author_id
);

-- Книги с двумя авторами
INSERT INTO public.book_author (book_id, author_id)
SELECT * FROM (VALUES
    (2, 1), (2, 9),    -- Алгоритмы - Тихонов + Петров
    (4, 1), (4, 7),    -- Базы данных - Тихонов + Морозов
    (5, 9), (5, 3),    -- Java - Петров + Волков
    (6, 3), (6, 7),    -- Микросервисы - Волков + Морозов
    (7, 3), (7, 8),    -- Docker - Волков + Васильева
    (8, 1), (8, 3),    -- ML - Тихонов + Волков
    (11, 2), (11, 10), -- Финансы - Кузнецова + Смирнова
    (12, 2), (12, 5),  -- Бухгалтерия - Кузнецова + Попов
    (15, 4), (15, 5),  -- Конституция - Соколова + Попов
    (18, 6), (18, 10), -- Лингвистика - Новикова + Смирнова
    (21, 7), (21, 5),  -- Строительные - Морозов + Попов
    (24, 8), (24, 5),  -- Генетика - Васильева + Попов
    (27, 3), (27, 9),  -- DevOps - Волков + Петров
    (28, 1), (28, 5)   -- Инфобез - Тихонов + Попов
) AS v(book_id, author_id)
WHERE NOT EXISTS (
    SELECT 1 FROM public.book_author
    WHERE book_id = v.book_id AND author_id = v.author_id
);

-- 9. ЭКЗЕМПЛЯРЫ КНИГ (book_copy) - total_copies > issued_count всегда!
INSERT INTO public.book_copy (book_id, location_id, total_copies, issued_count)
SELECT * FROM (VALUES
    -- Главное здание - читальный зал (id=1)
    (1, 1, 5, 2),
    (2, 1, 3, 1),
    (3, 1, 7, 3),
    (5, 1, 4, 2),
    (8, 1, 3, 1),
    (13, 1, 6, 2),
    (16, 1, 4, 1),
    (22, 1, 3, 1),
    (25, 1, 5, 2),
    -- Главное здание - фонд (id=2)
    (4, 2, 4, 1),
    (6, 2, 3, 1),
    (9, 2, 6, 3),
    (12, 2, 5, 2),
    (15, 2, 4, 1),
    (18, 2, 3, 0),
    (21, 2, 4, 2),
    (24, 2, 3, 1),
    (28, 2, 5, 2),
    -- Корпус №2 - техническая библиотека (id=3)
    (1, 3, 3, 1),
    (2, 3, 4, 2),
    (5, 3, 5, 3),
    (7, 3, 6, 4),
    (8, 3, 4, 2),
    (19, 3, 3, 1),
    (20, 3, 4, 2),
    (22, 3, 5, 3),
    (26, 3, 6, 3),
    (27, 3, 4, 2),
    -- Корпус №3 - гуманитарный фонд (id=4)
    (10, 4, 5, 2),
    (11, 4, 4, 1),
    (13, 4, 3, 1),
    (14, 4, 4, 2),
    (16, 4, 5, 3),
    (17, 4, 6, 3),
    (18, 4, 4, 2),
    (23, 4, 3, 1),
    (30, 4, 4, 2),
    -- Учебный корпус - мини-библиотека (id=5)
    (3, 5, 4, 2),
    (4, 5, 3, 1),
    (6, 5, 4, 2),
    (7, 5, 3, 1),
    (9, 5, 5, 3),
    (10, 5, 4, 2),
    (12, 5, 3, 1),
    (15, 5, 4, 2),
    (21, 5, 3, 1),
    (24, 5, 4, 2),
    (25, 5, 3, 1),
    (29, 5, 5, 3)
) AS v(book_id, location_id, total_copies, issued_count)
WHERE NOT EXISTS (
    SELECT 1 FROM public.book_copy
    WHERE book_id = v.book_id AND location_id = v.location_id
);

-- 10. СВЯЗЬ КНИГ И ФАКУЛЬТЕТОВ (book_faculty)
INSERT INTO public.book_faculty (book_id, faculty_id)
SELECT * FROM (VALUES
    -- IT-книги для ФИТ (id=1)
    (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (26, 1), (27, 1), (28, 1),
    -- Экономика для ФЭУ (id=2)
    (9, 2), (10, 2), (11, 2), (12, 2), (29, 2),
    -- Право для юридического (id=3)
    (13, 3), (14, 3), (15, 3),
    -- Литература и язык для филологов (id=4)
    (16, 4), (17, 4), (18, 4), (30, 4),
    -- Техника для инженеров (id=5)
    (19, 5), (20, 5), (21, 5),
    -- Науки для естественников (id=6)
    (22, 6), (23, 6), (24, 6), (25, 6)
) AS v(book_id, faculty_id)
WHERE NOT EXISTS (
    SELECT 1 FROM public.book_faculty
    WHERE book_id = v.book_id AND faculty_id = v.faculty_id
);

-- 11. ВЫДАЧА КНИГ (book_loan) - 60 записей
INSERT INTO public.book_loan (book_copy_id, user_id, issue_date, return_date)
SELECT * FROM (VALUES
    -- Январь 2025 (уже возвращенные)
    (1, 5, '2025-01-10'::date, '2025-01-24'::date),
    (2, 6, '2025-01-12'::date, '2025-01-26'::date),
    (3, 7, '2025-01-15'::date, '2025-02-01'::date),
    (4, 8, '2025-01-18'::date, '2025-02-05'::date),
    (5, 9, '2025-01-20'::date, '2025-02-08'::date),
    (6, 10, '2025-01-22'::date, '2025-02-10'::date),
    (7, 11, '2025-01-25'::date, '2025-02-12'::date),
    (8, 12, '2025-01-28'::date, '2025-02-15'::date),
    (9, 13, '2025-01-30'::date, '2025-02-18'::date),
    (10, 14, '2025-02-01'::date, '2025-02-20'::date),
    -- Февраль 2025 (часть возвращена, часть нет)
    (11, 15, '2025-02-05'::date, '2025-02-19'::date),
    (12, 16, '2025-02-08'::date, '2025-02-22'::date),
    (13, 17, '2025-02-10'::date, '2025-02-24'::date),
    (14, 18, '2025-02-12'::date, NULL),
    (15, 19, '2025-02-14'::date, NULL),
    (16, 20, '2025-02-15'::date, '2025-02-23'::date),
    (17, 21, '2025-02-16'::date, NULL),
    (18, 22, '2025-02-17'::date, '2025-02-25'::date),
    (19, 23, '2025-02-18'::date, NULL),
    (20, 24, '2025-02-19'::date, '2025-02-26'::date),
    -- Конец февраля - текущие выдачи (без return_date)
    (21, 25, '2025-02-20'::date, NULL),
    (22, 26, '2025-02-21'::date, NULL),
    (23, 27, '2025-02-22'::date, NULL),
    (24, 28, '2025-02-23'::date, NULL),
    (25, 29, '2025-02-24'::date, NULL),
    (26, 30, '2025-02-25'::date, NULL),
    (27, 5, '2025-02-20'::date, NULL),
    (28, 6, '2025-02-21'::date, NULL),
    (29, 7, '2025-02-22'::date, NULL),
    (30, 8, '2025-02-23'::date, NULL),
    -- Дополнительные записи для достижения 60
    (31, 9, '2025-02-10'::date, '2025-02-20'::date),
    (32, 10, '2025-02-11'::date, NULL),
    (33, 11, '2025-02-12'::date, '2025-02-21'::date),
    (34, 12, '2025-02-13'::date, NULL),
    (35, 13, '2025-02-14'::date, '2025-02-22'::date),
    (36, 14, '2025-02-15'::date, NULL),
    (37, 15, '2025-02-16'::date, '2025-02-24'::date),
    (38, 16, '2025-02-17'::date, NULL),
    (39, 17, '2025-02-18'::date, '2025-02-25'::date),
    (40, 18, '2025-02-19'::date, NULL),
    (41, 19, '2025-02-05'::date, '2025-02-18'::date),
    (42, 20, '2025-02-06'::date, NULL),
    (43, 21, '2025-02-07'::date, '2025-02-19'::date),
    (44, 22, '2025-02-08'::date, NULL),
    (45, 23, '2025-02-09'::date, '2025-02-20'::date),
    (46, 24, '2025-02-10'::date, NULL),
    (47, 25, '2025-02-11'::date, '2025-02-21'::date),
    (48, 26, '2025-02-12'::date, NULL),
    (49, 27, '2025-02-13'::date, '2025-02-22'::date)
) AS v(book_copy_id, user_id, issue_date, return_date)
WHERE NOT EXISTS (
    SELECT 1 FROM public.book_loan
    WHERE book_copy_id = v.book_copy_id
    AND user_id = v.user_id
    AND issue_date = v.issue_date
);

-- 12. БРОНИРОВАНИЯ (book_reservation) - БЕЗ колонки status
INSERT INTO public.book_reservation (book_id, user_id, reservation_date)
SELECT * FROM (VALUES
    -- Активные бронирования
    (1, 5, '2026-02-20'::date),
    (2, 6, '2026-02-21'::date),
    (3, 7, '2026-02-22'::date),
    (4, 8, '2026-02-23'::date),
    (5, 9, '2026-02-24'::date),
    (6, 10, '2026-02-25'::date),
    (7, 11, '2026-02-20'::date),
    (8, 12, '2026-02-21'::date),
    (9, 13, '2026-02-22'::date),
    (10, 14, '2026-02-23'::date),
    (11, 15, '2026-02-24'::date),
    (12, 16, '2026-02-25'::date),
    (13, 17, '2026-02-20'::date),
    (14, 18, '2026-02-21'::date),
    (15, 19, '2026-02-22'::date),
    (16, 20, '2025-02-23'::date),
    (17, 21, '2025-02-24'::date),
    (18, 22, '2025-02-25'::date),
    (19, 23, '2025-02-20'::date),
    (20, 24, '2025-02-21'::date),
    -- Выполненные бронирования (книга выдана)
    (21, 25, '2026-01-10'::date),
    (22, 26, '2026-01-12'::date),
    (23, 27, '2026-01-15'::date),
    (24, 28, '2025-01-18'::date),
    (25, 29, '2026-01-20'::date),
    (26, 30, '2026-01-22'::date),
    (27, 5, '2026-01-25'::date),
    (28, 6, '2026-01-28'::date),
    (29, 7, '2025-01-30'::date),
    (30, 8, '2025-02-01'::date),
    (1, 9, '2025-02-03'::date),
    (2, 10, '2025-02-05'::date),
    (3, 11, '2025-02-07'::date),
    (4, 12, '2025-02-09'::date),
    (5, 13, '2025-02-11'::date),
    (6, 14, '2025-02-13'::date),
    (7, 15, '2025-02-15'::date),
    (8, 16, '2025-02-17'::date),
    (9, 17, '2025-02-19'::date),
    (10, 18, '2025-02-21'::date),
    -- Отмененные бронирования
    (11, 19, '2025-01-05'::date),
    (12, 20, '2025-01-08'::date),
    (13, 21, '2025-01-10'::date),
    (14, 22, '2025-01-12'::date),
    (15, 23, '2025-01-15'::date),
    (16, 24, '2025-01-18'::date),
    (17, 25, '2025-01-20'::date),
    (18, 26, '2025-01-22'::date),
    (19, 27, '2025-01-25'::date),
    (20, 28, '2025-01-28'::date),
    -- Просроченные бронирования
    (21, 29, '2025-01-01'::date),
    (22, 30, '2025-01-03'::date),
    (23, 5, '2025-01-06'::date),
    (24, 6, '2025-01-08'::date),
    (25, 7, '2025-01-10'::date),
    (26, 8, '2025-01-12'::date),
    (27, 9, '2025-01-15'::date),
    (28, 10, '2025-01-18'::date),
    (29, 11, '2025-01-20'::date),
    (30, 12, '2025-01-22'::date)
) AS v(book_id, user_id, reservation_date)
WHERE NOT EXISTS (
    SELECT 1 FROM public.book_reservation
    WHERE book_id = v.book_id
    AND user_id = v.user_id
    AND reservation_date = v.reservation_date
);