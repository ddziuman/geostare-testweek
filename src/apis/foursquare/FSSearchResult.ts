export interface FSSearchResult {
  results: FSPlace[];
  context: {
    geo_bounds: {
      circle: {
        center: {
          latitude: number;
          longtitude: number;
        };
        radius: number;
      };
    };
  };
}

export interface FSPlaceShort {
  // needed for 'related' sub-places ('children' array)
  categories: FSPlaceCategory[];
  name: string;
}

export interface FSPlace extends FSPlaceShort {
  // minimal interesting set of data

  // POI Core Data
  geocodes: {
    main: {
      latitude: number;
      longtitude: number;
    };
  };
  location: FSPlaceLocation;
  related_places?: FSPlaceRelated;
  distance: number; // in m
  closed_bucket: string; // probability of opennness (if 'hours' data is unavailable!)
  timezone: string; // from IANA, e.g. "Asia/Shanghai" (use Intl.DateTimeFormat to get Date)

  // POI Rich Data???
  description?: string;
  hours?: {
    display?: string; // specifically formatted hours of work, for example: "Mon-Wed 10:30 AM-5:00 PM; Thu 10:30 AM-8:00 PM; Fri-Sun 10:30 AM-5:00 PM"
    open_now?: boolean;
  };
  hours_popular?: FSPlaceHours[]; // for defining 'prime time!' styling flag, (warning for users!)
  rating?: number; // 0.0-10.0 (has mapped recommended colors in v2 api, we can map them manually for some background)
  date_closed?: string; // check if 'hours' is not present
  photos?: FSPlacePhoto[];
}

export interface FSPlaceLocation {
  formatted_address?: string;
  address?: string;
  country?: string; // 2-letter code
  dma?: string; // city
  region?: string;
  cross_street?: string;
  postcode?: string;
}

export interface FSPlaceRelated {
  children?: FSPlaceShort[];
  parent?: FSPlaceShort;
}

export interface FSPlaceCategory {
  icon: {
    prefix: string; // add sizing after prefix!!! + auth token
    suffix: string;
  };
  name: string;
}

export interface FSPlaceHours {
  day: number;
  open: string;
  close: string;
}

export interface FSPlacePhoto {
  created_at: string; // UTC string
  prefix: string;
  suffix: string;
  width: number;
  height: number;
}

export const FSSearchKeys: string = (() => {
  const runtimeDummyPlace: FSPlace = {
    name: '',
    geocodes: {
      main: {
        latitude: 0,
        longtitude: 0,
      },
    },
    categories: [],
    location: {},
    related_places: {},
    distance: 0,
    closed_bucket: '',
    timezone: '',
    description: '',
    hours: {},
    hours_popular: [],
    rating: 0,
    date_closed: '',
    photos: [],
  }
  return Object.keys(runtimeDummyPlace).join(',');
})();
  
