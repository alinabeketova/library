from typing import Any, TypeVar

from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Базовый класс для всех моделей.

    :param id: Идентификатор
    """

    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True)

    def to_dict(self: "Base") -> dict[str, Any]:
        """
        Преобразует экземпляр модели SQLAlchemy в словарь.

        Этот метод создает словарь, содержащий все атрибуты экземпляра,
        исключая системные атрибуты (атрибуты, начинающиеся с подчеркивания '_').
        Для каждого отношения (relationship), определенного в модели,
        метод проверяет, загружено ли оно (с помощью проверки на наличие в
        атрибуте self.dict). Если отношение загружено:
            - Если это отношение представляет собой список (uselist=True),
            метод рекурсивно преобразует каждый элемент списка в словарь,
            вызывая их метод to_dict().
            - Если это одиночное отношение, метод вызывает to_dict() для
            связанного объекта, чтобы получить его представление в виде словаря.

        Возвращает:
            dict[str, Any]: Словарь, представляющий экземпляр модели и его
            загруженные отношения.
        """
        result = {key: value for key, value in vars(self).items() if not key.startswith("_")}
        for rel in self.__mapper__.relationships:
            if self.__dict__.get(rel.key):
                related_value = getattr(self, rel.key)
                if rel.uselist:
                    result[rel.key] = [item.to_dict() for item in related_value if hasattr(item, "to_dict")]
                else:
                    result[rel.key] = related_value.to_dict()
        return result


class MaterializedView(Base):
    __tablename__ = "materialized_view"

    materialized_view_name: Mapped[str] = mapped_column(String(255), primary_key=True)


class TempTableBase(DeclarativeBase):
    __abstract__ = True


SqlModelType = TypeVar("SqlModelType", bound=Base)
