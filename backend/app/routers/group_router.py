from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.security import get_current_user_swagger
from app.db.client import groups_collection, contacts_collection
from app.schemas.group_schema import GroupCreate, GroupUpdate
from pydantic import BaseModel
from typing import List
import datetime

router = APIRouter(prefix="/groups", tags=["Groups"])

# ------------------ RESPONSE SCHEMA ------------------
class GroupResponse(BaseModel):
    id: str
    group_name: str
    contact_ids: List[str]
    created_at: str

# ------------------ CREATE GROUP ------------------
@router.post("/", response_model=GroupResponse)
def create_group(data: GroupCreate, user=Depends(get_current_user_swagger)):
    # Verify all contacts exist + belong to the user
    for cid in data.contact_ids:
        contact = contacts_collection.find_one({"_id": ObjectId(cid)})
        if not contact or str(contact["user_id"]) != str(user["_id"]):
            raise HTTPException(400, "Invalid contact ID or contact not owned by user")

    group = {
        "user_id": ObjectId(user["_id"]),
        "group_name": data.group_name,
        "contact_ids": [ObjectId(cid) for cid in data.contact_ids],
        "created_at": datetime.datetime.utcnow()
    }

    result = groups_collection.insert_one(group)

    return GroupResponse(
        id=str(result.inserted_id),
        group_name=group["group_name"],
        contact_ids=[str(cid) for cid in group["contact_ids"]],
        created_at=group["created_at"].isoformat()
    )

# ------------------ GET ALL GROUPS ------------------
@router.get("/", response_model=List[GroupResponse])
def get_groups(user=Depends(get_current_user_swagger)):
    groups = list(groups_collection.find({"user_id": ObjectId(user["_id"])}))
    response = []
    for g in groups:
        response.append(GroupResponse(
            id=str(g["_id"]),
            group_name=g["group_name"],
            contact_ids=[str(cid) for cid in g["contact_ids"]],
            created_at=g["created_at"].isoformat()
        ))
    return response

# ------------------ GET SINGLE GROUP ------------------
@router.get("/{group_id}", response_model=GroupResponse)
def get_group(group_id: str, user=Depends(get_current_user_swagger)):
    group = groups_collection.find_one({"_id": ObjectId(group_id)})

    if not group or str(group["user_id"]) != str(user["_id"]):
        raise HTTPException(404, "Group not found")

    return GroupResponse(
        id=str(group["_id"]),
        group_name=group["group_name"],
        contact_ids=[str(cid) for cid in group["contact_ids"]],
        created_at=group["created_at"].isoformat()
    )

# ------------------ UPDATE GROUP ------------------
@router.put("/{group_id}", response_model=GroupResponse)
def update_group(group_id: str, data: GroupUpdate, user=Depends(get_current_user_swagger)):
    group = groups_collection.find_one({"_id": ObjectId(group_id)})

    if not group or str(group["user_id"]) != str(user["_id"]):
        raise HTTPException(404, "Group not found")

    update_data = {}

    if data.group_name:
        update_data["group_name"] = data.group_name

    if data.contact_ids:
        for cid in data.contact_ids:
            contact = contacts_collection.find_one({"_id": ObjectId(cid)})
            if not contact or str(contact["user_id"]) != str(user["_id"]):
                raise HTTPException(400, "Invalid contact ID")
        update_data["contact_ids"] = [ObjectId(cid) for cid in data.contact_ids]

    groups_collection.update_one({"_id": ObjectId(group_id)}, {"$set": update_data})

    updated_group = groups_collection.find_one({"_id": ObjectId(group_id)})

    return GroupResponse(
        id=str(updated_group["_id"]),
        group_name=updated_group["group_name"],
        contact_ids=[str(cid) for cid in updated_group["contact_ids"]],
        created_at=updated_group["created_at"].isoformat()
    )

# ------------------ DELETE GROUP ------------------
@router.delete("/{group_id}")
def delete_group(group_id: str, user=Depends(get_current_user_swagger)):
    group = groups_collection.find_one({"_id": ObjectId(group_id)})

    if not group or str(group["user_id"]) != str(user["_id"]):
        raise HTTPException(404, "Group not found")

    groups_collection.delete_one({"_id": ObjectId(group_id)})
    return {"message": "Group deleted successfully"}
