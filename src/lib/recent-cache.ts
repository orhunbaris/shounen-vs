/**
 * Lightweight in-memory cache to track recently shown characters
 * Prevents the same characters from appearing in back-to-back battles
 */
class RecentCharacterCache {
  private cache: number[] = [];
  private readonly maxSize: number = 6;

  /**
   * Check if a character ID is in the recent cache
   */
  has(characterId: number): boolean {
    return this.cache.includes(characterId);
  }

  /**
   * Add a character ID to the recent cache
   * Implements FIFO - removes oldest entry if cache exceeds maxSize
   */
  add(characterId: number): void {
    // Don't add if already exists
    if (this.has(characterId)) {
      return;
    }

    this.cache.push(characterId);

    // Remove oldest entry if cache exceeds max size (FIFO)
    if (this.cache.length > this.maxSize) {
      this.cache.shift();
    }
  }

  /**
   * Get all cached character IDs
   */
  getAll(): number[] {
    return [...this.cache];
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.length;
  }

  /**
   * Clear the cache (useful for testing or reset)
   */
  clear(): void {
    this.cache = [];
  }

  /**
   * Get cache status for debugging
   */
  getStatus(): { cache: number[]; size: number; maxSize: number } {
    return {
      cache: [...this.cache],
      size: this.cache.length,
      maxSize: this.maxSize,
    };
  }
}

// Create a singleton instance to share across the app
export const recentCharacterCache = new RecentCharacterCache();
