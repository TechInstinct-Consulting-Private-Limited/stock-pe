import { useCallback, useEffect, useState } from "react";
import { fetchProfileData } from "../services/profileService";

export function useProfileSummary() {
  const [profile, setProfile] = useState(null);

  const refreshProfile = useCallback(async () => {
    const response = await fetchProfileData();
    if (response.success) setProfile(response.data);
    return response;
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return { profile, refreshProfile };
}
