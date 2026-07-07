import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  createdAt: Timestamp;
}

export interface Demo {
  id: string;
  userId: string;
  title: string;
  genre: string;
  audioUrl: string;
  coverUrl?: string;
  durationSec: number;
  likeCount: number;
  repostCount: number;
  playCount: number;
  createdAt: Timestamp;
}

export interface Repost {
  id: string;
  userId: string;
  demoId: string;
  createdAt: Timestamp;
}

export type FeedItem =
  | { type: 'demo'; id: string; demo: Demo; author?: UserProfile }
  | {
      type: 'repost';
      id: string;
      demo: Demo;
      repostedBy: UserProfile;
      repostedAt: Timestamp;
      author?: UserProfile;
    };

export type ChartPeriod = 'week' | 'month';

export interface ChartEntry {
  rank: number;
  demo: Demo;
  author?: UserProfile;
  score: number;
}
