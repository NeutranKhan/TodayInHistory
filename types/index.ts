export interface HistoryEvent {
  id?: string;
  year: number;
  monthDay: string; // Format: "MM-DD"
  title: string;
  content: string;
  impactSummary: string;
  imageURL?: string;
  createdAt: number;
  totalRating?: number;
  ratingCount?: number;
  likes?: number;
  dislikes?: number;
}

export interface FeedbackSubmission {
  id?: string;
  name: string;
  email: string;
  type: string;
  message: string;
  rating: number;
  createdAt: unknown; // Firestore Timestamp
}
