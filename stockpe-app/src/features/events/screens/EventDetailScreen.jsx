import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, shadows, spacing, typography } from "../../../theme";
import { useEventDetail } from "../hooks/useEventDetail";
import { useTradeExecution } from "../hooks/useTradeExecution";
import EventDetailHero from "../components/EventDetailHero";
import PrizeDistributionView from "../components/PrizeDistributionView";
import ContestRulesView from "../components/ContestRulesView";
import LiveLeaderboardView from "../components/LiveLeaderboardView";
import PredictionModalSheet from "../components/PredictionModalSheet";
import OrderSuccessModal from "../components/OrderSuccessModal";

export default function EventDetailScreen({ eventId }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("prizes"); // "prizes" | "rules" | "board"
  const [isTradeSheetVisible, setIsTradeSheetVisible] = useState(false);

  const { event } = useEventDetail(eventId);

  const {
    tradeMode,
    setTradeMode,
    targetPrice,
    setTargetPrice,
    handleIncrementTarget,
    selectedOption,
    setSelectedOption,
    quantity,
    setQuantity,
    metrics,
    walletBalance,
    isSuccessModalVisible,
    lastPlacedTrade,
    handlePlaceOrder,
    closeSuccessModal,
  } = useTradeExecution(event);

  const tabs = [
    { id: "prizes", label: "PRIZES", icon: "🏆" },
    { id: "rules", label: "RULES", icon: "📋" },
    { id: "board", label: "BOARD", icon: "📊" },
  ];

  const handleConfirmOrder = () => {
    handlePlaceOrder();
    setIsTradeSheetVisible(false);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Hero: Spot price, Digital Timer & 4-col metrics */}
          <EventDetailHero event={event} />

          {/* 3 Main Tabs: PRIZES | RULES | BOARD */}
          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tabIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive && styles.tabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isActive && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Views */}
          {activeTab === "prizes" && <PrizeDistributionView event={event} />}
          {activeTab === "rules" && <ContestRulesView event={event} />}
          {activeTab === "board" && <LiveLeaderboardView event={event} />}

          {/* Spacer for bottom sticky bar */}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Persistent Bottom Sticky Bar (As seen in wireframe) */}
        <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.stickyHeaderRow}>
            <View style={styles.stickyLeftCol}>
              <Text style={styles.stickyFeeLabel}>ENTRY FEE</Text>
              <View style={styles.stickyFeeRow}>
                <Text style={styles.stickyFeeInr}>{event?.entryInr || "₹199"}</Text>
                <View style={styles.usdtPillSmall}>
                  <View style={styles.usdtDotSmall}>
                    <Text style={styles.usdtDotText}>₮</Text>
                  </View>
                  <Text style={styles.usdtPillTextSmall}>
                    {event?.entryUsdt || "2.71 USDT"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.stickyRightCol}>
              <Text style={styles.stickyWinLabel}>WIN UP TO</Text>
              <Text style={styles.stickyWinVal}>₹400K</Text>
            </View>
          </View>

          {/* Full-width Emerald Green Join Button */}
          <TouchableOpacity
            style={styles.joinCtaBtn}
            onPress={() => setIsTradeSheetVisible(true)}
            activeOpacity={0.88}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.joinCtaText}>JOIN CONTEST</Text>
          </TouchableOpacity>
        </View>

        {/* Target Price Prediction & Trade Action Modal (Wireframe Matched) */}
        <Modal
          visible={isTradeSheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsTradeSheetVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsTradeSheetVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ width: "100%" }}
              onPress={(e) => e.stopPropagation()}
            >
              <PredictionModalSheet
                event={event}
                targetPrice={targetPrice}
                onSetTargetPrice={setTargetPrice}
                onIncrementTarget={handleIncrementTarget}
                walletBalance={walletBalance}
                onPlaceOrder={handleConfirmOrder}
                onClose={() => setIsTradeSheetVisible(false)}
                bottomInset={insets.bottom}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Order Success Modal */}
        <OrderSuccessModal
          visible={isSuccessModalVisible}
          trade={lastPlacedTrade}
          onClose={closeSuccessModal}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 4,
    ...shadows.sm,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    position: "relative",
  },
  tabBtnActive: {},
  tabIcon: {
    fontSize: 13,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: "#00C987",
    fontWeight: "900",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: "#00C987",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bottomStickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
    paddingHorizontal: 18,
    paddingTop: 12,
    ...shadows.lg,
  },
  stickyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  stickyLeftCol: {},
  stickyFeeLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  stickyFeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  stickyFeeInr: {
    fontSize: 20,
    fontWeight: "900",
    color: "#071329",
  },
  usdtPillSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  usdtDotSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  usdtDotText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 9,
  },
  usdtPillTextSmall: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
  },
  stickyRightCol: {
    alignItems: "flex-end",
  },
  stickyWinLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  stickyWinVal: {
    fontSize: 20,
    fontWeight: "900",
    color: "#F59E0B",
  },
  joinCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00C987",
    borderRadius: 16,
    paddingVertical: 14,
    ...shadows.md,
  },
  joinCtaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 19, 41, 0.45)",
    justifyContent: "flex-end",
  },
});
