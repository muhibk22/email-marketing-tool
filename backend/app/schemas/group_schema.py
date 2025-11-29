from pydantic import BaseModel
from typing import List

class GroupCreate(BaseModel):
    group_name: str
    contact_ids: List[str]

class GroupUpdate(BaseModel):
    group_name: str | None = None
    contact_ids: List[str] | None = None
