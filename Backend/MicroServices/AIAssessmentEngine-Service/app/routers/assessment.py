from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
            company_size=form.get("companySize", ""),
            problem_statement=form.get("problemStatement", ""),
            business_model=form.get("businessModel", ""),
            target_market=form.get("targetMarket", ""),
            funding_needed=float(form.get("fundingNeeded", 0))
        )

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