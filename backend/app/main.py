from fastapi import FastAPI
from app.routers import auth_router
from app.routers import user_router   # <-- add this import


app = FastAPI()

app.include_router(auth_router.router)
app.include_router(user_router.router)
@app.get("/")
def root():
    return {"message": "Email Marketing Backend Running"}
