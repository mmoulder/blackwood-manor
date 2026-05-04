# 🕵️ Blackwood Manor Mystery

An interactive murder mystery game set in 1924 England where teams race to solve a complex poisoning case involving embezzlement, forgery, and red herrings.

## 🎭 Overview

**The Crime:** Lord Blackwood has been found dead in his study, poisoned with arsenic. Players must interrogate AI-powered suspects, solve 10 interconnected puzzles, and piece together evidence to identify the killer and their accomplice.

**The Twist:** Not everyone who looks guilty is guilty. Colonel Harwick appears suspicious but is innocent of murder (though guilty of theft). The real conspiracy involves Victoria Ashworth and solicitor Silas Fenwick.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase Realtime Database account
- Anthropic API key (for AI suspect interrogations)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd blackwood-manor
   npm install
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

3. **Configure Firebase**
   - Create a Firebase Realtime Database
   - Set rules to allow read/write (or configure authentication)
   - Update the `GAME_ID` in `src/useGameSync.js` for each new event

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the game**
   - Main game: `http://localhost:5173/`
   - Admin panel: `http://localhost:5173/admin`

## 🎮 How to Play

### For Players

1. **Choose your team** - Select from Team Raven, Falcon, Serpent, or Wolf
2. **Solve clues** - Work through 10 sequential puzzles to unlock evidence
3. **Interrogate suspects** - Use AI-powered conversations to extract information
4. **Take notes** - Document your findings in the built-in notes tab
5. **Make your accusation** - Once all clues are solved, identify the killer, accomplice, weapon, and motive

### For Game Masters

- **Live leaderboard** - Appears in bottom-right corner showing all teams' progress
- **Admin panel** - Access at `/admin` to view team status and reset the game
- **Game ID** - Change `GAME_ID` in `src/useGameSync.js` for each new event

## 📋 Puzzle Answers & Solutions

### Clue 1: Opening Examination
**Location:** The Study — Lord Blackwood's Writing Desk  
**Question:** Name the crystalline compound used as the murder weapon (7 letters)  
**Answer:** `arsenic`

### Clue 2: Document Reconstruction
**Location:** The Fireplace — Partially Burned Documents  
**Question:** Arrange fragments A, B, C in chronological order  
**Answer:** `cab` (Fragment C: discovery → Fragment A: investigation → Fragment B: ultimatum)

### Clue 3: Forensic Accounting
**Location:** The Estate Office — Financial Ledger  
**Question:** Total embezzled, average monthly withdrawal, first month exceeding £5,000  
**Answer:** `64000, 4571, september`

### Clue 4: The Diary Page
**Location:** Behind the Study Bookcase — Hidden Panel  
**Question:** Identify S.F., the new document type, and "the other matter"  
**Answer:** `silas fenwick, will, murder`

### Clue 5: The Forged Will
**Location:** Fenwick & Associates — Lord Blackwood's Will  
**Question:** Which THREE facts prove Will B is forged? (from 5 options)  
**Answer:** `1, 2, 3`  
(Tuesday vs Thursday discrepancy, modern ink compound, untraceable witness)

### Clue 6: The Alibi Matrix
**Location:** The Billiards Room — Colonel Harwick's Evidence  
**Question:** Who is provably lying? Who has no alibi? Whose alibi is corroborated by an independent witness (someone outside the four suspects)?  
**Answer:** `harwick, victoria, doyle`

### Clue 7: The Coded Purchase Log
**Location:** Whitmore & Sons Chemist — Purchase Records  
**Question:** Decode the cipher (shift back 5 letters): KJSBNHP  
**Answer:** `fenwick`

### Clue 8: Reconstructing the Timeline
**Location:** The East Garden — Gardener's Full Statement  
**Question:** Order events C, D, F, A, B, E chronologically  
**Answer:** `cdfabe`  
(Window unlatched → Victoria enters → Poisons decanter → Blackwood drinks → Victoria exits → Body found)

### Clue 9: The Conspiracy Evidence
**Location:** Victoria's Room — The False-Bottom Dresser  
**Question:** Match 4 items to what they prove (W, X, Y, Z)  
**Answer:** `1w, 2z, 3y, 4x`  
- Note → Criminal agreement (W)
- Bank draft → Payment to Fenwick (Z)
- Arsenic box → Weapon possession (Y)
- Shawl with soil → Physical presence in garden (X)

