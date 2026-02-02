"""Tests for progress endpoints."""

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
    """Test health endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


@pytest.mark.anyio
async def test_get_progress(client):
    """Test getting progress data."""
    response = await client.get("/api/progress")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.anyio
async def test_add_progress(client):
    """Test adding a progress entry."""
    entry = {
        "date": str(date.today()),
        "problems_solved": 3,
        "problems": [
            {"name": "Two Sum", "difficulty": "easy", "topic": "arrays"},
            {"name": "Valid Anagram", "difficulty": "easy", "topic": "hash-table"},
            {"name": "3Sum", "difficulty": "medium", "topic": "two-pointers"},
        ],
        "study_hours": 2.5,
        "notes": "Great progress today!",
        "mood": "great",
    }
    
    response = await client.post("/api/progress", json=entry)
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["entry"]["problems_solved"] == 3


@pytest.mark.anyio
async def test_get_heatmap(client):
    """Test heatmap endpoint."""
    response = await client.get("/api/heatmap")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert isinstance(data["data"], dict)


@pytest.mark.anyio
async def test_get_knowledge_graph(client):
    """Test knowledge graph endpoint."""
    response = await client.get("/api/knowledge-graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert isinstance(data["nodes"], list)
    assert isinstance(data["edges"], list)


@pytest.mark.anyio
async def test_add_invalid_progress(client):
    """Test adding invalid progress entry."""
    entry = {
        "date": str(date.today()),
        "problems": [
            {"name": "Test", "difficulty": "invalid", "topic": "test"},
        ],
    }
    
    response = await client.post("/api/progress", json=entry)
    # Should fail validation due to invalid difficulty
    assert response.status_code == 422
