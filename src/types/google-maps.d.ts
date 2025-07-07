
declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => google.maps.Map;
        Marker: new (options: any) => google.maps.Marker;
        DirectionsService: new () => google.maps.DirectionsService;
        DirectionsRenderer: new (options?: any) => google.maps.DirectionsRenderer;
        Geocoder: new () => google.maps.Geocoder;
        TravelMode: {
          DRIVING: string;
          WALKING: string;
          BICYCLING: string;
          TRANSIT: string;
        };
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: any) => google.maps.places.Autocomplete;
        };
      };
    };
  }

  namespace google.maps {
    interface Map {
      addListener(eventName: string, handler: Function): void;
    }

    interface MapMouseEvent {
      latLng: {
        lat(): number;
        lng(): number;
      } | null;
    }

    interface DirectionsResult {
      routes: Array<{
        legs: Array<{
          distance?: { text: string; value: number };
          duration?: { text: string; value: number };
        }>;
      }>;
    }

    namespace places {
      interface Autocomplete {
        addListener(eventName: string, handler: Function): void;
        getPlace(): {
          formatted_address?: string;
          geometry?: {
            location: {
              lat(): number;
              lng(): number;
            };
          };
        };
      }
    }
  }
}

export {};
