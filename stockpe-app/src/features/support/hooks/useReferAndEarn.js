import { useState, useEffect } from "react";
import {
  REFERRAL_DATA,
  fetchReferralSummary,
} from "../services/supportService";

export function useReferAndEarn() {
  const [data, setData] = useState(REFERRAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchReferralSummary().then((res) => {
      setIsLoading(false);
      if (res.success) setData(res.data);
    });
  }, []);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return {
    data,
    isLoading,
    copied,
    handleCopyCode,
  };
}
