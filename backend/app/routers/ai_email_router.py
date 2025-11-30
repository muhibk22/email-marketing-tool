# app/routers/ai_email_router.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user_swagger
import openai
from decouple import config

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
        "Keep the tone according to the user's input and include key points if provided."
    )

    user_prompt = (
        f"Subject hint: {data.subject_hint}\n"
        f"Tone: {data.tone}\n"
        f"Audience: {data.audience}\n"
        f"Key points: {', '.join(data.key_points) if data.key_points else 'None'}\n\n"
        "Generate a subject line and a complete HTML email body."
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            max_tokens=500
        )

        message = response.choices[0].message.content

        # Split message into subject and body if possible
        if "Subject:" in message and "Body:" in message:
            parts = message.split("Body:")
            subject = parts[0].replace("Subject:", "").strip()
            body = parts[1].strip()
        else:
            # fallback: treat whole message as body
            subject = data.subject_hint or "Marketing Email"
            body = message

        return AIEmailResponse(subject=subject, body=body)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
