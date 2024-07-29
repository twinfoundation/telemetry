// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { INoContentResponse, IRestRoute, ITag } from "@gtsc/api-models";
import { Coerce, Guards } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import { ServiceFactory, type IServiceRequestContext } from "@gtsc/services";
import {
	type ITelemetryUpdateMetricValueRequest,
	MetricType,
	type ITelemetry,
	type ITelemetryCreateMetricRequest,
	type ITelemetryGetMetricRequest,
	type ITelemetryGetMetricResponse,
	type ITelemetryUpdateMetricRequest,
	type ITelemetryValuesListRequest,
	type ITelemetryValuesListResponse,
	type ITelemetryRemoveMetricRequest,
	type ITelemetryListRequest,
	type ITelemetryListResponse
} from "@gtsc/telemetry-models";
import { HttpStatusCode } from "@gtsc/web";

/**
 * The source used when communicating about these routes.
 */
const ROUTES_SOURCE = "telemetryRoutes";

/**
 * The tag to associate with the routes.
 */
export const tagsTelemetry: ITag[] = [
	{
		name: "Telemetry",
		description: "Endpoints which are modelled to access a telemetry contract."
	}
];

/**
 * The REST routes for telemetry.
 * @param baseRouteName Prefix to prepend to the paths.
 * @param factoryServiceName The name of the service to use in the routes store in the ServiceFactory.
 * @returns The generated routes.
 */
