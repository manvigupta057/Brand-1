import chromadb
from config import Config

# Configuration — must match what we used in ingest.py
DB_PATH = Config.CHROMA_DB_DIR
COLLECTION_NAME = Config.COLLECTION_NAME

# Connect to the ChromaDB we already built
client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_or_create_collection(name=COLLECTION_NAME)

# Load the embedding model lazily
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        print("\n[AI] Lazy Loading: Initializing SentenceTransformer (this may take a few seconds)...")
        _embedding_model = SentenceTransformer(Config.EMBEDDING_MODEL)
    return _embedding_model


def search_similar(query: str, top_k: int = 5) -> list[str]:
    """
    Takes the user's question, converts it to a vector,
    finds the most similar rows in the healthcare dataset.
    Returns top_k matching text chunks.
    """
    # Convert user query to embedding via getter
    model = get_embedding_model()
    query_embedding = model.encode(query).tolist()

    # Search ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    # Extract matched documents
    matched_docs = results["documents"][0]
    return matched_docs