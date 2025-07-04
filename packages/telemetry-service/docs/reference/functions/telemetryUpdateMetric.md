# Function: telemetryUpdateMetric()

> **telemetryUpdateMetric**(`httpRequestContext`, `componentName`, `request`): `Promise`\<`INoContentResponse`\>

Updates a telemetry metric.

## Parameters

### httpRequestContext

`IHttpRequestContext`

The request context for the API.

### componentName

`string`

The name of the component to use in the routes.

### request

`ITelemetryUpdateMetricRequest`

The request.

## Returns

`Promise`\<`INoContentResponse`\>

The response object with additional http response properties.
