from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

class OnboardingResponse(Base):
    __tablename__ = "onboarding_responses"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String)
    role = Column(String)
    brand_name = Column(String)
    industry = Column(String)
    tagline = Column(String)
    audience = Column(String)
    competitor = Column(String)
    goal = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
