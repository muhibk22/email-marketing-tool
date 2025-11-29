from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from bson import ObjectId
import boto3
import datetime
from decouple import config
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

from app.core.security import get_current_user_swagger
from app.db.client import contacts_collection, groups_collection, emails_collection
from app.schemas.email_schema import EmailSend

router = APIRouter(prefix="/email", tags=["Email"])

ses = boto3.client(
    "ses",
    aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"),
    region_name=config("AWS_REGION")
)

MAX_EMAIL_SIZE = 9 * 1024 * 1024


# -------------------------
# Newsletter HTML builder
# -------------------------
def build_newsletter_html(body_text: str, inline_cids: list):
    image_rows = ""
    for cid in inline_cids:
        image_rows += f"""
        <tr>
            <td style="padding: 20px 0;">
                <img src="cid:{cid}" width="100%" style="display:block;border-radius:12px;" />
            </td>
        </tr>
        """

    return f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f2f2f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:25px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;padding:25px;">
        <tr>
          <td align="center" style="font-size:24px;font-weight:bold;color:#333;padding-bottom:15px;">
            📢 New Update
          </td>
        </tr>
        <tr>
          <td style="font-size:16px;color:#444;line-height:1.6;">
            {body_text}
          </td>
        </tr>
        {image_rows}
        <tr>
          <td align="center" style="font-size:12px;color:#888;padding-top:25px;">
            Sent automatically · © 2025
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
"""


# -------------------------
# 1️⃣ Normal Email endpoint
# -------------------------
@router.post("/send")
def send_normal_email(data: EmailSend, user=Depends(get_current_user_swagger)):

    recipients = set()

    # Manual emails
    if data.to_emails:
        if "ALL" in [e.upper() for e in data.to_emails]:
            all_contacts = contacts_collection.find({"user_id": ObjectId(user["_id"])}, {"email": 1})
            recipients.update([c["email"].lower() for c in all_contacts if "email" in c])
        else:
            recipients.update([e.lower() for e in data.to_emails])

    # Groups
    if data.group_ids:
        for gid in data.group_ids:
            try:
                group = groups_collection.find_one({"_id": ObjectId(gid)})
            except:
                continue
            if not group or str(group["user_id"]) != user["_id"]:
                continue
            contact_ids = group.get("contact_ids", [])
            contact_object_ids = [ObjectId(cid) for cid in contact_ids]
            contacts = contacts_collection.find({
                "_id": {"$in": contact_object_ids},
                "user_id": ObjectId(user["_id"])
            })
            recipients.update([c["email"].lower() for c in contacts if "email" in c])

    # Send to all
    if getattr(data, "send_to_all", False):
        all_contacts = contacts_collection.find({"user_id": ObjectId(user["_id"])}, {"email": 1})
        recipients.update([c["email"].lower() for c in all_contacts if "email" in c])

    if not recipients:
        raise HTTPException(400, "No recipients found.")

    recipients = list(recipients)

    # Send via SES
    try:
        ses.send_email(
            Source=config("SES_FROM_EMAIL"),
            Destination={"ToAddresses": recipients},
            Message={
                "Subject": {"Data": data.subject},
                "Body": {"Html": {"Data": data.body}}
            }
        )
    except Exception as e:
        raise HTTPException(500, f"Email sending failed: {str(e)}")

    # Log
    emails_collection.insert_one({
        "user_id": ObjectId(user["_id"]),
        "subject": data.subject,
        "body": data.body,
        "sent_to": recipients,
        "created_at": datetime.datetime.utcnow(),
        "status": "success"
    })

    return {"message": "Normal email sent successfully", "recipients": recipients}


# -------------------------
# 2️⃣ Newsletter Email endpoint
# -------------------------
@router.post("/send/newsletter")
async def send_newsletter_email(
    subject: str = Form(...),
    body: str = Form(...),
    to_emails: Optional[str] = Form(None),
    group_ids: Optional[str] = Form(None),
    send_to_all: bool = Form(False),
    inline_images: Optional[List[UploadFile]] = File(default=None),
    user=Depends(get_current_user_swagger)
):

    recipients = set()

    # Manual emails
    if to_emails:
        recipients.update([e.strip().lower() for e in to_emails.split(",") if e.strip()])

    # Groups
    if group_ids:
        for gid in [g.strip() for g in group_ids.split(",") if g.strip()]:
            try:
                group = groups_collection.find_one({"_id": ObjectId(gid)})
                if group:
                    ids = [ObjectId(cid) for cid in group.get("contact_ids", [])]
                    contacts = contacts_collection.find({"_id": {"$in": ids}})
                    for c in contacts:
                        recipients.add(c["email"].lower())
            except:
                continue

    # Send to all
    if send_to_all:
        contacts = contacts_collection.find({"user_id": ObjectId(user["_id"])})
        for c in contacts:
            recipients.add(c["email"].lower())

    if not recipients:
        raise HTTPException(400, "No recipients found.")

    recipients = list(recipients)

    # Inline images
    inline_cids = []
    inline_files = []
    inline_images = [f for f in (inline_images or []) if getattr(f, "filename", None)]
    image_parts = []

    total_size = 0
    for file in inline_images:
        content = await file.read()
        if not content:
            continue

        total_size += len(content)
        if total_size > MAX_EMAIL_SIZE:
            raise HTTPException(400, "Email too large for SES.")

        cid = file.filename.replace(" ", "_")
        img = MIMEImage(content)
        img.add_header("Content-ID", f"<{cid}>")
        img.add_header("Content-Disposition", "inline", filename=file.filename)
        image_parts.append(img)
        inline_cids.append(cid)
        inline_files.append(file.filename)

    # Build HTML
    final_html = build_newsletter_html(body, inline_cids)

    # Build MIME
    root = MIMEMultipart("related")
    root["Subject"] = subject
    root["From"] = config("SES_FROM_EMAIL")
    root["To"] = ", ".join(recipients)

    alt = MIMEMultipart("alternative")
    root.attach(alt)
    alt.attach(MIMEText(final_html, "html", "utf-8"))

    for img in image_parts:
        root.attach(img)

    # Send via SES
    try:
        ses.send_raw_email(
            Source=config("SES_FROM_EMAIL"),
            Destinations=recipients,
            RawMessage={"Data": root.as_string()}
        )
    except Exception as e:
        raise HTTPException(500, f"Newsletter email sending failed: {str(e)}")

    # Log
    emails_collection.insert_one({
        "user_id": ObjectId(user["_id"]),
        "subject": subject,
        "body": body,
        "sent_to": recipients,
        "inline_images": inline_files,
        "created_at": datetime.datetime.utcnow(),
        "status": "success",
    })

    return {
        "message": "Newsletter email sent successfully",
        "recipients": recipients,
        "inline_images": inline_files
    }
