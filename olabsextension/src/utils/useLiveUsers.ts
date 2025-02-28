import { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function useLiveUsers(experimentId: string) {
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!experimentId) return;

    const experimentDocRef = doc(db, "experiments", experimentId);
    const unsubscribe = onSnapshot(experimentDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUsers(data?.liveUsers || []);
      }
    });

    return () => unsubscribe(); // Cleanup function to stop listening
  }, [experimentId]);

  return users;
}
