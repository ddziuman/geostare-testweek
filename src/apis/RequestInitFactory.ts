import { API, PayloadContentType, PreparedRequest } from "./API.ts";
import { AuthType } from "./API.ts";

export function RequsetInitFactory<
  RequestRecord extends Record<string, string>
>(
  api: API<RequestRecord, unknown, unknown, unknown>
): (record: RequestRecord) => PreparedRequest {

  const headersInit: HeadersInit = {};
  const requestInit: RequestInit = {};
  requestInit.headers = headersInit;
  requestInit.method = api.props.method;
  headersInit["Accept"] = api.props.responsePayloadFormat;
  headersInit["Content-Type"] = api.props.requestPayloadFormat;

  if (api.props.auth === AuthType.key && api.props.key) {
    headersInit["Authorization"] = api.props.key;
  }

  if (api.props.requestPayloadFormat === PayloadContentType.urlencoded) {
    return (record: RequestRecord) => {
      const queryString = new URLSearchParams(record).toString();
      const resource = api.props.uri.toString().concat("?", queryString);
      return { resource, init: requestInit };
    };
  } else { // (api.format === PayloadFormat other than 'x-www-form-urlencoded')
    return (record: RequestRecord) => {
      if (api.props.requestPayloadFormat === PayloadContentType.json) {
        requestInit.body = JSON.stringify(record);
      } else if (api.props.requestPayloadFormat === PayloadContentType.text) {
        requestInit.body = record.toString();
      }
      
      return { resource: api.props.uri, init: requestInit };
    }
  }
}