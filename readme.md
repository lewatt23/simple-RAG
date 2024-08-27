# Simple RAG

This project is a simple Retrieval-Augmented Generation (RAG) system that uses OpenAI, LangChain, and Express on the backend, while the frontend is built with Next.js and Tailwind CSS. It also includes a topic modeling component that leverages Python and Pinecone for topic extraction and metadata management.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/) for your operating system.
- **Docker Compose**: Docker Compose is typically included with Docker Desktop, but you can also install it separately if needed. [Install Docker Compose](https://docs.docker.com/compose/install/).

## Project Structure

Here's a brief overview of the project's structure:

```bash
.
├── ai-enhanced-backend
│   ├── .env
│   ├── Dockerfile.backend
│   ├── package.json
│   ├── yarn.lock
│   ├── build/
│   ├── src/
│   ├── topic_modeling.py
│   └── requirements.txt
├── ai-enhanced-frontend
│   ├── Dockerfile.frontend
│   ├── package.json
│   ├── yarn.lock
│   ├── public/
│   └── src/
├── topic_modeling
│   ├── Dockerfile
│   ├── topic_modeling.py
│   ├── requirements.txt
│   └── README.md
├── docker-compose.yml
└── README.md

```

- **`ai-enhanced-backend/`**: Contains the backend application files, including the `.env` file, source code, and the `Dockerfile.backend`. It also includes the Python script for topic modeling (`topic_modeling.py`).
- **`ai-enhanced-frontend/`**: Contains the frontend application files, including the `Dockerfile.frontend`, source code, and public assets.
- **`topic_modeling/`**: Contains the Python script and Dockerfile for topic modeling. This component handles the extraction of topics from documents and updates Pinecone metadata.

- **`docker-compose.yml`**: Defines and manages the services, networks, and volumes required for your project.
- **`README.md`**: This file, providing instructions on how to set up and run the project.

## Environment Variables

The backend service relies on environment variables defined in the `.env` file located in the `ai-enhanced-backend` directory. Ensure that the `.env` file contains all the necessary environment variables. Here’s how the `.env` file might look like:

**`PINECONE_API_KEY=your_pinecone_api_key`** **`OPENAI_API_KEY=your_pinecone_openai_key`** **`PINECONE_INDEX=your_pinecone_index_name`**

**`MEDIA_SERVE_URL=""`**
**`APP_SERVING_URL="4040/media"`**
**`SERVER_PORT="4040"`**
**`DOMAIN="localhost"`**
**`MAIN="media"`**
**`NODE_ENV="production"`**

## Setup and Installation

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/yourproject.git
cd yourproject
```

### 2. Set Up Environment Variables

Ensure that the .env file is properly configured in the ai-enhanced-backend directory. This file contains sensitive information like database credentials and API keys, so make sure it is kept secure and is not committed to version control.

### 3. Build and Run the Containers

With Docker and Docker Compose installed, you can now build and run the services using the following command:

```bash
docker-compose up --build

```

### 4. Access the Applications

Once the containers are running, you can access the applications via your web browser:

    Frontend: http://localhost:3000
    Backend: http://localhost:4040

These URLs are based on the ports exposed by the services in the docker-compose.yml file.

### 5. Running the Topic Modeling Service Manually

The topic modeling service is not part of the docker-compose setup and needs to be run manually inside a Docker container. Here’s how you can do that:

1. Build the Topic Modeling Docker Image:

Navigate to the topic_modeling directory and build the Docker image:

```bash

cd topic_modeling
docker build -t topic-modeling-app .
```

2. Run the Topic Modeling Container:

Run the container with the necessary environment variables:

```bash

docker run -e PINECONE_API_KEY=your_pinecone_api_key \
           -e PINECONE_INDEX_NAME=your_pinecone_index_name \
           topic-modeling-app
```

This command runs the topic modeling service, which processes documents, performs topic modeling using a Python script, and updates the document metadata in Pinecone.

### Approach and Implementation

In this project, I utilized LangChain on the backend with OpenAI to build a Retrieval-Augmented Generation (RAG) system. LangChain facilitated seamless integration, making it easier to manage tasks like document retrieval and natural language processing.
Benefits of Using LangChain

- Simplified Integration: Streamlined the connection with OpenAI, reducing development complexity.
- Modular Design: Allowed easy integration of various components, keeping the codebase clean and maintainable.
- Scalability: Supported efficient processing of large data volumes and complex queries.

### Challenges Faced

- Confidence Scores: I faced difficulties in extracting reliable confidence scores from the LangChain-OpenAI integration.
- Python Script: Implementing the Python script for topic modeling took more time than expected due to integration complexities.

## Troubleshooting

- Port Conflicts: If the ports 3000 (frontend) or 4040 (backend) are already in use on your machine, you'll need to stop the other processes using those ports or change the exposed ports in the docker-compose.yml file.
- Environment Variables: Ensure your .env file is correctly configured and located in the ai-enhanced-backend directory. Missing or incorrect environment variables can cause the backend service to fail.
