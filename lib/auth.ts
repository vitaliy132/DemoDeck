import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase';

export async function signUp(
  email: string,
  password: string,
  username: string,
  displayName: string,
  role: 'dj' | 'raver'
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  await setDoc(doc(db, 'users', credential.user.uid), {
    username: username.toLowerCase(),
    displayName,
    bio: '',
    avatarUrl: '',
    role,
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
