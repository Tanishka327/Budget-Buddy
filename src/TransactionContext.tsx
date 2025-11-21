import React, { createContext, useContext, useState } from "react";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  date: string;
};

type TransactionContextType = {
  transactions: Transaction[];
  insertTransaction: (tx: Omit<Transaction, "id">) => void;
};

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function insertTransaction(tx: Omit<Transaction, "id">) {
    const newTx = {
      ...tx,
      id: Math.random().toString(36).slice(2),
    };

    setTransactions((prev) => [...prev, newTx]);
  }

  return (
    <TransactionContext.Provider value={{ transactions, insertTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used inside a TransactionProvider");
  }
  return context;
}
