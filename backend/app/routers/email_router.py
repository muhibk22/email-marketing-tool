from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from bson import ObjectId
from typing import List, Optional
from app.core.security import get_current_user_swagger
from app.db.client import contacts_collection, groups_collection, emails_collection
from app.schemas.email_schema import EmailSend
from decouple import config
import boto3
import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

router = APIRouter(prefix="/email", tags=["Email"])

# SES client
ses = boto3.client(
    "ses",
    aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
    region_name=config("AWS_REGION")
)

MAX_EMAIL_SIZE = 9 * 1024 * 1024  # 9MB safety (SES max = 10MB)


@router.post("/send")
async def send_email(
    subject: str = Form(...),
    body: str = Form(...),
    to_emails: Optional[str] = Form(None),       # Comma-separated manual emails
    group_ids: Optional[str] = Form(None),       # Comma-separated group IDs
    send_to_all: bool = Form(False),
    attachments: Optional[List[UploadFile]] = File(None),
    user=Depends(get_current_user_swagger)
):
    """
    Send email via SES.
    - Supports manual emails, groups, send_to_all
    - Optional file attachments
    """

    recipients = set()

    # -------------------------------
    # 1️⃣ Manual emails
    # -------------------------------
    to_emails_list = [e.strip() for e in to_emails.split(",")] if to_emails else []
    if to_emails_list:
        if "ALL" in [e.upper() for e in to_emails_list]:
            all_contacts = contacts_collection.find({"user_id": ObjectId(user["_id"])}, {"email": 1})
            recipients.update([c["email"].lower() for c in all_contacts if "email" in c])
        else:
            recipients.update([e.lower() for e in to_emails_list])

    # -------------------------------
    # 2️⃣ Groups
    # -------------------------------
    group_ids_list = [g.strip() for g in group_ids.split(",")] if group_ids else []
    if group_ids_list:
        for gid in group_ids_list:
            try:
                group = groups_collection.find_one({"_id": ObjectId(gid)})
            except:
                continue

            if not group or str(group["user_id"]) != user["_id"]:
                continue

            contact_ids = group.get("contact_ids", [])
            if contact_ids:
                contacts = contacts_collection.find({
                    "_id": {"$in": [ObjectId(cid) for cid in contact_ids]},
                    "user_id": ObjectId(user["_id"])
                })
                recipients.update([c["email"].lower() for c in contacts if "email" in c])

    # -------------------------------
    # 3️⃣ Send to all contacts
    # -------------------------------
    if send_to_all:
        all_contacts = contacts_collection.find({"user_id": ObjectId(user["_id"])}, {"email": 1})
        recipients.update([c["email"].lower() for c in all_contacts if "email" in c])

    # -------------------------------
    # 4️⃣ Validate recipients
    # -------------------------------
    if not recipients:
        raise HTTPException(400, "No recipients found. Provide emails, groups, or send_to_all.")

    recipients = list(recipients)

    # -------------------------------
    # 5️⃣ Build MIME email
    # -------------------------------
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = config("SES_FROM_EMAIL")
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(body, "html"))

    total_size = len(msg.as_string().encode())
    attached_files = []

    # -------------------------------
    # 6️⃣ Handle attachments
    # -------------------------------
    if attachments:
        for file in attachments:
            content = await file.read()
            if len(content) == 0:
                continue

            total_size += len(content)
            if total_size > MAX_EMAIL_SIZE:
                raise HTTPException(400, "Email too large. SES limit = 10MB")

            part = MIMEBase("application", "octet-stream")
            part.set_payload(content)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f'attachment; filename="{file.filename}"')
            msg.attach(part)
            attached_files.append(file.filename)

    # -------------------------------
    # 7️⃣ Send via SES RAW
    # -------------------------------
    try:
        ses.send_raw_email(
            Source=config("SES_FROM_EMAIL"),
            Destinations=recipients,
            RawMessage={"Data": msg.as_string()}
        )
    except Exception as e:
        raise HTTPException(500, f"Email sending failed: {str(e)}")

    # -------------------------------
    # 8️⃣ Log in MongoDB
    # -------------------------------
    emails_collection.insert_one({
        "user_id": ObjectId(user["_id"]),
        "subject": subject,
        "body": body,
        "sent_to": recipients,
        "attachments": attached_files,
        "created_at": datetime.datetime.utcnow(),
        "status": "success"
    })

    return {
        "message": "Email sent successfully",
        "recipients": recipients,
        "attachments": attached_files
    }
