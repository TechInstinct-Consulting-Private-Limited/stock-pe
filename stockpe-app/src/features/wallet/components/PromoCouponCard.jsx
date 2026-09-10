import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PromoCouponCard({
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponError,
  isApplyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  promoCoupons,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>PROMO CODE & OFFERS</Text>
        {appliedCoupon && (
          <View style={styles.appliedBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#00C987" />
            <Text style={styles.appliedBadgeText}>APPLIED</Text>
          </View>
        )}
      </View>

      {appliedCoupon ? (
        <View style={styles.appliedCard}>
          <View style={styles.appliedInfo}>
            <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
            <Text style={styles.appliedTitle}>{appliedCoupon.title}</Text>
            <Text style={styles.appliedDesc}>
              Bonus: +₹
              {appliedCoupon.flatBonusInr ||
                appliedCoupon.calculatedBonus ||
                appliedCoupon.maxBonusInr ||
                0}{" "}
              Cash
            </Text>
          </View>
          <TouchableOpacity
            onPress={onRemoveCoupon}
            style={styles.removeBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.inputRow}>
            <Ionicons name="pricetag-outline" size={18} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="ENTER COUPON CODE"
              placeholderTextColor="#94A3B8"
              value={couponCode}
              onChangeText={(t) => setCouponCode(t.toUpperCase())}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              onPress={() => onApplyCoupon(couponCode)}
              disabled={isApplyingCoupon || !couponCode.trim()}
              style={[
                styles.applyBtn,
                (!couponCode.trim() || isApplyingCoupon) &&
                  styles.applyBtnDisabled,
              ]}
              activeOpacity={0.8}
            >
              {isApplyingCoupon ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.applyBtnText}>APPLY</Text>
              )}
            </TouchableOpacity>
          </View>

          {couponError ? (
            <Text style={styles.errorText}>{couponError}</Text>
          ) : null}

          {/* Available coupons chips */}
          <View style={styles.availableCouponsContainer}>
            <Text style={styles.availableLabel}>AVAILABLE OFFERS:</Text>
            <View style={styles.couponChips}>
              {promoCoupons.map((coupon) => (
                <TouchableOpacity
                  key={coupon.code}
                  onPress={() => onApplyCoupon(coupon.code)}
                  style={styles.couponChip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.couponChipCode}>{coupon.code}</Text>
                  <Text style={styles.couponChipSub}>
                    {coupon.flatBonusInr ? `₹${coupon.flatBonusInr} Extra` : `${coupon.discountPercent}% Bonus`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  appliedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  appliedBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#00C987",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.5,
    padding: 0,
  },
  applyBtn: {
    backgroundColor: "#00C987",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyBtnDisabled: {
    backgroundColor: "#CBD5E1",
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11.5,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
  },
  appliedCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E6FBF3",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    padding: 14,
  },
  appliedInfo: {
    flex: 1,
  },
  appliedCode: {
    fontSize: 14,
    fontWeight: "900",
    color: "#00C987",
    letterSpacing: 0.6,
  },
  appliedTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  appliedDesc: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#059669",
    marginTop: 2,
  },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  removeBtnText: {
    color: "#EF4444",
    fontSize: 11.5,
    fontWeight: "800",
  },
  availableCouponsContainer: {
    marginTop: 14,
  },
  availableLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  couponChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  couponChip: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  couponChipCode: {
    fontSize: 11.5,
    fontWeight: "900",
    color: "#0F172A",
  },
  couponChipSub: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#00C987",
  },
});
