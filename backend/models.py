from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class Problem(BaseModel):
    name: str
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    topic: str
    leetcode_id: Optional[int] = None
    time_minutes: Optional[int] = None
    notes: Optional[str] = None


class TrainingEntry(BaseModel):
    type: str = Field(..., pattern="^(bodyweight|sprints|lifting|hiit|sports|rest)$")
    duration_minutes: int
    exercises: list[str] = []
    notes: Optional[str] = None


class DailyMetrics(BaseModel):
    sleep_quality: int = Field(..., ge=1, le=10)
    energy_level: int = Field(..., ge=1, le=10)
    motivation: int = Field(..., ge=1, le=10)
    social_anxiety: int = Field(..., ge=1, le=10)
    morning_wood: bool = False
    social_interaction: bool = False
    win_count: int = 0


class ProgressEntry(BaseModel):
    date: date
    problems_solved: int = 0
    problems: list[Problem] = []
    study_hours: float = 0.0
    training: Optional[TrainingEntry] = None
    metrics: Optional[DailyMetrics] = None
    supplement_stack: list[str] = []
    notes: Optional[str] = None
    mood: Optional[str] = None


class ProgressStats(BaseModel):
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
    data: dict[str, int]


class KnowledgeNode(BaseModel):
    id: str
    label: str
    category: str
    mastery: float = 0.0
    problems_solved: int = 0


class KnowledgeEdge(BaseModel):
    source: str
    target: str
    strength: float = 1.0


class KnowledgeGraph(BaseModel):
    nodes: list[KnowledgeNode]
    edges: list[KnowledgeEdge]
