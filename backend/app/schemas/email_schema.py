from pydantic import BaseModel
from typing import List, Optional

class EmailSend(BaseModel):
    subject: str
    body: str
    to_emails: Optional[List[str]] = None        # Manual emails, "ALL" for all contacts
    group_ids: Optional[List[str]] = None        # List of group IDs
    send_to_all: Optional[bool] = False          # True to send to all contacts
