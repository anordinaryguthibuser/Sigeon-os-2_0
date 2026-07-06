import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  getDocs,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';

// Credentials retrieved from firebase-applet-config.json
const firebaseConfig = {
  projectId: "abiding-team-dnzsc",
  appId: "1:743635621123:web:02d22ccc2f01dda81f8536",
  apiKey: "AIzaSyCQboypKv6Cii4AZ1Hgcd8rXjrG-qA7cUs",
  authDomain: "abiding-team-dnzsc.firebaseapp.com",
  databaseId: "ai-studio-sigeonos20-27f92820-1e45-4f19-8c8f-d3552e30abb8",
  storageBucket: "abiding-team-dnzsc.firebasestorage.app",
  messagingSenderId: "743635621123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.databaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: false,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'users', 'test_connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export interface ChatMessage {
  id?: string;
  username: string;
  text: string;
  timestamp: Timestamp;
}

export interface UserPresence {
  username: string;
  lastActive: Timestamp;
}

// Check if a username is available
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return false;
  const path = `users/${normalized}`;
  try {
    const docRef = doc(db, 'users', normalized);
    const docSnap = await getDoc(docRef);
    return !docSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export interface UserDoc {
  username: string;
  lastActive: any;
  password?: string;
}

// Get user document by username
export async function getUserDoc(username: string): Promise<UserDoc | null> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return null;
  const path = `users/${normalized}`;
  try {
    const docRef = doc(db, 'users', normalized);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserDoc;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// Register username with optional password
export async function registerUsername(username: string, password?: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  const available = await isUsernameAvailable(username);
  if (!available) return false;

  const path = `users/${normalized}`;
  try {
    const docRef = doc(db, 'users', normalized);
    const data: any = {
      username: username.trim(),
      lastActive: serverTimestamp()
    };
    if (password) {
      data.password = password;
    }
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update user heartbeat presence
export async function updateUserPresence(username: string) {
  const normalized = username.trim().toLowerCase();
  const path = `users/${normalized}`;
  try {
    const docRef = doc(db, 'users', normalized);
    await setDoc(docRef, {
      username: username.trim(),
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Send a chat message
export async function sendChatMessage(username: string, text: string) {
  const path = 'messages';
  try {
    await addDoc(collection(db, 'messages'), {
      username,
      text,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Subscribe to real-time chat messages
export function subscribeToMessages(callback: (messages: ChatMessage[]) => void) {
  const path = 'messages';
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        username: data.username,
        text: data.text,
        timestamp: data.timestamp
      });
    });
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Subscribe to all users to determine presence counts
export function subscribeToUsers(callback: (users: UserPresence[]) => void) {
  const path = 'users';
  const q = collection(db, 'users');
  return onSnapshot(q, (snapshot) => {
    const users: UserPresence[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.username && data.lastActive) {
        users.push({
          username: data.username,
          lastActive: data.lastActive
        });
      }
    });
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}
