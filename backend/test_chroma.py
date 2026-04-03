import chromadb
from sentence_transformers import SentenceTransformer

# Connect to the local database
client = chromadb.PersistentClient(path="c:/Users/manvi/Downloads/Major-Project-II-feature-rag-dataset/Major-Project-II-feature-rag-dataset/backend/chroma_db")
collection = client.get_collection(name="brand_analytics")

# Initialize the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Test queries
test_queries = ["ZenFoods", "SummitLabs", "NimbusGlobal", "primeHub"]

for q in test_queries:
    query_embedding = model.encode(q).tolist()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3,
        include=['distances', 'documents']
    )
    print(f"\nQUERY: {q}")
    for doc, dist in zip(results['documents'][0], results['distances'][0]):
        print(f" - [{dist:.4f}] {doc[:100]}...")
