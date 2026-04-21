# FinSight AI

FinSight AI is a financial analysis platform that processes transaction data, categorizes expenses using a machine learning model, and provides meaningful insights along with an AI-powered assistant for user queries.

The project is designed to demonstrate the integration of data processing, machine learning, and generative AI within a practical fintech use case.

---

## Overview

The application allows users to upload financial transaction data and analyze it through a structured pipeline. Transactions are categorized automatically using a trained model, followed by generation of insights and visual summaries.

An integrated AI assistant enables users to interact with their financial data using natural language queries.

---

## Features

- Upload and process transaction datasets
- Automatic expense categorization using a machine learning model
- Data analysis and summary generation
- Visualization of financial patterns using charts
- AI assistant for answering finance-related queries
- Authentication and multi-page frontend interface

---

## Tech Stack

### Frontend
- React (Vite)
- TypeScript
- Tailwind CSS

### Backend
- FastAPI (Python)
- Pandas for data handling
- Scikit-learn for machine learning
- Matplotlib for visualization
- OpenAI API for AI assistant functionality

---

## Machine Learning Approach

The project uses a lightweight supervised learning approach for transaction categorization.

- Text data is converted into numerical form using TF-IDF vectorization
- A Multinomial Naive Bayes classifier is trained on a curated dataset
- The model predicts categories such as Food, Transport, Bills, Shopping, etc.

This approach keeps the system efficient while still demonstrating real-world applicability.

---

## API Endpoints

The backend exposes the following endpoints:

- `/upload`  
  Accepts transaction data input

- `/analyze`  
  Processes and categorizes transactions

- `/insights`  
  Generates summary insights based on data

- `/charts/{kind}`  
  Returns chart visualizations

- `/chat`  
  Handles AI-based queries

---

## Project Structure

- `frontend/` (React application)
- `backend/` (FastAPI server and ML model)
- `supabase/` (authentication and configuration)

---

## Running the Project Locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload