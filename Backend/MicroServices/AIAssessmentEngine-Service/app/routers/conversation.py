import httpx
import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    StartConversationRequest, StartConversationResponse,
    SendMessageRequest, SendMessageResponse,
    FinishConversationRequest, FinishConversationResponse
)
from app.services import conversation_service
from app.security import get_current_user
from app.config import settings

router = APIRouter(prefix="/conversation", tags=["Conversation"])

async def get_update_interval() -> str:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.USER_MANAGEMENT_URL}/api/config")
        if response.status_code == 200:
            data = response.json().get("data", {})
            value = data.get("updateIntervalValue", 42)
            unit = data.get("updateIntervalUnit", "hours").lower()
            return f"{value} {unit}"
    except Exception:
        pass
    return "42 hours"

@router.post("/start", response_model=StartConversationResponse)
async def start_conversation(
    request: StartConversationRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        session_id, opening_message = conversation_service.start_session(
            db=db,
            execution_id=request.execution_id,
            user_id=request.user_id,
            session_type=request.session_type,
            form_data=request.form_data
        )
        return StartConversationResponse(
            session_id=session_id,
            message=opening_message
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/message", response_model=SendMessageResponse)
async def send_message(
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        reply, is_complete = conversation_service.send_message(
            db=db,
            session_id=request.session_id,
            user_message=request.message
        )
        return SendMessageResponse(
            session_id=request.session_id,
            reply=reply,
            is_complete=is_complete
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/finish", response_model=FinishConversationResponse)
async def finish_conversation(
    request: FinishConversationRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        update_interval = await get_update_interval()
        closing_message = conversation_service.finish_session(
            db=db,
            session_id=request.session_id,
            additional_considerations=request.additional_considerations or "",
            update_interval=update_interval
        )
        return FinishConversationResponse(
            session_id=request.session_id,
            message=closing_message,
            update_interval=update_interval
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))