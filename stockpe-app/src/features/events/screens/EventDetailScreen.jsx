import React, { useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { shadows } from "../../../theme";
import { useEventDetail } from "../hooks/useEventDetail";
import { useTradeExecution } from "../hooks/useTradeExecution";
import EventDetailHero from "../components/EventDetailHero";
import ContestRulesView from "../components/ContestRulesView";
import PredictionModalSheet from "../components/PredictionModalSheet";
import OrderSuccessModal from "../components/OrderSuccessModal";
import { usePullToRefresh } from "../../../hooks/usePullToRefresh";

export default function EventDetailScreen({ eventId }) {
  const insets = useSafeAreaInsets();
  const [isTradeSheetVisible, setIsTradeSheetVisible] = useState(false);
  const [isContestInfoVisible, setIsContestInfoVisible] = useState(false);

  const { event, isLoading, error, refreshEvent } = useEventDetail(eventId);
  const { refreshing, onRefresh } = usePullToRefresh(refreshEvent);

  const {
    targetPrice,
    setTargetPrice,
    handleIncrementTarget,
    walletBalance,
    isSuccessModalVisible,
    lastPlacedTrade,
    handlePlaceOrder,
    closeSuccessModal,
    canJoin,
    joinMessage,
  } = useTradeExecution(event);

  const handleConfirmOrder = async () => {
    const result = await handlePlaceOrder();
    if (!result?.error) setIsTradeSheetVisible(false);
    return result;
  };

  if (isLoading || error || !event) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.detailState}>
          <Text style={styles.detailStateText}>
            {isLoading ? "Loading contest details…" : error}
          </Text>
          {!isLoading && (
            <TouchableOpacity style={styles.backToEventsButton} onPress={() => router.back()}>
              <Text style={styles.backToEventsText}>BACK TO EVENTS</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Hero: Spot price, Digital Timer & 4-col metrics */}
          <EventDetailHero event={event} />

          <TouchableOpacity
            style={styles.contestInfoToggle}
            onPress={() => setIsContestInfoVisible((visible) => !visible)}
            activeOpacity={0.75}
          >
            <View>
              <Text style={styles.contestInfoTitle}>CONTEST DETAILS</Text>
              <Text style={styles.contestInfoSub}>How demo prediction and settlement work</Text>
            </View>
            <Ionicons
              name={isContestInfoVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
          {isContestInfoVisible && <ContestRulesView event={event} />}

          {/* Spacer for bottom sticky bar */}
          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Persistent Bottom Sticky Bar (As seen in wireframe) */}
        <View style={[styles.bottomStickyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.stickyHeaderRow}>
            <View style={styles.stickyLeftCol}>
                <Text style={styles.stickyFeeLabel}>DEMO ENTRY</Text>
              <View style={styles.stickyFeeRow}>
                <Text style={styles.stickyFeeInr}>{Number(event?.entryCredits || 0).toLocaleString("en-IN")} {event?.currency === 'DEMO_USDT' ? 'Demo USDT' : 'Credits'}</Text>
                <View style={styles.usdtPillSmall}>
                  <View style={styles.usdtDotSmall}>
                    <Text style={styles.usdtDotText}>₮</Text>
                  </View>
                  <Text style={styles.usdtPillTextSmall}>Non-withdrawable</Text>
                </View>
              </View>
            </View>

            <View style={styles.stickyRightCol}>
              <Text style={styles.stickyWinLabel}>DEMO PRIZE POOL</Text>
              <Text style={styles.stickyWinVal}>{Number(event?.prizePoolCredits || 0).toLocaleString("en-IN")}</Text>
            </View>
          </View>

          {/* Full-width Emerald Green Join Button */}
          <TouchableOpacity
            style={[styles.joinCtaBtn, !canJoin && styles.joinCtaBtnDisabled]}
            onPress={() => canJoin && setIsTradeSheetVisible(true)}
            disabled={!canJoin}
            activeOpacity={0.88}
          >
            <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.joinCtaText}>{joinMessage}</Text>
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
  contestInfoToggle: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F6",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 12,
    marginBottom: 2,
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.sm,
  },
  contestInfoTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: 0.5,
  },
  contestInfoSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 3,
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
  detailState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  detailStateText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  backToEventsButton: {
    backgroundColor: "#00C987",
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backToEventsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  joinCtaBtnDisabled: {
    backgroundColor: "#94A3B8",
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
