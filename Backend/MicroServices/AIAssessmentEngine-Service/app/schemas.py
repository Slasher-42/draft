from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum

class SessionType(str, Enum):
    STARTUP = "STARTUP"
    INVESTOR = "INVESTOR"

class StartConversationRequest(BaseModel):
    execution_id: int
    user_id: int
    session_type: SessionType
    form_data: Dict[str, Any]

class StartConversationResponse(BaseModel):
    session_id: str
    message: str

class SendMessageRequest(BaseModel):
    session_id: str
    message: str

class SendMessageResponse(BaseModel):
    session_id: str
    reply: str
    is_complete: bool

class FinishConversationRequest(BaseModel):
    session_id: str
    additional_considerations: Optional[str] = None

class FinishConversationResponse(BaseModel):
    session_id: str
    message: str
    update_interval: str

class ScoreRequest(BaseModel):
    execution_id: int
    weight_financial_health: float
    weight_team_strength: float
    weight_market_potential: float
    weight_business_viability: float
    minimum_passing_score: float

class ScoreResponse(BaseModel):
    execution_id: int
    session_id: str
    financial_health: float
    team_strength: float
    market_potential: float
    business_viability: float
    overall_score: float
    classification: str
    reasoning: str