# app/routers/auth_router.py
from fastapi import APIRouter
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Auth"])  # <-- Must be named router

@router.post("/register")
def register(body: UserRegister):
    return register_user(
        email=body.email,
        password=body.password,
        name=body.name,
        company_name=body.company_name,
        phone=body.phone
    )

@router.post("/login", response_model=UserResponse)
def login(body: UserLogin):
    return login_user(body.email, body.password)
