export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  formatted: string;
  mapsUrl: string;
}

/**
 * Obtiene las coordenadas GPS en tiempo real del dispositivo móvil/navegador.
 * Si el usuario deniega o la API no responde a tiempo, entrega coordenadas de respaldo de la Sede Morococha - Toromocho.
 */
export async function getDeviceGeolocation(): Promise<GPSCoordinates> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(getFallbackCoordinates());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        resolve({
          latitude: lat,
          longitude: lng,
          formatted: `Lat: ${lat}°, Lon: ${lng}°`,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        });
      },
      (error) => {
        console.warn('Acceso GPS denegado o timeout. Usando geolocalización de Sede Toromocho:', error);
        resolve(getFallbackCoordinates());
      },
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 60000,
      }
    );
  });
}

export function getFallbackCoordinates(): GPSCoordinates {
  // Coordenadas oficiales Sede Morococha - Unidad Toromocho, Junín, Perú
  const lat = -11.9541;
  const lng = -76.0123;
  return {
    latitude: lat,
    longitude: lng,
    formatted: `Lat: ${lat}°, Lon: ${lng}° (Toromocho)`,
    mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
  };
}
