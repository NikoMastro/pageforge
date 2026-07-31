import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb, googleProvider } from "./config";

export type User = FirebaseUser;

export type AuthState = {
  user: FirebaseUser | null;
  loading: boolean;
  isAllowed: boolean;
};

const ALLOWLIST_COLLECTION = "allowlist"; // docs keyed by uid or email

function normalizeEmailForCompare(email: string): string {
  const lower = email.trim().toLowerCase();
  const atIndex = lower.lastIndexOf("@");
  if (atIndex === -1) return lower;
  const local = lower.slice(0, atIndex);
  const domain = lower.slice(atIndex + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    const noPlus = local.split("+")[0];
    const noDots = noPlus.split(".").join("");
    return `${noDots}@gmail.com`;
  }
  return `${local}@${domain}`;
}

const STATIC_ALLOWED_EMAILS = new Set<string>([
  normalizeEmailForCompare("demo@example.com"),
    
]);
const ALLOWED_EMAIL_DOMAINS = ["example.com"]; // matches *@example.com

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function sendResetEmail(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthState(
  onChange: (state: AuthState) => void
): () => void {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  onChange({ user: null, loading: true, isAllowed: false });

  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (!user) {
      onChange({ user: null, loading: false, isAllowed: false });
      return;
    }

    // Static checks: specific email or approved domain
    let isAllowed = false;
    const rawEmail = user.email ?? "";
    const email = normalizeEmailForCompare(rawEmail);
    if (email) {
      if (STATIC_ALLOWED_EMAILS.has(email)) {
        isAllowed = true;
      } else if (ALLOWED_EMAIL_DOMAINS.some((d) => email.endsWith(`@${d}`))) {
        isAllowed = true;
      }
    }

    // Fallback to Firestore allowlist
    try {
      if (!isAllowed) {
        const uidDoc = await getDoc(doc(db, ALLOWLIST_COLLECTION, user.uid));
        if (uidDoc.exists()) {
          isAllowed = true;
        } else if (email) {
          const emailDoc = await getDoc(doc(db, ALLOWLIST_COLLECTION, email));
          isAllowed = emailDoc.exists();
        }
      }
    } catch {
      isAllowed = false;
    }

    onChange({ user, loading: false, isAllowed });
  });
}
