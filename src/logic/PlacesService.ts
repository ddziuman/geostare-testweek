import { PlaceErrorMessage, PlacesContext } from "./PlacesContext.ts";
import { UserPlacementRecord } from "../view/UserPlacementRecord.ts";
import { SearchPlacementRecord } from "./SearchPlacementRecord.ts";
import { FSSearchAPI } from "../apis/foursquare/FSSearchAPI.ts";
import { precompleteConfig } from "../view/precompleteConfig.ts";
import { Service } from "../abstract/Service.ts";
import { PlacesCacheService } from "./PlacesCacheService.ts";

// type PlacesServiceProps = { radius: number };

export class PlacesService extends Service/*<PlacesServiceProps>*/ {
  // business logic layer
  constructor(/*searchProps: PlacesServiceProps*/) {
    super({});
  }

  public async updatePlacesContext(userRecord: UserPlacementRecord): Promise<PlacesContext> {
    // TODO:
    // remove strong cohesion on ErrorMessage, replace sort to FSSearchAPI
    // FIRST LOOKUP CACHE, then go to search, if needed
    let searchRecord: SearchPlacementRecord = 
      Object.assign({ radius: -1, lookupLimit: precompleteConfig.placesDisplayLimit }, userRecord);

    const placesFromCache = this.caching.prelookupCache(searchRecord);
      /* 'prelookup' always returns 100% sure relevant places (if exist)

      YES, IT HAS TO! Because otherwise it doesn't provide any useful information for this service
      So now we can prevent the following 'searchPlaces' in 'searchAPI' FSSearch instance: */
    if (placesFromCache.length > 0) return {
      places: placesFromCache,
      searchMessage: PlaceErrorMessage.ok,
    }
    
    // no recursion --> easier to NOT lookup at cache again
    let ctx: PlacesContext;
    do {
      ctx = await this.searchAPI.searchPlaces(searchRecord);
      // TODO: rewrite 'PlaceErrorMessage' on error objects passing, simplify!
      if (ctx.searchMessage === PlaceErrorMessage.serverDown) {
        return {
          places: [],
          searchMessage: ctx.searchMessage,
        };
      } else if (ctx.searchMessage === PlaceErrorMessage.tooLateTooFar) {
        searchRecord.radius = this.computeNextRadius();
      } else {
        this.caching.pushToCache(searchRecord, ctx.places);
        break;
      }
    } while (searchRecord.radius < this.topRadiusLimit)
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
}
