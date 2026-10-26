export type Category =
  | 'BUG' | 'ACCESS_ISSUE' | 'BILLING' | 'FEATURE_REQUEST' | 'HOW_TO' | 'OUTAGE' | 'OTHER';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'OPEN' | 'RESOLVED';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  summary: string | null;
  suggestedAction: string | null;
  aiTriaged: boolean;
  status: Status;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
}
