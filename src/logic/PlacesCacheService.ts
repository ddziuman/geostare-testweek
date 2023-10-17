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

type SortedCacheRecord = {
  userInCacheRadius: number, 
  cachedRecord: PlacesCacheRecord
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
  // Smart level: ( level 3 is overlapping circles + removing ), but not yet implemented
  prelookupCache(searchRecord: SearchPlacementRecord): Place[] {
    const cache = this.cache;
    const limit = searchRecord.lookupLimit;
    const { latitude, longtitude, cacheKey } = this.prepareCacheRecordParams(searchRecord);
    // the exact coordinates 'simple' case (100% guarantee):
    console.dir(cache);
    const placesFromCache = cache[cacheKey];
    if (placesFromCache) return placesFromCache.placesInRadius;
    // OK, let's smart-pass the whole cache
    const cachedRecords = Object.values(cache);
    let guaranteedPlaces: Place[] = []; // final result
    let maxInnerCacheRadiusChecked = 0;
    // 1. For every cached record, compute radius(k2)
    // 2. Quick-filter-out non-relevant cached records (negative radius(k2)=maxInnerRadius):
    // 3. Sort caches in ascending order based on innerCacheRadiuses (for avoiding duplicates!!!)
    const cachedRecordsSortedByUser: SortedCacheRecord[] = [];
    for (const cachedRecord of cachedRecords) {
      const { 
        latitude: cachedLatitude,
        longtitude: cachedLongtitude, 
        foundRadiusMeters } = cachedRecord;
      const userToRecordDistance = 
        this.placesMath.applyHaversineFormula(cachedLatitude, cachedLongtitude, latitude, longtitude);
      const userInCacheRadius = cachedRecord.foundRadiusMeters - userToRecordDistance; // step 1
      if (userInCacheRadius < 0) continue; // step 2
      cachedRecordsSortedByUser.push({ userInCacheRadius, cachedRecord });
    }
    cachedRecordsSortedByUser.sort((a, b) => a.userInCacheRadius - b.userInCacheRadius); // step 3

    // 4.Iterate, skip non-relevant when no places within radius(k2) / when places
    // have already been processed by previous 'maxInnerCacheRadiusChecked' cache
    // [ only those places which in the 'ring', for NO DUPLICATES in result ]
    // 5. Update 'maxInnerCacheRadiusChecked', if needed
    // 6. Re-calculate the places' ACTUAL distance to the user (by creating copies)
    // 7. Push found relevant places to the final result
    // 8. multi-key sort the final result and slice the fisrt <needed>[6]
    // 9. Update 'radius' for seach record, anyways (based on 'maxInnerCacheRadiusCehcked')

    for (const sortedCachedRecord of cachedRecordsSortedByUser) {
      const userInCacheRadius = sortedCachedRecord.userInCacheRadius;
      
      if (maxInnerCacheRadiusChecked <= userInCacheRadius)
        maxInnerCacheRadiusChecked = userInCacheRadius; // step 5
      
      const relevantCachedPlaces: Place[] = // step 4 (start)
        sortedCachedRecord.cachedRecord.placesInRadius.reduce<Place[]>((places: Place[], place: Place) => {
          if (!(place.latitude && place.longtitude)) return places;
          const userToCachedPlaceDistance = 
            this.placesMath.applyHaversineFormula(latitude, longtitude, +place.latitude, +place.longtitude);
          if (userToCachedPlaceDistance > userInCacheRadius || // step 4 ('ring' checking)
              userToCachedPlaceDistance <= maxInnerCacheRadiusChecked) 
            return places; // this place is either too far, or a 'duplicate' from lesser cache
          
          const updatedDistanceCopy = Object.assign({}, place);
          updatedDistanceCopy.distanceMeters = userToCachedPlaceDistance; // step 6
          places.push(updatedDistanceCopy);
          return places;
        }, []);
      if (relevantCachedPlaces.length === 0) continue;
      guaranteedPlaces.push(...relevantCachedPlaces); // step 7
    }

    guaranteedPlaces = guaranteedPlaces // step 8
      .sort(this.placesMath.multiKeyPlaceSort(latitude, longtitude)) // re-sorting for K2'
      .slice(0, limit);
    
    if (maxInnerCacheRadiusChecked <= 0) // step 9
      maxInnerCacheRadiusChecked = 30;
    searchRecord.radius = maxInnerCacheRadiusChecked
    
    return guaranteedPlaces; // 100% something good in there!
  }

  private prepareCacheRecordParams(searchRecord: SearchPlacementRecord) {
    const latitude = +searchRecord.latitude;
    const longtitude = +searchRecord.longtitude;
    const cacheKey = this.cacheKey(latitude, longtitude);
    return { latitude, longtitude, cacheKey };
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