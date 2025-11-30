import sys
import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import io

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.routers.contact_router import router
from app.core.security import get_current_user_swagger
from bson import ObjectId

# Override dependency
async def mock_get_current_user():
    return {"_id": "507f1f77bcf86cd799439011", "email": "test@example.com"}

app.dependency_overrides[get_current_user_swagger] = mock_get_current_user

client = TestClient(app)

@patch("app.routers.contact_router.contacts_collection")
def test_parse_import_csv(mock_contacts):
    # Setup mocks
    mock_contacts.find_one.return_value = None 
    
    csv_content = "name,email\nJohn Doe,john@example.com\nJane Doe,jane@example.com"
    files = {'file': ('contacts.csv', io.StringIO(csv_content), 'text/csv')}
    
    response = client.post("/contacts/parse-import", files=files)
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["count"] == 2
    assert len(json_response["contacts"]) == 2
    assert json_response["contacts"][0]["email"] == "john@example.com"
    assert json_response["contacts"][0]["name"] == "John Doe"

@patch("app.routers.contact_router.contacts_collection")
def test_parse_import_txt(mock_contacts):
    # Setup mocks
    mock_contacts.find_one.return_value = None
    
    txt_content = "john@example.com\njane@example.com"
    files = {'file': ('contacts.txt', io.StringIO(txt_content), 'text/plain')}
    
    response = client.post("/contacts/parse-import", files=files)
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["count"] == 2
    assert len(json_response["contacts"]) == 2
    assert json_response["contacts"][0]["email"] == "john@example.com"

@patch("app.routers.contact_router.contacts_collection")
@patch("app.routers.contact_router.groups_collection")
def test_bulk_create_contacts(mock_groups, mock_contacts):
    # Setup mocks
    mock_contacts.find_one.return_value = None
    mock_contacts.insert_one.return_value = MagicMock(inserted_id=ObjectId())
    
    payload = {
        "contacts": [
            {"name": "John Doe", "email": "john@example.com"},
            {"name": "Jane Doe", "email": "jane@example.com"}
        ],
        "group_id": "507f1f77bcf86cd799439012"
    }
    
    response = client.post("/contacts/bulk", json=payload)
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["added_count"] == 2
    assert json_response["total_processed"] == 2
    
    # Verify insert calls
    assert mock_contacts.insert_one.call_count == 2
    
    # Verify group update
    assert mock_groups.update_one.call_count == 1

if __name__ == "__main__":
    # Manually run tests if executed directly
    with patch("app.routers.contact_router.contacts_collection") as mock_contacts, \
         patch("app.routers.contact_router.groups_collection") as mock_groups:
        test_parse_import_csv(mock_contacts)
        test_parse_import_txt(mock_contacts)
        test_bulk_create_contacts(mock_groups, mock_contacts)
        print("All tests passed!")
