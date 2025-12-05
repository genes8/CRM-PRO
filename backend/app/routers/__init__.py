from app.routers.auth import router as auth_router
from app.routers.contacts import router as contacts_router
from app.routers.deals import router as deals_router
from app.routers.tasks import router as tasks_router
from app.routers.analytics import router as analytics_router
from app.routers.users import router as users_router

__all__ = [
    "auth_router",
    "contacts_router", 
    "deals_router",
    "tasks_router",
    "analytics_router",
    "users_router"
]
