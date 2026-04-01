import re
import os
from groq import Groq
from dotenv import load_dotenv
from ai_config import get_active_config

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def route_query(query: str) -> str:
    config = get_active_config()
    MODEL = config["model"]
    routing_prompt = config["prompt"]
    
    # 1. AI FIRST (Ensures your dynamic prompt is respected)
    prompt = f"""{routing_prompt}
    Query: "{query}"
    Return ONLY 'DATA' or 'SEMANTIC'."""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        result = response.choices[0].message.content.strip().upper()
        # If the AI says DATA or SEMANTIC, we trust it immediately
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