import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FaqAccordionItem({ faq, isExpanded, onToggle }) {
  return (
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => onToggle(faq.id)}
        activeOpacity={0.75}
      >
        <Text style={[styles.question, isExpanded && styles.questionExpanded]}>
          {faq.question}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={isExpanded ? "#00C987" : "#94A3B8"}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.body}>
          <Text style={styles.answer}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#EDF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardExpanded: {
    borderColor: "#A7F3D0",
    backgroundColor: "#FAFFFD",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
    marginRight: 10,
    lineHeight: 18,
  },
  questionExpanded: {
    color: "#00C987",
  },
  body: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  answer: {
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
    fontWeight: "500",
  },
});
