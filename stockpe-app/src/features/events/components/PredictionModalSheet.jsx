import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { shadows } from "../../../theme";

export default function PredictionModalSheet({
  event,
  targetPrice,
  onSetTargetPrice,
  onIncrementTarget,
  walletBalance,
  onPlaceOrder,
  onClose,
  bottomInset = 16,
}) {
  const [secondsLeft, setSecondsLeft] = useState(
    Number(event?.secondsUntilLive || event?.secondsUntilClose || 0)
  );
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Robust local state fallback if parent does not provide state
  const spotNumeric = Number(event?.spotNumeric || 0);
  const [localPrice, setLocalPrice] = useState(
    targetPrice ? String(targetPrice) : String(spotNumeric)
  );

  useEffect(() => {
    if (targetPrice) {
      setLocalPrice(String(targetPrice));
    }
  }, [targetPrice]);

  useEffect(() => {
    const deadline = new Date(event?.liveAt || event?.closesAt).getTime();
    const timer = setInterval(() => {
      setSecondsLeft(
        Number.isFinite(deadline) ? Math.max(0, Math.floor((deadline - Date.now()) / 1000)) : 0
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [event?.liveAt, event?.closesAt]);

  const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const entryCredits = Number(event?.entryCredits || 0);
  const hasWalletBalance = Number.isFinite(Number(walletBalance));
  const balanceCredits = hasWalletBalance ? Number(walletBalance) : 0;
  const afterCredits = Math.max(0, balanceCredits - entryCredits);

  const stepVal = Number(event?.priceStep || 1);

  const handlePriceChange = (val) => {
    const sanitized = val.replace(/[^0-9.]/g, "");
    setLocalPrice(sanitized);
    if (typeof onSetTargetPrice === "function") {
      onSetTargetPrice(sanitized);
    }
  };

  const handleStep = (delta) => {
    const current = parseFloat(localPrice) || spotNumeric;
    const next = Math.round((current + delta) * 100) / 100;
    const nextStr = String(next);
    setLocalPrice(nextStr);
    if (typeof onIncrementTarget === "function") {
      onIncrementTarget(delta);
    } else if (typeof onSetTargetPrice === "function") {
      onSetTargetPrice(nextStr);
    }
  };

  const handleConfirm = async () => {
    const predictionValue = Number(localPrice);
    if (!(predictionValue > 0)) {
      setSubmitError("Enter a valid positive closing value.");
      return;
    }
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const result = await onPlaceOrder?.();
      if (result?.error) setSubmitError(result.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cutoffLabel = event?.status === "OPEN" ? "ENTRY CLOSES IN" : "CONTEST ENDS IN";
  const cutoffDate = new Date(event?.liveAt || event?.closesAt);
  const cutoffTime = Number.isFinite(cutoffDate.getTime())
    ? cutoffDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZoneName: "short" })
    : "Schedule unavailable";

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(bottomInset, 20) },
      ]}
    >
      {/* Top Gradient Accent Line */}
      <LinearGradient
        colors={["#00C987", "#6366F1", "#F59E0B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccentBar}
      />

      {/* Header Row: Title & Badges + Close Button */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{event?.title || "NIFTY 50"}</Text>
          <View style={styles.badgesRow}>
            <View style={styles.openBadge}>
              <Text style={styles.openBadgeText}>{event?.status || "OPEN"}</Text>
            </View>
            <View style={styles.usdtBadge}>
              <View style={styles.usdtDot}>
                <Text style={styles.usdtDotText}>₮</Text>
              </View>
              <Text style={styles.usdtBadgeText}>
                Demo credits
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Benchmark Box: CURRENT VALUE */}
      <View style={styles.benchmarkCard}>
        <View style={styles.benchmarkHeaderRow}>
          <Text style={styles.benchmarkLabel}>CURRENT VALUE</Text>
          <Text style={styles.benchmarkTime}>{cutoffTime}</Text>
        </View>

        <Text style={styles.benchmarkPrice}>
          {event?.currentPrice || "—"}
        </Text>

        <Text style={styles.countdownLabel}>{cutoffLabel}</Text>
        <View style={styles.timerRow}>
          <View style={styles.timerPill}>
            <Text style={styles.timerNum}>{hrs}</Text>
            <Text style={styles.timerUnit}>H</Text>
          </View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerPill}>
            <Text style={styles.timerNum}>{mins}</Text>
            <Text style={styles.timerUnit}>M</Text>
          </View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerPill}>
            <Text style={styles.timerNum}>{secs}</Text>
            <Text style={styles.timerUnit}>S</Text>
          </View>
        </View>
      </View>

      {/* Input Section: YOUR PREDICTION — CLOSING VALUE */}
      <View style={styles.predictionSection}>
        <Text style={styles.sectionLabel}>
          YOUR PREDICTION — CLOSING VALUE
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.priceInput}
            value={localPrice}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
            placeholder="Enter value"
            placeholderTextColor="#94A3B8"
            selectTextOnFocus
          />

          {/* Stepper Buttons (Up / Down) */}
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperUpBtn}
              onPress={() => handleStep(stepVal)}
              activeOpacity={0.7}
            >
              <Ionicons name="caret-up" size={13} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.stepperDivider} />
            <TouchableOpacity
              style={styles.stepperDownBtn}
              onPress={() => handleStep(-stepVal)}
              activeOpacity={0.7}
            >
              <Ionicons name="caret-down" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.rangeSubtext}>Enter your own estimated closing value.</Text>
      </View>

      {/* Financial & Balance Breakdown Box */}
      <View style={styles.breakdownCard}>
        {/* Row 1: Entry Fee */}
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Demo Entry</Text>
          <View style={styles.breakdownRight}>
            <Text style={styles.breakdownInr}>{entryCredits.toLocaleString("en-IN")} Credits</Text>
            <View style={styles.breakdownPill}>
              <View style={styles.usdtMiniDot}>
                <Text style={styles.usdtMiniText}>₮</Text>
              </View>
              <Text style={styles.breakdownUsdt}>Non-withdrawable</Text>
            </View>
          </View>
        </View>

        <View style={styles.breakdownDivider} />

        {/* Row 2: Balance */}
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Demo Balance</Text>
          <View style={styles.breakdownRight}>
            <Text style={styles.breakdownInr}>
              {hasWalletBalance ? `${balanceCredits.toLocaleString("en-IN")} Credits` : "Loading…"}
            </Text>
            <View style={styles.breakdownPill}>
              <View style={styles.usdtMiniDot}>
                <Text style={styles.usdtMiniText}>₮</Text>
              </View>
              <Text style={styles.breakdownUsdt}>Demo only</Text>
            </View>
          </View>
        </View>

        <View style={styles.breakdownDivider} />

        {/* Row 3: After */}
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>After entry</Text>
          <View style={styles.breakdownRight}>
            <Text style={styles.breakdownInr}>
              {hasWalletBalance ? `${afterCredits.toLocaleString("en-IN")} Credits` : "—"}
            </Text>
            <View style={styles.breakdownPill}>
              <View style={styles.usdtMiniDot}>
                <Text style={styles.usdtMiniText}>₮</Text>
              </View>
              <Text style={styles.breakdownUsdt}>Demo only</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Primary Submit CTA Button */}
      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
      <Text style={styles.submitHint}>One prediction per user. It is locked after submission.</Text>
      <TouchableOpacity
        style={[styles.submitCtaBtn, isSubmitting && styles.submitCtaBtnDisabled]}
        onPress={handleConfirm}
        disabled={isSubmitting}
        activeOpacity={0.88}
      >
        <Text style={styles.submitCtaText}>{isSubmitting ? "SUBMITTING…" : "SUBMIT PREDICTION"}</Text>
        <Ionicons name="flash" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 0,
    ...shadows.lg,
    overflow: "hidden",
  },
  topAccentBar: {
    height: 4,
    width: "100%",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {},
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.4,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  openBadge: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  openBadgeText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#00C987",
    letterSpacing: 0.5,
  },
  usdtBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  usdtDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  usdtDotText: {
    fontSize: 7.5,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 9,
  },
  usdtBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#059669",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  benchmarkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 18,
    ...shadows.sm,
  },
  benchmarkHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  benchmarkLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  benchmarkTime: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },
  benchmarkPrice: {
    fontSize: 28,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.7,
    marginTop: 10,
    marginBottom: 6,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
  },
  timerNum: {
    fontSize: 14,
    fontWeight: "900",
    color: "#F59E0B",
  },
  timerUnit: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#94A3B8",
  },
  timerColon: {
    fontSize: 12,
    fontWeight: "900",
    color: "#CBD5E1",
  },
  predictionSection: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FFFC",
    borderWidth: 1.5,
    borderColor: "#00C987",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  priceInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: "900",
    color: "#071329",
    letterSpacing: -0.5,
    padding: 0,
  },
  stepperContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    width: 28,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  stepperUpBtn: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperDivider: {
    height: 1,
    width: 18,
    backgroundColor: "#334155",
  },
  stepperDownBtn: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  rangeSubtext: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 6,
  },
  breakdownCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
  },
  breakdownRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownInr: {
    fontSize: 14,
    fontWeight: "900",
    color: "#071329",
  },
  breakdownPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  usdtMiniDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00C987",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },
  usdtMiniText: {
    fontSize: 6.5,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 8,
  },
  breakdownUsdt: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 6,
  },
  submitCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00C987",
    borderRadius: 18,
    paddingVertical: 16,
    ...shadows.md,
  },
  submitCtaBtnDisabled: {
    opacity: 0.65,
  },
  submitCtaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  submitHint: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  submitError: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
});
