import { AuthType, ISearchAPI, PayloadFormat } from "./ISearchAPI.ts";

export function RequsetInitFactory<
  RequestRecord extends Record<string, string>
>(
  api: ISearchAPI<RequestRecord, unknown>
): (record: RequestRecord) => { resource: RequestInfo | URL; init: RequestInit } {
  const headersInit: HeadersInit = {
    Accept: "application/json",
  };
  const requestInit: RequestInit = {
    method: "GET",
    headers: headersInit,
  };
  if (api.auth === AuthType.key && api.key) {
    headersInit["Authorization"] = api.key;
  }
  if (api.format === PayloadFormat.query) {
    headersInit["Content-Type"] = "application/x-www-form-urlencoded";
    return (record: RequestRecord) => {
      const queryString = new URLSearchParams(record).toString();
      const resource = api.uri.toString().concat("?", queryString);
      return { resource, init: requestInit };
    };
  } else { // (api.format === PayloadFormat.body)
    headersInit["Content-Type"] = "application/json";
    return (record: RequestRecord) => {
      requestInit.body = JSON.stringify(record);
      return { resource: api.uri, init: requestInit };
    }
  }
}
