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

        base_guideline = system_instruction if system_instruction else "You are a Brand Coach."
        
        # 🧪 DEBUG MODE: CAG (History) Disabled
        # We only provide the persona and the current query context.
        messages = [{"role": "system", "content": base_guideline}]
        
        # Define context for RAG (even if not using history)
        context = "\n\n".join(context_chunks)

        # Final prompt for normal brand analysis logic (No Greeting-specific branch)
        prompt = f"""
        [[ BRAND CONTEXT ]]
        {context}
        
        [[ USER QUESTION ]]
        {query}
        [[ INSTRUCTIONS ]]
        - You MUST act as the personality defined in the system prompt.
        - Do NOT output raw JSON data or objects in your answer.
        - Provide your response as a single, conversational text string inside the "answer" key.
        [[ MANDATORY JSON SCHEMA ]]
        {{
            "answer": "Write your conversational response here. Use \\n for line breaks if needed."
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
