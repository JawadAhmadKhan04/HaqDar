# HaqDar — حق دار

**A privacy-first mobile safety app for men and women in Pakistan to securely document harassment, access legal guidance, and find emergency help; hidden inside a working calculator.**

---

## Why do we need it?
In Pakistan, it’s rarely a lack of legislation that stalls justice for survivors of harassment and cyberstalking; it’s a catastrophic evidence gap. With a cybercrime conviction rate hovering below 1% under PECA due to broken chains of custody and destroyed proof, survivors need more than laws. They need a secure way to document their reality.



---


## What It Does

HaqDar gives everyone a safe, discrete way to record evidence of harassment incidents on their phone. To anyone looking at the screen, it appears to be a plain calculator. All the real features are locked behind a secret code and a PIN, ensuring the app cannot be discovered by an abuser.

---

## Demo Video of HaqDar
https://drive.google.com/file/d/1Bmz8WbMvumUUkbhP0B4jUMe2wwPbypAv/view

---

## Features

### 1. Decoy Calculator
The app opens as a fully functional calculator; indistinguishable from the stock iOS/Android app. It handles all standard arithmetic (addition, subtraction, multiplication, division, percentages).

**Secret vault entry:** Type `9911` then press `=`. The app silently redirects to the PIN screen to access the secure vault.

**Hidden dialer:** Type any phone number on the calculator and press `+/-`. The native phone dialer opens immediately with that number pre-filled, ready to call — with no visible indication that `+/-` does anything other than toggle a sign. Useful for quickly calling a trusted person or helpline without opening a contacts app.

---

### 2. PIN Lock
On first entry, the user sets a private 4-digit PIN. All subsequent vault access requires it. The PIN is stored as a SHA-256 hash; the raw digits are never saved. Wrong PIN attempts return no information about what the correct PIN is.

---

### 3. Incident Vault (Timeline)
A chronological feed of all recorded incidents. Each entry shows:
- Title and date/time
- A preview of the written narrative
- Thumbnails of any attached photos or audio
- The auto-detected Pakistani law category (e.g. PECA 2016, FOSPAH 2010)

Every incident is given a SHA-256 hash at the moment of creation. This hash changes if the data is modified after the fact, providing a tamper-evident chain of evidence admissible under Section 164-A of the Qanun-e-Shahadat (Law of Evidence).

---

### 4. Log an Incident
Users document what happened with:

- **Title**: a short description of the event
- **Narrative**: a full written account (up to 4,000 characters), with Urdu placeholder prompts
- **Voice dictation (STT)**: tap the microphone icon to dictate the narrative in Urdu; the app sends audio to the server and transcribes it back as Urdu text
- **Photo evidence**: attach multiple photos from the camera or gallery
- **Audio recording**: record audio directly from the log screen
- **Automatic legal tagging**: as the user types, keywords are matched against a law map and the relevant Pakistani law is shown (e.g. typing about images flags PECA §21; workplace issues flag FOSPAH §4)

All media is uploaded to secure cloud storage organised by device ID and timestamp. The incident record is saved both locally (encrypted via XOR + SHA-256) and synced to the cloud.

---

### 5. Legal Rights & AI Advisor
A two-part screen:

**Law Library** : plain-language summaries of the key Pakistani laws that protect the victims of abuse:
- PECA 2016 (cyberstalking, intimate images, impersonation)
- FOSPAH 2010 (workplace harassment ombudsman)
- PPC §354-A / §509 / §506 / §352 (public harassment, threats, assault)

**AI Legal Advisor** : a text box where the user describes their situation in their own words. The server processes it using a structured legal prompt and returns four concise lines: the applicable law, an immediate action to take, the specific authority to report to, and a note of encouragement. Responses reference real contact points (FIA 9911, fospah.gov.pk, police FIR).

---

### 6. AI Legal Document Generator (Dossier)
Takes every incident recorded in the vault and generates a complete, formally-structured legal complaint document ready for submission to Pakistani courts, police, or an ombudsman. The document contains seven sections:

