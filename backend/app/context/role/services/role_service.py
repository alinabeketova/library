from app.context.role.dependencies.repositories import IRoleRepository


class RoleService:
    def __init__(self: "RoleService", repository: IRoleRepository) -> None:
        self.repository = repository
