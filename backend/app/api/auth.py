from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.database import get_supabase
from app.core.security import create_access_token
import bcrypt

router = APIRouter()

class RegisterRequest(BaseModel):
    student_id: str
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(data: RegisterRequest):
    supabase = get_supabase()
    
    # Hash the password
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    
    try:
        result = supabase.table("users").insert({
            "student_id": data.student_id,
            "full_name": data.full_name,
            "email": data.email,
            "password_hash": hashed
        }).execute()
        
        return {"message": "Account created successfully!"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(data: LoginRequest):
    supabase = get_supabase()
    
    try:
        result = supabase.table("users").select("*").eq("email", data.email).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = result.data[0]
        
        # Check password
        if not bcrypt.checkpw(data.password.encode(), user["password_hash"].encode()):
            raise HTTPException(status_code=401, detail="Invalid password")
        
        # Create token
        token = create_access_token({"sub": user["id"], "email": user["email"]})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "full_name": user["full_name"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))