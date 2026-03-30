from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(120), nullable=False)
    title = Column(String(120), nullable=False)
    location = Column(String(120), nullable=False)
    experience_level = Column(String(50), nullable=False)
    salary = Column(Float, nullable=False)
    job_description = Column(Text, nullable=True)
    work_life_balance = Column(String(20), nullable=False)
    role_clarity_score = Column(Integer, nullable=False)
    growth_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

