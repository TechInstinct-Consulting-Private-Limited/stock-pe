import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, spacing, typography } from "../../theme";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  step = 5,
  presets = [10, 50, 100],
  unit = "Qty",
}) {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(value + step);
  };

  const handlePreset = (amount) => {
    onChange(value + amount);
  };

  return (
    <View style={styles.container}>
      {/* Controls */}
      <View style={styles.stepperContainer}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={handleDecrement}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={16} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.valueBox}>
          <Text style={styles.valueText}>
            {value} {unit}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={handleIncrement}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Preset Chips */}
      {presets && presets.length > 0 && (
        <View style={styles.presetsRow}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p}
              style={styles.presetChip}
              onPress={() => handlePreset(p)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetText}>+{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  valueBox: {
    paddingHorizontal: spacing.md,
  },
  valueText: {
    fontSize: typography.base,
    fontWeight: typography.black,
    color: colors.textPrimary,
  },
  presetsRow: {
    flexDirection: "row",
    gap: spacing.xs + 2,
  },
  presetChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.borderLight,
    borderRadius: radii.sm + 2,
  },
  presetText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.textSecondary,
  },
});
