import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactionHistory } from "../hooks/useTransactionHistory";
import TransactionItemCard from "../components/TransactionItemCard";

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const {
    filters,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    transactions,
    isLoading,
    selectedTxn,
    setSelectedTxn,
  } = useTransactionHistory();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, txn id or ref..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Horizontal Scroll */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                activeOpacity={0.75}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#00C987" />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your filter or search keyword.
            </Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <TransactionItemCard
              key={tx.id}
              transaction={tx}
              onPress={setSelectedTxn}
            />
          ))
        )}
      </ScrollView>

      {/* Receipt / Txn Details Modal */}
      {selectedTxn && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!selectedTxn}
          onRequestClose={() => setSelectedTxn(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Transaction Receipt</Text>
                <TouchableOpacity
                  onPress={() => setSelectedTxn(null)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Amount Display */}
              <View style={styles.modalAmountBox}>
                <Text style={styles.modalAmountLabel}>
                  {selectedTxn.type === "CREDIT" ? "CREDITED" : "DEBITED"}
                </Text>
                <Text
                  style={[
                    styles.modalAmountText,
                    {
                      color:
                        selectedTxn.type === "CREDIT" ? "#00C987" : "#0F172A",
                    },
                  ]}
                >
                  {selectedTxn.type === "CREDIT" ? "+" : "-"}₹
                  {selectedTxn.amountInr.toLocaleString("en-IN")}
                </Text>
                <Text style={styles.modalUsdtText}>
                  ~{selectedTxn.amountUsdt} USDT
                </Text>
              </View>

              {/* Txn Details Grid */}
              <View style={styles.modalDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title</Text>
                  <Text style={styles.detailValue}>{selectedTxn.title}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date & Time</Text>
                  <Text style={styles.detailValue}>{selectedTxn.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text style={styles.detailValue}>{selectedTxn.id}</Text>
                </View>
                {selectedTxn.refId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reference No.</Text>
                    <Text style={styles.detailValue}>{selectedTxn.refId}</Text>
                  </View>
                )}
                {selectedTxn.paymentMethod && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Network / Method</Text>
                    <Text style={styles.detailValue}>
                      {selectedTxn.paymentMethod}
                    </Text>
                  </View>
                )}
                {selectedTxn.txHash && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Blockchain TxID</Text>
                    <Text style={[styles.detailValue, { fontFamily: "monospace", color: "#64748B" }]}>
                      {selectedTxn.txHash}
                    </Text>
                  </View>
                )}
                {selectedTxn.bonusCreditedInr ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bonus Added</Text>
                    <Text style={[styles.detailValue, { color: "#00C987" }]}>
                      +₹{selectedTxn.bonusCreditedInr}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={styles.receiptStatusPill}>
                    <Text style={styles.receiptStatusText}>
                      {selectedTxn.status}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeReceiptBtn}
                onPress={() => setSelectedTxn(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.closeReceiptBtnText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    padding: 0,
  },
  filtersWrapper: {
    marginBottom: 8,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  filterPillSelected: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
  },
  filterTextSelected: {
    color: "#FFFFFF",
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingBox: {
    padding: 40,
    alignItems: "center",
  },
  emptyBox: {
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12.5,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 380,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalAmountBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalAmountLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
  },
  modalAmountText: {
    fontSize: 26,
    fontWeight: "900",
    marginVertical: 2,
  },
  modalUsdtText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#64748B",
  },
  modalDetails: {
    gap: 10,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  receiptStatusPill: {
    backgroundColor: "#E6FBF3",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  receiptStatusText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#00C987",
  },
  closeReceiptBtn: {
    backgroundColor: "#0F172A",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  closeReceiptBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
