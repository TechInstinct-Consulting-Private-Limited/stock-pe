import { useEffect, useMemo, useState } from "react";
import { fetchTransactionHistory } from "../services/walletService";

export function useTransactionHistory() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);
  const filters = [{ id: "ALL", label: "All Txns" }, { id: "CONTESTS", label: "Contest test" }, { id: "DEPOSITS", label: "Deposits" }, { id: "WITHDRAWALS", label: "Withdrawals" }];

  useEffect(() => {
    setIsLoading(true);
    fetchTransactionHistory({ category: activeFilter }).then((result) => {
      if (result.success) setTransactions(result.data);
      setWarning(result.success ? result.warning || "" : result.error || "Transaction history is unavailable.");
      setIsLoading(false);
    });
  }, [activeFilter]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? transactions.filter((item) => `${item.title} ${item.id} ${item.refId}`.toLowerCase().includes(query)) : transactions;
  }, [transactions, searchQuery]);
  return { filters, activeFilter, setActiveFilter, searchQuery, setSearchQuery, transactions: filteredTransactions, isLoading, warning, selectedTxn, setSelectedTxn };
}
