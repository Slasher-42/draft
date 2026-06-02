from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security
from pydantic import BaseModel
from typing import List
from app.security import get_current_user
from app.services import assistant_service

router = APIRouter(prefix="/assistant", tags=["Assistant"])

bearer_scheme = HTTPBearer()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []


@router.post("/chat")
async def chat(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    current_user: dict = Depends(get_current_user),
):
    try:
        token = credentials.credentials

        system_prompt = await assistant_service.build_system_prompt(token, current_user)

        messages = [{"role": m.role, "content": m.content}
                    for m in request.conversation_history]
        messages.append({"role": "user", "content": request.message})

        return StreamingResponse(
            assistant_service.stream_chat(system_prompt, messages[:-1] + [messages[-1]]),
            media_type="text/plain; charset=utf-8",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
