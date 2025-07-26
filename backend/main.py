"""
FastAPI backend for PDF Q&A system.
- Receives PDF upload
- Parses PDF content
- Accepts user question
- Calls OpenAI API for answer
- Reads OpenAI API key from .env
"""
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
from pydantic import BaseModel
from typing import List
import openai
import os
from dotenv import load_dotenv
import io

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str
    pdf_text: str

@app.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Receives a PDF file, extracts text, and returns it.
    """
    if not file.filename.lower().endswith(".pdf"):
        return JSONResponse(status_code=400, content={"error": "Only PDF files are supported."})
    try:
        contents = await file.read()
        reader = PdfReader(io.BytesIO(contents))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return {"pdf_text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/ask_question/")
async def ask_question(request: QuestionRequest):
    """
    Receives a question and PDF text, returns answer from OpenAI.
    """
    if not openai.api_key:
        return JSONResponse(status_code=500, content={"error": "OpenAI API key not set."})
    prompt = f"PDF内容如下：\n{request.pdf_text}\n\n问题：{request.question}\n请基于PDF内容用中文简明回答。"
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=512,
            temperature=0.2
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)}) 