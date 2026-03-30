from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Offer
from backend.schemas import (
    JobAnalysisRequest,
    JobAnalysisResponse,
    NegotiationRequest,
    NegotiationResponse,
    OfferComparisonResponse,
    OfferCreateRequest,
    OfferResponse,
    SalaryPredictionRequest,
    SalaryPredictionResponse,
)
from backend.services.negotiation_service import generate_negotiation_package
from backend.services.nlp_service import analyzer
from backend.services.salary_service import salary_estimator


router = APIRouter()


@router.post("/analyze-job", response_model=JobAnalysisResponse)
def analyze_job(payload: JobAnalysisRequest):
    return analyzer.analyze(payload.job_description)


@router.post("/predict-salary", response_model=SalaryPredictionResponse)
def predict_salary(payload: SalaryPredictionRequest):
    return salary_estimator.predict(
        title=payload.title,
        location=payload.location,
        experience_level=payload.experience_level,
        current_salary=payload.current_salary,
    )


@router.post("/add-offer", response_model=OfferResponse)
def add_offer(payload: OfferCreateRequest, db: Session = Depends(get_db)):
    analysis = analyzer.analyze(payload.job_description)
    # Growth score is intentionally simple: stronger clarity plus explicit mentorship nudges the score up.
    growth_score = min(
        100,
        max(
            35,
            int(
                analysis["role_clarity_score"] * 0.65
                + (18 if "mentorship" in payload.job_description.lower() else 8)
            ),
        ),
    )

    offer = Offer(
        company=payload.company,
        title=payload.title,
        location=payload.location,
        experience_level=payload.experience_level,
        salary=payload.salary,
        job_description=payload.job_description,
        work_life_balance=analysis["work_life_balance"],
        role_clarity_score=analysis["role_clarity_score"],
        growth_score=growth_score,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


@router.get("/compare-offers", response_model=OfferComparisonResponse)
def compare_offers(db: Session = Depends(get_db)):
    offers = db.query(Offer).order_by(Offer.created_at.desc()).all()
    return {"offers": offers}


@router.post("/negotiate", response_model=NegotiationResponse)
def negotiate(payload: NegotiationRequest):
    return generate_negotiation_package(
        company=payload.company,
        title=payload.title,
        offered_salary=payload.offered_salary,
        estimated_market_salary=payload.estimated_market_salary,
        role_clarity_score=payload.role_clarity_score,
        work_life_balance=payload.work_life_balance,
    )