export function generateRestRoutesTelemetry(
	baseRouteName: string,
	factoryServiceName: string
): IRestRoute[] {
	const createMetricRoute: IRestRoute<ITelemetryCreateMetricRequest, INoContentResponse> = {
		operationId: "telemetryCreateMetric",
		summary: "Create a telemetry metric",
		tag: tagsTelemetry[0].name,
		method: "POST",
		path: `${baseRouteName}/`,
		handler: async (requestContext, request) =>
			telemetryCreateMetric(requestContext, factoryServiceName, request),
		requestType: {
			type: nameof<ITelemetryCreateMetricRequest>(),
			examples: [
				{
					id: "telemetryCreateMetricExample",
					request: {
						body: {
							id: "my-counter",
							label: "My Counter",
							description: "This is my counter",
							type: MetricType.Counter,
							unit: "KG"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>()
			}
		]
	};

	const getMetricRoute: IRestRoute<ITelemetryGetMetricRequest, ITelemetryGetMetricResponse> = {
		operationId: "telemetryGetMetric",
		summary: "Get a telemetry metric and it's most recent value",
		tag: tagsTelemetry[0].name,
		method: "GET",
		path: `${baseRouteName}/:id`,
		handler: async (requestContext, request) =>
			telemetryGetMetric(requestContext, factoryServiceName, request),
		requestType: {
			type: nameof<ITelemetryGetMetricRequest>(),
			examples: [
				{
					id: "telemetryGetMetricExample",
					request: {
						pathParams: {
							id: "my-counter"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ITelemetryGetMetricResponse>()
			}
		]
	};

	const updateMetricRoute: IRestRoute<ITelemetryUpdateMetricRequest, INoContentResponse> = {
		operationId: "telemetryUpdateMetric",
		summary: "Update a telemetry metric",
		tag: tagsTelemetry[0].name,
		method: "PUT",
		path: `${baseRouteName}/:id`,
		handler: async (requestContext, request) =>
			telemetryUpdateMetric(requestContext, factoryServiceName, request),
		requestType: {
			type: nameof<ITelemetryUpdateMetricRequest>(),
			examples: [
				{
					id: "telemetryUpdateMetricExample",
					request: {
						pathParams: {
							id: "my-counter"
						},
						body: {
							label: "My New Label"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>()
			}
		]
	};

	const updateMetricValueRoute: IRestRoute<ITelemetryUpdateMetricValueRequest, INoContentResponse> =
		{
			operationId: "telemetryUpdateMetricValue",
			summary: "Update a telemetry metric value",
			tag: tagsTelemetry[0].name,
			method: "PUT",
			path: `${baseRouteName}/:id/value`,
			handler: async (requestContext, request) =>
				telemetryUpdateMetricValue(requestContext, factoryServiceName, request),
			requestType: {
				type: nameof<ITelemetryUpdateMetricValueRequest>(),
				examples: [
					{
						id: "telemetryUpdateMetricValueExample",
						request: {
							pathParams: {
								id: "my-counter"
							},
							body: {
								value: 10
							}
						}
					}
				]
			},
			responseType: [
				{
					type: nameof<INoContentResponse>()
				}
			]
		};

	const removeMetricRoute: IRestRoute<ITelemetryRemoveMetricRequest, INoContentResponse> = {
		operationId: "telemetryRemoveMetricValue",
		summary: "Remove a telemetry metric value",
		tag: tagsTelemetry[0].name,
		method: "DELETE",
		path: `${baseRouteName}/:id`,
		handler: async (requestContext, request) =>
			telemetryRemoveMetric(requestContext, factoryServiceName, request),
		requestType: {
			type: nameof<ITelemetryRemoveMetricRequest>(),
			examples: [
				{
					id: "telemetryRemoveMetricValueExample",
					request: {
						pathParams: {
							id: "my-counter"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<INoContentResponse>()
			}
		]
	};

	const listMetricsRoute: IRestRoute<ITelemetryListRequest, ITelemetryListResponse> = {
		operationId: "telemetryListEntries",
		summary: "Get a list of the telemetry metrics",
		tag: tagsTelemetry[0].name,
		method: "GET",
		path: `${baseRouteName}/`,
		handler: async (requestContext, request) =>
			telemetryMetricList(requestContext, factoryServiceName, request),
		requestType: {
			type: nameof<ITelemetryListRequest>(),
			examples: [
				{
					id: "telemetryListRequestExample",
					request: {
						query: {
							type: MetricType.Counter
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ITelemetryListResponse>(),
				examples: [
					{
						id: "telemetryListResponseExample",
						response: {
							body: {
								entities: [
									{
										id: "my-counter",
										label: "My Counter",
										type: MetricType.Counter,
										unit: "KG"
									}
								],
								cursor: "1",
								pageSize: 10,
								totalEntities: 20
							}
						}
					}
				]
			}
		]
	};

	const listMetricsValuesRoute: IRestRoute<
		ITelemetryValuesListRequest,
		ITelemetryValuesListResponse
	> = {
		operationId: "telemetryValuesListEntries",
		summary: "Get a list of the values for a telemetry metric",
		tag: tagsTelemetry[0].name,
		method: "GET",
		path: `${baseRouteName}/:id`,
		handler: async (requestContext, request) =>
			telemetryMetricValueList(requestContext, factoryServiceName, request),
		requestType: {
			type: nameof<ITelemetryValuesListRequest>(),
			examples: [
				{
					id: "telemetryValuesListRequestExample",
					request: {
						pathParams: {
							id: "my-counter"
						}
					}
				}
			]
		},
		responseType: [
			{
				type: nameof<ITelemetryValuesListResponse>(),
				examples: [
					{
						id: "listResponseExample",
						response: {
							body: {
								metric: {
									id: "my-counter",
									label: "My Counter",
									type: MetricType.Counter,
									unit: "KG"
								},
								entities: [
									{
										ts: 1715252922273,
										value: 10
									}
								],
								cursor: "1",
								pageSize: 10,
								totalEntities: 20
							}
						}
					}
				]
			}
		]
	};

	return [
		createMetricRoute,
		getMetricRoute,
		updateMetricRoute,
		updateMetricValueRoute,
		removeMetricRoute,
		listMetricsRoute,
		listMetricsValuesRoute
	];
}

/**
 * Create a new telemetry metric.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function telemetryCreateMetric(
	requestContext: IServiceRequestContext,
	factoryServiceName: string,
	request: ITelemetryCreateMetricRequest
): Promise<INoContentResponse> {
	Guards.object<ITelemetryCreateMetricRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<ITelemetryCreateMetricRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const service = ServiceFactory.get<ITelemetry>(factoryServiceName);
	await service.createMetric(
		{
			id: request.body.id,
			label: request.body.label,
			description: request.body.description,
			type: request.body.type,
			unit: request.body.unit
		},
		request.body.initialValue,
		requestContext
	);
	return {
		statusCode: HttpStatusCode.noContent
	};
}

/**
 * Gets a telemetry metric.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function telemetryGetMetric(
	requestContext: IServiceRequestContext,
	factoryServiceName: string,
	request: ITelemetryGetMetricRequest
): Promise<ITelemetryGetMetricResponse> {
	Guards.object<ITelemetryGetMetricRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<ITelemetryGetMetricRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const service = ServiceFactory.get<ITelemetry>(factoryServiceName);
	const result = await service.getMetric(request.pathParams.id, requestContext);
	return { body: result };
}

/**
 * Updates a telemetry metric.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function telemetryUpdateMetric(
	requestContext: IServiceRequestContext,
	factoryServiceName: string,
	request: ITelemetryUpdateMetricRequest
): Promise<INoContentResponse> {
	Guards.object<ITelemetryUpdateMetricRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<ITelemetryUpdateMetricRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);
	Guards.object<ITelemetryUpdateMetricRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const service = ServiceFactory.get<ITelemetry>(factoryServiceName);
	await service.updateMetric(
		{
			id: request.pathParams.id,
			label: request.body.label,
			description: request.body.description,
			unit: request.body.unit
		},
		requestContext
	);

	return { statusCode: HttpStatusCode.noContent };
}

/**
 * Updates a telemetry metric value.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function telemetryUpdateMetricValue(
	requestContext: IServiceRequestContext,
	factoryServiceName: string,
	request: ITelemetryUpdateMetricValueRequest
): Promise<INoContentResponse> {
	Guards.object<ITelemetryUpdateMetricValueRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<ITelemetryUpdateMetricValueRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);
	Guards.object<ITelemetryUpdateMetricValueRequest["body"]>(
		ROUTES_SOURCE,
		nameof(request.body),
		request.body
	);

	const service = ServiceFactory.get<ITelemetry>(factoryServiceName);
	await service.updateMetricValue(request.pathParams.id, request.body.value, requestContext);

	return { statusCode: HttpStatusCode.noContent };
}

/**
 * Removes a telemetry metric.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function telemetryRemoveMetric(
	requestContext: IServiceRequestContext,
	factoryServiceName: string,
	request: ITelemetryRemoveMetricRequest
): Promise<INoContentResponse> {
	Guards.object<ITelemetryRemoveMetricRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<ITelemetryRemoveMetricRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.pathParams),
		request.pathParams
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const service = ServiceFactory.get<ITelemetry>(factoryServiceName);
	await service.removeMetric(request.pathParams.id, requestContext);
	return {
		statusCode: HttpStatusCode.noContent
	};
}

/**
 * Get a list of the telemetry metrics.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function telemetryMetricList(
	requestContext: IServiceRequestContext,
	factoryServiceName: string,
	request: ITelemetryListRequest
): Promise<ITelemetryListResponse> {
	Guards.object<ITelemetryListRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<ITelemetryListRequest["query"]>(
		ROUTES_SOURCE,
		nameof(request.query),
		request.query
	);

	const service = ServiceFactory.get<ITelemetry>(factoryServiceName);

	const itemsAndCursor = await service.query(
		request?.query.type,
		request?.query?.cursor,
		Coerce.number(request?.query?.pageSize),
		requestContext
	);

	return {
		body: itemsAndCursor
	};
}

/**
 * Get a list of the telemetry metric values.
 * @param requestContext The request context for the API.
 * @param factoryServiceName The name of the service to use in the routes.
 * @param request The request.
 * @returns The response object with additional http response properties.
 */
export async function telemetryMetricValueList(
	requestContext: IServiceRequestContext,
	factoryServiceName: string,
	request: ITelemetryValuesListRequest
): Promise<ITelemetryValuesListResponse> {
	Guards.object<ITelemetryValuesListRequest>(ROUTES_SOURCE, nameof(request), request);
	Guards.object<ITelemetryValuesListRequest["pathParams"]>(
		ROUTES_SOURCE,
		nameof(request.query),
		request.query
	);
	Guards.stringValue(ROUTES_SOURCE, nameof(request.pathParams.id), request.pathParams.id);

	const service = ServiceFactory.get<ITelemetry>(factoryServiceName);

	const itemsAndCursor = await service.queryValues(
		request?.pathParams.id,
		Coerce.number(request?.query?.timeStart),
		Coerce.number(request?.query?.timeEnd),
		request?.query?.cursor,
		Coerce.number(request?.query?.pageSize),
		requestContext
	);

	return {
		body: itemsAndCursor
	};
}
