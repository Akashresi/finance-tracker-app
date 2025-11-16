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

router.post("/verify-details")
def verify_user_for_reset(details: schemas.UserVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify user's identity before allowing a password reset.
    """
    user = crud.verify_user_details(db, details=details)
    if not user:
        raise HTTPException(status_code=404, detail="User details do not match.")
    
    return {"message": "User verified successfully."}

# ✅ ADD THIS NEW ENDPOINT FOR RESETTING THE PASSWORD
@router.post("/reset-password")
def reset_password(request: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Reset a user's password after they have been verified.
    """
    # Hash the new password before updating
    user = crud.update_user_password_by_email(
        db, 
        email=request.email, 
        new_password=request.new_password
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    return {"message": "Password updated successfully."}