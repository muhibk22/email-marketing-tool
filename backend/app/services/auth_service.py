from fastapi import HTTPException
from bson import ObjectId
from app.db.client import users_collection
from app.core.security import hash_password, verify_password, create_access_token

def register_user(email: str, password: str):

    if users_collection.find_one({"email": email}):
        raise HTTPException(400, "Email already exists")

    hashed = hash_password(password)

    users_collection.insert_one({
        "email": email,
        "password_hash": hashed
    })

    return {"message": "registered"}


def login_user(email: str, password: str):

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(400, "Invalid email or password")

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(400, "Invalid email or password")

    token = create_access_token(str(user["_id"]))

    return {"email": email, "token": token}
