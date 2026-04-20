import { useEffect } from "react";
import { db, ref, set, onValue, update } from "./firebase";

const GAME_ID = "blackwood-04-20-2026"; // change this to a unique ID per event

// Write this team's progress to Firebase
export function syncTeamProgress(teamName, solvedCount, accusation = null) {
  const teamRef = ref(db, `games/${GAME_ID}/teams/${teamName}`);
  update(teamRef, {
    solvedCount,
    lastUpdated: Date.now(),
    ...(accusation && { accusation }),
  });
}

// Subscribe to all teams' progress
export function useAllTeams(callback) {
  useEffect(() => {
    const teamsRef = ref(db, `games/${GAME_ID}/teams`);
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
    return () => unsubscribe();
  }, []);
}

// Reset the entire game (delete all team data)
export function resetGame() {
  const gameRef = ref(db, `games/${GAME_ID}`);
  return set(gameRef, null);
}
