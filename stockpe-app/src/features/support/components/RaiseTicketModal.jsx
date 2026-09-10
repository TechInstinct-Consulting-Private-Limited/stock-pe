import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RaiseTicketModal({
  visible,
  onClose,
  subject,
  setSubject,
  message,
  setMessage,
  category,
  setCategory,
  isSubmitting,
  ticketResult,
  ticketError,
  onSubmit,
}) {
  const categories = [
    { id: "DEPOSITS", label: "Deposits" },
    { id: "WITHDRAWALS", label: "Withdrawals" },
    { id: "CONTESTS", label: "Contests" },
    { id: "KYC", label: "KYC" },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {ticketResult ? "Ticket Created!" : "Raise Support Ticket"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {ticketResult ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={48} color="#00C987" />
              </View>
              <Text style={styles.successTitle}>Ticket #{ticketResult.ticketId}</Text>
              <Text style={styles.successMsg}>
                Our team has received your inquiry and will respond within {ticketResult.estimatedResponseTime}.
              </Text>

              <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneBtnText}>DONE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.desc}>
                Select the issue category and describe your problem.
              </Text>

              {/* Category Pills */}
              <View style={styles.catRow}>
                {categories.map((c) => {
                  const isSelected = category === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setCategory(c.id)}
                      style={[
                        styles.catPill,
                        isSelected && styles.catPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          isSelected && styles.catPillTextSelected,
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Subject */}
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>SUBJECT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Deposit not reflected in wallet"
                  placeholderTextColor="#94A3B8"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              {/* Message */}
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>EXPLAIN THE ISSUE</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Provide transaction IDs or specific details..."
                  placeholderTextColor="#94A3B8"
                  value={message}
                  onChangeText={setMessage}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              {ticketError ? (
                <Text style={styles.errorText}>{ticketError}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={onSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>SUBMIT TICKET</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  desc: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 14,
  },
  catRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  catPillSelected: {
    backgroundColor: "#E6FBF3",
    borderColor: "#00C987",
  },
  catPillText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#64748B",
  },
  catPillTextSelected: {
    color: "#00C987",
  },
  inputBox: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11.5,
    fontWeight: "700",
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "#00C987",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  successIconBox: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  successMsg: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  doneBtn: {
    backgroundColor: "#0F172A",
    width: "100%",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
