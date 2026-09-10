import React from "react";
import { useLocalSearchParams } from "expo-router";
import LiveContestScreen from "../../../src/sections/contests/LiveContestScreen";

export default function LiveContestRoute() {
  const { id } = useLocalSearchParams();
  return <LiveContestScreen contestId={id} />;
}
