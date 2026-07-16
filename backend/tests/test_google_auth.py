from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker

client = TestClient(app)

def test_google_login_invalid_token():
    response = client.post("/auth/google", json={"token": "invalid_token"})
    # Without a valid token, verify_google_token raises ValueError or similar, mapped to 401
    assert response.status_code == 401
    assert "Invalid Firebase token" in response.json().get("detail", "")

@patch("app.routers.auth.verify_google_token")
def test_google_login_new_user(mock_verify):
    # Mocking the verify_google_token response
    mock_verify.return_value = {
        "uid": "google_12345",
        "email": "testgoogle@example.com",
        "name": "Test Google User",
        "picture": "http://example.com/pic.jpg"
    }

    response = client.post("/auth/google", json={"token": "valid_mock_token"})
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testgoogle@example.com"
    assert data["user"]["is_google_user"] == True
    assert data["user"]["profile_image"] == "http://example.com/pic.jpg"

@patch("app.routers.auth.verify_google_token")
def test_google_login_existing_user(mock_verify):
    # Since we just created the user in the previous test (if they run in order and use the same DB),
    # this will link or just return the existing user.
    mock_verify.return_value = {
        "uid": "google_12345",
        "email": "testgoogle@example.com",
        "name": "Test Google User",
        "picture": "http://example.com/pic.jpg"
    }

    response = client.post("/auth/google", json={"token": "valid_mock_token"})
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testgoogle@example.com"
    assert data["user"]["is_google_user"] == True

@patch("app.routers.auth.verify_google_token")
def test_google_login_no_email(mock_verify):
    mock_verify.return_value = {
        "uid": "google_no_email",
        # Missing email
    }

    response = client.post("/auth/google", json={"token": "valid_mock_token"})
    
    assert response.status_code == 400
    assert "Email not provided by Google" in response.json().get("detail", "")
