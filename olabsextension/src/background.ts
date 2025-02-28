import { db } from "./firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getData } from "./utils/storage";

chrome.tabs.onUpdated.addListener(async () => {
  const details = await getData("experimentDetails");
  if (details) {
    await addDoc(collection(db, "experiments"), {
      sub: details.sub,
      sim: details.sim,
      cnt: details.cnt,
      timestamp: serverTimestamp()
    });
    console.log("User added to experiment tracking:", details);
  }
});
