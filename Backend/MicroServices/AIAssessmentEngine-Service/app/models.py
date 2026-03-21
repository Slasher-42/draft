from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum

class SessionType(str, enum.Enum):
    STARTUP = "STARTUP"
    INVESTOR = "INVESTOR"

class SessionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

class Classification(str, enum.Enum):
    HIGHLY_READY = "HIGHLY_READY"
    MODERATELY_READY = "MODERATELY_READY"
    NOT_READY = "NOT_READY"

class AISession(Base):
    __tablename__ = "ai_sessions"

    id = Column(String, primary_key=True)
    execution_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    session_type = Column(SQLEnum(SessionType), nullable=False)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.ACTIVE)
    conversation_history = Column(JSON, default=list)
    form_data = Column(JSON, nullable=False)
    additional_considerations = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class AssessmentScore(Base):
    __tablename__ = "assessment_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=False)
    execution_id = Column(Integer, nullable=False, unique=True)
    user_id = Column(Integer, nullable=False)
    financial_health = Column(Float, nullable=False)
    team_strength = Column(Float, nullable=False)
    market_potential = Column(Float, nullable=False)
    business_viability = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    classification = Column(SQLEnum(Classification), nullable=False)
    reasoning = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())