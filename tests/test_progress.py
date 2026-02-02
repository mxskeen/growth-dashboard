import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date

from backend.main import app


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.anyio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


@pytest.mark.anyio
async def test_get_progress(client):
    response = await client.get("/api/progress")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.anyio
async def test_add_progress(client):
    entry = {
        "date": str(date.today()),
        "problems_solved": 3,
        "problems": [
            {"name": "Two Sum", "difficulty": "easy", "topic": "arrays"},
            {"name": "Valid Anagram", "difficulty": "easy", "topic": "hash-table"},
            {"name": "3Sum", "difficulty": "medium", "topic": "two-pointers"},
        ],
        "study_hours": 2.5,
        "notes": "Good progress",
        "mood": "great",
    }
    
    response = await client.post("/api/progress", json=entry)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["entry"]["problems_solved"] == 3


@pytest.mark.anyio
async def test_get_heatmap(client):
    response = await client.get("/api/heatmap")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert isinstance(data["data"], dict)


@pytest.mark.anyio
async def test_get_knowledge_graph(client):
    response = await client.get("/api/knowledge-graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data


@pytest.mark.anyio
async def test_add_invalid_progress(client):
    entry = {
        "date": str(date.today()),
        "problems": [
            {"name": "Test", "difficulty": "invalid", "topic": "test"},
        ],
    }
    
    response = await client.post("/api/progress", json=entry)
    assert response.status_code == 422
