class Config:
    CSV_PATH = "brand_dataset.csv"  # Ensure the CSV is in the backend folder
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    CHROMA_DB_DIR = "./chroma_db"
    COLLECTION_NAME = "brand_dataset"
    CHUNK_SIZE = 500
    CHUNK_OVERLAP = 50
    MAX_SEARCH_RESULTS = 20
    LLM_MODEL = "llama-3.1-8b-instant"
    LLM_TEMPERATURE = 0.0
    
    PROMPT_TEMPLATE = """You are a Brand Data Analyst. Use ONLY the provided brand information to answer the user's question.
    
    Rules:
    1. Do NOT use outside knowledge.
    2. Incorporate the provided sentiment scores, market share, and SEO metrics into your answer if relevant.
    3. Be precise with the brand's industry and target audience.
    
    Context:
    {context}
    
    Question: {question}
    
    Answer:"""
