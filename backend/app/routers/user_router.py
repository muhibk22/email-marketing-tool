from fastapi import APIRouter, Depends
from app.core.security import get_current_user_swagger

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.get("/me", summary="Get current logged-in user")
def get_me(current_user=Depends(get_current_user_swagger)):
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"]
    }
