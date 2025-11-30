import sys
import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from bson import ObjectId

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.core.security import get_current_user_swagger

# Override dependency
async def mock_get_current_user():
    return {"_id": "507f1f77bcf86cd799439011", "email": "test@example.com"}

app.dependency_overrides[get_current_user_swagger] = mock_get_current_user

client = TestClient(app)

@patch("app.routers.contact_router.contacts_collection")
def test_delete_contact(mock_contacts):
    # Setup mocks
    contact_id = "507f1f77bcf86cd799439012"
    mock_contacts.find_one.return_value = {
        "_id": ObjectId(contact_id),
        "user_id": ObjectId("507f1f77bcf86cd799439011"),
        "name": "John Doe",
        "email": "john@example.com"
    }
    mock_contacts.delete_one.return_value = MagicMock(deleted_count=1)
    
    response = client.delete(f"/contacts/{contact_id}")
    
    assert response.status_code == 200
    assert response.json()["message"] == "Contact deleted"
    
    # Verify delete call
    mock_contacts.delete_one.assert_called_once()

@patch("app.routers.contact_router.contacts_collection")
def test_delete_contact_not_found(mock_contacts):
    # Setup mocks
    mock_contacts.find_one.return_value = None
    
    response = client.delete(f"/contacts/{'5'*24}")
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Contact not found"

if __name__ == "__main__":
    with patch("app.routers.contact_router.contacts_collection") as mock_contacts:
        test_delete_contact(mock_contacts)
        test_delete_contact_not_found(mock_contacts)
        print("All tests passed!")
