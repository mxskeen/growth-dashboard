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


@router.get("/stats/training")
async def get_training_stats() -> dict:
    data = load_progress()
    
    training_days = 0
    rest_days = 0
    total_training_minutes = 0
    training_by_type = {}
    
    for entry in data:
        training = entry.get("training")
        if training:
            training_type = training.get("type", "rest")
            duration = training.get("duration_minutes", 0)
            
            if training_type == "rest":
                rest_days += 1
            else:
                training_days += 1
                total_training_minutes += duration
                training_by_type[training_type] = training_by_type.get(training_type, 0) + 1
    
    return {
        "training_days": training_days,
        "rest_days": rest_days,
        "total_training_hours": round(total_training_minutes / 60, 2),
        "training_by_type": training_by_type,
        "avg_duration_per_session": round(total_training_minutes / training_days, 2) if training_days > 0 else 0,
    }


@router.get("/stats/health")
async def get_health_stats() -> dict:
    data = load_progress()
    
    metrics_data = [d.get("metrics") for d in data if d.get("metrics")]
    
    if not metrics_data:
        return {"message": "No health data recorded yet"}
    
    avg_sleep = sum(m.get("sleep_quality", 0) for m in metrics_data) / len(metrics_data)
    avg_energy = sum(m.get("energy_level", 0) for m in metrics_data) / len(metrics_data)
    avg_motivation = sum(m.get("motivation", 0) for m in metrics_data) / len(metrics_data)
    avg_anxiety = sum(m.get("social_anxiety", 0) for m in metrics_data) / len(metrics_data)
    
    social_interaction_days = sum(1 for m in metrics_data if m.get("social_interaction"))
    morning_wood_count = sum(1 for m in metrics_data if m.get("morning_wood"))
    total_wins = sum(m.get("win_count", 0) for m in metrics_data)
    
    return {
        "days_tracked": len(metrics_data),
        "avg_sleep_quality": round(avg_sleep, 2),
        "avg_energy_level": round(avg_energy, 2),
        "avg_motivation": round(avg_motivation, 2),
        "avg_social_anxiety": round(avg_anxiety, 2),
        "social_interaction_days": social_interaction_days,
        "morning_wood_count": morning_wood_count,
        "total_wins": total_wins,
    }


@router.get("/stats/heatmap/training")
async def get_training_heatmap() -> dict:
    from backend.models import HeatmapData
    data = load_progress()
    
    training_data = {}
    for entry in data:
        date_str = entry.get("date", "")
        training = entry.get("training")
        if training and training.get("type") != "rest":
            training_data[date_str] = training.get("duration_minutes", 0)
    
    return HeatmapData(data=training_data)
