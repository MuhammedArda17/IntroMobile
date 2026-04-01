Muhammed Gurkan en Soufiane Bouzelmat

# IntroMobile - Padel App

Een mobiele applicatie (iOS & Android) die de functionaliteit van de Playtomic-app nabootst. Gebouwd met React Native (Expo) en Firebase.

## Vereisten

- Node.js (versie 18 of hoger)
- npm
- Expo Go app op je telefoon ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Installatie

### 1. Repository clonen
```bash
git clone https://github.com/MuhammedArda17/IntroMobile.git
cd IntroMobile/IntroMobile
```

### 2. Dependencies installeren
```bash
npm install
```

### 3. Environment variabelen instellen
Maak een `.env` bestand aan in de `IntroMobile` map met de volgende inhoud:
```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAJQQP_sBBOOxBC9iRSds1Hh2PNS3arEos
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=intromobile-110fd.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=intromobile-110fd
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=intromobile-110fd.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=924898231803
EXPO_PUBLIC_FIREBASE_APP_ID=1:924898231803:web:82f355670e93b8fdf7b75e
```

### 4. App starten
```bash
npx expo start
```

Scan de QR code met de Expo Go app op je telefoon. Zorg dat je telefoon en pc op hetzelfde wifi netwerk zitten.

Als de QR code niet werkt, probeer dan:
```bash
npx expo start --tunnel
```

## Functionaliteiten

### Registreren & Inloggen
- Maak een account aan met naam, email, wachtwoord en geslacht
- Nieuwe spelers starten automatisch op niveau 1.5
- Niveaus gaan van 0.5 tot 7.0

### Veld Boeken
- Zoek beschikbare velden op basis van club en datum
- Selecteer een tijdslot en bevestig de boeking
- Bezette tijdsloten worden automatisch grijs weergegeven

### Wedstrijd Aanmaken
- Maak een nieuwe wedstrijd aan met club, datum, tijdstip en niveau range
- Kies of de wedstrijd gemengd en/of competitief is
- De wedstrijd is zichtbaar voor andere spelers om op in te schrijven

### Wedstrijd Zoeken
- Zoek wedstrijden op basis van datum, club, gemengd of competitief
- Alleen wedstrijden binnen jouw niveau range worden getoond
- Schrijf je in op een wedstrijd (gesimuleerde betaling)
- Bij 4 spelers wordt de wedstrijd automatisch bevestigd

### Chat
- Elke wedstrijd heeft een eigen chatroom
- Berichten verschijnen realtime voor alle deelnemers

### Resultaten & Levels
- Voer scores in na een wedstrijd (minstens 2 sets)
- Geldige scores: 6-4, 7-5, 7-6
- Bij competitieve wedstrijden worden levels automatisch aangepast
- Winnaars krijgen level omhoog, verliezers omlaag

### Leaderboard
- Bekijk alle spelers gesorteerd op niveau
- Zoek een specifieke speler op naam

## Technische Stack

- **React Native** met Expo
- **Expo Router** voor navigatie
- **Firebase Authentication** voor inloggen
- **Firebase Firestore** als database
- **Zustand** voor state management

## Projectstructuur

```
IntroMobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab navigatie
│   │   ├── index.tsx         # Home scherm
│   │   ├── book.tsx          # Veld boeken
│   │   ├── leaderboard.tsx   # Leaderboard
│   │   └── profile.tsx       # Profiel
│   ├── _layout.tsx           # Root navigatie
│   ├── index.tsx             # Entry point
│   ├── login.tsx             # Login scherm
│   ├── register.tsx          # Registreer scherm
│   ├── create-match.tsx      # Wedstrijd aanmaken
│   ├── search-match.tsx      # Wedstrijd zoeken
│   ├── results.tsx           # Resultaten invoeren
│   └── chat/
│       └── [matchId].tsx     # Chat per wedstrijd
└── src/
    ├── firebase/
    │   ├── config.ts         # Firebase configuratie
    │   ├── auth.ts           # Authenticatie functies
    │   ├── matches.ts        # Wedstrijd functies
    │   └── firestore.ts      # Database functies
    ├── store/
    │   └── useAuthStore.ts   # Globale state
    └── utils/
        └── levelAlgorithm.ts # Level berekeningen
```
