import sys
import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.routers.email_router import router
from app.core.security import get_current_user_swagger

# Override dependency
async def mock_get_current_user():
    return {"_id": "507f1f77bcf86cd799439011", "email": "test@example.com"}

app.dependency_overrides[get_current_user_swagger] = mock_get_current_user

client = TestClient(app)

@patch("app.routers.email_router.ses")
@patch("app.routers.email_router.emails_collection")
@patch("app.routers.email_router.contacts_collection")
def test_send_newsletter_unsubscribe(mock_contacts, mock_emails, mock_ses):
    # Setup mocks
    mock_ses.send_raw_email.return_value = {"MessageId": "123"}
    mock_emails.insert_one.return_value = MagicMock()
    
    # Mock contacts
    mock_contacts.find.return_value = [
        {"email": "recipient1@example.com"},
        {"email": "recipient2@example.com"}
    ]
    
    data = {
        "subject": "Newsletter Subject",
        "body": "<html><body>Newsletter Body <!-- UNSUBSCRIBE_PLACEHOLDER --></body></html>",
        "to_emails": "recipient1@example.com, recipient2@example.com",
        "send_to_all": False
    }
    
    response = client.post("/email/send/newsletter", data=data)
    
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["message"] == "Newsletter email sent successfully"
    assert json_response["sent_count"] == 2
    assert "recipients" in json_response
    assert len(json_response["recipients"]) == 2
    
    # Verify SES called twice (once for each recipient)
    assert mock_ses.send_raw_email.call_count == 2
    
    # Verify headers and footer for first recipient
    call_args = mock_ses.send_raw_email.call_args_list[0][1]
    raw_message = call_args["RawMessage"]["Data"]
    
    # Check for List-Unsubscribe header
    assert 'List-Unsubscribe: <http://13.61.21.175:9000/unsubscribe?email=recipient1@example.com>' in raw_message
    assert 'List-Unsubscribe-Post: List-Unsubscribe=One-Click' in raw_message
    assert 'Precedence: bulk' in raw_message
    assert 'X-Auto-Response-Suppress: OOF, DR, RN, NRN, AutoReply' in raw_message
    
    # Check for footer link
    assert 'href="http://13.61.21.175:9000/unsubscribe?email=recipient1@example.com"' in raw_message
    
    # Verify log insertion
    assert mock_emails.insert_one.call_count == 1
    log_entry = mock_emails.insert_one.call_args[0][0]
    assert log_entry["status"] == "success"
    assert log_entry["created_at"].tzinfo is not None
    
    print("Test passed!")

if __name__ == "__main__":
    with patch("app.routers.email_router.ses") as mock_ses, \
         patch("app.routers.email_router.emails_collection") as mock_emails, \
         patch("app.routers.email_router.contacts_collection") as mock_contacts:
        
        test_send_newsletter_unsubscribe(mock_contacts, mock_emails, mock_ses)
