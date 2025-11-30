from fastapi import HTTPException
from bson import ObjectId
from app.db.client import users_collection
from app.core.security import hash_password, verify_password, create_access_token

def register_user(email: str, password: str, name: str, company_name: str = None, phone: str = None):
    # Check if email already exists
    if users_collection.find_one({"email": email}):
        raise HTTPException(400, "Email already exists")

    hashed = hash_password(password)

    # Insert user into MongoDB
    users_collection.insert_one({
        "email": email,
        "password_hash": hashed,
        "name": name,
        "company_name": company_name,
        "phone": phone
    })

    return {"message": "User registered successfully"}

def login_user(email: str, password: str):
    user = users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(400, "Invalid email or password")

    token = create_access_token(str(user["_id"]))

    # Return all relevant fields for frontend
    return {
        "email": user["email"],
        "name": user.get("name"),
        "company_name": user.get("company_name"),
        "phone": user.get("phone"),
        "token": token
    }