1. Case Overview
2. Applicable Laws (PECA, FOSPAH, Protection of Women Acts, PPC, Qanun-e-Shahadat)
3. Incident Chronology (drawn from all logged entries)
4. Legal Analysis
5. Relief Sought (FIR, protection order, compensation, evidence preservation)
6. Supporting Evidence (with SHA-256 hashes)
7. Chain-of-Custody Declaration (referencing Section 164-A)

The document can be downloaded as a `.txt` file on web, or shared via the native share sheet on mobile (to save to Files, email, WhatsApp, etc.).

---

### 7. Shelter Homes Map
A dedicated tab showing government and NGO shelter homes across Pakistan. Includes:
- An interactive OpenStreetMap view with location pins
- Distance from the user's current location (sorted nearest first)
- Shelter type badges (Government Shelter / NGO / Crisis Centre)
- One-tap **Call** button for each shelter
- One-tap **Directions** button (opens Maps app)
- Detail card with Urdu name, description, and city

Shelters covered: Darul Aman Lahore/Karachi/Islamabad/Peshawar/Quetta, Panah Shelter Home, Edhi Women's Home, ROZAN Counselling Centre, Aurat Foundation, Dastak Shelter.

---

### 8. Emergency Helplines (Resources)
A quick-reference screen of national emergency contacts with one-tap calling:
- Punjab Women Protection Helpline (1043)
- FIA Cybercrime Wing (9911)
- Federal Ombudsman for Harassment (FOSPAH)
- Aurat Foundation
- Shirkat Gah
- Emergency / Police (15)
- Edhi Foundation (115)

Each entry shows the Urdu name and description alongside the English.

---

### 9. Panic Reset
A hidden "Wipe All Data" button inside the Dossier screen. One confirmation press:
- Deletes all incidents from local storage and the cloud
- Clears the PIN
- Redirects to the PIN setup screen, leaving no trace the app was ever used

---

## Technical Overview

### Stack
- **Frontend:** Expo SDK 54, React Native 0.81.5, TypeScript, `expo-router`
- **Backend:** Node.js 24, Express 5, Drizzle ORM, PostgreSQL
- **AI / Speech:** Ollama proxy (legal advice + document generation), Deepgram Nova-3 (Urdu STT)
- **Storage:** `AsyncStorage` (local, XOR-obfuscated), Supabase (cloud media + incident sync)
- **Monorepo:** pnpm workspaces

### Security model
| Layer | Mechanism |
|---|---|
| App disguise | Fully functional calculator as home screen |
| Vault access | 4-digit PIN stored as SHA-256 hash only |
| Evidence integrity | SHA-256 hash per incident, verified on read |
| Local storage | XOR obfuscation + hashed keys |
| Cloud media | Tenant-isolated paths (`deviceId/timestamp_file`) |
| Legal document | Chain-of-custody declaration with hash references |

### API Endpoints
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/healthz` | Server health check |
| `POST` | `/api/stt` | Urdu speech-to-text via Deepgram Nova-3 |
| `POST` | `/api/tts` | Text-to-speech for legal content |
| `POST` | `/api/legal-advice` | AI legal advice (4-line structured response) |
| `POST` | `/api/generate-document` | Full 7-section formal legal complaint |

### Environment Variables
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DEEPGRAM_API_KEY` | Urdu speech-to-text |
| `EXPO_PUBLIC_DOMAIN` | Replit dev domain for API calls from mobile |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_OLLAMA_URL` | Ollama API endpoint |
| `EXPO_PUBLIC_OLLAMA_API_KEY` | Ollama API key |
| `EXPO_PUBLIC_OLLAMA_MODEL` | Model name (default: `ministral-3:14b-cloud`) |

---

## Run Locally

```bash
# Install dependencies
pnpm install

# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the Expo app
pnpm --filter @workspace/haqdar run dev

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Full typecheck
pnpm run typecheck
```

---

## Name

**HaqDar** (حق دار) is Urdu for *"one who deserves rights"* — affirming that every person has the right to safety, justice, and to be heard.

