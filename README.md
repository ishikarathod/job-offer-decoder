# OfferWise

OfferWise is a full-stack web application for decoding job descriptions, estimating salary ranges, comparing multiple offers, and drafting negotiation guidance.

## Stack

- Frontend: React + Vite + TailwindCSS
- Backend: FastAPI + SQLAlchemy + SQLite
- ML/NLP: scikit-learn with TF-IDF phrase extraction, heuristic text classification, and a simple salary regression model

## Features

- Job Description Decoder
  - Extracts key phrases and likely skills
  - Classifies work-life balance as `low`, `medium`, or `high`
  - Scores role clarity from `0-100`
  - Surfaces heuristic red and green flags
- Salary Estimator
  - Predicts a market salary using title, location, and experience level
  - Returns estimated min/max salary range
  - Labels the entered salary as `underpaid`, `fair`, or `competitive`
- Offer Comparison
  - Stores offers in SQLite
  - Displays salary, work-life balance, growth score, and role clarity in a comparison table
- Salary Negotiation Assistant
  - Suggests an ask range
  - Assigns negotiation risk
  - Generates a dynamic negotiation draft

## Project Structure

```text
.
├── backend/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   └── data/
├── frontend/
│   └── src/
├── main.py
├── requirements.txt
└── package.json
```

## Local Setup

### 1. Backend

Create and activate a virtual environment, then install Python dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Optional: generate a larger synthetic salary dataset before starting the API:

```bash
python backend/scripts/generate_salary_data.py
```

Run the backend locally from the project root:

```bash
uvicorn main:app --reload
```

The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 2. Frontend

From the project root, install frontend dependencies and run Vite:

```bash
npm install
npm run dev
```

This uses the root workspace script to start the Vite app in `frontend/`.

The frontend will be available at [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Environment Variables

Copy `.env.example` as needed and adjust values for your local machine:

```bash
cp .env.example .env
```

- `DATABASE_URL`
  - Defaults to `sqlite:///./offerwise.db`
- `VITE_API_BASE_URL`
  - Defaults in the frontend client to `http://127.0.0.1:8000`
  - If you want to override it explicitly, create `frontend/.env` with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## API Endpoints

- `POST /analyze-job`
- `POST /predict-salary`
- `POST /add-offer`
- `GET /compare-offers`
- `POST /negotiate`

## Notes

- The NLP pipeline is intentionally lightweight so it runs fully locally.
- The salary model uses categorical features with a small synthetic dataset and can be expanded later with real market data.
- Offers are persisted in `offerwise.db` at the project root by default.

## Deploy For A Public Link

The project now includes a production-friendly setup:

- [Dockerfile](/Users/ishikarathod/Desktop/job%20offer%20decoder/Dockerfile)
  - Builds the React frontend
  - Serves it from FastAPI in production
- [render.yaml](/Users/ishikarathod/Desktop/job%20offer%20decoder/render.yaml)
  - Configures a Render web service
  - Adds a persistent disk so SQLite data survives deploys

### Recommended path: Render

1. Push this repo to GitHub.
2. Create a Render account and connect your GitHub repo.
3. In Render, create a new Blueprint and point it at this repository.
4. Render will detect `render.yaml` and provision the `offerwise` web service.
5. Once the deploy finishes, Render will give you a public `onrender.com` URL.

### Important

- The deployed app uses one public URL for both frontend and backend.
- SQLite needs persistent storage in production, so keep the attached disk enabled.
- Local development still works the same way with `uvicorn main:app --reload` and `npm run dev`.
