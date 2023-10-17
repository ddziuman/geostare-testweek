import { Service } from "../abstract/Service";
import { Place } from "./PlacesContext";


export class PlacesMathService extends Service {
  constructor() {
    super({});
  }

  public get earthRadius(): number {
    return 6371e3;
  }

  // ‘as-the-crow-flies’ distance between the points, in meters
  public applyHaversineFormula(lat1: number, long1: number, lat2: number, long2: number) {
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
    console.log('result of haversine formula (m): ', this.earthRadius * cTriangleSide);
    return this.earthRadius * cTriangleSide; // in meters
  }

  public multiKeyPlaceSort(userLat: number, userLong: number) {
    return (a: Place, b: Place): number => {
      if (a.distanceMeters && b.distanceMeters) {
        const diff = a.distanceMeters - b.distanceMeters;
        if (diff) return diff;
      }
      if (a.latitude && a.longtitude && b.latitude && b.longtitude) {
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
}