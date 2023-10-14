import { PlacesContext, PlaceErrorMessage, Place, PlaceCategory, RelatedPlaces } from "../../logic/PlacesContext.ts";
import { SearchPlacementRecord } from "../../logic/SearchPlacementRecord.ts";
import { ISearchAPI, AuthType, PayloadFormat } from "../ISearchAPI.ts";
import { FSSearchRecord } from "./FSSearchRecord.ts";
import { FSPlace, FSPlaceCategory, FSPlaceLocation, FSSearchResult } from "./FSSearchResult.ts";
import { RequsetInitFactory } from "../RequestInitFactory.ts";
import { FSSearchKeys } from "./FSSearchResult.ts";
import { ensureNonEmptyString } from "../../validators/ensureNonEmptyString.ts";

export class FSSearchAPI implements ISearchAPI<FSSearchRecord, FSSearchResult> {
  constructor(auth: AuthType, key: string, format: PayloadFormat, uri: RequestInfo | URL) {
    this.auth = auth;
    this.key = key;
    this.format = format;
    this.uri = uri;
    this.prepareRequest = RequsetInitFactory(this);
  }

  adaptFrom(adaptee: SearchPlacementRecord): FSSearchRecord { // logic --> api
    return {
      ll: `${adaptee.latitude},${adaptee.longtitude}`,
      radius: adaptee.radius,
      limit: "6",
      sort: "distance",
      fields: FSSearchKeys,
    };
  }

  adaptFor(adaptee: FSSearchResult): PlacesContext { // api --> logic
    const fsPlaces = adaptee.results;
    const searchMessage = fsPlaces.length > 0 ? 
      PlaceErrorMessage.ok : PlaceErrorMessage.tooLateTooFar;
    const places: Place[] = this.adaptFSPlacesToPlaces(fsPlaces);

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

  static get name(): string {
    return 'Foursquare';
  }

  public auth: AuthType;
  public key: string;
  public format: PayloadFormat;
  public uri: RequestInfo | URL;
  public prepareRequest: (record: FSSearchRecord) => { resource: RequestInfo | URL; init: RequestInit };
}