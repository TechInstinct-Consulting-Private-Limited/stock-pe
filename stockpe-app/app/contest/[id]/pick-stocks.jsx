import React from "react";
import { useLocalSearchParams } from "expo-router";
import TeamBuilderScreen from "../../../src/sections/contests/TeamBuilderScreen";

export default function PickStocksRoute() {
  const { id } = useLocalSearchParams();
  return <TeamBuilderScreen contestId={id} />;
}
