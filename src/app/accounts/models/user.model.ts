import { ApiKey } from './api-key.model';
import { UserProfile, UserProfileUpdatePayload } from './profile.model';

/**
 * Represents the detailed data for displaying a user's profile.
 * Contains all possible fields; sensitive fields are optional and typically
 * only present for the authenticated user's own profile.
 */
export interface UserProfileData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile: UserProfile; // Contains bio, avatar_url
  email?: string | null; // Optional: Only for "my profile"
  api_key_object?: ApiKey | null; // Optional: Only for "my profile"
}

/**
 * Represents the structure of a user item in a list, including their API key.
 * This is based on the example response for the /users/ endpoint.
 * This is used for the initial user selection.
 */
export interface UserListItem {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  api_key_object: ApiKey | null; // Full API key details needed for "login"
  avatar_url: string | null; // Direct avatar URL from the list
  // Note: The 'profile' field with bio is not in the UserListItem from backend example,
  // but UserProfileData expects a 'profile' object.
  // The AccountService will map UserListItem to UserProfileData if needed,
  // or more likely, UserListItem is used for selection, then /profile/me fetches full UserProfileData.
}


/**
 * Represents the payload for updating the authenticated user's core details (excluding profile).
 * All fields are optional.
 */
export interface UserCoreUpdatePayload {
  email?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Represents the complete payload for updating the authenticated user's self profile,
 * which can include updates to core user fields and/or profile-specific fields.
 */
export interface UserSelfProfileUpdatePayload {
  email?: string;
  first_name?: string;
  last_name?: string;
  profile?: UserProfileUpdatePayload; // For bio and avatar file
}

// The User interface previously represented the /profile/me response.
// It's now effectively replaced by UserProfileData for display purposes.
// If the backend /profile/me endpoint returns a structure identical to UserProfileData
// (with optional fields for email/api_key if not present), then this is fine.
// If /profile/me specifically returns a type *with* email and api_key_object guaranteed,
// the service will map it to UserProfileData.

// UserPublicProfile is also effectively covered by UserProfileData where email/api_key are just undefined.
