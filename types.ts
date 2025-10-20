import { type Timestamp } from 'firebase/firestore';
// Fix: Import the User type from firebase/auth to define our app's User type.
import type { User as FirebaseUser } from 'firebase/auth';

export interface Link {
  id: string;
  userId?: string;
  url: string;
  summary: string;
  tags: string[];
  createdAt: Timestamp;
  title?: string;
}

// Fix: Add and export the User type, which was previously missing.
export type User = FirebaseUser;
