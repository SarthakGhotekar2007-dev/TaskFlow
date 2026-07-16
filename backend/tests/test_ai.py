from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ai_chat():
    response = client.post("/ai/chat", json={"message": "Hello"})
    assert response.status_code in [200, 401]

def test_ai_prioritize():
    response = client.post("/ai/prioritize", json={"title": "Test Task"})
    assert response.status_code in [200, 401, 422]

def test_ai_predict_deadline():
    response = client.post("/ai/predict-deadline", json={"task_title": "Test", "task_description": "Desc"})
    assert response.status_code in [200, 401, 422]

def test_get_conversations():
    response = client.get("/ai/conversations")
    assert response.status_code in [200, 401]
