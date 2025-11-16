# backend/routes/expenses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("/", response_model=list[schemas.ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    """Get all expenses (admin)"""
    return crud.get_all_expenses(db=db)

@router.get("/{user_id}", response_model=list[schemas.ExpenseResponse])
def get_expenses_by_user(user_id: int, db: Session = Depends(get_db)):
    """Get all expenses for a specific user"""
    expenses = crud.get_expenses_by_user(db=db, user_id=user_id)
    # Don't raise 404, just return an empty list. This is better for frontends.
    return expenses

@router.post("/", response_model=schemas.ExpenseResponse)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    """Create a new expense"""
    # Simple check
    if not crud.get_user_by_id(db, user_id=expense.user_id):
         raise HTTPException(status_code=404, detail="User not found")
    return crud.create_expense(db=db, expense=expense)

@router.get("/analysis/{user_id}")
def analyze_expenses(user_id: int, db: Session = Depends(get_db)):
    """Analyze weekly, monthly spending and behavioral savings pattern"""
    if not crud.get_user_by_id(db, user_id=user_id):
         raise HTTPException(status_code=404, detail="User not found")
    
    return crud.analyze_user_expenses(db=db, user_id=user_id)