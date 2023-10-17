import { Service } from "../abstract/Service"
import { RequsetInitFactory } from "./RequestInitFactory";

export abstract class API<RequestRecord extends Record<string, string>, ResponseRecord, AdapteeRecord, ConsumerRecord> extends Service<APIProps> {
  constructor(apiProps: APIProps) {
    super(apiProps);
    this.prepareRequest = RequsetInitFactory<RequestRecord>(this);
  }

  public prepareRequest: (record: RequestRecord) => PreparedRequest;

  protected abstract adaptFrom(adaptee: AdapteeRecord): RequestRecord // logic --> api

  protected abstract adaptFor(adaptee: ResponseRecord): ConsumerRecord  // api --> logic

};

export type APIProps = {
  auth: AuthType,
  key?: string,
  requestPayloadFormat: PayloadContentType, // json / xml / text
  responsePayloadFormat: PayloadContentType,
  uri: RequestInfo | URL,
  method: HTTPMethod,
}

export enum AuthType {
  key,
  none
};

export enum PayloadContentType {
  text = "text/plain",
  json = "application/json",
  urlencoded = "application/x-www-form-urlencoded",
  // TODO: implement in the preparing requests factory:

  // xml = "application/xml",
  // html = "text/html",
  // multipart = "multipart/form-data",
};

export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATH = "PATCH",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
}

export type PreparedRequest = { resource: RequestInfo | URL, init: RequestInit };