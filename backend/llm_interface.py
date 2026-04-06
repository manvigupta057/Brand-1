import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

def generate_answer(query: str, context_chunks: list[str], chat_history: list[dict], system_instruction: str = None) -> dict:
    import json
    import mlflow
    
    # --- DOMAIN AGNOSTIC STRATEGIC PROMPT ---
    STRATEGIC_SYSTEM_PROMPT = """
    You are a World-Class Strategic Brand Coach. Your expertise covers any industry (SaaS, Tech, Personal, Retail, or Startups).

    Use the following Strategic Pillars in your analysis:
    1. MARKET PRESENCE: Share, growth, and positioning.
    2. DIGITAL FOOTPRINT: SEO, authority, and online reach.
    3. PUBLIC SENTIMENT: Customer trust and emotions.
    4. GROWTH STRATEGY: Scalable metaphors and advice.

    RULES:
    - Be expert, upbeat, and straight to the point.
    - If data is from the internet, refer to it as "Global Intelligence".
    - DO NOT show raw URLs/Links. Instead, say "According to latest market news..." or "Sources indicate...".
    """
    
    # 🕵️ GREETING DETECTION: If it's a simple greeting, don't use RAG context.
    greetings = ["hello", "hi", "hey", "good morning", "good afternoon", "gm", "gn"]
    is_greeting = query.strip().lower().rstrip('?').rstrip('!') in greetings
    
    context = "" if is_greeting else "\n\n".join(context_chunks)

    # 🕵️ Start MLflow Run
    with mlflow.start_run(run_name=f"Chat: {query[:20]}"):
        # Log Persona and Context Stats
        mlflow.log_param("persona", system_instruction[:50] if system_instruction else "Default")
        mlflow.log_param("is_greeting", is_greeting)
        mlflow.log_param("context_chunks_count", 0 if is_greeting else len(context_chunks))
        mlflow.set_tag("user_question", query)

        # 🔥 MERGE LOGIC: Framework (Knowledge) + Admin Customization (Tone)
        admin_persona = system_instruction if system_instruction else "Be professional and helpful."
        base_guideline = f"{STRATEGIC_SYSTEM_PROMPT}\n\n[YOUR ACTIVE TONE/PERSONA]: {admin_persona}"
        
        if is_greeting:
           # 🚀 Super Force Fix: Ignore history and context for greetings
             messages = [{"role": "system", "content": f"{base_guideline}. The user is just greeting you. Just say hello back in your persona. DO NOT provide any data, metrics, or brand analysis."}]
             messages.append({"role": "user", "content": query})
             prompt = 'Return ONLY a JSON object with a single key "answer" containing your greeting.'
        else:
             messages = [{"role": "system", "content": base_guideline}]
             for msg in chat_history[-5:]:
                 role = "assistant" if msg["role"] in ["ai", "assistant"] else "user"
                 content = msg["content"]
                 if not isinstance(content, str):
                     content = json.dumps(content)
                 messages.append({"role": role, "content": content})

            # Final prompt for strategic brand analysis logic
        prompt = f"""
        [[ BRAND CONTEXT ]]
        {context}
        
        [[ USER QUESTION ]]
        {query}

        [[ INSTRUCTIONS ]]
        - Act STRICTLY as the Strategic Coach and adopt the ACTIVE TONE/PERSONA defined in the your system prompt.
        - IDENTIFY INDUSTRY: Determine the business type (e.g., SaaS, IT, Retail) and put it in the "brand_type" field.
        - Answer using the BRAND CONTEXT and Strategic Pillars (Market Share, SEO, Sentiment).
        - If the user uses pronouns, resolve them using context.
        - !! IMPORTANT: Do NOT include raw URLs/Links. Summarize the source instead.
        - You MUST output your response in valid JSON format.
        - The "answer" must be a SINGLE STRING. Escape any double quotes (\") inside.

        [[ MANDATORY JSON FORMAT ]]
        {{
            "brand_type": "Detected Industry (e.g. SaaS, Fintech, etc.)",
            "answer": "Your expert strategic analysis here..."
        }}
        """
        
        messages.append({"role": "user", "content": prompt})

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.7
            )
            res_content = json.loads(response.choices[0].message.content)
            
            # Log the AI Response
            mlflow.log_text(res_content.get("answer", ""), "ai_response.txt")
            
            return res_content
        except Exception as e:
            mlflow.log_param("error", str(e))
            print(f"Error in LLM Generation: {e}")
            return {
                "answer": "I encountered an error processing your brand data."
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
