export interface LegalMatch {
  category: string;
  urduCategory: string;
  law: string;
  authority: string;
}

const legalMappings: { keywords: string[]; match: LegalMatch }[] = [
  {
    keywords: ["nude", "photo", "video", "share", "online", "facebook", "whatsapp", "screenshot", "image", "post", "leak"],
    match: {
      category: "Cyber / Image Harassment",
      urduCategory: "سائبر / تصویر ہراسانی",
      law: "PECA 2016, Section 21 (Intimate Image Harassment) — Up to 7 years imprisonment.",
      authority: "FIA Cybercrime Wing — 9911",
    },
  },
  {
    keywords: ["office", "boss", "colleague", "work", "job", "promotion", "workplace", "manager", "supervisor", "company"],
    match: {
      category: "Workplace Harassment",
      urduCategory: "کام کی جگہ ہراسانی",
      law: "Protection Against Harassment of Women at the Workplace Act 2010 / FOSPAH jurisdiction.",
      authority: "FOSPAH Complaints Portal",
    },
  },
  {
    keywords: ["hit", "beat", "slap", "lock", "home", "husband", "father", "punch", "kick", "threaten", "abuse", "violent", "violence"],
    match: {
      category: "Domestic Violence",
      urduCategory: "گھریلو تشدد",
      law: "Provincial Domestic Violence Acts / Pakistan Penal Code Sections 339-345 (assault, wrongful confinement).",
      authority: "Punjab Helpline — 1043",
    },
  },
  {
    keywords: ["bazaar", "street", "market", "shout", "follow", "stalk", "grope", "touch", "public", "road"],
    match: {
      category: "Public Harassment",
      urduCategory: "عوامی ہراسانی",
      law: "PPC Section 509 (Insulting Modesty in Public Spaces) — up to 1 year imprisonment.",
      authority: "Punjab Helpline — 1043",
    },
  },
];

export const DISCLAIMER =
  "This is an automated documentation aid, not official legal advice. / یہ ایک خودکار دستاویزی امداد ہے، سرکاری قانونی مشورہ نہیں۔";

export function getLegalMatchByCategory(category: string): LegalMatch | undefined {
  return legalMappings.find((m) => m.match.category === category)?.match;
}

export function detectLegal(text: string): LegalMatch[] {
  if (!text || text.trim().length < 3) return [];
  const lower = text.toLowerCase();
  const seen = new Set<string>();
  const matches: LegalMatch[] = [];
  for (const mapping of legalMappings) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      if (!seen.has(mapping.match.law)) {
        seen.add(mapping.match.law);
        matches.push(mapping.match);
      }
    }
  }
  return matches;
}
