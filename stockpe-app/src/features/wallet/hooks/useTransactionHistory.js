import { useState, useEffect, useMemo } from "react";
import {
  TRANSACTIONS_DATA,
  fetchTransactionHistory,
} from "../services/walletService";

export function useTransactionHistory() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState(TRANSACTIONS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filters = [
    { id: "ALL", label: "All Txns" },
    { id: "DEPOSITS", label: "Deposits" },
    { id: "WITHDRAWALS", label: "Withdrawals" },
    { id: "CONTESTS", label: "Contest Wins" },
    { id: "EVENTS", label: "Trades" },
  ];

  useEffect(() => {
    setIsLoading(true);
    fetchTransactionHistory({ category: activeFilter }).then((res) => {
      setIsLoading(false);
      if (res.success) {
        setTransactions(res.data);
      }
    });
  }, [activeFilter]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        (tx.refId && tx.refId.toLowerCase().includes(q))
    );
  }, [transactions, searchQuery]);

  return {
    filters,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    transactions: filteredTransactions,
    isLoading,
    selectedTxn,
    setSelectedTxn,
  };
}
