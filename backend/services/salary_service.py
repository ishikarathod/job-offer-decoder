from __future__ import annotations

import csv
from pathlib import Path
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "salary_data.csv"


DEFAULT_DATASET = [
    {"title": "Software Engineer", "location": "New York, NY", "experience_level": "entry", "salary": 105000},
    {"title": "Software Engineer", "location": "Austin, TX", "experience_level": "mid", "salary": 128000},
    {"title": "Software Engineer", "location": "San Francisco, CA", "experience_level": "senior", "salary": 188000},
    {"title": "Data Scientist", "location": "Boston, MA", "experience_level": "mid", "salary": 142000},
    {"title": "Product Manager", "location": "Seattle, WA", "experience_level": "senior", "salary": 176000},
    {"title": "ML Engineer", "location": "Remote", "experience_level": "mid", "salary": 155000},
    {"title": "Frontend Engineer", "location": "Chicago, IL", "experience_level": "entry", "salary": 97000},
    {"title": "Backend Engineer", "location": "Denver, CO", "experience_level": "mid", "salary": 134000},
    {"title": "DevOps Engineer", "location": "Remote", "experience_level": "senior", "salary": 172000},
    {"title": "Business Analyst", "location": "Atlanta, GA", "experience_level": "entry", "salary": 82000},
]


class SalaryEstimator:
    def __init__(self) -> None:
        self.model = None
        self.training_rows = []
        self._ensure_dataset()
        self._train_model()

    def _ensure_dataset(self) -> None:
        if DATA_PATH.exists():
            return

        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        with DATA_PATH.open("w", newline="", encoding="utf-8") as csv_file:
            writer = csv.DictWriter(csv_file, fieldnames=["title", "location", "experience_level", "salary"])
            writer.writeheader()
            writer.writerows(DEFAULT_DATASET)

    def _read_rows(self) -> list[dict]:
        with DATA_PATH.open("r", encoding="utf-8") as csv_file:
            return list(csv.DictReader(csv_file))

    def _train_model(self) -> None:
        rows = self._read_rows()
        self.training_rows = rows
        X = [
            [row["title"], row["location"], row["experience_level"]]
            for row in rows
        ]
        y = np.array([float(row["salary"]) for row in rows])

        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "categorical",
                    OneHotEncoder(handle_unknown="ignore"),
                    [0, 1, 2],
                )
            ]
        )

        self.model = Pipeline(
            steps=[
                ("preprocessor", preprocessor),
                ("regressor", RandomForestRegressor(n_estimators=200, random_state=42)),
            ]
        )
        self.model.fit(X, y)

    def predict(self, title: str, location: str, experience_level: str, current_salary: float | None = None) -> dict:
        payload = [[title, location, experience_level]]
        predicted_salary = int(round(float(self.model.predict(payload)[0])))

        # Keep the estimate readable by returning a practical confidence band around the point prediction.
        band = max(10000, int(predicted_salary * 0.12))
        estimated_min = predicted_salary - band
        estimated_max = predicted_salary + band

        market_comparison = "fair"
        if current_salary is not None:
            if current_salary < estimated_min:
                market_comparison = "underpaid"
            elif current_salary > estimated_max:
                market_comparison = "competitive"
            else:
                market_comparison = "fair"

        return {
            "estimated_min": estimated_min,
            "estimated_max": estimated_max,
            "predicted_salary": predicted_salary,
            "market_comparison": market_comparison,
        }


salary_estimator = SalaryEstimator()
