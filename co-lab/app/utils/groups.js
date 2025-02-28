'use client';

import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  onSnapshot, 
  doc, 
  arrayUnion, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  limit,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Create a new group
export async function createGroup(groupName, subject, experimentDetails) {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    // Create the group document
    const groupRef = await addDoc(collection(db, "groups"), {
      name: groupName,
      subject,
      experimentDetails,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      creatorName: user.displayName || user.email || 'Anonymous',
      members: [user.uid],
      membersCount: 1
    });
    
    // Also add this user to the members subcollection
    await addDoc(collection(db, `groups/${groupRef.id}/members`), {
      uid: user.uid,
      displayName: user.displayName || user.email || 'Anonymous',
      email: user.email,
      photoURL: user.photoURL || null,
      joinedAt: serverTimestamp(),
      role: 'admin', // Group creator is admin
      online: true
    });
    
    return groupRef.id;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error; // Rethrow to handle in the component
  }
}

// Get all available groups
export function getAvailableGroups(callback) {
  const groupsQuery = query(
    collection(db, "groups"),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(groupsQuery, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    callback(groups);
  });
}

// Join a group
export async function joinGroup(groupId) {
  const user = auth.currentUser;
  if (!user) return false;
  
  const groupRef = doc(db, "groups", groupId);
  
  try {
    // Add user to members array in group document
    await updateDoc(groupRef, {
      members: arrayUnion(user.uid),
      membersCount: increment(1)
    });
    
    // Add user to members subcollection
    await addDoc(collection(db, `groups/${groupId}/members`), {
      uid: user.uid,
      displayName: user.displayName || user.email || 'Anonymous',
      email: user.email,
      photoURL: user.photoURL || null,
      joinedAt: serverTimestamp(),
      role: 'member',
      online: true
    });
    
    return true;
  } catch (error) {
    console.error("Error joining group:", error);
    return false;
  }
}

// Get groups the current user is a member of
export function getUserGroups(callback) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }
  
  const groupsQuery = query(
    collection(db, "groups"),
    where("members", "array-contains", user.uid),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(groupsQuery, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    callback(groups);
  });
}

// Leave a group
export async function leaveGroup(groupId) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    // Get the member document to delete
    const membersQuery = query(
      collection(db, `groups/${groupId}/members`),
      where("uid", "==", user.uid)
    );
    
    const memberSnapshot = await getDocs(membersQuery);
    
    if (!memberSnapshot.empty) {
      // Delete the member document
      const memberDoc = memberSnapshot.docs[0];
      await deleteDoc(doc(db, `groups/${groupId}/members`, memberDoc.id));
    }
    
    // Update the group document
    const groupRef = doc(db, "groups", groupId);
    
    // Remove user from members array and decrement count
    // Note: Removing from arrays is trickier - we need to get current array and filter
    const groupDoc = await getDoc(groupRef);
    const currentMembers = groupDoc.data().members || [];
    const updatedMembers = currentMembers.filter(uid => uid !== user.uid);
    
    await updateDoc(groupRef, {
      members: updatedMembers,
      membersCount: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error("Error leaving group:", error);
    return false;
  }
}