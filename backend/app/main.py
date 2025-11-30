from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth_router
from app.routers import user_router
from app.routers import contact_router   
from app.routers import group_router
from app.routers import email_router

from app.routers import ai_email_router



app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(contact_router.router)   
app.include_router(group_router.router)
app.include_router(email_router.router)
app.include_router(ai_email_router.router)


@app.get("/")
def root():
    return {"message": "Email Marketing Backend Running"}
