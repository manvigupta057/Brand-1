import re
import os
from groq import Groq
from dotenv import load_dotenv
from ai_config import get_active_config

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def route_query(query: str) -> str:
    # 1. FIXED Classification Instructions (Don't let admin prompts confuse the router)
    prompt = f"""Classify the user query into one of two categories:
    1. 'DATA': If the user is asking for specific numbers, brand lists, counts, market shares, or analytics.
    2. 'SEMANTIC': If the user is just greeting, saying 'Hi', 'Hello', 'How are you?', or asking general non-data questions.
    
    User Query: "{query}"
    
    Return ONLY 'DATA' or 'SEMANTIC'."""
    
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        result = response.choices[0].message.content.strip().upper()
        if "DATA" in result: return "DATA"
        if "SEMANTIC" in result: return "SEMANTIC"
    except Exception as e:
        print(f"AI Routing Error: {e}")
        pass # Fallback to hardcoded rules if AI fails
    # 2. FALLBACK RULES (Check keywords only if AI fails)
    query_lower = query.lower()
    
    # ... (Keep your existing keyword lists here as a safety net)
    if any(keyword in query_lower for keyword in data_keywords):
        return "DATA"
        
    return "SEMANTIC"

def parse_data_intent(query: str):
    """
    Placeholder for news data analytics.
    """
    return {"function": "unknown", "params": {}}