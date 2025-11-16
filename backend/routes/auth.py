# backend/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import crud
import schemas  # Make sure schemas is imported
from database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ✅ FIX: Change the response_model here
@router.post("/register", response_model=schemas.RegisterResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register new user"""
    existing = crud.get_user_by_email(db, email=user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = crud.create_user(db=db, user=user)
    
    # This return value now matches the new response_model
    return {
        "message": "User registered successfully",
        "user": schemas.UserResponse.model_validate(new_user)
    }

@router.post("/login")
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    existing = crud.get_user_by_email(db, email=credentials.email)
    
    if not existing or not crud.verify_password(credentials.password, existing.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # NOTE: In a real app, you would create and return a JWT token here
    # For now, just returning the user object matches your app's flow
    return {
        "message": "Login successful",
        "user": schemas.UserResponse.model_validate(existing)
    }