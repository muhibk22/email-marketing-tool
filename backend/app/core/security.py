from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from decouple import config
from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from bson import ObjectId

from app.db.client import users_collection

# ---- JWT Config ----
SECRET_KEY = config("SECRET_KEY")
ALGORITHM = "HS256"

# ---- Password Hashing ----
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

def create_access_token(user_id: str):
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ---- OAuth2PasswordBearer (for backend) ----
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Use this in your backend routes
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")

# ---- Swagger-friendly APIKeyHeader (for docs) ----
api_key_scheme = APIKeyHeader(name="Authorization", auto_error=False)

def get_current_user_swagger(token: str = Security(api_key_scheme)):
    """
    Use this in Swagger UI so only token is required
    """
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")

    if token.startswith("Bearer "):
        token = token[7:]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.JWTError:
        raise HTTPException(401, "Token is invalid or expired")
