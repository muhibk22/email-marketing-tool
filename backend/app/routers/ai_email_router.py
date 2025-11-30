# app/routers/ai_email_router.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user_swagger
import openai
from decouple import config
import json
import re

router = APIRouter(prefix="/ai-email", tags=["AI Email"])

openai.api_key = config("OPENAI_API_KEY")

# Request model
class AIEmailRequest(BaseModel):
    subject_hint: str | None = None
    tone: str | None = "professional"  # professional, friendly, witty, persuasive
    audience: str | None = None       # target audience
    key_points: list[str] | None = []  # optional key points to include

# Response model
class AIEmailResponse(BaseModel):
    subject: str
    body: str

@router.post("/generate", response_model=AIEmailResponse)
async def generate_email(
    data: AIEmailRequest,
    current_user=Depends(get_current_user_swagger)
):
    """
    Generate a marketing / promotional email using GPT-4o-mini
    """

    system_prompt = (
        "You are a top marketing email copywriter. "
        "Your task is to write emails that are highly attractive, persuasive, and convert readers into customers. "
        "Keep the tone according to the user's input and include key points if provided. "
        "You MUST respond with a valid JSON object containing 'subject' and 'body' fields. "
        "The 'subject' should be a plain text string without any prefixes like 'Subject:' or 'Subject Line:'. "
        "The 'body' should be complete, valid HTML email content with proper structure."
    )

    user_prompt = (
        f"Subject hint: {data.subject_hint}\n"
        f"Tone: {data.tone}\n"
        f"Audience: {data.audience}\n"
        f"Key points: {', '.join(data.key_points) if data.key_points else 'None'}\n\n"
        "Generate a professional marketing email. Respond ONLY with a JSON object in this exact format:\n"
        "{\n"
        '  "subject": "Your compelling subject line here",\n'
        '  "body": "<html><head>...</head><body>...complete HTML email here...</body></html>"\n'
        "}\n"
        "Do not include any other text, explanations, markdown formatting, or content outside of this JSON structure."
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )

        message = response.choices[0].message.content
        
        # Parse JSON response
        try:
            parsed = json.loads(message)
            subject = parsed.get("subject", "").strip()
            body = parsed.get("body", "").strip()
            
            # Fallback if parsing fails
            if not subject or not body:
                raise ValueError("Missing subject or body in response")
                
        except (json.JSONDecodeError, ValueError) as parse_error:
            # Fallback parsing for non-JSON responses
            print(f"JSON parsing failed: {parse_error}. Attempting fallback parsing.")
            
            # Try to extract subject and body using regex
            subject_match = re.search(r'"subject"\s*:\s*"([^"]+)"', message)
            body_match = re.search(r'"body"\s*:\s*"([\s\S]+)"', message)
            
            if subject_match and body_match:
                subject = subject_match.group(1).strip()
                body = body_match.group(1).strip()
            else:
                # Last resort: use hint as subject and entire message as body
                subject = data.subject_hint or "Marketing Email"
                body = message

        return AIEmailResponse(subject=subject, body=body)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
