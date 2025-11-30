import sys
import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.routers.email_router import router

# Mock dependencies
from app.core.security import get_current_user_swagger

# Override dependency
async def mock_get_current_user():
    return {"_id": "507f1f77bcf86cd799439011", "email": "test@example.com"}

app.dependency_overrides[get_current_user_swagger] = mock_get_current_user

client = TestClient(app)

@patch("app.routers.email_router.ses")
@patch("app.routers.email_router.emails_collection")
@patch("app.routers.email_router.contacts_collection")
def test_send_transactional_email_with_attachment(mock_contacts, mock_emails, mock_ses):
    # Setup mocks
    mock_ses.send_raw_email.return_value = {"MessageId": "123"}
    mock_emails.insert_one.return_value = MagicMock()
    
    # Create a dummy file
    files = [
        ('attachments', ('test.txt', b'Hello World', 'text/plain'))
    ]
    
    data = {
        "subject": "Test Subject",
        "body": "Test Body",
        "to_emails": "recipient@example.com",
        "send_to_all": False
    }
    
    response = client.post("/email/send/transactional", data=data, files=files)
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["message"] == "Transactional email sent successfully"
    assert "test.txt" in json_response["attachments"]
    
    # Verify SES called
    mock_ses.send_raw_email.assert_called_once()
    call_args = mock_ses.send_raw_email.call_args[1]
    raw_message = call_args["RawMessage"]["Data"]
    
    # Verify attachment in raw message
    assert 'Content-Disposition: attachment; filename="test.txt"' in raw_message
    
    print("Test passed!")

if __name__ == "__main__":
    # Manually run the test function if pytest is not available or for quick check
    # But we need to setup the mocks manually if we don't use pytest runner
    # So let's just use a simple run logic
    with patch("app.routers.email_router.ses") as mock_ses, \
         patch("app.routers.email_router.emails_collection") as mock_emails, \
         patch("app.routers.email_router.contacts_collection") as mock_contacts:
        
        test_send_transactional_email_with_attachment(mock_contacts, mock_emails, mock_ses)
