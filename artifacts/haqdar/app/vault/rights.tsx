import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface Provision {
  section: string;
  title: string;
  description: string;
}

interface RightCategory {
  id: string;
  law: string;
  lawUrdu: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  summary: string;
  provisions: Provision[];
  whatToDo: string[];
}

const RIGHTS: RightCategory[] = [
  {
    id: "peca",
    law: "PECA 2016",
    lawUrdu: "الیکٹرانک جرائم ایکٹ ۲۰۱۶",
    subtitle: "Digital & Online Abuse",
    icon: "monitor",
    color: "#4F6EF7",
    summary:
      "The Prevention of Electronic Crimes Act (PECA) 2016 criminalises online harassment, non-consensual sharing of intimate images, cyberstalking, and identity impersonation in Pakistan.",
    provisions: [
      {
        section: "§ 20",
        title: "Online Harassment & Cyberstalking",
        description:
          "Criminalises any electronic communication intended to coerce, intimidate, or harass another person. Punishable by up to 3 years imprisonment and/or a fine of up to Rs. 1 million.",
      },
      {
        section: "§ 21",
        title: "Non-Consensual Intimate Images",
        description:
          "Prohibits displaying, distributing, or broadcasting someone's intimate images without consent (\u201crevenge porn\u201d). Up to 5 years imprisonment and/or Rs. 5 million fine.",
      },
      {
        section: "§ 22",
        title: "Identity Spoofing / Impersonation",
        description:
          "Covers creation of fake profiles or impersonating another person online to harm reputation or deceive others. Up to 3 years imprisonment.",
      },
      {
        section: "§ 23",
        title: "Malicious Code / Spyware",
        description:
          "Using spyware, stalkerware, or any malicious software to monitor, track, or intercept someone's device without consent.",
      },
    ],
    whatToDo: [
      "Preserve screenshots, URLs, and timestamps as evidence",
      "Report to FIA Cybercrime Wing at nccf.pk or call 9911",
      "File a complaint at your nearest FIA office with printed evidence",
      "Request platform takedown (Instagram, Facebook, WhatsApp) simultaneously",
      "Log the incident in this app to create a timestamped record",
    ],
  },
  {
    id: "fospah",
    law: "FOSPAH Act 2010",
    lawUrdu: "ہراسانی سے تحفظ کا قانون ۲۰۱۰",
    subtitle: "Workplace & Institutional Harassment",
    icon: "briefcase",
    color: "#16A34A",
    summary:
      "The Protection Against Harassment of Women at Workplace Act 2010 mandates every organisation to establish an Inquiry Committee and provides a formal complaint mechanism for workplace harassment.",
    provisions: [
      {
        section: "§ 2(h)",
        title: "Definition of Harassment",
        description:
          "Covers any unwelcome sexual advance, request for sexual favours, or other verbal/written/physical conduct of a sexual nature that creates an intimidating, hostile, or offensive work environment.",
      },
      {
        section: "§ 4",
        title: "Inquiry Committee Requirement",
        description:
          "Every public or private organisation must constitute a three-member Inquiry Committee — including at least one woman — to hear harassment complaints. Employers who fail to do so are liable for fine.",
      },
      {
        section: "§ 6",
        title: "Ombudsman Complaint",
        description:
          "If the in-house committee fails or the harasser is a senior, you may escalate directly to the Federal/Provincial Ombudsman (FOSPAH). No fee is required and the process is confidential.",
      },
      {
        section: "§ 7",
        title: "Penalties",
        description:
          "Perpetrators face dismissal, demotion, withholding of promotion/increment, or fine of up to Rs. 500,000. Repeat offenders may face criminal prosecution.",
      },
    ],
    whatToDo: [
      "Write a formal complaint letter to your organisation's Inquiry Committee",
      "Keep copies of all written communications (emails, messages) from the harasser",
      "Note dates, times, locations, and witnesses for each incident",
      "If the committee is not formed or fails to act, file directly at fospah.gov.pk",
      "You have the right to representation — bring a lawyer or colleague",
      "Log each incident in this app to build a documented timeline",
    ],
  },
  {
    id: "ppc",
    law: "Pakistan Penal Code",
    lawUrdu: "پاکستان تعزیرات",
    subtitle: "Public Spaces & Verbal Assault",
    icon: "map-pin",
    color: "#DC2626",
    summary:
      "Several sections of the Pakistan Penal Code (PPC) protect against verbal abuse, physical assault, threats, and harassment in public spaces, on transport, and in everyday life.",
    provisions: [
      {
        section: "§ 354-A",
        title: "Sexual Harassment in Public",
        description:
          "Criminalises touching, following, passing sexually explicit remarks, or making sexually coloured gestures in public. Punishable by 3 years imprisonment and/or fine.",
      },
      {
        section: "§ 509",
        title: "Insulting Modesty / Eve Teasing",
        description:
          "Any word, gesture, or act intended to insult the modesty of a woman — including cat-calling, sexual remarks, or displaying obscene material — carries up to 3 years imprisonment.",
      },
      {
        section: "§ 506",
        title: "Criminal Intimidation / Threats",
        description:
          "Threatening someone with injury to their person, reputation, or property to cause alarm or compel them to do something. Up to 2 years imprisonment, or 7 years if the threat involves death.",
      },
      {
        section: "§ 352",
        title: "Assault / Use of Force",
        description:
          "Any deliberate physical contact — pushing, grabbing, or striking — without consent constitutes criminal assault, punishable by up to 1 year imprisonment and/or fine.",
      },
      {
        section: "§ 290",
        title: "Public Nuisance",
        description:
          "Persistent harassment, stalking on public transport, or threatening behaviour in public spaces can be reported as a public nuisance and leads to fines or short imprisonment.",
      },
    ],
    whatToDo: [
      "Note the time, place, and description of the perpetrator immediately",
      "File a First Information Report (FIR) at your local police station",
      "If police refuse to register an FIR, approach the Judicial Magistrate directly",
      "Gather witness contact information if anyone saw the incident",
      "For transport harassment, report to the DGPR helpline or Punjab Safe Cities Authority (Lahore: 111-911)",
      "Document everything in this app right after the incident while memory is fresh",
    ],
  },
];

