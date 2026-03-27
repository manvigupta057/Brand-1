import pandas as pd
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client for code generation
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

# Load the dataset once
CSV_PATH = "brand_dataset.csv"
if os.path.exists(CSV_PATH):
    df = pd.read_csv(CSV_PATH)
    print(f"Pandas Engine: Loaded {len(df)} records.")
else:
    df = pd.DataFrame()
    print("Warning: CSV not found for Pandas Engine.")

def execute_data_query(query: str) -> str:
    """
    Translates natural language to Pandas code, executes it, and formats it naturally.
    """
    if df.empty:
        return "Dataset not loaded."

    columns = list(df.columns)
    
    prompt = f"""You are a Python expert focused on Pandas.
    The user has a DataFrame 'df' with these columns: {columns}
    
    Translate the user's natural language question into a SINGLE LINE of Python code that evaluates to the answer from 'df'.
    
    Rules:
    1. Respond ONLY with the raw python code string. No explanations, no markdown blocks.
    2. Example for "count": len(df[...])
    3. Example for "list names": df[...]['brand_name'].tolist()
    
    Question: {query}
    Code:"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0
    )

    code = response.choices[0].message.content.strip().replace("```python", "").replace("```", "").strip()
    
    try:
        # Execute the generated code on the 'df' variable
        raw_result = eval(code)
        
        # Protect against Pandas Series/DataFrame printing issues confusing the LLM
        if hasattr(raw_result, "tolist") and not hasattr(raw_result, "columns"):
            raw_result = raw_result.tolist()
        elif hasattr(raw_result, "to_dict"):
            raw_result = raw_result.to_dict(orient="records")
        
        # Step 2: Format naturally
        format_prompt = f"""The user asked: "{query}"
        The exact data result fetched from the database is: {raw_result}
        
        Write a very concise, natural language response providing this data to the user. Do not explain the code."""
        
        format_response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": format_prompt}],
            temperature=0.5
        )
        return format_response.choices[0].message.content.strip()
        
    except Exception as e:
        return f"Sorry, I couldn't execute analytics for that query. (Error: {e})"
