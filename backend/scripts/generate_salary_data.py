import csv
import random
from pathlib import Path


OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "salary_data.csv"

TITLES = {
    "Software Engineer": 110000,
    "Frontend Engineer": 102000,
    "Backend Engineer": 118000,
    "Data Scientist": 125000,
    "ML Engineer": 138000,
    "Product Manager": 132000,
    "DevOps Engineer": 128000,
    "Business Analyst": 88000,
}

LOCATIONS = {
    "New York, NY": 24000,
    "San Francisco, CA": 38000,
    "Seattle, WA": 26000,
    "Austin, TX": 12000,
    "Chicago, IL": 9000,
    "Boston, MA": 18000,
    "Atlanta, GA": 5000,
    "Denver, CO": 11000,
    "Remote": 15000,
}

EXPERIENCE = {
    "entry": -18000,
    "mid": 0,
    "senior": 28000,
    "lead": 46000,
}


def main() -> None:
    random.seed(42)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for title, title_base in TITLES.items():
        for location, location_adjustment in LOCATIONS.items():
            for level, level_adjustment in EXPERIENCE.items():
                for _ in range(4):
                    salary = title_base + location_adjustment + level_adjustment + random.randint(-9000, 9000)
                    rows.append(
                        {
                            "title": title,
                            "location": location,
                            "experience_level": level,
                            "salary": max(65000, salary),
                        }
                    )

    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=["title", "location", "experience_level", "salary"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

