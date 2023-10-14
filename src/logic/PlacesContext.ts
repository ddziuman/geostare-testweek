export interface PlacesContext {
  searchMessage: PlaceErrorMessage;
  places: Place[];
}

export interface Place {
  name: string;
  categories: PlaceCategory[],
  address?: string;
  latitude?: number;
  longtitude?: number;
  relatedPlaces: RelatedPlaces;
  distanceMeters?: number;
  description?: string;
  openNow?: boolean;
  workingHours?: string; // e.g. "Mon-Wed 10:30 AM-5:00 PM; Thu 10:30 AM-8:00 PM; Fri-Sun 10:30 AM-5:00 PM"
  ratingOutOfTen?: number;
} // unified represenation of 'Place' object

export interface RelatedPlaces {
  children?: Partial<Place>[];
  parent?: Partial<Place>;
}

export interface PlaceCategory {
  title: string,
  categoryIconURL: RequestInfo | URL;
}

export enum PlaceErrorMessage {
  ok = "",
  serverDown = "We are sorry 😔\nOur data source seems not to be working right now!",
  tooLateTooFar = "We are sorry ⛺\nIt seems you are too late or too far from civilization!",
}