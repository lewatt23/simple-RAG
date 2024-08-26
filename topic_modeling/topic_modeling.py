import os
import pinecone
import logging
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from PyPDF2 import PdfReader

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Pinecone
pc = pinecone.Pinecone(
    api_key=os.getenv('PINECONE_API_KEY')
)

index_name = os.getenv('PINECONE_INDEX_NAME')
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=1536,  # Adjust the dimension as needed
        metric='cosine'  # Choose your preferred metric
    )

index = pc.Index(index_name)

def ingest_documents_from_pdfs(pdf_folder_path):
    documents = []
    for filename in os.listdir(pdf_folder_path):
        if filename.endswith('.pdf'):
            file_path = os.path.join(pdf_folder_path, filename)
            text = extract_text_from_pdf(file_path)
            if text:
                documents.append(text)
    return documents

def extract_text_from_pdf(file_path):
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + " "
        return text.strip()
    except Exception as e:
        logger.error(f"Error reading {file_path}: {e}")
        return None

def perform_topic_modeling(documents, n_topics=3):
    # Convert the documents to a matrix of token counts
    vectorizer = CountVectorizer(stop_words='english')
    X = vectorizer.fit_transform(documents)

    # Fit the LDA model
    lda = LatentDirichletAllocation(n_components=n_topics, random_state=0)
    lda.fit(X)

    # Get the topics for each document
    topics = lda.transform(X)
    feature_names = vectorizer.get_feature_names_out()
    topic_words = []
    for topic_idx, topic in enumerate(lda.components_):
        top_words = [feature_names[i] for i in topic.argsort()[:-n_topics - 1:-1]]
        topic_words.append(top_words)
    return topics, topic_words

def update_pinecone_metadata(topics, topic_words):
    # Update metadata for each document in Pinecone
    for i, (topic_distribution, words) in enumerate(zip(topics, topic_words)):
        doc_id = f"doc_{i}"
        # Convert the topic distribution to a list of strings
        topic_distribution_str = [f"{value:.10f}" for value in topic_distribution]

        metadata = {
            "topics": words,
            "topic_distribution": topic_distribution_str
        }
        
        try:
            index.update(id=doc_id, set_metadata=metadata)
            logger.info(f"Updated document {doc_id} with topics: {words}")
        except Exception as e:
            logger.error(f"Failed to update metadata for {doc_id}: {e}")



if __name__ == "__main__":
    # Use the folder where the PDFs were copied inside the container
    pdf_folder_path = "/app/documents"

    documents = ingest_documents_from_pdfs(pdf_folder_path)
    if not documents:
        logger.error("No documents were found or extracted from the PDFs.")
    else:
        topics, topic_words = perform_topic_modeling(documents)
        update_pinecone_metadata(topics, topic_words)
