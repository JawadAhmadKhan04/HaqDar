import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Resource {
  name: string;
  urduName: string;
  number?: string;
  url?: string;
  description: string;
  urduDescription: string;
  category: string;
  icon: keyof typeof Feather.glyphMap;
}

const RESOURCES: Resource[] = [
  {
    category: "National",
    icon: "phone",
    name: "Punjab Women Protection Helpline",
    urduName: "پنجاب خواتین تحفظ ہیلپ لائن",
    number: "1043",
    description: "24/7 helpline for women in distress, domestic violence, and harassment.",
    urduDescription: "پریشانی میں خواتین کے لیے 24 گھنٹے خدمت",
  },
  {
    category: "Cyber / Digital",
    icon: "shield",
    name: "FIA Cybercrime Wing",
    urduName: "ایف آئی اے سائبر کرائم ونگ",
    number: "9911",
    description: "Report cyber harassment, intimate image sharing, online stalking.",
    urduDescription: "سائبر ہراسانی، تصاویر کا غلط استعمال، آن لائن پیچھا",
  },
  {
    category: "Workplace",
    icon: "briefcase",
    name: "FOSPAH",
    urduName: "فیڈرل اومبڈزمین فار ہراسمنٹ",
    url: "https://fospah.gov.pk",
    description: "Federal Ombudsman Secretariat for Protection against Harassment — workplace harassment complaints.",
    urduDescription: "کام کی جگہ ہراسانی کی شکایات",
  },
  {
    category: "Legal Aid",
    icon: "users",
    name: "Aurat Foundation",
    urduName: "عورت فاؤنڈیشن",
    url: "https://af.org.pk",
    description: "Women's rights organization providing legal support and resources.",
    urduDescription: "خواتین کے حقوق اور قانونی امداد",
  },
  {
    category: "Legal Aid",
    icon: "globe",
    name: "Shirkat Gah",
    urduName: "شرکت گاہ",
    url: "https://shirkatgah.org",
    description: "Women's resource centre providing legal literacy and advocacy.",
    urduDescription: "قانونی آگاہی اور وکالت",
  },
  {
    category: "Emergency",
    icon: "alert-triangle",
    name: "Emergency / Police",
    urduName: "ایمرجنسی / پولیس",
    number: "15",
    description: "Pakistan national police emergency line.",
    urduDescription: "قومی پولیس ایمرجنسی",
  },
  {
    category: "Emergency",
    icon: "heart",
    name: "Edhi Foundation",
    urduName: "ایدھی فاؤنڈیشن",
    number: "115",
    description: "Emergency ambulance and shelter services.",
    urduDescription: "ایمرجنسی ایمبولینس اور پناہ گاہ",
  },
];

const CATEGORIES = [...new Set(RESOURCES.map((r) => r.category))];

export default function ResourcesScreen() {
  const colors = useColors();

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Feather name="phone-call" size={24} color="#FFFFFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Emergency Resources</Text>
          <Text style={styles.bannerUrdu}>ہنگامی وسائل — Pakistan Helplines</Text>
        </View>
      </View>

      <View style={[styles.disclaimer, { backgroundColor: "#FFF8E7", borderColor: "#F0C040" }]}>
        <Feather name="info" size={13} color="#B8860B" />
        <Text style={styles.disclaimerText}>
          Phone numbers use tel: links. Tapping a number will dial your phone directly. No call logs are stored in this app.
        </Text>
      </View>

      {CATEGORIES.map((cat) => (
        <View key={cat} style={styles.categorySection}>
          <Text style={[styles.categoryLabel, { color: colors.mutedForeground }]}>
            {cat.toUpperCase()}
          </Text>
          {RESOURCES.filter((r) => r.category === cat).map((resource) => (
            <View
              key={resource.name}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: colors.muted }]}>
                  <Feather name={resource.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.nameBlock}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{resource.name}</Text>
                  <Text style={[styles.urduName, { color: colors.mutedForeground }]}>{resource.urduName}</Text>
                </View>
              </View>

              <Text style={[styles.desc, { color: colors.mutedForeground }]}>{resource.description}</Text>
              <Text style={[styles.urduDesc, { color: colors.mutedForeground }]}>{resource.urduDescription}</Text>

              {resource.number && (
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleCall(resource.number!)}
                  activeOpacity={0.8}
                >
                  <Feather name="phone" size={16} color="#FFFFFF" />
                  <Text style={styles.callBtnText}>Call {resource.number}</Text>
                </TouchableOpacity>
              )}

              {resource.url && (
                <TouchableOpacity
                  style={[styles.urlBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                  onPress={() => handleUrl(resource.url!)}
                  activeOpacity={0.8}
                >
                  <Feather name="external-link" size={15} color={colors.primary} />
                  <Text style={[styles.urlBtnText, { color: colors.primary }]}>Visit Website</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ))}

      <View style={[styles.legalNote, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Text style={[styles.legalNoteTitle, { color: colors.foreground }]}>Important Notice</Text>
        <Text style={[styles.legalNoteText, { color: colors.mutedForeground }]}>
          This directory is provided for reference only. Always verify contact information independently. HaqDar does not guarantee the accuracy of external resources. In immediate danger, call 15 (Police) or 115 (Edhi Ambulance).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 14 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  bannerUrdu: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    marginTop: 2,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: "#7A5500",
    lineHeight: 16,
  },
  categorySection: {
    gap: 10,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
    marginBottom: 0,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "700" as const,
    lineHeight: 19,
  },
  urduName: {
    fontSize: 12,
    lineHeight: 18,
  },
  desc: {
    fontSize: 12,
    lineHeight: 18,
  },
  urduDesc: {
    fontSize: 11,
    lineHeight: 17,
    fontStyle: "italic" as const,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 4,
  },
  callBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  urlBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  urlBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  legalNote: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  legalNoteTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  legalNoteText: {
    fontSize: 11,
    lineHeight: 17,
  },
});
