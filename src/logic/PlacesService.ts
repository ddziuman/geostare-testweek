import { Place, PlaceErrorMessage, PlacesContext } from "./PlacesContext.ts";
import { UserPlacementRecord } from "../view/UserPlacementRecord.ts";
import { SearchPlacementRecord } from "./SearchPlacementRecord.ts";
import { FSSearchAPI } from "../apis/foursquare/FSSearchAPI.ts";
import { AuthType, PayloadFormat } from "../apis/ISearchAPI.ts";
import { precompleteConfig } from "../view/precompleteConfig.ts";
import { Service } from "../abstract/Service.ts";

const APIs = {  // TODO: вынести отдельно ближе к 3 слою, + upgrade to Singleton with 'getAPI' entity
  [FSSearchAPI.name]: new FSSearchAPI(
    AuthType.key, 
    "fsq3h4BEyJeFMtuQn+DbFHiC+ZlKwH9RdhEh22ONKWNsgcI=",
    PayloadFormat.query,
    "https://api.foursquare.com/v3/places/search",
  ),
};

// TODO: Implement caching responses from APIs (from certain coordinates) => (from single place)

export class PlacesService extends Service<{ radius: number }> {
  // business logic layer
  constructor() {
    super({ radius: precompleteConfig.botRadiusLimit });
  }

  public async updatePlacesContext(userRecord: UserPlacementRecord): Promise<PlacesContext> {
    /** Business logic tasks: 
     * 1) Radius increment (DONE, not tested)
     * 2) Priority sorting (DONE, not tested)
     * 3) Error handling (server down, out of radius limit bounds) (DONE, not tested)
     * 4) Related places showing up in result??? (not done, not tested)
    */
    if (this.radius >= this.topRadiusLimit) {
      // end recursion
      return {
        places: [],
        searchMessage: PlaceErrorMessage.tooLateTooFar,
      };
    }
    let searchRecord: SearchPlacementRecord = Object.assign({ radius: String(this.radius) }, userRecord);
    const ctx = await this.searchAPI.searchPlaces(searchRecord);
    // TODO: rewrite 'PlaceErrorMessage' on error objects passing, simplify!
    if (ctx.searchMessage === PlaceErrorMessage.serverDown) {
      return {
        places: [],
        searchMessage: ctx.searchMessage,
      };
    }
    if (ctx.searchMessage === PlaceErrorMessage.tooLateTooFar) {
      this.radius = this.computeNextRadius();
      return await this.updatePlacesContext(userRecord);
    }

    ctx.places.sort(this.multiKeyPlaceSort(+userRecord.latitude, +userRecord.longtitude));
    return ctx;
  }

  // private searchAPI = this.getDependency;
  public get botRadiusLimit(): number {
    return precompleteConfig.botRadiusLimit;
  }
  public get topRadiusLimit(): number {
    return precompleteConfig.topRadiusLimit;
  }
  public get areaFromRadius(): number {
    return Math.round(Math.PI * Math.pow(this.radius, 2));
  }
  public get earthRadius(): number {
    return 6371e3;
  }
  private computeNextRadius(): number {
    const nextArea = this.areaFromRadius * precompleteConfig.areaScaleFactor;
    return Math.round(Math.sqrt(nextArea / Math.PI));
  }
  private multiKeyPlaceSort(userLat: number, userLong: number) {
    return (a: Place, b: Place): number => {
      if (a.distanceMeters && b.distanceMeters) {
        const diff = a.distanceMeters - b.distanceMeters;
        if (diff) return diff;
      }
      if (a.latitude && a.longtitude && b.latitude && b.longtitude) { // TODO: replace to the lowest API level
        let userADistance = a.distanceMeters;
        if (!userADistance) {
          userADistance = this.applyHaversineFormula(userLat, userLong, a.latitude, a.longtitude);
          a.distanceMeters = userADistance;
        }
        let userBDistance = b.distanceMeters;
        if (!userBDistance) {
          userBDistance = this.applyHaversineFormula(userLat, userLong, b.latitude, b.longtitude);
          b.distanceMeters = userBDistance;
        }

        const diff = userADistance - userBDistance;
        if (diff) return diff;
      }
      if (a.ratingOutOfTen && b.ratingOutOfTen) {
        const diff = b.ratingOutOfTen - a.ratingOutOfTen;
        if (diff) return diff;
      }
      return 0;
    }
  }

  // ‘as-the-crow-flies’ distance between the points, in kilometers
  // TODO: replace to external class, working with places 'mathematically'
  private applyHaversineFormula(lat1: number, long1: number, lat2: number, long2: number) {
    const radianFactor = Math.PI / 180;
    const latitudePhi1 = lat1 * radianFactor;
    const latitudePhi2 = lat2 * radianFactor;

    const deltaLatitudesPhi = (lat2 - lat1) * radianFactor;
    const deltaLongtitudesLambda = (long2 - long1) * radianFactor;

    const aTriangleSide = 
      Math.pow(Math.sin(deltaLatitudesPhi / 2), 2) +
      Math.cos(latitudePhi1) * Math.cos(latitudePhi2) *
      Math.pow(Math.sin(deltaLongtitudesLambda / 2), 2);
    
    const cTriangleSide = 2 * Math.atan2(Math.sqrt(aTriangleSide), Math.sqrt(1 - aTriangleSide));

    return this.earthRadius * cTriangleSide; // in meters
  }
}
