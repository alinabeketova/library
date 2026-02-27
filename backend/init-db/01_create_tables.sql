CREATE TABLE IF NOT EXISTS public.role (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    name varchar(50) NOT NULL UNIQUE,
    description text NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.faculty (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    name varchar(100) NOT NULL UNIQUE,
    description text NULL,
    CONSTRAINT faculty_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.user (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    first_name varchar(20) NOT NULL,
    middle_name varchar(20) NULL,
    last_name varchar(20) NOT NULL,
    date_of_birth date NOT NULL,
    address varchar(100) NULL,
    email varchar(100) NOT NULL,
    passport_number varchar(10) NOT NULL,
    password varchar(255) NOT NULL,
    role_id int4 NOT NULL DEFAULT 1,
    CONSTRAINT user_email_key UNIQUE (email),
    CONSTRAINT user_pkey PRIMARY KEY (id),
    CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id)
        REFERENCES public.role(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.author (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    first_name varchar(50) NOT NULL,
    middle_name varchar(50) NULL,
    last_name varchar(50) NOT NULL,
    CONSTRAINT author_pkey PRIMARY KEY (id),
    CONSTRAINT author_name_unique UNIQUE (first_name, last_name)
);

CREATE TABLE IF NOT EXISTS public.publisher (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    name varchar(100) NOT NULL UNIQUE,
    address varchar(200) NULL,
    CONSTRAINT publisher_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.location (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    name varchar(100) NOT NULL UNIQUE,
    address varchar(200) NULL,
    CONSTRAINT location_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.book (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    title varchar(255) NOT NULL,
    isbn varchar(30) NULL UNIQUE,
    publisher_id int4 NOT NULL,
    publication_year int4 NOT NULL,
    page_count int4 NOT NULL,
    illustration_count int4 NOT NULL DEFAULT 0,
    price numeric(10, 2) NOT NULL,
    CONSTRAINT book_pkey PRIMARY KEY (id),
    CONSTRAINT book_publisher_id_fkey FOREIGN KEY (publisher_id)
        REFERENCES public.publisher(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.book_author (
    book_id int4 NOT NULL,
    author_id int4 NOT NULL,
    CONSTRAINT book_author_book_id_fkey FOREIGN KEY (book_id)
        REFERENCES public.book(id) ON DELETE CASCADE,
    CONSTRAINT book_author_author_id_fkey FOREIGN KEY (author_id)
        REFERENCES public.author(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.book_copy (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    book_id int4 NOT NULL,
    location_id int4 NOT NULL,
    total_copies int4 NOT NULL DEFAULT 1,
    issued_count int4 NOT NULL DEFAULT 0,
    CONSTRAINT book_copy_pkey PRIMARY KEY (id),
    CONSTRAINT book_copy_book_id_fkey FOREIGN KEY (book_id)
        REFERENCES public.book(id) ON DELETE CASCADE,
    CONSTRAINT book_copy_location_id_fkey FOREIGN KEY (location_id)
        REFERENCES public.location(id) ON DELETE CASCADE,
    CONSTRAINT book_copy_book_location_unique UNIQUE (book_id, location_id)
);

CREATE TABLE IF NOT EXISTS public.book_faculty (
    book_id int4 NOT NULL,
    faculty_id int4 NOT NULL,
    CONSTRAINT book_faculty_book_id_fkey FOREIGN KEY (book_id)
        REFERENCES public.book(id) ON DELETE CASCADE,
    CONSTRAINT book_faculty_faculty_id_fkey FOREIGN KEY (faculty_id)
        REFERENCES public.faculty(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.book_loan (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    book_copy_id int4 NOT NULL,
    user_id int4 NOT NULL,
    issue_date date NOT NULL DEFAULT CURRENT_DATE,
    return_date date NULL,
    CONSTRAINT book_loan_pkey PRIMARY KEY (id),
    CONSTRAINT book_loan_unique_user_copy UNIQUE (user_id, book_copy_id),
    CONSTRAINT book_loan_book_copy_id_fkey FOREIGN KEY (book_copy_id)
        REFERENCES public.book_copy(id) ON DELETE CASCADE,
    CONSTRAINT book_loan_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.book_reservation (
    id int4 GENERATED ALWAYS AS IDENTITY(
        INCREMENT BY 1
        MINVALUE 1
        MAXVALUE 2147483647
        START 1
        CACHE 1
        NO CYCLE
    ) NOT NULL,
    book_id int4 NOT NULL,
    user_id int4 NOT NULL,
    reservation_date date NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT book_reservation_pkey PRIMARY KEY (id),
    CONSTRAINT book_reservation_book_id_fkey FOREIGN KEY (book_id)
        REFERENCES public.book(id) ON DELETE CASCADE,
    CONSTRAINT book_reservation_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.user(id) ON DELETE CASCADE
);
