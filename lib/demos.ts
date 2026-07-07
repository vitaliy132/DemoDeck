import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  updateDoc,
  where,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

import { db } from './firebase';
import { ChartEntry, ChartPeriod, Demo, FeedItem, Repost, UserProfile } from './types';

function mapDemo(id: string, data: DocumentData): Demo {
  return {
    id,
    userId: data.userId,
    title: data.title,
    genre: data.genre,
    audioUrl: data.audioUrl,
    coverUrl: data.coverUrl,
    durationSec: data.durationSec ?? 0,
    likeCount: data.likeCount ?? 0,
    repostCount: data.repostCount ?? 0,
    playCount: data.playCount ?? 0,
    createdAt: data.createdAt,
  };
}

export function computeScore(demo: Demo): number {
  return demo.likeCount * 2 + demo.repostCount * 3 + demo.playCount;
}

export function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), updates);
}

export async function createDemo(params: {
  userId: string;
  title: string;
  genre: string;
  audioUrl: string;
  coverUrl?: string;
  durationSec: number;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'demos'), {
    ...params,
    likeCount: 0,
    repostCount: 0,
    playCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDemo(demoId: string): Promise<Demo | null> {
  const snap = await getDoc(doc(db, 'demos', demoId));
  if (!snap.exists()) return null;
  return mapDemo(snap.id, snap.data());
}

export async function incrementPlayCount(demoId: string): Promise<void> {
  await updateDoc(doc(db, 'demos', demoId), { playCount: increment(1) });
}

export async function isDemoLiked(demoId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'demos', demoId, 'likes', userId));
  return snap.exists();
}

export async function toggleLike(
  demoId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  const likeRef = doc(db, 'demos', demoId, 'likes', userId);
  const demoRef = doc(db, 'demos', demoId);

  if (currentlyLiked) {
    await deleteDoc(likeRef);
    await updateDoc(demoRef, { likeCount: increment(-1) });
  } else {
    await setDoc(likeRef, { createdAt: serverTimestamp() });
    await updateDoc(demoRef, { likeCount: increment(1) });
  }
}

export async function hasReposted(userId: string, demoId: string): Promise<boolean> {
  const repostId = `${userId}_${demoId}`;
  const snap = await getDoc(doc(db, 'reposts', repostId));
  return snap.exists();
}

export async function repostDemo(userId: string, demoId: string): Promise<void> {
  const repostId = `${userId}_${demoId}`;
  const repostRef = doc(db, 'reposts', repostId);
  const existing = await getDoc(repostRef);
  if (existing.exists()) return;

  await setDoc(repostRef, {
    userId,
    demoId,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'demos', demoId), { repostCount: increment(1) });
}

export async function getUserDemos(userId: string): Promise<Demo[]> {
  const q = query(
    collection(db, 'demos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDemo(d.id, d.data()));
}

export async function getFeedItems(): Promise<FeedItem[]> {
  const [demosSnap, repostsSnap] = await Promise.all([
    getDocs(query(collection(db, 'demos'), orderBy('createdAt', 'desc'), limit(50))),
    getDocs(query(collection(db, 'reposts'), orderBy('createdAt', 'desc'), limit(50))),
  ]);

  const demos = demosSnap.docs.map((d) => mapDemo(d.id, d.data()));
  const reposts: Repost[] = repostsSnap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Repost, 'id'>),
  }));

  const demoMap = new Map(demos.map((d) => [d.id, d]));
  const userIds = new Set<string>();

  demos.forEach((d) => userIds.add(d.userId));
  reposts.forEach((r) => userIds.add(r.userId));

  const missingDemoIds = reposts
    .map((r) => r.demoId)
    .filter((id) => !demoMap.has(id));

  if (missingDemoIds.length > 0) {
    const extraDemos = await Promise.all(missingDemoIds.map((id) => getDemo(id)));
    extraDemos.forEach((d) => {
      if (d) {
        demoMap.set(d.id, d);
        userIds.add(d.userId);
      }
    });
  }

  demoMap.forEach((d) => userIds.add(d.userId));

  const profiles = new Map<string, UserProfile>();
  await Promise.all(
    Array.from(userIds).map(async (uid) => {
      const profile = await getUserProfile(uid);
      if (profile) profiles.set(uid, profile);
    })
  );

  const feedItems: FeedItem[] = [];

  demos.forEach((demo) => {
    feedItems.push({
      type: 'demo',
      id: `demo_${demo.id}`,
      demo,
      author: profiles.get(demo.userId),
    });
  });

  reposts.forEach((repost) => {
    const demo = demoMap.get(repost.demoId);
    const reposter = profiles.get(repost.userId);
    if (!demo || !reposter) return;

    feedItems.push({
      type: 'repost',
      id: `repost_${repost.id}`,
      demo,
      repostedBy: reposter,
      repostedAt: repost.createdAt,
      author: profiles.get(demo.userId),
    });
  });

  feedItems.sort((a, b) => {
    const aTime =
      a.type === 'repost' ? a.repostedAt?.toMillis() ?? 0 : a.demo.createdAt?.toMillis() ?? 0;
    const bTime =
      b.type === 'repost' ? b.repostedAt?.toMillis() ?? 0 : b.demo.createdAt?.toMillis() ?? 0;
    return bTime - aTime;
  });

  return feedItems.slice(0, 50);
}

export async function getChartEntries(period: ChartPeriod): Promise<ChartEntry[]> {
  const startDate = period === 'week' ? getStartOfWeek() : getStartOfMonth();
  const startTimestamp = Timestamp.fromDate(startDate);

  const q = query(
    collection(db, 'demos'),
    where('createdAt', '>=', startTimestamp),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const snap = await getDocs(q);
  const demos = snap.docs.map((d) => mapDemo(d.id, d.data()));

  const userIds = [...new Set(demos.map((d) => d.userId))];
  const profiles = new Map<string, UserProfile>();
  await Promise.all(
    userIds.map(async (uid) => {
      const profile = await getUserProfile(uid);
      if (profile) profiles.set(uid, profile);
    })
  );

  const ranked = demos
    .map((demo) => ({
      demo,
      author: profiles.get(demo.userId),
      score: computeScore(demo),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  return ranked.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
