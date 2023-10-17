export interface FSSearchRecord extends Record<string, string> {
  ll: string,
  radius: string;
  limit: string;
  sort: FSSearchSortingKey;
  fields: string;
};

export enum FSSearchSortingKey { // TODO: test whether this even works!!!
  distance = "distance",
  relevance = "relevance",
  rating = "rating",
};