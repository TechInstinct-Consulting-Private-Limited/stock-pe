import { useState, useEffect, useMemo } from "react";
import {
  FAQ_CATEGORIES,
  FAQ_DATA,
  fetchFaqs,
  submitSupportTicket,
} from "../services/supportService";

export function useHelpSupport() {
  const [categories] = useState(FAQ_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState(FAQ_DATA);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ticket Modal Form State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("DEPOSITS");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketResult, setTicketResult] = useState(null);
  const [ticketError, setTicketError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetchFaqs({ category: activeCategory }).then((res) => {
      setIsLoading(false);
      if (res.success) setFaqs(res.data);
    });
  }, [activeCategory]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const handleToggleFaq = (id) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketError("Please enter both subject and message");
      return;
    }
    setTicketError("");
    setIsSubmittingTicket(true);

    const res = await submitSupportTicket({
      category: ticketCategory,
      subject: ticketSubject.trim(),
      message: ticketMessage.trim(),
    });

    setIsSubmittingTicket(false);

    if (res.success) {
      setTicketResult(res.data);
      setTicketSubject("");
      setTicketMessage("");
    } else {
      setTicketError(res.error || "Failed to submit ticket");
    }
  };

  const handleCloseTicketModal = () => {
    setShowTicketModal(false);
    setTicketResult(null);
    setTicketError("");
  };

  return {
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    faqs: filteredFaqs,
    expandedFaqId,
    handleToggleFaq,
    isLoading,
    showTicketModal,
    setShowTicketModal,
    ticketSubject,
    setTicketSubject,
    ticketMessage,
    setTicketMessage,
    ticketCategory,
    setTicketCategory,
    isSubmittingTicket,
    ticketResult,
    ticketError,
    handleCreateTicket,
    handleCloseTicketModal,
  };
}
