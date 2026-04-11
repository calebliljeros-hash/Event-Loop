const STORAGE_KEY = 'event_loop_location';

export interface SavedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

/** Read saved location from localStorage. Returns null if missing or corrupt. */
export function getSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic validation
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number' && parsed.displayName) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Save location to localStorage. */
export function saveLocation(loc: SavedLocation): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
}

/** Remove saved location from localStorage. */
export function clearLocation(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Extract a short city-level name from Nominatim's display_name.
 * "Orlando, Orange County, Florida, United States" → "Orlando"
 * "123 Main St, Orlando, Florida, United States" → "Orlando" (skips short first segments)
 */
export function getShortName(displayName: string): string {
  const parts = displayName.split(',').map((p) => p.trim());
  // If the first part looks like a street number, use the second part
  if (parts.length > 1 && /^\d/.test(parts[0])) {
    return parts[1];
  }
  return parts[0] || displayName;
}
