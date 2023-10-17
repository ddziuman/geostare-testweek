import { Service } from "../abstract/Service";
import { Place, PlacesContext } from "./PlacesContext";
import { PlacesMathService } from "./PlacesMathService";
import { SearchPlacementRecord } from "./SearchPlacementRecord";

type PlacesCacheRecord = {
  latitude: number,
  longtitude: number,
  foundRadiusMeters: number,
  placesInRadius: Place[],
}

type CacheServiceProps = {
  cacheMaxSize: number,
  currentSize: number,
  cache: Record<string, PlacesCacheRecord>,
}

export class PlacesCacheService extends Service<CacheServiceProps> {
  constructor(cacheProps: CacheServiceProps) {
    super(cacheProps);
  }

  private placesMath = this.getDependency<PlacesMathService>(PlacesMathService);

  pushToCache(searchRecord: SearchPlacementRecord, places: Place[]) {
    const { latitude, longtitude, radius, cacheKey } = this.prepareCacheRecordParams(searchRecord);
    const cacheRecord: PlacesCacheRecord = {
      latitude, longtitude, foundRadiusMeters: radius, placesInRadius: places
    };
    if (this.cacheIsFull) this.clearupCache(cacheRecord, places.length);
    this.props.currentSize += places.length;
    this.cache[cacheKey] = cacheRecord;
  }

  clearupCache(causingRecord: PlacesCacheRecord, count: number) {
    // TODO: implement!

    // I need to delete <count> number of records from cache.
    // Based on WHAT will I think of what elements to remove?

    
    // Maybe I need data from the actual record 'causing' this method call??
    
    // Places are always 'dynamic', they may appear / not appear even with similar requests,
    // (but this 'dynamic' behaviour is rather difficult to implement)
  }

  // 'exact-coordinates-prelookup', (NOT SMART yet)
  // Smart level: 1. ( level 2 is what we were speaking about ) ( level 3 is 'dynamic' removals )
  prelookupCache(searchRecord: SearchPlacementRecord): Place[] {
    const cache = this.cache;
    const { latitude, longtitude, radius, limit, cacheKey } = this.prepareCacheRecordParams(searchRecord);
    // the exact coordinates 'simple' case (100% guarantee):
    console.dir(cache);
    const placesFromCache = cache[cacheKey];
    if (placesFromCache) return placesFromCache.placesInRadius;
    // OK, let's try to pass the whole cache:
    const cachedRecords = Object.values(cache); // think about this 'whole cache' passing!
    let guaranteedPlaces: Place[] = [];
    for (const cachedRecord of cachedRecords) {
      // What are the constraints of a 'relevant, 100% guarantee' for a cached record?
      // The first in the list inside a 'cachedRecord' IS NOT 100% the relevant record
  
      // Should I 'filter' by PlacesCacheRecords first, and then the actual Places here?
      // Maybe I should do '.reduce' or 'for of'?
  
      // Maybe I can first 'filter' the relevant PlacesCacheRecords?
      
      // len(k1,k2') + radius(k2') <= radius(k1) --> 100% guarantee that there are no other places, 
      // then those which ARE in this 'big' radius of k1.
      // so let's actually test this first 100% case: (are there even any other?)
      const { 
        latitude: cachedLatitude, 
        longtitude: cachedLongtitude, 
        foundRadiusMeters } = cachedRecord;
      const userToRecordDistance = 
        this.placesMath.applyHaversineFormula(cachedLatitude, cachedLongtitude, latitude, longtitude);
      if (userToRecordDistance + radius > foundRadiusMeters) continue; // else, extend logic somehow? (level 3)
      // let's take up to first NEEDED COUNT of places from cache: [from 1 to 6]
      // step 1: sort (with multiple keys)
      // step 2: take up to 6 first elements
      guaranteedPlaces = cachedRecord.placesInRadius
        .slice()
        .sort(this.placesMath.multiKeyPlaceSort(latitude, longtitude)) // re-sorting for K2'
        .slice(0, limit);
      break;
    }
    return guaranteedPlaces; // 100% something good in there!
  }

  private prepareCacheRecordParams(searchRecord: SearchPlacementRecord) {
    const latitude = +searchRecord.latitude;
    const longtitude = +searchRecord.longtitude;
    const radius = +searchRecord.radius;
    const limit = +searchRecord.lookupLimit;
    const cacheKey = this.cacheKey(latitude, longtitude);
    return { latitude, longtitude, radius, limit, cacheKey };
  }

  private cacheKey(latitude: number, longtitude: number) {
    return `${latitude},${longtitude}`;
  }

  get cache() {
    return this.props.cache;
  }

  get cacheIsFull() {
    return this.props.currentSize >= this.props.cacheMaxSize;
  }
}