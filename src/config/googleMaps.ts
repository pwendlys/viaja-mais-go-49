
// Função para obter a chave da API do localStorage
const getGoogleMapsApiKey = (): string => {
  const savedKey = localStorage.getItem('google_maps_api_key');
  // Se não houver chave salva, usar a chave fornecida pelo usuário
  if (!savedKey || savedKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return 'AIzaSyC1RTNnAuPOxerNlXqZfIXPYFHdmRg3qow';
  }
  return savedKey;
};

// Configure sua chave da API do Google Maps aqui
export const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

// Configurações do Google Maps
export const GOOGLE_MAPS_LIBRARIES = ['places', 'geometry'];

// Configurações de mapa padrão
export const DEFAULT_MAP_CONFIG = {
  center: { lat: -23.5505, lng: -46.6333 }, // São Paulo como padrão
  zoom: 15,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Configurações de autocomplete
export const AUTOCOMPLETE_CONFIG = {
  types: ['address'],
  componentRestrictions: { country: 'BR' },
  fields: ['formatted_address', 'geometry'],
};
