import bcrypt
# Monkey patch for passlib 1.7.4 compatibility with bcrypt >= 4.0.0
if not hasattr(bcrypt, '__about__'):
    class About:
        __version__ = bcrypt.__version__
    bcrypt.__about__ = About()

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from decouple import config
from fastapi import Security, HTTPException
from fastapi.security import APIKeyHeader
from bson import ObjectId
from app.db.client import users_collection

SECRET_KEY = config("SECRET_KEY")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

def create_access_token(user_id: str):
    payload = {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# Swagger / APIKeyHeader
api_key_scheme = APIKeyHeader(name="Authorization", auto_error=True)

def get_current_user_swagger(token: str = Security(api_key_scheme)):
    if token.startswith("Bearer "):
        token = token[7:]  # remove "Bearer "

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")

        # Find user by ObjectId
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(401, "User not found")

        # Convert _id to string for easy use in routers
        user["_id"] = str(user["_id"])
        return user

    except jwt.JWTError:
        raise HTTPException(401, "Token is invalid or expired")
