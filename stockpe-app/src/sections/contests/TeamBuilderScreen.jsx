import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import AppHeader from "../../components/ui/AppHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useTeamBuilder } from "./contestsHook";
import TeamBudgetBar from "./TeamBudgetBar";
import StockPickerRow from "./StockPickerRow";
import CaptainVCSelector from "./CaptainVCSelector";
import TeamPreviewModal from "./TeamPreviewModal";
import ContestSuccessModal from "./ContestSuccessModal";

export default function TeamBuilderScreen({ contestId }) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1); // 1: Pick Stocks | 2: Captain / VC

  const {
    contest,
    stocksCatalog,
    selectedStocks,
    selectedSector,
    setSelectedSector,
    searchQuery,
    setSearchQuery,
    creditsUsed,
    creditsRemaining,
    maxStocksCount,
    longCount,
    shortCount,
    captain,
    viceCaptain,
    selectCaptain,
    selectViceCaptain,
    isStockSelected,
    toggleSelectStock,
    setStockType,
    isTeamValid,
    isPreviewVisible,
    setIsPreviewVisible,
    isSuccessModalVisible,
    setIsSuccessModalVisible,
    joinedEntry,
    handleJoinContest,
  } = useTeamBuilder(contestId);

  const sectors = ["all", "Banking", "IT", "Auto", "Energy", "Pharma"];

  const canProceedToStep2 =
    selectedStocks.length === maxStocksCount && creditsRemaining >= 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <AppHeader
          title={currentStep === 1 ? "Select 6 Stocks" : "Assign C & VC"}
          subtitle={contest?.title}
          onBack={
            currentStep === 2 ? () => setCurrentStep(1) : undefined
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sticky Team Budget / Credit Bar */}
          <TeamBudgetBar
            selectedCount={selectedStocks.length}
            maxCount={maxStocksCount}
            creditsRemaining={creditsRemaining}
            longCount={longCount}
            shortCount={shortCount}
            onOpenPreview={() => setIsPreviewVisible(true)}
          />

          {/* STEP 1: STOCK SELECTION */}
          {currentStep === 1 && (
            <>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={colors.textLight} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search NSE/BSE stocks..."
                  placeholderTextColor={colors.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Sector Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sectorScroll}
                style={styles.sectorContainer}
              >
                {sectors.map((sec) => {
                  const isSelected = selectedSector === sec;
                  return (
                    <TouchableOpacity
                      key={sec}
                      style={[
                        styles.sectorChip,
                        isSelected && styles.sectorChipActive,
                      ]}
                      onPress={() => setSelectedSector(sec)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.sectorText,
                          isSelected && styles.sectorTextActive,
                        ]}
                      >
                        {sec.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Stock Rows */}
              <View style={styles.stocksList}>
                {stocksCatalog.map((stock) => {
                  const isSelected = isStockSelected(stock.symbol);
                  const selectedObj = selectedStocks.find(
                    (s) => s.symbol === stock.symbol
                  );
                  return (
                    <StockPickerRow
                      key={stock.symbol}
                      stock={stock}
                      isSelected={isSelected}
                      selectedType={selectedObj?.type || "LONG"}
                      onToggleSelect={toggleSelectStock}
                      onSetType={setStockType}
                    />
                  );
                })}
              </View>
            </>
          )}

          {/* STEP 2: CAPTAIN & VICE-CAPTAIN SELECTION */}
          {currentStep === 2 && (
            <CaptainVCSelector
              selectedStocks={selectedStocks}
              captain={captain}
              viceCaptain={viceCaptain}
              onSelectCaptain={selectCaptain}
              onSelectViceCaptain={selectViceCaptain}
            />
          )}

          {/* Bottom Spacer for CTA bar */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Floating Step Action */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, spacing.base) },
          ]}
        >
          {currentStep === 1 ? (
            <PrimaryButton
              title={`CONTINUE (${selectedStocks.length}/${maxStocksCount} SELECTED)`}
              disabled={!canProceedToStep2}
              iconName="arrow-forward"
              onPress={() => setCurrentStep(2)}
            />
          ) : (
            <View style={styles.step2Buttons}>
              <PrimaryButton
                title="PREVIEW & JOIN"
                disabled={!isTeamValid}
                iconName="checkmark-circle"
                onPress={() => setIsPreviewVisible(true)}
              />
            </View>
          )}
        </View>

        {/* Team Preview Modal */}
        <TeamPreviewModal
          visible={isPreviewVisible}
          contest={contest}
          selectedStocks={selectedStocks}
          captain={captain}
          viceCaptain={viceCaptain}
          creditsUsed={creditsUsed}
          onClose={() => setIsPreviewVisible(false)}
          onConfirmJoin={handleJoinContest}
        />

        {/* Success Modal */}
        <ContestSuccessModal
          visible={isSuccessModalVisible}
          entry={joinedEntry}
          onClose={() => setIsSuccessModalVisible(false)}
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
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sm + 1,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    padding: 0,
  },
  sectorContainer: {
    marginBottom: spacing.md,
  },
  sectorScroll: {
    gap: spacing.xs + 2,
  },
  sectorChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectorChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  sectorText: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: colors.textMuted,
  },
  sectorTextActive: {
    color: colors.textWhite,
  },
  stocksList: {
    gap: 2,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
  step2Buttons: {
    width: "100%",
  },
});
