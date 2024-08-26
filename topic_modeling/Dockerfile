# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Copy the PDF documents to the container

COPY ./media/document /app/documents

# Install Python dependencies
RUN pip install --no-cache-dir pinecone-client scikit-learn PyPDF2

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variables



ENV PINECONE_API_KEY=
ENV PINECONE_INDEX_NAME=

# Run the script when the container launches
CMD ["python", "topic_modeling.py"]
