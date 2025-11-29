from fastapi import FastAPI
from app.routers import auth_router
from app.routers import user_router
from app.routers import contact_router   
from app.routers import group_router
from app.routers import email_router



app = FastAPI()

app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(contact_router.router)   
app.include_router(group_router.router)
app.include_router(email_router.router)

@app.get("/")
def root():
    return {"message": "Email Marketing Backend Running"}
