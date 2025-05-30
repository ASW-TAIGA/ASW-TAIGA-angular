/**
 * @fileoverview Defines the interface for API key data.
 */

/**
 * Represents the structure of a user's API key information.
 */
export interface ApiKey {
    key_display: string;
    created_at: string; // ISO date string
    expires_at: string | null; // ISO date string or null
  }
  