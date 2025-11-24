

# **Email Marketing Tool — FastAPI Backend**

## **Project Overview**

This is the backend for an Email Marketing Tool built with **FastAPI**, **MongoDB**, and **JWT authentication**.

Current functionality:

* User **registration** and **login** with JWT-based authentication
* `/auth/me` endpoint to get the current logged-in user
* Modular structure to easily extend with **contacts, groups, and email sending** in the future
* Swagger UI is configured to use a **simplified token input** for testing protected routes

---

## **Project Structure**

```
backend/
│
├─ app/
│  ├─ main.py
│  ├─ db/
│  │  └─ client.py
│  ├─ core/
│  │  └─ security.py
│  ├─ routers/
│  │  ├─ auth_router.py
│  │  └─ user_router.py
│  ├─ services/
│  │  └─ auth_service.py
│  └─ schemas/
│     └─ user_schema.py
│
├─ .env
└─ README.md
```

---

## **File Descriptions**

### **1. main.py**

* Entry point for the FastAPI backend
* Initializes FastAPI app and includes all routers
* Defines a root endpoint `/` that returns a simple health check message

```python
app = FastAPI()
app.include_router(auth_router.router)
app.include_router(user_router.router)

@app.get("/")
def root():
    return {"message": "Email Marketing Backend Running"}
```

---

### **2. db/client.py**

* Handles **MongoDB connection**
* Reads `MONGO_URI` and `DB_NAME` from `.env`
* Provides a reference to `users_collection` for user operations

```python
from pymongo import MongoClient
from decouple import config

MONGO_URI = config("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client[config("DB_NAME")]
users_collection = db["users_email_tool"]
```

---

### **3. core/security.py**

* Responsible for **authentication and security**

* Functions:

  * `hash_password(password)` → hashes a password using bcrypt
  * `verify_password(password, hashed)` → verifies password against hash
  * `create_access_token(user_id)` → creates a JWT token valid for 7 days
  * `get_current_user(token)` → backend dependency for protected routes
  * `get_current_user_swagger(token)` → simplified dependency for Swagger UI (only asks for JWT token)

* `OAuth2PasswordBearer` is used for token extraction in the backend

* `APIKeyHeader` is used for Swagger to simplify token input

---

### **4. routers/auth_router.py**

* Handles **user registration and login**
* Implements `/auth/register` and `/auth/login` endpoints
* Uses `services/auth_service.py` and `schemas/user_schema.py` for validation and business logic

---

### **5. routers/user_router.py**

* Provides `/auth/me` endpoint to get the current logged-in user
* Uses **Swagger-friendly JWT dependency** (`get_current_user_swagger`)
* Example response:

```json
{
  "id": "MongoDB ObjectId",
  "email": "user@example.com"
}
```

---

### **6. services/auth_service.py**

* Contains **business logic** for authentication

* Handles:

  * Checking if a user exists
  * Creating a new user in MongoDB
  * Verifying passwords during login
  * Returning JWT token

* Keeps **routers clean** by separating logic from endpoint definitions

---

### **7. schemas/user_schema.py**

* Contains **Pydantic models** for validation and type checking

Models:

* `UserRegister` → request body for registration (`email`, `password`)
* `UserLogin` → request body for login (`email`, `password`)
* `UserResponse` → response model for user info (id, email)

Example:

```python
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
```

---

### **8. .env**

Holds environment variables:

```env
MONGO_URI=<your MongoDB connection string>
DB_NAME=<MongoDB database name>
SECRET_KEY=<JWT secret key>
```

* Make sure `DB_NAME` matches the database where `users_email_tool` collection exists

---

## **How to Run Backend**

1. Install dependencies:

```bash
pip install fastapi uvicorn pymongo passlib[bcrypt] python-jose python-decouple pydantic[email]
```

2. Start server:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

3. Open Swagger UI:

```
http://127.0.0.1:8000/docs
```

4. Test endpoints:

* Register user → `/auth/register`
* Login → `/auth/login` → get JWT
* Use **Authorize** in Swagger → paste `Bearer <token>`
* Test `/auth/me` → returns current user info

---

## **Next Steps (Planned)**

1. Implement **Contacts system**:

* Add emails
* Update/delete emails
* Ensure user isolation (each user sees only their emails)

2. Implement **Groups system**:

* Create groups
* Add emails to groups
* Send emails to group members via Amazon SES

3. Integrate **Amazon SES** for sending emails

4. Extend Swagger UI to test all protected endpoints with JWT token

---

This README now fully describes:

* **Current backend setup**
* **File structure and purpose**
* **Authentication flow**
* **How to continue development**

