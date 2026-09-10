import React from "react";
import { useLocalSearchParams } from "expo-router";
import ContestDetailScreen from "../../src/sections/contests/ContestDetailScreen";

export default function ContestDetailRoute() {
  const { id } = useLocalSearchParams();
  return <ContestDetailScreen contestId={id} />;
}
