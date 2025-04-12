import os
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, UnstructuredPDFLoader
from langchain_community.vectorstores.pgvector import PGVector
from langchain_experimental.text_splitter import SemanticChunker
from langchain_community.embeddings import HuggingFaceEmbeddings
load_dotenv()
from langchain_community.embeddings import HuggingFaceEmbeddings


# Cargar PDFs
loader = DirectoryLoader(
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../pdf-documents")),
    glob="**/*.pdf",
    use_multithreading=True,
    show_progress=True,
    max_concurrency=10,
    loader_cls=UnstructuredPDFLoader,
)
docs_nested = loader.load()
docs = [doc for sublist in docs_nested for doc in (sublist if isinstance(sublist, list) else [sublist])]

# Embeddings y splitter
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
text_splitter = SemanticChunker(embeddings=embeddings)
chunks = text_splitter.split_documents(docs)

postgres_url = os.getenv("POSTGRES_URL") 

# ...

vector_store = PGVector(
    collection_name="pdf_vectors_v1",
    connection_string=postgres_url,
    embedding_function=embeddings,
    pre_delete_collection=False,
    create_extension=False
)

# Verificar si ya existen vectores antes de cargar
QUERY_TEST = "test"

if len(vector_store.similarity_search(QUERY_TEST, k=1)) == 0:
    print("Cargando documentos al vector store...")
    vector_store.add_documents(chunks)
else:
    print("Los vectores ya existen. No se cargan duplicados.")