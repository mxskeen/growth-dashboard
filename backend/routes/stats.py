from datetime import date, timedelta
from fastapi import APIRouter

from backend.models import ProgressStats
from backend.routes.progress import load_progress

router = APIRouter()


def calculate_streak(dates: list[str]) -> tuple[int, int]:
    if not dates:
        return 0, 0
    
    parsed_dates = sorted([date.fromisoformat(d) for d in dates])
    
    current_streak = 0
    longest_streak = 0
    streak = 1
    
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    if parsed_dates and parsed_dates[-1] >= yesterday:
        current_streak = 1
    
    for i in range(1, len(parsed_dates)):
        diff = (parsed_dates[i] - parsed_dates[i-1]).days
        if diff == 1:
            streak += 1
            if parsed_dates[i] >= yesterday:
                current_streak = streak
        elif diff > 1:
            longest_streak = max(longest_streak, streak)
            streak = 1
    
    longest_streak = max(longest_streak, streak)
    
    return current_streak, longest_streak


@router.get("/stats")
async def get_stats() -> ProgressStats:
    data = load_progress()
    
    total_problems = 0
    easy_count = 0
    medium_count = 0
    hard_count = 0
    total_study_hours = 0.0
    topics = set()
    dates = []
    
    for entry in data:
        total_problems += entry.get("problems_solved", 0)
        total_study_hours += entry.get("study_hours", 0)
        dates.append(entry.get("date", ""))
        
        for problem in entry.get("problems", []):
            difficulty = problem.get("difficulty", "easy")
            if difficulty == "easy":
                easy_count += 1
            elif difficulty == "medium":
                medium_count += 1
            elif difficulty == "hard":
                hard_count += 1
            
            topic = problem.get("topic")
            if topic:
                topics.add(topic)
    
    current_streak, longest_streak = calculate_streak(dates)
    days_active = len(set(dates))
    avg_problems = total_problems / days_active if days_active > 0 else 0
    
    return ProgressStats(
        total_problems=total_problems,
        easy_count=easy_count,
        medium_count=medium_count,
        hard_count=hard_count,
        total_study_hours=total_study_hours,
        current_streak=current_streak,
        longest_streak=longest_streak,
        topics_covered=sorted(list(topics)),
        avg_problems_per_day=round(avg_problems, 2),
        days_active=days_active,
    )


@router.get("/stats/weekly")
async def get_weekly_stats() -> dict:
    data = load_progress()
    today = date.today()
    week_ago = today - timedelta(days=7)
    
    weekly_data = [d for d in data if d.get("date", "") >= str(week_ago)]
    
    problems_by_day = {}
    for d in weekly_data:
        problems_by_day[d.get("date", "")] = d.get("problems_solved", 0)
    
    return {
        "period": f"{week_ago} to {today}",
        "problems_by_day": problems_by_day,
        "total_problems": sum(d.get("problems_solved", 0) for d in weekly_data),
        "total_hours": sum(d.get("study_hours", 0) for d in weekly_data),
        "days_active": len(weekly_data),
    }
