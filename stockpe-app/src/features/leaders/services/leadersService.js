import { getLeaderProfile, getUserFacingError } from "../../../services/api";

export async function fetchPlayerProfile(playerId) {
  try {
    const response = await getLeaderProfile(playerId);
    return { success: true, data: response };
  } catch (error) {
    return { success: false, message: getUserFacingError(error, "Could not load player profile.") };
  }
}
