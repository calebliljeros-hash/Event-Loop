const NOMINATIM_HEADERS = {
  'User-Agent': 'EventLoop/1.0 (student project)',
};

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: NOMINATIM_HEADERS }
    );

    const data = await response.json();

    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon), // Nominatim uses "lon" not "lng"
      displayName: data[0].display_name,
    };
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to a display name.
 * Falls back to formatted coords if the API fails.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: NOMINATIM_HEADERS }
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
}
