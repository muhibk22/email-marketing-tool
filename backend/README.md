
# **Email Marketing Tool — FastAPI Backend**

## **Project Overview**

This is the backend for an Email Marketing Tool built with **FastAPI**, **MongoDB**, and **JWT authentication**.

Current functionality:

* User **registration** and **login** with JWT-based authentication
* `/auth/me` endpoint to get the current logged-in user
* **Contacts system**: create, read, update, delete contacts (each user sees only their own)
* **Groups system**: create, read, update, delete groups of contacts
* **Email sending**: send emails to individual emails or groups via **Amazon SES**
* Swagger UI is configured to use a **simplified token input** for testing protected routes
* All MongoDB `ObjectId`s are serialized properly to **avoid internal server errors**

---

## **Project Structure**

backend/
│
├─ app/
│ ├─ main.py
│ ├─ db/
│ │ └─ client.py
│ ├─ core/
│ │ └─ security.py
│ ├─ routers/
│ │ ├─ auth_router.py
│ │ ├─ user_router.py
│ │ ├─ contact_router.py
│ │ ├─ group_router.py
│ │ └─ email_router.py
│ ├─ services/
│ │ └─ auth_service.py
│ └─ schemas/
│ ├─ user_schema.py
│ ├─ contact_schema.py
│ ├─ group_schema.py
│ └─ email_schema.py
│
├─ .env
└─ README.md

---

## **File Descriptions**

### **1. main.py**

* Entry point for the FastAPI backend
* Initializes FastAPI app and includes all routers
* Defines a root endpoint `/` for health check

```python
from fastapi import FastAPI
from app.routers import auth_router, user_router, contact_router, group_router, email_router

app = FastAPI()

# Include all routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(contact_router.router)
app.include_router(group_router.router)
app.include_router(email_router.router)

@app.get("/")
def root():
    return {"message": "Email Marketing Backend Running"}
```

### **2. db/client.py**

Handles MongoDB connection

Provides references to all collections

```python
from pymongo import MongoClient
from decouple import config

MONGO_URI = config("MONGO_URI")
DB_NAME = config("DB_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_collection = db["users_email_tool"]
contacts_collection = db["contacts"]
groups_collection = db["groups"]
emails_collection = db["emails"]
```

### **3. core/security.py**

JWT-based authentication

Password hashing with bcrypt

Swagger-friendly token input to avoid Bearer issues

ObjectIds properly handled in dependencies

Functions:

* `hash_password(password)` → hash password
* `verify_password(password, hashed)` → verify password
* `create_access_token(user_id)` → generate JWT valid for 7 days
* `get_current_user_swagger(token)` → dependency for protected routes in Swagger

```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from decouple import config
from fastapi import HTTPException, Security
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
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(days=7)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

api_key_scheme = APIKeyHeader(name="Authorization", auto_error=True)

def get_current_user_swagger(token: str = Security(api_key_scheme)):
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
```

### **4. routers/contact_router.py**

CRUD endpoints for contacts
Returns properly serialized JSON (converts all ObjectId to strings)

Endpoints:

* `POST /contacts/` → create contact
* `GET /contacts/` → list contacts
* `PUT /contacts/{contact_id}` → update contact
* `DELETE /contacts/{contact_id}` → delete contact

### **5. routers/group_router.py**

CRUD endpoints for groups
Each group contains a list of contact_ids
Validation ensures contacts belong to the user
ObjectIds serialized for JSON output

### **6. routers/email_router.py**

Handles email sending via Amazon SES

Supports **two endpoints**:

#### **a) Normal Email — `/email/send`**

Send standard HTML email to:

* Manual email addresses (`to_emails`)
* Contact groups (`group_ids`)
* All contacts (`send_to_all`)

**Request Body (JSON)**:

```json
{
  "subject": "Hello World",
  "body": "<p>This is a test email</p>",
  "to_emails": ["example1@gmail.com", "example2@gmail.com"],
  "group_ids": ["64fabc12345..."],
  "send_to_all": false
}
```

**Response**:

```json
{
  "message": "Normal email sent successfully",
  "recipients": ["example1@gmail.com", "example2@gmail.com"]
}
```

#### **b) Newsletter Email — `/email/send/newsletter`**

Send newsletter-style email with inline images, optimized for Gmail mobile/desktop.

**Method:** `POST`
**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field           | Type                     | Description                           |
| --------------- | ------------------------ | ------------------------------------- |
| `subject`       | string                   | Email subject                         |
| `body`          | string                   | Email content in HTML/text            |
| `to_emails`     | string (comma-separated) | Optional manual emails                |
| `group_ids`     | string (comma-separated) | Optional contact group IDs            |
| `send_to_all`   | boolean                  | Optional flag to send to all contacts |
| `inline_images` | file[]                   | Optional inline images                |

**Example cURL Request:**

```bash
curl -X POST "http://127.0.0.1:8000/email/send/newsletter" \
  -H "Authorization: Bearer <token>" \
  -F "subject=Monthly Update" \
  -F "body=<p>Hello, check our updates below!</p>" \
  -F "to_emails=example1@gmail.com,example2@gmail.com" \
  -F "inline_images=@/path/to/image1.png" \
  -F "inline_images=@/path/to/image2.jpg"
```

**Response:**

```json
{
  "message": "Newsletter email sent successfully",
  "recipients": ["example1@gmail.com", "example2@gmail.com"],
  "inline_images": ["image1.png", "image2.jpg"]
}
```

---

### **7. routers/auth_router.py & user_router.py**

* `/auth/register` → register user
* `/auth/login` → login and get JWT
* `/auth/me` → get current logged-in user

All use Swagger-friendly JWT dependency.

---

### **8. schemas/**

* `user_schema.py` → registration/login models
* `contact_schema.py` → ContactCreate, ContactUpdate
* `group_schema.py` → GroupCreate, GroupUpdate
* `email_schema.py` → EmailSend (used in normal email endpoint)

---

### **9. .env**

```env
MONGO_URI=<your MongoDB connection string>
DB_NAME=<MongoDB database name>
SECRET_KEY=<JWT secret key>
AWS_ACCESS_KEY_ID=<your AWS key>
AWS_SECRET_ACCESS_KEY=<your AWS secret>
AWS_REGION=<AWS SES region>
SES_FROM_EMAIL=<your verified SES sender email>
```

---

## **How to Run Backend**

Install dependencies:

```bash
pip install fastapi uvicorn pymongo passlib[bcrypt] python-jose python-decouple pydantic[email] boto3
```

Start server:

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Open Swagger UI:

```
http://127.0.0.1:8000/docs
```

---

## **Test Endpoints**

1. Register user → `/auth/register`
2. Login → `/auth/login` → get JWT
3. Authorize in Swagger → paste `Bearer <token>`
4. Test `/auth/me`, `/contacts/`, `/groups/`
5. Test `/email/send` (normal email)
6. Test `/email/send/newsletter` (newsletter with optional inline images)

---

## **Next Steps (Development Plan)**

* Add full email templates (HTML & plain text)
* Implement scheduled emails
* Extend Groups to support nested groups or multiple email lists
* Add logging and monitoring for email sending failures
* Add unit tests and integration tests
* Enhance Swagger UI documentation for all endpoints

---

This README now clearly documents **both email endpoints** for frontend developers.

