# The Office

A black-and-white iOS app for sharing DJ demos, reposting tracks, liking, and charting the top demos of the week and month.

Built with **Expo (React Native)** and **Firebase**.

## Features

- Upload audio demos (MP3, M4A, WAV)
- Feed of demos and reposts
- Like and repost tracks
- Weekly and monthly charts ranked by engagement score
- User profiles with demo collections

## Prerequisites

- Node.js 18+
- Xcode (for iOS Simulator)
- A [Firebase](https://console.firebase.google.com) project

## Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. **Authentication** — enable Email/Password sign-in:
   - Build → Authentication → Sign-in method → Email/Password → Enable

3. **Firestore Database** — create database in production mode, then apply these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /demos/{demoId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
      match /likes/{likeUserId} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == likeUserId;
      }
    }
    match /reposts/{repostId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

4. **Storage** — create a default bucket, then apply these rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /demos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. **Firestore indexes** — the app will prompt you to create composite indexes when needed. Required indexes:
   - `demos`: `userId` ASC + `createdAt` DESC
   - `demos`: `createdAt` ASC (for chart queries)
   - `reposts`: `createdAt` DESC

   Click the link in the Firebase error log when running the app, or create them manually in Firestore → Indexes.

6. **Web app config** — Project Settings → Your apps → Add web app → copy config values.

7. Copy env file and fill in your keys:

```bash
cp .env.example .env
```

## Run the App

```bash
cd DemoDeck
npm install
npm run ios
```

For Expo Go on a physical device:

```bash
npm start
```

Scan the QR code with the Expo Go app.

## Project Structure

```
app/           Expo Router screens (auth, tabs, demo detail)
components/    UI components (DemoCard, AudioPlayer, etc.)
context/       Auth and audio playback providers
lib/           Firebase, Firestore helpers, storage uploads
theme/         Black & white design tokens
```

## Chart Scoring

Demos are ranked by:

```
score = (likes × 2) + (reposts × 3) + plays
```

Charts filter demos uploaded within the current week or month.

## Design

Monochrome palette — pure black background, white accents, Space Mono for rank numbers and labels, Inter for body text. Sharp corners, 1px borders, minimal iconography.
