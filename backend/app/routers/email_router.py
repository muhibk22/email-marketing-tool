from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from typing import List, Optional
from app.core.security import get_current_user_swagger
from app.db.client import contacts_collection, groups_collection, emails_collection
from app.schemas.email_schema import EmailSend
from decouple import config
import boto3
import datetime

router = APIRouter(prefix="/email", tags=["Email"])

# Initialize Amazon SES client
ses = boto3.client(
    "ses",
    aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
    region_name=config("AWS_REGION")
)

@router.post("/send")
def send_email(data: EmailSend, user=Depends(get_current_user_swagger)):

    recipients = set()  # Use set to avoid duplicates

    # -------------------------------
    # 1️⃣ Manual Emails
    # -------------------------------
    if data.to_emails:
        if "ALL" in [e.upper() for e in data.to_emails]:
            # Send to all contacts
            all_contacts = contacts_collection.find({"user_id": ObjectId(user["_id"])}, {"email": 1})
            recipients.update([c["email"].lower() for c in all_contacts if "email" in c])
        else:
            recipients.update([e.lower() for e in data.to_emails])

    # -------------------------------
    # 2️⃣ Groups
    # -------------------------------
    if data.group_ids:
        for gid in data.group_ids:
            try:
                group = groups_collection.find_one({"_id": ObjectId(gid)})
            except:
                continue  # Skip invalid IDs

            if not group or str(group["user_id"]) != user["_id"]:
                continue  # Skip groups not belonging to this user

            contact_ids = group.get("contact_ids", [])
            if contact_ids:
                # Convert string IDs to ObjectId
                contact_object_ids = [ObjectId(cid) for cid in contact_ids]
                contacts = contacts_collection.find({
                    "_id": {"$in": contact_object_ids},
                    "user_id": ObjectId(user["_id"])
                })
                recipients.update([c["email"].lower() for c in contacts if "email" in c])

    # -------------------------------
    # 3️⃣ Send to all contacts via flag
    # -------------------------------
    if getattr(data, "send_to_all", False):
        all_contacts = contacts_collection.find({"user_id": ObjectId(user["_id"])}, {"email": 1})
        recipients.update([c["email"].lower() for c in all_contacts if "email" in c])

    # -------------------------------
    # 4️⃣ Validate recipients
    # -------------------------------
    if not recipients:
        raise HTTPException(400, "No recipients found. Provide emails, groups, or send_to_all.")

    recipients = list(recipients)

    # -------------------------------
    # 5️⃣ Send via SES
    # -------------------------------
    try:
        response = ses.send_email(
            Source=config("SES_FROM_EMAIL"),  # Verified SES sender
            Destination={"ToAddresses": recipients},
            Message={
                "Subject": {"Data": data.subject},
                "Body": {"Html": {"Data": data.body}}
            }
        )
    except Exception as e:
        raise HTTPException(500, f"Email sending failed: {str(e)}")

    # -------------------------------
    # 6️⃣ Log email in MongoDB
    # -------------------------------
    log = {
        "user_id": ObjectId(user["_id"]),
        "subject": data.subject,
        "body": data.body,
        "sent_to": recipients,
        "created_at": datetime.datetime.utcnow(),
        "status": "success"
    }
    emails_collection.insert_one(log)

    return {"message": "Email sent successfully", "recipients": recipients}
