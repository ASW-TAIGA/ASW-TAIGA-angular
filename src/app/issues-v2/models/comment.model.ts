import { User } from './user.model';

export interface Comment {
  id: number;
  issue: number;
  author: User;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentPayload {
  issue: number;
  text: string;
}
