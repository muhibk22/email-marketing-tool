from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.security import get_current_user_swagger  # <-- change here
from app.db.client import contacts_collection, groups_collection, emails_collection
from app.schemas.email_schema import EmailSend
from decouple import config
import boto3
import datetime

router = APIRouter(prefix="/email", tags=["Email"])

ses = boto3.client(
    "ses",
    aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
    region_name=config("AWS_REGION")
)

@router.post("/send")
def send_email(data: EmailSend, user=Depends(get_current_user_swagger)):

    recipients = []

    if data.to_emails:
        recipients.extend(data.to_emails)

    if data.group_id:
        group = groups_collection.find_one({"_id": ObjectId(data.group_id)})
        if not group or str(group["user_id"]) != user["_id"]:
            raise HTTPException(404, "Group not found")

        contact_ids = group["contact_ids"]
        contacts = contacts_collection.find({"_id": {"$in": contact_ids}})

        for c in contacts:
            recipients.append(c["email"])

    if not recipients:
        raise HTTPException(400, "No recipients provided")

    recipients = list(set(recipients))

    try:
        response = ses.send_email(
            Source="noreply@yourdomain.com",
            Destination={"ToAddresses": recipients},
            Message={
                "Subject": {"Data": data.subject},
                "Body": {"Html": {"Data": data.body}}
            }
        )

    except Exception as e:
        raise HTTPException(500, f"Email sending failed: {str(e)}")

    log = {
        "user_id": ObjectId(user["_id"]),
        "subject": data.subject,
        "body": data.body,
        "sent_to": recipients,
        "created_at": datetime.datetime.utcnow(),
        "status": "success"
    }

    emails_collection.insert_one(log)

    return {"message": "Email sent", "recipients": recipients}
