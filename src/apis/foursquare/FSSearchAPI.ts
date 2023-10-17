import { PlacesContext, PlaceErrorMessage, Place, PlaceCategory, RelatedPlaces } from "../../logic/PlacesContext";
import { SearchPlacementRecord } from "../../logic/SearchPlacementRecord";
import { API, APIProps } from "../API";
import { FSSearchRecord, FSSearchSortingKey } from "./FSSearchRecord";
import { FSPlace, FSPlaceCategory, FSPlaceLocation, FSSearchResult } from "./FSSearchResult";
import { FSSearchKeys } from "./FSSearchResult";
import { ensureNonEmptyString } from "../../validators/ensureNonEmptyString";
import { PlacesMathService } from "../../logic/PlacesMathService";

export class FSSearchAPI extends API<FSSearchRecord, FSSearchResult, SearchPlacementRecord, PlacesContext> {
  constructor(apiProps: APIProps) {
    super(apiProps);
  }

  private placesMath = this.getDependency<PlacesMathService>(PlacesMathService);

  adaptFrom(adaptee: SearchPlacementRecord): FSSearchRecord { // logic --> api
    return {
      ll: `${adaptee.latitude},${adaptee.longtitude}`,
      radius: String(adaptee.radius),
      limit: String(adaptee.lookupLimit),
      sort: FSSearchSortingKey.distance,
      fields: FSSearchKeys,
    };
  }

  adaptFor(adaptee: FSSearchResult): PlacesContext { // api --> logic
    const { latitude, longtitude } = adaptee.context.geo_bounds.circle.center;
    const fsPlaces = adaptee.results;
    const searchMessage = fsPlaces.length > 0 ? 
      PlaceErrorMessage.ok : PlaceErrorMessage.tooLateTooFar;
    let places: Place[] = [];
    if (fsPlaces.length > 0) {
      places.push(
        ...this.adaptFSPlacesToPlaces(fsPlaces)
        .sort(this.placesMath.multiKeyPlaceSort(latitude, longtitude)));
    }
    return { searchMessage, places };
  }

  private adaptFSPlacesToPlaces(fsPlaces: FSPlace[]): Place[] {
    const places: Place[] = [];
    for (const fsPlace of fsPlaces) {
      places.push(this.adaptFSPlaceToPlace(fsPlace));
    }
    return places;
  }

  private adaptFSPlaceToPlace(fsPlace: FSPlace): Place {
    const { latitude, longtitude } = fsPlace.geocodes.main;
    const hours = fsPlace.hours;
    const categories: PlaceCategory[] = fsPlace.categories.map(this.adaptFSPlaceCategoryToCategory.bind(this));
    const address = this.adaptFSPlaceLocationToString(fsPlace.location, latitude, longtitude);
    
    let relatedPlaces: RelatedPlaces = {};
    const fsRelatedPlaces = fsPlace.related_places;
    if (fsRelatedPlaces) {
      const { children: fsChildren, parent: fsParent } = fsRelatedPlaces;
      if (fsChildren) {
        const children: Partial<Place>[] = [];
        for (const shortPlace of fsChildren) {
          children.push({ 
            name: shortPlace.name, 
            categories: shortPlace.categories.map(this.adaptFSPlaceCategoryToCategory.bind(this)) });
        }
        relatedPlaces.children = children;
      }
      if (fsParent) {
        relatedPlaces.parent = {
          name: fsParent.name,
          categories: fsParent.categories.map(this.adaptFSPlaceCategoryToCategory.bind(this)),
        };
      }
    }
    return {
      name: fsPlace.name,
      address,
      categories,
      relatedPlaces,
      latitude,
      longtitude,
      distanceMeters: fsPlace.distance,
      description: fsPlace.description,
      workingHours: hours?.display,
      openNow: hours?.open_now,
      ratingOutOfTen: fsPlace.rating,
    }
  }

  private adaptFSPlaceLocationToString(
      location: FSPlaceLocation, 
      latitude: number,
      longtitude: number,
    ): string {
    let formattedAddress = location.formatted_address;
    const country = location.country;
    const addressTokens: string[] = [];
    if (ensureNonEmptyString(formattedAddress)) {
      const postcode = location.postcode;
      if (ensureNonEmptyString(postcode)) {
        formattedAddress = formattedAddress!.slice(
          0, formattedAddress!.length - postcode!.length - 1);
      }
      addressTokens.push(formattedAddress!);
    } else {
      const { address, dma, region, cross_street } = location;
      if (ensureNonEmptyString(address)) {
        addressTokens.push(address!);
      } else {
        addressTokens.push(`<${latitude},${longtitude}>`);
      }
      if (ensureNonEmptyString(cross_street)) {
        addressTokens.push(` (${cross_street})`);
      }
      if (ensureNonEmptyString(dma)) {
        addressTokens.push(`, ${dma}`);
      }
      if (ensureNonEmptyString(region)) {
        addressTokens.push(`, ${region}`);
      }
    }
    if (ensureNonEmptyString(country)) {
      addressTokens.push(`, ${country}`);
    }
    return addressTokens.join('');
  }

  private adaptFSPlaceCategoryToCategory(fsCategory: FSPlaceCategory): PlaceCategory {
    const { prefix, suffix } = fsCategory.icon;
    return {
      title: fsCategory.name,
      categoryIconURL: `${prefix}${this.categoryIconSize}${suffix}`,
    }
  }

  async searchPlaces(searchRecord: SearchPlacementRecord): Promise<PlacesContext> {
    const fsSearchRecord = this.adaptFrom(searchRecord);
    const { resource, init } = this.prepareRequest(fsSearchRecord);
    let response: Response, result: FSSearchResult, ctx: PlacesContext;
    try {
      response = await fetch(resource, init);
      if (!response.ok) throw new Error();
      result = await response.json();
    } catch (e) {
      ctx = {
        searchMessage: PlaceErrorMessage.serverDown,
        places: [],
      };
      return ctx;
    }
    ctx = this.adaptFor(result);
    return ctx;
  }

  get categoryIconSize() {
    return 32;
  }
}