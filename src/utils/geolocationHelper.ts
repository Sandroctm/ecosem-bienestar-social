export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  formatted: string;
  mapsUrl: string;
}

// Mapa de Coordenadas Oficiales por Campamento / Sede
const CAMP_COORDINATES_MAP: Record<string, { lat: number; lng: number }> = {
  'Sede Morococha - Unidad Toromocho': { lat: -11.9541, lng: -76.0123 },
  'Campamento Soledad': { lat: -11.9610, lng: -76.0210 },
  'Campamento Diana': { lat: -11.9480, lng: -76.0050 },
  'Campamento Central': { lat: -11.9500, lng: -76.0100 },
  'Campamento Carhuacoto': { lat: -11.9700, lng: -76.0300 },
  'Campamento Tuctu': { lat: -11.9300, lng: -75.9900 },
};

/**
 * Obtiene las coordenadas GPS en tiempo real del dispositivo o entrega la ubicación asignada al campamento/sede del trabajador.
 */
export async function getDeviceGeolocation(campName?: string): Promise<GPSCoordinates> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(getFallbackCoordinates(campName));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        const label = campName ? ` (${campName})` : '';
        resolve({
          latitude: lat,
          longitude: lng,
          formatted: `Lat: ${lat}°, Lon: ${lng}°${label}`,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        });
      },
      (error) => {
        console.warn('Uso de coordenadas según campamento/lugar del trabajador:', error);
        resolve(getFallbackCoordinates(campName));
      },
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 60000,
      }
    );
  });
}

export function getFallbackCoordinates(campName?: string): GPSCoordinates {
  let lat = -11.9541;
  let lng = -76.0123;

  if (campName && CAMP_COORDINATES_MAP[campName]) {
    lat = CAMP_COORDINATES_MAP[campName].lat;
    lng = CAMP_COORDINATES_MAP[campName].lng;
  }

  const label = campName || 'Toromocho';

  return {
    latitude: lat,
    longitude: lng,
    formatted: `Lat: ${lat}°, Lon: ${lng}° (${label})`,
    mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
  };
}
