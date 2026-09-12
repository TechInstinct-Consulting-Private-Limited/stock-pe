import React from "react";
import {
  ActivityIndicator,
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
import { useHelpSupport } from "../hooks/useHelpSupport";
import FaqAccordionItem from "../components/FaqAccordionItem";
import RaiseTicketModal from "../components/RaiseTicketModal";

export default function HelpSupportScreen() {
  const router = useRouter();
  const {
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    faqs,
    expandedFaqId,
    handleToggleFaq,
    isLoading,
    showTicketModal,
    setShowTicketModal,
    ticketSubject,
    setTicketSubject,
    ticketMessage,
    setTicketMessage,
    ticketCategory,
    setTicketCategory,
    isSubmittingTicket,
    ticketResult,
    ticketError,
    handleCreateTicket,
    handleCloseTicketModal,
  } = useHelpSupport();

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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs, issues, questions..."
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

        {/* Category Horizontal Filter Pills */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {categories.map((c) => {
              const isSelected = activeCategory === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setActiveCategory(c.id)}
                  style={[
                    styles.filterPill,
                    isSelected && styles.filterPillSelected,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.filterTextSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* FAQs List */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Raise Ticket Hero Banner */}
          <View style={styles.contactBanner}>
            <View style={styles.contactLeft}>
              <Ionicons name="headset" size={26} color="#00C987" />
              <View>
                <Text style={styles.contactTitle}>Still need assistance?</Text>
                <Text style={styles.contactSub}>
                  Our 24x7 support team typically responds in under 2 hours.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.raiseBtn}
              onPress={() => setShowTicketModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.raiseBtnText}>RAISE TICKET</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionHeader}>FREQUENTLY ASKED QUESTIONS</Text>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00C987" />
            </View>
          ) : faqs.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="help-circle-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Matching FAQs</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search keyword or tap Raise Ticket above.
              </Text>
            </View>
          ) : (
            faqs.map((faq) => (
              <FaqAccordionItem
                key={faq.id}
                faq={faq}
                isExpanded={expandedFaqId === faq.id}
                onToggle={handleToggleFaq}
              />
            ))
          )}
        </ScrollView>

        {/* Raise Ticket Modal */}
        <RaiseTicketModal
          visible={showTicketModal}
          onClose={handleCloseTicketModal}
          subject={ticketSubject}
          setSubject={setTicketSubject}
          message={ticketMessage}
          setMessage={setTicketMessage}
          category={ticketCategory}
          setCategory={setTicketCategory}
          isSubmitting={isSubmittingTicket}
          ticketResult={ticketResult}
          ticketError={ticketError}
          onSubmit={handleCreateTicket}
        />
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
    marginBottom: 6,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  contactBanner: {
    backgroundColor: "#0F172A",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  contactSub: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 2,
    lineHeight: 16,
  },
  raiseBtn: {
    backgroundColor: "#00C987",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  raiseBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 4,
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
});
