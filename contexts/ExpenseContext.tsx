// contexts/ExpenseContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback // ✅ Import useCallback
  ,

  useContext,
  useEffect,
  useState
} from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

export type Expense = {
  id?: number;
  user_id: number;
  category: string;
  amount: number;
  description?: string;
  date?: string;
};

type ExpenseContextType = {
  expenses: Expense[];
  fetchExpenses: () => Promise<void>;
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // ✅ FIX: Wrap fetchExpenses in useCallback
  const fetchExpenses = useCallback(async () => {
    if (!user?.id) {
      setExpenses([]);
      return;
    }
    try {
      const res = await api.get(`/expenses/${user.id}`);
      setExpenses(res.data || []);
    } catch (err) {
      console.warn("fetchExpenses error", err);
    }
  }, [user]); // ✅ It only changes when the user changes

  const addExpense = async (e: Omit<Expense, "id">) => {
    try {
      await api.post("/expenses/", e);
      await fetchExpenses();
    } catch (err) {
      console.warn("addExpense error", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]); // ✅ FIX: Add fetchExpenses to the dependency array

  return (
    <ExpenseContext.Provider value={{ expenses, fetchExpenses, addExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpenseProvider");
  return ctx;
}