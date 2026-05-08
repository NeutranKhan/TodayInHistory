export interface HistoryEvent {
  id?: string;
  year: number;
  monthDay: string; // Format: "MM-DD"
  title: string;
  content: string;
  impactSummary: string;
  imageURL?: string;
  createdAt: number;
}
