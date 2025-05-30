/**
 * @fileoverview Defines interfaces related to user profile data.
 */

/**
 * Represents the structure of a user's profile information as received from the backend.
 */
export interface UserProfile {
    bio: string | null;
    avatar_url: string | null;
  }
  
  /**
   * Represents the payload for updating a user's profile information.
   * The 'avatar' field is for uploading a new avatar file.
   * If 'avatar' is null, it might indicate a request to remove the avatar.
   */
  export interface UserProfileUpdatePayload {
    bio?: string;
    avatar?: File | null;
  }
  