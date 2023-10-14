import { UserPlacementRecord } from "../view/UserPlacementRecord.ts";

export interface SearchPlacementRecord extends UserPlacementRecord {
  radius: string,
};