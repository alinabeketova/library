class AlreadyExistError(Exception):
    pass


class NotFoundError(Exception):
    pass


class NotFound400Error(Exception):
    pass


class UnauthorizedError(Exception):
    pass


class FilterFieldsTransformError(Exception):
    def __init__(self: "FilterFieldsTransformError", error_text: SyntaxError | ValueError) -> None:
        super().__init__(f"Неверный формат filter_fields: {error_text}")
