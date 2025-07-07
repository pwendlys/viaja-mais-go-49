
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        places: {
          Autocomplete: any;
        };
        DirectionsService: any;
        DirectionsRenderer: any;
        Geocoder: any;
        TravelMode: {
          DRIVING: any;
        };
        LatLng: any;
        MapMouseEvent: any;
      };
    };
  }
}

export {};
