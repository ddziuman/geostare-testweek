import { PlacesContext } from "../logic/PlacesContext.ts";
import { SearchPlacementRecord } from "../logic/SearchPlacementRecord.ts";

export enum AuthType {
  key,
  none
};

export enum PayloadFormat {
  body,
  query,
};

export interface ISearchAPI<RequestRecord extends Record<string, string>, ResponseRecord> {
  auth: AuthType,
  key?: string,
  format: PayloadFormat,
  uri: RequestInfo | URL,
  adaptFrom(adaptee: SearchPlacementRecord): RequestRecord, // logic --> api
  adaptFor(adaptee: ResponseRecord): PlacesContext, // api --> logic
  prepareRequest: (record: RequestRecord) => { resource: RequestInfo | URL; init: RequestInit },

  searchPlaces(searchRecord: SearchPlacementRecord): Promise<PlacesContext>;
}
// fetchData, searchPlaces.
// жёстко определить какие данные в бизнес-логике приходят, какие там "формируются" для API, и
//

// Mathematical model of places: > radius === > places.
