from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class JobAnalysisRequest(BaseModel):
    job_description: str = Field(..., min_length=30)


class JobAnalysisResponse(BaseModel):
    key_phrases: List[str]
    work_life_balance: str
    role_clarity_score: int
    red_flags: List[str]
    green_flags: List[str]


class SalaryPredictionRequest(BaseModel):
    title: str
    location: str
    experience_level: str
    current_salary: Optional[float] = None


class SalaryPredictionResponse(BaseModel):
    estimated_min: int
    estimated_max: int
    predicted_salary: int
    market_comparison: str


class OfferCreateRequest(BaseModel):
    company: str
    title: str
    location: str
    experience_level: str
    salary: float
    job_description: str = Field(..., min_length=30)


class OfferResponse(BaseModel):
    id: int
    company: str
    title: str
    location: str
    experience_level: str
    salary: float
    work_life_balance: str
    role_clarity_score: int
    growth_score: int

    model_config = ConfigDict(from_attributes=True)


class OfferComparisonItem(BaseModel):
    id: int
    company: str
    title: str
    salary: float
    work_life_balance: str
    growth_score: int
    role_clarity_score: int

    model_config = ConfigDict(from_attributes=True)


class OfferComparisonResponse(BaseModel):
    offers: List[OfferComparisonItem]


class NegotiationRequest(BaseModel):
    company: str
    title: str
    offered_salary: float
    estimated_market_salary: float
    role_clarity_score: int
    work_life_balance: str


class NegotiationResponse(BaseModel):
    recommended_ask_min: int
    recommended_ask_max: int
    risk_level: str
    suggested_message: str
