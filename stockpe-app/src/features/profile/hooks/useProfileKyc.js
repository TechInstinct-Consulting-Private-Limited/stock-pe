import { useEffect, useState } from "react";
import { fetchKycDetails } from "../services/profileService";

export function useProfileKyc() {
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    const response = await fetchKycDetails();
    if (response.success) setKycData(response.data);
    setIsLoading(false);
  };

  useEffect(() => { refresh(); }, []);
  return { kycData, isLoading, refresh };
}
