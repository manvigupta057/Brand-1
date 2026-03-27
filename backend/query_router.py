import re
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def route_query(query: str) -> str:
    """
    Categorizes the query into DATA or SEMANTIC for News context.
    """
    query_lower = query.lower()
    
    # Simple rule-based detection for news
    semantic_prefixes = [
        "what happened", "news about", "who said", "tell me about", 
        "summarize", "headlines", "sentiment for"
    ]
    if any(prefix in query_lower for prefix in semantic_prefixes):
        return "SEMANTIC"

    # DATA keywords for potential analytics
    data_keywords = [
        "how many", "count", "average", "top", "total", "percentage"
    ]
    if any(keyword in query_lower for keyword in data_keywords):
        return "DATA"

    # LLM Refinement
    prompt = f"""Analyze this news/financial query: "{query}"
    
    Classify into:
    - DATA: If it requires statistics, counts, or finding a specific record attribute based on quantitative logic.
    - SEMANTIC: If it asks for information retrieval, summaries, or qualitative news content.
    
    Return ONLY 'DATA' or 'SEMANTIC'."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        result = response.choices[0].message.content.strip().upper()
        return "DATA" if "DATA" in result else "SEMANTIC"
    except:
        return "SEMANTIC"

def parse_data_intent(query: str):
    """
    Placeholder for news data analytics.
    """
    return {"function": "unknown", "params": {}}
