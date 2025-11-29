from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.db.client import contacts_collection
from app.core.security import get_current_user_swagger
from app.schemas.contact_schema import ContactCreate, ContactUpdate
import datetime

router = APIRouter(prefix="/contacts", tags=["Contacts"])


def serialize_contact(contact):
    """Convert ObjectId fields to str for JSON serialization"""
    return {
        "id": str(contact["_id"]),
        "user_id": str(contact["user_id"]),
        "name": contact["name"],
        "email": contact["email"],
        "created_at": contact["created_at"].isoformat() if "created_at" in contact else None
    }


@router.post("/")
def create_contact(data: ContactCreate, user=Depends(get_current_user_swagger)):
    contact = {
        "user_id": ObjectId(user["_id"]),
        "name": data.name,
        "email": data.email,
        "created_at": datetime.datetime.utcnow()
    }
    result = contacts_collection.insert_one(contact)
    contact["id"] = str(result.inserted_id)  # serialize ID
    return serialize_contact(contact)


@router.get("/")
def get_contacts(user=Depends(get_current_user_swagger)):
    contacts = list(contacts_collection.find({"user_id": ObjectId(user["_id"])}))
    return [serialize_contact(c) for c in contacts]


@router.put("/{contact_id}")
def update_contact(contact_id: str, data: ContactUpdate, user=Depends(get_current_user_swagger)):
    contact = contacts_collection.find_one({"_id": ObjectId(contact_id)})
    if not contact or str(contact["user_id"]) != str(user["_id"]):
        raise HTTPException(404, "Contact not found")

    update_data = {k: v for k, v in data.dict().items() if v is not None}
    contacts_collection.update_one({"_id": ObjectId(contact_id)}, {"$set": update_data})

    # Return updated contact
    contact.update(update_data)
    return serialize_contact(contact)


@router.delete("/{contact_id}")
def delete_contact(contact_id: str, user=Depends(get_current_user_swagger)):
    contact = contacts_collection.find_one({"_id": ObjectId(contact_id)})
    if not contact or str(contact["user_id"]) != str(user["_id"]):
        raise HTTPException(404, "Contact not found")

    contacts_collection.delete_one({"_id": ObjectId(contact_id)})
    return {"message": "Contact deleted"}