function RightCard({ right, colors }: { right: RightCategory; colors: any }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedProvision, setExpandedProvision] = useState<string | null>(null);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBox, { backgroundColor: right.color + "18" }]}>
          <Feather name={right.icon} size={20} color={right.color} />
        </View>
        <View style={styles.cardHeaderText}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.lawName, { color: colors.foreground }]}>{right.law}</Text>
            <View style={[styles.badge, { backgroundColor: right.color + "18" }]}>
              <Text style={[styles.badgeText, { color: right.color }]}>{right.subtitle}</Text>
            </View>
          </View>
          <Text style={[styles.lawUrdu, { color: colors.mutedForeground }]}>{right.lawUrdu}</Text>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <Text style={[styles.summary, { color: colors.mutedForeground }]}>{right.summary}</Text>

          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Key Provisions</Text>
          {right.provisions.map((p) => (
            <TouchableOpacity
              key={p.section}
              style={[
                styles.provision,
                {
                  backgroundColor:
                    expandedProvision === p.section ? right.color + "0E" : colors.background,
                  borderColor:
                    expandedProvision === p.section ? right.color + "55" : colors.border,
                },
              ]}
              onPress={() =>
                setExpandedProvision(expandedProvision === p.section ? null : p.section)
              }
              activeOpacity={0.75}
            >
              <View style={styles.provisionHeader}>
                <View style={[styles.sectionBadge, { backgroundColor: right.color }]}>
                  <Text style={styles.sectionBadgeText}>{p.section}</Text>
                </View>
                <Text style={[styles.provisionTitle, { color: colors.foreground }]}>{p.title}</Text>
                <Feather
                  name={expandedProvision === p.section ? "minus" : "plus"}
                  size={14}
                  color={colors.mutedForeground}
                />
              </View>
              {expandedProvision === p.section && (
                <Text style={[styles.provisionDesc, { color: colors.mutedForeground }]}>
                  {p.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>What To Do</Text>
          <View style={[styles.stepsList, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {right.whatToDo.map((step, i) => (
              <View key={i} style={[styles.step, i < right.whatToDo.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                <View style={[styles.stepNum, { backgroundColor: right.color }]}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export default function RightsScreen() {
  const colors = useColors();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.banner, { backgroundColor: "#1E293B" }]}>
        <Feather name="book-open" size={24} color="#FFFFFF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Know Your Rights</Text>
          <Text style={styles.bannerUrdu}>اپنے حقوق جانیں — Pakistani Law</Text>
        </View>
      </View>

      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        You have legal protection under Pakistani law. Tap any card to explore your rights and learn what steps to take.
      </Text>

      {RIGHTS.map((right) => (
        <RightCard key={right.id} right={right} colors={colors} />
      ))}

      <View style={[styles.disclaimer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="alert-circle" size={13} color={colors.mutedForeground} />
        <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
          This information is for awareness only and does not constitute legal advice. For your specific situation, consult a qualified lawyer or contact the relevant authority.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
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
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    marginTop: 2,
  },
  intro: {
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardHeaderText: {
    flex: 1,
    gap: 4,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  lawName: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  lawUrdu: {
    fontSize: 12,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  summary: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: "uppercase" as const,
  },
  provision: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  provisionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  sectionBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  provisionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  provisionDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  stepsList: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 11,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
