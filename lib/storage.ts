import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

import { storage } from './firebase';

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export async function uploadAudio(
  userId: string,
  uri: string,
  filename: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const blob = await uriToBlob(uri);
  const storageRef = ref(storage, `demos/${userId}/audio/${Date.now()}_${filename}`);
  const task = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function uploadCoverImage(
  userId: string,
  uri: string,
  filename: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const blob = await uriToBlob(uri);
  const storageRef = ref(storage, `demos/${userId}/covers/${Date.now()}_${filename}`);
  const task = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(pct);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
