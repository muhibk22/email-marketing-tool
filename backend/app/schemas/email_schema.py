from pydantic import BaseModel
from typing import List, Optional

class EmailSend(BaseModel):
    subject: str
    body: str
    to_emails: Optional[List[str]] = None
    group_id: Optional[str] = None
