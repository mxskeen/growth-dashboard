"""Progress tracking routes."""

import json
from datetime import date
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException

from backend.models import ProgressEntry, Problem, HeatmapData, KnowledgeGraph, KnowledgeNode, KnowledgeEdge

router = APIRouter()

# Data file path
DATA_DIR = Path(__file__).parent.parent / "data"
PROGRESS_FILE = DATA_DIR / "progress.json"


def ensure_data_dir():
    """Ensure data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not PROGRESS_FILE.exists():
        PROGRESS_FILE.write_text("[]")


def load_progress() -> list[dict]:
    """Load progress data from file."""
    ensure_data_dir()
    try:
        return json.loads(PROGRESS_FILE.read_text())
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_progress(data: list[dict]):
    """Save progress data to file."""
    ensure_data_dir()
    PROGRESS_FILE.write_text(json.dumps(data, indent=2, default=str))


@router.get("/progress")
async def get_progress(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[dict]:
    """Get all progress entries, optionally filtered by date range."""
    data = load_progress()
    
    if start_date:
        data = [d for d in data if d.get("date", "") >= str(start_date)]
    if end_date:
        data = [d for d in data if d.get("date", "") <= str(end_date)]
    
    return data


@router.post("/progress")
async def add_progress(entry: ProgressEntry) -> dict:
    """Add a new progress entry."""
    data = load_progress()
    
    # Check if entry for this date already exists
    entry_dict = entry.model_dump(mode="json")
    existing_idx = next(
        (i for i, d in enumerate(data) if d.get("date") == str(entry.date)),
        None
    )
    
    if existing_idx is not None:
        # Update existing entry
        data[existing_idx] = entry_dict
        message = "Progress entry updated"
    else:
        # Add new entry
        data.append(entry_dict)
        message = "Progress entry added"
    
    # Sort by date
    data.sort(key=lambda x: x.get("date", ""))
    save_progress(data)
    
    return {"message": message, "entry": entry_dict}


@router.delete("/progress/{date_str}")
async def delete_progress(date_str: str) -> dict:
    """Delete a progress entry by date."""
    data = load_progress()
    original_len = len(data)
    data = [d for d in data if d.get("date") != date_str]
    
    if len(data) == original_len:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    save_progress(data)
    return {"message": f"Deleted entry for {date_str}"}


@router.get("/heatmap")
async def get_heatmap() -> HeatmapData:
    """Get heatmap data for activity visualization."""
    data = load_progress()
    heatmap = {}
    
    for entry in data:
        date_str = entry.get("date", "")
        problems = entry.get("problems_solved", 0)
        hours = entry.get("study_hours", 0)
        # Activity score: problems + hours (weighted)
        activity = problems + int(hours * 2)
        heatmap[date_str] = activity
    
    return HeatmapData(data=heatmap)


@router.get("/knowledge-graph")
async def get_knowledge_graph() -> KnowledgeGraph:
    """Get knowledge graph data from progress."""
    data = load_progress()
    
    # Build topic stats
    topic_stats: dict[str, dict] = {}
    for entry in data:
        for problem in entry.get("problems", []):
            topic = problem.get("topic", "unknown")
            if topic not in topic_stats:
                topic_stats[topic] = {"count": 0, "difficulties": []}
            topic_stats[topic]["count"] += 1
            topic_stats[topic]["difficulties"].append(problem.get("difficulty", "easy"))
    
    # Create nodes
    nodes = []
    max_count = max((t["count"] for t in topic_stats.values()), default=1)
    
    for topic, stats in topic_stats.items():
        # Calculate mastery based on count and difficulty mix
        mastery = min(stats["count"] / 10, 1.0)  # Cap at 10 problems per topic
        hard_ratio = stats["difficulties"].count("hard") / len(stats["difficulties"]) if stats["difficulties"] else 0
        mastery = min(mastery + hard_ratio * 0.3, 1.0)
        
        nodes.append(KnowledgeNode(
            id=topic,
            label=topic.replace("-", " ").title(),
            category="topic",
            mastery=mastery,
            problems_solved=stats["count"],
        ))
    
    # Create edges between related topics
    # For now, simple heuristic: topics that appear in same day's entries are connected
    edges = []
    topic_pairs: dict[tuple, int] = {}
    
    for entry in data:
        topics_in_entry = list(set(p.get("topic", "") for p in entry.get("problems", [])))
        for i, t1 in enumerate(topics_in_entry):
            for t2 in topics_in_entry[i+1:]:
                pair = tuple(sorted([t1, t2]))
                topic_pairs[pair] = topic_pairs.get(pair, 0) + 1
    
    for (t1, t2), count in topic_pairs.items():
        edges.append(KnowledgeEdge(
            source=t1,
            target=t2,
            strength=min(count / 5, 1.0),
        ))
    
    return KnowledgeGraph(nodes=nodes, edges=edges)
