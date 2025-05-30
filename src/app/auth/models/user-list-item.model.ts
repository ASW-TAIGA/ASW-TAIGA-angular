export interface ApiKeyObject {
    key_display: string;
    created_at: string;
    expires_at: string;
  }
  
  export interface UserListItemProfile {
    bio?: string | null;
    avatar_url?: string | null;
  }
  
  export interface UserListItem {
    id: number;
    username: string;
    email?: string;
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
    api_key_object?: ApiKeyObject | null; // Make it optional as not all users might have one immediately
  }
  