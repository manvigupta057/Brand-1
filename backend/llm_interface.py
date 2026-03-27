import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def generate_answer(query: str, context_chunks: list[str]) -> dict:
    """
    Expert News Analyst answering based on DJI Headline context.
    """
    import json
    context = "\n\n".join(context_chunks)

    prompt = f"""You are an Expert News Analyst and Financial Data Researcher. 
    Use the provided context (DJI Headlines) to assist the user.
    
    TASK:
    1. Answer the user's question accurately based ONLY on the context.
    2. Provide a neutral, analytical summary.
    3. Keep the response concise and professional.
    
    RESPONSE FORMAT (Strict JSON):
    {{
        "answer": "Direct analytical answer here..."
    }}

    Context (Historical News Headlines):
    {context}

    User Question: {query}
    """

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "answer": "I encountered an error processing the historical archives."
        }

def generate_suggestions(partial_query: str) -> list[str]:
    """
    Returns 5 relevant news/financial keyword suggestions.
    """
    prompt = f"""The user is typing a news or financial query: "{partial_query}"
    
    Suggest exactly 5 short, relevant keyword phrases related to world news, markets, or the DJI headlines to complete this query.
    Return only the 5 suggestions as a numbered list, nothing else."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )

        raw = response.choices[0].message.content
        lines = [line.strip() for line in raw.strip().split("\n") if line.strip()]
        suggestions = [line.split(". ", 1)[-1] for line in lines if line]
        return suggestions[:5]
    except:
        return []
