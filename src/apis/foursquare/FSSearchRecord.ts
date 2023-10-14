export interface FSSearchRecord extends Record<string, string> {
  ll: string,
  radius: string;
  limit: string;
  sort: "distance" | "relevance" | "rating"; // TODO: rewrite using enums
  fields: string;
}