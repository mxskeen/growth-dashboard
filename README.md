# Growth Dashboard 🚀

Personal growth tracking dashboard with visualizations, heatmaps, and 3D knowledge graphs.

Track your journey to FAANG with beautiful visual representations of progress.

## Features

- 📊 **Progress Charts**: LeetCode problems over time, difficulty breakdown
- 🔥 **Activity Heatmap**: GitHub-style contribution grid for study habits
- 🧠 **3D Knowledge Graph**: Visual representation of concepts mastered
- 📅 **Journey Timeline**: Milestones and key achievements
- 📡 **API Backend**: FastAPI-powered data management

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python + FastAPI + Poetry |
| Frontend | HTML/CSS/JS + Chart.js + Three.js |
| Data | JSON files |
| Testing | pytest |

## Setup

### Prerequisites

- Python 3.10+
- Poetry (`pip install poetry` or `pipx install poetry`)
- Node.js (optional, for frontend dev)

### Installation

```bash
# Clone the repo
git clone https://github.com/mxskeen/growth-dashboard.git
cd growth-dashboard

# Install Python dependencies
poetry install

# Run the backend
poetry run uvicorn backend.main:app --reload

# Open frontend
# Just open frontend/index.html in your browser
# Or visit http://localhost:8000 for API
```

### Running Tests

```bash
poetry run pytest
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/progress` | GET | Get all progress data |
| `/api/progress` | POST | Add new progress entry |
| `/api/stats` | GET | Get aggregated statistics |
| `/api/heatmap` | GET | Get heatmap data |
| `/api/knowledge-graph` | GET | Get knowledge graph data |

## Data Format

Progress entries:
```json
{
  "date": "2026-02-02",
  "problems_solved": 3,
  "problems": [
    {"name": "Two Sum", "difficulty": "easy", "topic": "arrays"},
    {"name": "Valid Anagram", "difficulty": "easy", "topic": "hash-table"}
  ],
  "study_hours": 2.5,
  "notes": "Finally understood hash maps!"
}
```

## Project Structure

```
growth-dashboard/
├── backend/
│   ├── __init__.py
│   ├── main.py          # FastAPI app
│   ├── models.py        # Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── progress.py  # Progress endpoints
│   │   └── stats.py     # Stats endpoints
│   └── data/
│       └── progress.json
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── charts.js
│       ├── heatmap.js
│       └── knowledge-graph.js
├── tests/
│   ├── __init__.py
│   ├── test_progress.py
│   └── test_stats.py
├── pyproject.toml
└── README.md
```

## License

MIT

---

Built with 🥧 by Son of Anton for Maskeen's FAANG journey.
