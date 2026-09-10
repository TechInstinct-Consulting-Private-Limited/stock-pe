import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "../../../theme";
import AppHeader from "../../../components/ui/AppHeader";
import TabPills from "../../../components/ui/TabPills";
import AppCard from "../../../components/ui/AppCard";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { useUserPositions } from "../hooks/useUserPositions";
import PortfolioMetricCard from "../components/PortfolioMetricCard";
import PositionCard from "../components/PositionCard";
import ExitTradeModal from "../components/ExitTradeModal";

export default function MyTradesScreen() {
  const {
    activeTab,
    setActiveTab,
    activeTrades,
    settledTrades,
    portfolio,
    selectedTradeToExit,
    isExitModalVisible,
    openExitModal,
    closeExitModal,
    confirmExitTrade,
  } = useUserPositions();

  const tabs = [
    { id: "ACTIVE", label: "Active Positions", count: activeTrades.length },
    { id: "SETTLED", label: "Settled History", count: settledTrades.length },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <AppHeader
          title="My Positions"
          subtitle={`${activeTrades.length} Active`}
          rightActions={
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push("/(tabs)/events")}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={22} color={colors.primary} />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Portfolio Metric Hero Card */}
          <PortfolioMetricCard portfolio={portfolio} />

          {/* Tab Switcher */}
          <TabPills
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            style={{ marginBottom: spacing.base }}
          />

          {/* Active Positions */}
          {activeTab === "ACTIVE" && (
            <View style={styles.list}>
              {activeTrades.length === 0 ? (
                <AppCard style={styles.emptyCard}>
                  <Ionicons name="sparkles-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyTitle}>No Active Positions</Text>
                  <Text style={styles.emptySubtitle}>
                    Pick your opinions on live stock markets and indices to start earning!
                  </Text>
                  <PrimaryButton
                    title="Explore Markets"
                    onPress={() => router.push("/(tabs)/events")}
                  />
                </AppCard>
              ) : (
                activeTrades.map((trade) => (
                  <PositionCard
                    key={trade.tradeId}
                    trade={trade}
                    onExit={openExitModal}
                  />
                ))
              )}
            </View>
          )}

          {/* Settled Positions */}
          {activeTab === "SETTLED" && (
            <View style={styles.list}>
              {settledTrades.length === 0 ? (
                <AppCard style={styles.emptyCard}>
                  <Ionicons name="time-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyTitle}>No Settled Trades</Text>
                  <Text style={styles.emptySubtitle}>
                    When your active opinion events reach settlement, your payout records will appear here.
                  </Text>
                </AppCard>
              ) : (
                settledTrades.map((trade) => (
                  <PositionCard
                    key={trade.tradeId}
                    trade={trade}
                    onExit={openExitModal}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* Exit Modal */}
        <ExitTradeModal
          visible={isExitModalVisible}
          trade={selectedTradeToExit}
          onConfirm={confirmExitTrade}
          onClose={closeExitModal}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  list: {
    gap: spacing.xs,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.md + 1,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.base,
  },
});
