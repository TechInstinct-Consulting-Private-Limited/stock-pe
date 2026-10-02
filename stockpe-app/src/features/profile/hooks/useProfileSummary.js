import { useEffect, useState } from "react";
import { fetchProfileData } from "../services/profileService";

export function useProfileSummary() {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    let active = true;
    fetchProfileData().then((response) => { if (active && response.success) setProfile(response.data); });
    return () => { active = false; };
  }, []);
  return profile;
}
