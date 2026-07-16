from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_stats():
    # Assuming the API requires authentication, we would normally mock the dependency
    # For now, this is a placeholder structural test
    response = client.get("/dashboard/stats")
    # Will be 401 without auth token, but proves route exists
    assert response.status_code in [200, 401]

def test_get_productivity():
    response = client.get("/dashboard/productivity")
    assert response.status_code in [200, 401]

def test_get_heatmap():
    response = client.get("/dashboard/heatmap")
    assert response.status_code in [200, 401]

def test_get_achievements():
    response = client.get("/dashboard/achievements")
    assert response.status_code in [200, 401]
