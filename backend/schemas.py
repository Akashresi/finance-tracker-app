# backend/schemas.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date as DateType # ✅ 1. Import 'date' as 'DateType'

# ---------- USER SCHEMAS ----------
class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str
    date_of_birth: Optional[DateType] = None # ✅ Use DateType
    age: Optional[int] = None
    gender: Optional[str] = None

class UserResponse(UserBase):
    id: int
    date_of_birth: Optional[DateType] = None # ✅ Use DateType
    age: Optional[int] = None
    gender: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------- SAVING GOALS SCHEMAS ----------
class SavingGoalBase(BaseModel):
    title: str
    target_amount: float
    user_id: int

class SavingGoalCreate(SavingGoalBase):
    pass

class SavingGoalUpdate(BaseModel):
    saved_amount: float

class SavingGoalResponse(SavingGoalBase):
    id: int
    saved_amount: float
    
    model_config = ConfigDict(from_attributes=True)


# ---------- EXPENSE SCHEMAS ----------
class ExpenseBase(BaseModel):
  category: str
  amount: float
  # ✅ 2. Use the 'DateType' alias for the type hint and the factory
  date: Optional[DateType] = Field(default_factory=DateType.today) 
  user_id: int
  description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ---------- CHATBOT SCHEMAS ----------
class ChatRequest(BaseModel):
    message: str = Field(..., description="User message for chatbot")

class ChatReply(BaseModel):
    reply: str = Field(..., description="Chatbot's generated response")

# ---------- AUTH SCHEMAS ----------
class LoginRequest(BaseModel):
    email: str
    password: str

# ✅ ADD THIS NEW SCHEMA
class RegisterResponse(BaseModel):
    message: str
    user: UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str

# ✅ ADD THIS NEW SCHEMA FOR VERIFICATION
class UserVerifyRequest(BaseModel):
    email: str
    name: str
    date_of_birth: DateType

# ✅ ADD THIS NEW SCHEMA FOR PASSWORD RESET
class PasswordResetRequest(BaseModel):
    email: str  # The email of the user to update
    new_password: str