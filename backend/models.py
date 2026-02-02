"""Pydantic models for the Growth Dashboard API."""

from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class Problem(BaseModel):
    """A single problem solved."""
    name: str
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    topic: str
    leetcode_id: Optional[int] = None
    time_minutes: Optional[int] = None
    notes: Optional[str] = None


class ProgressEntry(BaseModel):
    """A daily progress entry."""
    date: date
    problems_solved: int = 0
    problems: list[Problem] = []
    study_hours: float = 0.0
    notes: Optional[str] = None
    mood: Optional[str] = None  # "great", "good", "okay", "struggling"


class ProgressStats(BaseModel):
    """Aggregated progress statistics."""
    total_problems: int
    easy_count: int
    medium_count: int
    hard_count: int
    total_study_hours: float
    current_streak: int
    longest_streak: int
    topics_covered: list[str]
    avg_problems_per_day: float
    days_active: int


class HeatmapData(BaseModel):
    """Heatmap data for activity visualization."""
    data: dict[str, int]  # date string -> activity count


class KnowledgeNode(BaseModel):
    """A node in the knowledge graph."""
    id: str
    label: str
    category: str  # "topic", "concept", "pattern"
    mastery: float = 0.0  # 0.0 to 1.0
    problems_solved: int = 0


class KnowledgeEdge(BaseModel):
    """An edge connecting knowledge nodes."""
    source: str
    target: str
    strength: float = 1.0


class KnowledgeGraph(BaseModel):
    """The complete knowledge graph."""
    nodes: list[KnowledgeNode]
    edges: list[KnowledgeEdge]
