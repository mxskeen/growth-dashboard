"""Tests for stats endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport

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
async def test_get_stats(client):
    """Test stats endpoint."""
    response = await client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    
    # Check all required fields
    assert "total_problems" in data
    assert "easy_count" in data
    assert "medium_count" in data
    assert "hard_count" in data
    assert "total_study_hours" in data
    assert "current_streak" in data
    assert "longest_streak" in data
    assert "topics_covered" in data
    assert "avg_problems_per_day" in data
    assert "days_active" in data
    
    # Check types
    assert isinstance(data["total_problems"], int)
    assert isinstance(data["easy_count"], int)
    assert isinstance(data["medium_count"], int)
    assert isinstance(data["hard_count"], int)
    assert isinstance(data["total_study_hours"], (int, float))
    assert isinstance(data["topics_covered"], list)


@pytest.mark.anyio
async def test_get_weekly_stats(client):
    """Test weekly stats endpoint."""
    response = await client.get("/api/stats/weekly")
    assert response.status_code == 200
    data = response.json()
    
    assert "period" in data
    assert "problems_by_day" in data
    assert "total_problems" in data
    assert "total_hours" in data
    assert "days_active" in data


@pytest.mark.anyio
async def test_stats_consistency(client):
    """Test that stats are consistent with progress data."""
    # Get progress
    progress_response = await client.get("/api/progress")
    progress = progress_response.json()
    
    # Get stats
    stats_response = await client.get("/api/stats")
    stats = stats_response.json()
    
    # Calculate expected values
    expected_total = sum(p.get("problems_solved", 0) for p in progress)
    expected_hours = sum(p.get("study_hours", 0) for p in progress)
    
    assert stats["total_problems"] == expected_total
    assert abs(stats["total_study_hours"] - expected_hours) < 0.01
