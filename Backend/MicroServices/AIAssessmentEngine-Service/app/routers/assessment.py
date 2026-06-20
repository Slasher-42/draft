import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.schemas import ScoreRequest, ScoreResponse
from app.services import scoring_service
from app.kafka.producer import (
    publish_assessment_completed,
    publish_score_generated,
    publish_classification_assigned,
    publish_score_generated_full
)
from app.security import get_current_user

router = APIRouter(prefix="/assessment", tags=["Assessment"])


def _safe_str(value) -> str:
    return str(value) if value is not None else ""


def _safe_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


async def _create_review_direct(payload: dict):
    """Kafka delivery to the evaluation service has proven unreliable, so the
    evaluator review is created via a direct HTTP call rather than relying
    solely on the score.generated.full event.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.EVALUATION_SERVICE_URL}/api/evaluator/internal/reviews/from-score",
                json=payload,
            )
            resp.raise_for_status()
    except Exception as e:
        print(f"Warning: direct review creation failed — {e}")


@router.post("/score", response_model=ScoreResponse)
async def score_execution(
    request: ScoreRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        score = scoring_service.compute_score(
            db=db,
            execution_id=request.execution_id,
            weight_financial_health=request.weight_financial_health,
            weight_team_strength=request.weight_team_strength,
            weight_market_potential=request.weight_market_potential,
            weight_business_viability=request.weight_business_viability,
            minimum_passing_score=request.minimum_passing_score
        )

        publish_assessment_completed(request.execution_id, score.session_id)
        publish_score_generated(request.execution_id, score.overall_score, score.classification.value)
        publish_classification_assigned(request.execution_id, score.classification.value)

        from app.models import AISession, SessionStatus
        session = db.query(AISession).filter(
            AISession.execution_id == request.execution_id,
            AISession.status == SessionStatus.COMPLETED
        ).first()

        form = session.form_data if session else {}
        company_size = _safe_str(form.get("companySize"))
        problem_statement = _safe_str(form.get("problemStatement"))
        business_model = _safe_str(form.get("businessModel"))
        target_market = _safe_str(form.get("targetMarket"))
        funding_needed = _safe_float(form.get("fundingNeeded"))

        publish_score_generated_full(
            execution_id=request.execution_id,
            startup_user_id=score.user_id,
            financial_health=score.financial_health,
            team_strength=score.team_strength,
            market_potential=score.market_potential,
            business_viability=score.business_viability,
            overall_score=score.overall_score,
            classification=score.classification.value,
            ai_reasoning=score.reasoning,
            company_size=company_size,
            problem_statement=problem_statement,
            business_model=business_model,
            target_market=target_market,
            funding_needed=funding_needed
        )

        await _create_review_direct({
            "executionId": request.execution_id,
            "startupUserId": score.user_id,
            "financialHealth": score.financial_health,
            "teamStrength": score.team_strength,
            "marketPotential": score.market_potential,
            "businessViability": score.business_viability,
            "overallScore": score.overall_score,
            "classification": score.classification.value,
            "aiReasoning": score.reasoning,
            "companySize": company_size,
            "problemStatement": problem_statement,
            "businessModel": business_model,
            "targetMarket": target_market,
            "fundingNeeded": funding_needed,
        })

        return ScoreResponse(
            execution_id=score.execution_id,
            session_id=score.session_id,
            financial_health=score.financial_health,
            team_strength=score.team_strength,
            market_potential=score.market_potential,
            business_viability=score.business_viability,
            overall_score=score.overall_score,
            classification=score.classification.value,
            reasoning=score.reasoning
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))