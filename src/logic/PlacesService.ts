import { Place, PlaceErrorMessage, PlacesContext } from "./PlacesContext.ts";
import { UserPlacementRecord } from "../view/UserPlacementRecord.ts";
import { SearchPlacementRecord } from "./SearchPlacementRecord.ts";
import { FSSearchAPI } from "../apis/foursquare/FSSearchAPI.ts";
import { precompleteConfig } from "../view/precompleteConfig.ts";
import { Service } from "../abstract/Service.ts";
import { PlacesCacheService } from "./PlacesCacheService.ts";

type PlacesServiceProps = { radius: number };

// TODO: Implement caching responses from APIs (from certain coordinates) => (from single place)

export class PlacesService extends Service<PlacesServiceProps> {
  // business logic layer
  constructor(searchProps: PlacesServiceProps) {
    super(searchProps);
  }

  public async updatePlacesContext(userRecord: UserPlacementRecord): Promise<PlacesContext> {
    // TODO:
    // simplify recursion logic, remove strong cohesion on ErrorMessage, replace sort to FSSearchAPI
    if (this.props.radius >= this.topRadiusLimit) {
      // end recursion
      return {
        places: [],
        searchMessage: PlaceErrorMessage.tooLateTooFar,
      };
    }
    let searchRecord: SearchPlacementRecord = 
      Object.assign({ radius: String(this.props.radius), lookupLimit: precompleteConfig.placesDisplayLimit }, userRecord);
    // HERE, before each following recursive search call, first LOOKUP THE CACHE?
    // debugger;
    const placesFromCache = this.caching.prelookupCache(searchRecord);
      /* But there's no guarantee that placesFromCache will be 100% THE NEAREST, until extra req
      Is there actually a GUARANTEE in any cases? 
      Should 'prelookup' return only 100% places (if exist), to not make extra requests right away?

      YES, IT HAS TO! Because otherwise it doesn't provide any useful information for this service
      So now we can prevent the following 'searchPlaces' in 'searchAPI' FSSearch instance: */
    if (placesFromCache.length > 0) return {
      places: placesFromCache,
      searchMessage: PlaceErrorMessage.ok,
    }
    const ctx = await this.searchAPI.searchPlaces(searchRecord);
    // TODO: rewrite 'PlaceErrorMessage' on error objects passing, simplify!
    if (ctx.searchMessage === PlaceErrorMessage.serverDown) {
      return {
        places: [],
        searchMessage: ctx.searchMessage,
      };
    }
    if (ctx.searchMessage === PlaceErrorMessage.tooLateTooFar) {
      // could have changed 'this.radius' right away, but used 'universal' way of 'this.updateProps'
      this.updateProps({ radius: this.computeNextRadius() });
      return await this.updatePlacesContext(userRecord);
    }

    this.caching.pushToCache(searchRecord, ctx.places);
    return ctx;
  }

  private searchAPI = this.getDependency<FSSearchAPI>(FSSearchAPI);
  private caching = this.getDependency<PlacesCacheService>(PlacesCacheService);
  public get botRadiusLimit(): number {
    return precompleteConfig.botRadiusLimit;
  }
  public get topRadiusLimit(): number {
    return precompleteConfig.topRadiusLimit;
  }
  public get areaFromRadius(): number {
    return Math.round(Math.PI * Math.pow(this.props.radius, 2));
  }
  private computeNextRadius(): number {
    const nextArea = this.areaFromRadius * precompleteConfig.areaScaleFactor;
    return Math.round(Math.sqrt(nextArea / Math.PI));
  }

  // ‘as-the-crow-flies’ distance between the points, in kilometers
  // TODO: replace to external class, working with places 'mathematically'.
  // It will be as dependency for FSSearchAPI (for pre-sorting, after taking out the sorting part from here)
  // And it will be as dependency for PlacesCacheService (for verifying the 100% relevant cached cases)
}