### Clue 10: The Final Deduction
**Location:** Scotland Yard — Inspector's Final Briefing  
**Question:** Is Inspector Graves's logical argument valid, invalid, or partially valid?  
**Answer:** `c` (Partially valid)

## 🎯 Final Solution

**Killer:** Victoria Ashworth  
**Accomplice:** Mr. Silas Fenwick  
**Weapon:** Arsenic  
**Time:** 9:30pm  
**Motive:** Embezzlement (Victoria embezzled £64,000; Blackwood discovered it and threatened Scotland Yard)

**Full Explanation:**  
Victoria Ashworth embezzled £64,000 from the Blackwood estate over 14 months. When Lord Blackwood discovered the fraud and threatened to contact Scotland Yard, Victoria conspired with family solicitor Silas Fenwick to forge a new will naming her sole heir — paying him £8,000. On November 2nd, 1924, she purchased arsenic from Whitmore and Sons, unlatched the study window in advance, and entered the study at 9:30pm via the east garden wearing her red shawl and white gloves. She dissolved arsenic in the brandy decanter and departed. Lord Blackwood drank the brandy and was found dead at 11pm. Colonel Harwick, though guilty of stealing the Victoria Cross to pay gambling debts, played no part in the murder — his suspicious behaviour was a deliberate red herring.

## 🎭 Suspect Profiles

### Guilty Parties
- **Victoria Ashworth** - Niece & Estate Accountant (Murderer)
- **Mr. Silas Fenwick** - Family Solicitor (Accomplice - forged will)

### Red Herrings
- **Colonel Harwick** - War Veteran (Guilty of medal theft, innocent of murder)

### Innocent Witnesses
- **Mrs. Agnes Doyle** - Head Housekeeper (Saw Victoria near the study)
- **Dr. Reginald Pembrook** - Family Physician (Noticed will discrepancies)
- **Thomas Briggs** - Head Gardener (Eyewitness to Victoria entering via window)

## 🛠️ Technical Stack

- **Frontend:** React 18 + Vite
- **Database:** Firebase Realtime Database (for multi-team sync)
- **AI:** Anthropic Claude (for suspect interrogations)
- **Styling:** Inline CSS with 1920s noir aesthetic

## 📁 Project Structure

```
blackwood-manor/
├── src/
│   ├── App.jsx           # Main game logic, puzzles, suspects
│   ├── Admin.jsx         # Admin control panel
│   ├── Leaderboard.jsx   # Live team standings
│   ├── useGameSync.js    # Firebase sync hooks
│   ├── firebase.js       # Firebase configuration
│   └── main.jsx          # Entry point with routing
├── .env                  # Environment variables (not committed)
└── package.json
```

## 🎨 Features

- **Real-time multiplayer** - Multiple teams compete simultaneously
- **AI-powered suspects** - Each character has unique personality and knowledge
- **Progressive difficulty** - Puzzles range from riddles to logic grids to ciphers
- **Live leaderboard** - See other teams' progress in real-time
- **Admin controls** - Reset game between sessions
- **Responsive design** - Works on desktop and tablet
- **1920s aesthetic** - Period-appropriate styling and language

## 🔧 Customization

### Change Game ID
Edit `src/useGameSync.js`:
```javascript
const GAME_ID = "blackwood-04-20-2026"; // Update for each event
```

### Modify Teams
Edit `src/App.jsx`:
```javascript
const TEAMS = ["Team Raven", "Team Falcon", "Team Serpent", "Team Wolf"];
const TEAM_COLORS = {
  "Team Raven": "#c084fc",
  "Team Falcon": "#60a5fa",
  // ...
};
```

### Adjust Difficulty
- Change `TOTAL_CLUES` constant (currently 10)
- Modify `acceptedAnswers` arrays for more lenient matching
- Edit suspect `system` prompts to make them more/less cooperative

## 📝 License

This project is provided as-is for educational and entertainment purposes.

## 🤝 Credits

Built with React, Firebase, and Claude AI. Inspired by classic murder mystery games and 1920s detective fiction.

---

**Need help?** Check the admin panel at `/admin` or review the puzzle answers above.
