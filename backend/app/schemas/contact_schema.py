from pydantic import BaseModel, EmailStr

class ContactCreate(BaseModel):
    name: str
    email: EmailStr

class ContactUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
