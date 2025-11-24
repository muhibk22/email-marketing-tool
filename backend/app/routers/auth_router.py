from fastapi import APIRouter
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(body: UserRegister):
    return register_user(body.email, body.password)

@router.post("/login", response_model=UserResponse)
def login(body: UserLogin):
    return login_user(body.email, body.password)
