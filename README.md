# Growth Dashboard

Personal growth tracking dashboard with visualizations and analytics.

## Features

- Progress tracking with charts
- Activity heatmap
- 3D Knowledge graph
- Topic progress bars
- Goal tracker with predictions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python, FastAPI, Poetry |
| Frontend | HTML, CSS, JavaScript, Chart.js, Three.js |
| Data | JSON |
| Testing | pytest |

## Setup

### Prerequisites

- Python 3.10+
- Poetry

### Installation

```bash
git clone https://github.com/mxskeen/growth-dashboard.git
cd growth-dashboard
poetry install
poetry run uvicorn backend.main:app --reload
```

Open http://localhost:8000

### Running Tests

```bash
poetry run pytest
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/progress | GET | Get all progress data |
| /api/progress | POST | Add new progress entry |
| /api/stats | GET | Get aggregated statistics |
| /api/heatmap | GET | Get heatmap data |
| /api/knowledge-graph | GET | Get knowledge graph data |

## Project Structure

```
growth-dashboard/
├── backend/
│   ├── main.py
│   ├── models.py
│   └── routes/
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── tests/
├── pyproject.toml
└── README.md
```

## License

Built by Son of Anton for Maskeen.
