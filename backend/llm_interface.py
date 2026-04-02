import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def generate_answer(query: str, context_chunks: list[str], system_instruction: str = None) -> dict:
    """
    Expert Analyst answering based on Brand Data and Dynamic admin instructions.
    """
    import json
    context = "\n\n".join(context_chunks)

    base_guideline = system_instruction if system_instruction else "You are an Expert Brand Analyst."

    # Final prompt with absolute Roleplay dominance.
    prompt = f"""
    [[ YOUR IDENTITY ]]
    {base_guideline} (Act as this person ALWAYS).
    
    [[ RULES ]]
    - NEVER start with "Based on the data" or "Here is the information".
    - Respond specifically like the identity above.
    - If the user asks about data, weave these facts into your natural conversation: "{context}"
    - NO HALLUCINATIONS: Stay true to the facts above.
    
    [[ RESPONSE FORMAT ]]
    You MUST return ONLY a JSON object with this key:
    {{
        "answer": "YOUR IN-CHARACTER RESPONSE HERE"
    }}
    
    User: {query}
    """

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error in LLM Generation: {e}")
        return {
            "answer": "I encountered an error processing the historical archives."
        }

def generate_suggestions(partial_query: str) -> list[str]:
    """
    Returns 5 relevant keyword suggestions.
    """
    prompt = f"""The user is typing query: "{partial_query}"
    Suggest 5 relevant keyword phrases to complete this query.
    Return ONLY the 5 suggestions as a list."""

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
