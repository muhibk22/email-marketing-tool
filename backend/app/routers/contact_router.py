from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from bson import ObjectId
from app.db.client import contacts_collection, groups_collection
from app.core.security import get_current_user_swagger
from app.schemas.contact_schema import ContactCreate, ContactUpdate
import datetime
import csv
import io
from typing import Optional

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


@router.post("/parse-import")
async def parse_import_contacts(
    file: UploadFile = File(...),
    user=Depends(get_current_user_swagger)
):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(400, "Invalid file format. Please upload CSV or TXT.")

    content = await file.read()
    decoded_content = content.decode('utf-8')
    
    parsed_contacts = []
    
    if file.filename.endswith('.csv'):
        # Expecting header: name,email OR just email
        csv_reader = csv.reader(io.StringIO(decoded_content))
        header = next(csv_reader, None)
        
        if not header:
            raise HTTPException(400, "Empty CSV file")
            
        # Simple heuristic for columns
        email_idx = -1
        name_idx = -1
        
        for i, col in enumerate(header):
            if 'email' in col.lower():
                email_idx = i
            elif 'name' in col.lower():
                name_idx = i
                
        if email_idx == -1:
            # Fallback: assume first column is email if no header match
            email_idx = 0
            
        for row in csv_reader:
            if not row: continue
            
            email = row[email_idx].strip() if len(row) > email_idx else ""
            name = row[name_idx].strip() if name_idx != -1 and len(row) > name_idx else ""
            
            if email and '@' in email:
                parsed_contacts.append({"email": email, "name": name or email.split('@')[0]})

    else: # TXT
        # One email per line
        lines = decoded_content.splitlines()
        for line in lines:
            email = line.strip()
            if email and '@' in email:
                parsed_contacts.append({"email": email, "name": email.split('@')[0]})

    return {
        "message": "File parsed successfully",
        "contacts": parsed_contacts,
        "count": len(parsed_contacts)
    }


from pydantic import BaseModel
from typing import List

class BulkImportData(BaseModel):
    contacts: List[dict] # {name, email}
    group_id: Optional[str] = None

@router.post("/bulk")
def bulk_create_contacts(data: BulkImportData, user=Depends(get_current_user_swagger)):
    if not data.contacts:
        return {"message": "No contacts provided", "added_count": 0}

    added_count = 0
    contact_ids = []
    
    for contact in data.contacts:
        # Check if exists
        existing = contacts_collection.find_one({
            "user_id": ObjectId(user["_id"]),
            "email": contact["email"]
        })
        
        if existing:
            contact_ids.append(existing["_id"])
            continue
            
        # Insert new
        new_contact = {
            "user_id": ObjectId(user["_id"]),
            "name": contact.get("name", contact["email"].split('@')[0]),
            "email": contact["email"],
            "created_at": datetime.datetime.now(datetime.timezone.utc)
        }
        result = contacts_collection.insert_one(new_contact)
        contact_ids.append(result.inserted_id)
        added_count += 1

    # Add to group if requested
    if data.group_id and contact_ids:
        try:
            groups_collection.update_one(
                {"_id": ObjectId(data.group_id), "user_id": ObjectId(user["_id"])},
                {"$addToSet": {"contact_ids": {"$each": contact_ids}}}
            )
        except Exception as e:
            print(f"Failed to add to group: {e}")

    return {
        "message": "Bulk import completed",
        "added_count": added_count,
        "total_processed": len(data.contacts),
        "group_updated": bool(data.group_id)
    }
