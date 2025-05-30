import { Issue, Comment as IssueComment } from '../../issues-v2/models';

export interface ProfileData {
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UserStats {
  open_assigned: number;
  watched: number;
  comments: number;
}

// This interface represents the full response from /api/v1/accounts/profile/{username}/
export interface UserProfileApiResponse {
  id: number;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null; // Only available for /profile/me/
  profile: ProfileData;
  stats: UserStats;
  active_tab: 'assigned' | 'watched' | 'comments'; // Reflects the requested tab
  list_title: string; // User-friendly title for the tab_content
  current_sort_field?: string | null; // Field used for sorting issue lists
  current_sort_direction?: 'asc' | 'desc' | null; // "asc" or "desc"
  tab_content: Issue[] | IssueComment[]; // Array of Issue objects or Comment objects
  // Note: The API doc implies tab_content is paginated, but we're ignoring pagination for now.
  // If pagination was used, tab_content would be nested in a pagination object:
  // tab_content: { count: number, next: string|null, previous: string|null, results: Issue[] | IssueComment[] }
}

// This can be used for the component's main user signal, extracting from UserProfileApiResponse
export interface DetailedUserForView {
  id: number;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  profile: ProfileData;
  stats: UserStats;
}


export interface UserProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile?: {
    bio?: string | null;
    // Avatar is handled separately with FormData
  };
}
