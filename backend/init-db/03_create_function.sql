
DROP FUNCTION IF EXISTS public.add_book_with_relations CASCADE;

CREATE OR REPLACE FUNCTION public.add_book_with_relations(
    p_title text,
    p_isbn text,
    p_publisher_id int,
    p_publication_year int,
    p_page_count int,
    p_price float,
    p_illustration_count int DEFAULT 0,
    p_author_ids text DEFAULT NULL,
    p_new_authors text DEFAULT NULL,
    p_faculty_ids text DEFAULT NULL,
    p_location_id int DEFAULT NULL,
    p_copies_count int DEFAULT 1
)
RETURNS text  -- возвращаем text вместо jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_book_id int;
    v_author_id int;
    v_author_arr int[];
    v_faculty_arr int[];
    v_new_authors_json jsonb;
    v_new_author jsonb;
    v_copy_id int;
    v_result text;
BEGIN
    -- Конвертируем text в массивы
    IF p_author_ids IS NOT NULL AND p_author_ids != '' THEN
        v_author_arr := string_to_array(p_author_ids, ',')::int[];
    END IF;

    IF p_faculty_ids IS NOT NULL AND p_faculty_ids != '' THEN
        v_faculty_arr := string_to_array(p_faculty_ids, ',')::int[];
    END IF;

    IF p_new_authors IS NOT NULL AND p_new_authors != '' THEN
        v_new_authors_json := p_new_authors::jsonb;
    END IF;

    INSERT INTO public.book (title, isbn, publisher_id, publication_year,
                           page_count, illustration_count, price)
    VALUES (p_title, p_isbn, p_publisher_id, p_publication_year,
            p_page_count, p_illustration_count, p_price)
    RETURNING id INTO v_book_id;

    IF v_author_arr IS NOT NULL THEN
        INSERT INTO public.book_author (book_id, author_id)
        SELECT v_book_id, unnest(v_author_arr)
        ON CONFLICT DO NOTHING;
    END IF;

    IF v_new_authors_json IS NOT NULL THEN
        FOR v_new_author IN SELECT * FROM jsonb_array_elements(v_new_authors_json)
        LOOP
            SELECT id INTO v_author_id
            FROM public.author
            WHERE first_name = (v_new_author->>'first_name')
              AND last_name = (v_new_author->>'last_name')
              AND (middle_name IS NOT DISTINCT FROM (v_new_author->>'middle_name'));

            IF v_author_id IS NULL THEN
                INSERT INTO public.author (first_name, middle_name, last_name)
                VALUES (
                    v_new_author->>'first_name',
                    v_new_author->>'middle_name',
                    v_new_author->>'last_name'
                )
                RETURNING id INTO v_author_id;
            END IF;

            INSERT INTO public.book_author (book_id, author_id)
            VALUES (v_book_id, v_author_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    IF v_faculty_arr IS NOT NULL THEN
        INSERT INTO public.book_faculty (book_id, faculty_id)
        SELECT v_book_id, unnest(v_faculty_arr)
        ON CONFLICT DO NOTHING;
    END IF;

    IF p_location_id IS NOT NULL THEN
        INSERT INTO public.book_copy (book_id, location_id, total_copies, issued_count)
        VALUES (v_book_id, p_location_id, p_copies_count, 0);
    END IF;

    -- Формируем JSON результат как text
    v_result := json_build_object(
        'success', true,
        'book_id', v_book_id,
        'title', p_title,
        'authors_added', coalesce(array_length(v_author_arr, 1), 0) +
                        coalesce(jsonb_array_length(v_new_authors_json), 0),
        'faculties_added', coalesce(array_length(v_faculty_arr, 1), 0),
        'copies_created', CASE WHEN p_location_id IS NOT NULL THEN p_copies_count ELSE 0 END
    )::text;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
    )::text;
END;
$$;