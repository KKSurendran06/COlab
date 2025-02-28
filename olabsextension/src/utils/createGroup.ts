import { db } from "../firebase/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, arrayUnion } from "firebase/firestore";
import fetchExperimentTitle from "./fetchExperimentTitle";
import getSubjectName from "./getSubjectName";

export const createOrJoinGroup = async (userId: string, sub: string, sim: string) => {
  try {
    const subjectName = await getSubjectName(sub);
    const experimentTitle = await fetchExperimentTitle(window.location.href);

    // Check if group exists
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("experimentId", "==", sim), where("subjectId", "==", sub));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Group exists, join the group
      const groupDoc = querySnapshot.docs[0];
      const groupRef = groupDoc.ref;

      await updateDoc(groupRef, {
        members: arrayUnion(userId),
      });

      return { success: true, message: "Joined existing group" };
    } else {
      // Create a new group
      await addDoc(groupsRef, {
        experimentId: sim,
        subjectId: sub,
        experimentName: experimentTitle,
        subjectName: subjectName,
        createdBy: userId,
        members: [userId],
      });

      return { success: true, message: "Group created successfully" };
    }
  } catch (error) {
    console.error("Error creating/joining group:", error);
    return { success: false, message: "Failed to create/join group" };
  }
};
