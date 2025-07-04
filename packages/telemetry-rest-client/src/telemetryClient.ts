// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type {
	IBaseRestClientConfig,
	ICreatedResponse,
	INoContentResponse
} from "@twin.org/api-models";
import { Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import type {
	ITelemetryAddMetricValueRequest,
	ITelemetryComponent,
	ITelemetryCreateMetricRequest,
	ITelemetryGetMetricRequest,
	ITelemetryGetMetricResponse,
	ITelemetryListRequest,
	ITelemetryListResponse,
	ITelemetryMetric,
	ITelemetryMetricValue,
	ITelemetryRemoveMetricRequest,
	ITelemetryUpdateMetricRequest,
	ITelemetryValuesListRequest,
	ITelemetryValuesListResponse,
	MetricType
} from "@twin.org/telemetry-models";
import { HeaderTypes } from "@twin.org/web";

/**
 * Client for performing telemetry through to REST endpoints.
 */
export class TelemetryClient extends BaseRestClient implements ITelemetryComponent {
	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<TelemetryClient>();

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = TelemetryClient._CLASS_NAME;

	/**
	 * Create a new instance of TelemetryClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(TelemetryClient._CLASS_NAME, config, "telemetry");
	}

	/**
	 * Create a new metric.
	 * @param metric The metric details.
	 * @returns Nothing.
	 */
	public async createMetric(metric: ITelemetryMetric): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);

		await this.fetch<ITelemetryCreateMetricRequest, ICreatedResponse>("/metric", "POST", {
			body: metric
		});
	}

	/**
	 * Get the metric details and it's most recent value.
	 * @param id The metric id.
	 * @returns The metric details and it's most recent value.
	 */
	public async getMetric(id: string): Promise<{
		metric: ITelemetryMetric;
		value: ITelemetryMetricValue;
	}> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const result = await this.fetch<ITelemetryGetMetricRequest, ITelemetryGetMetricResponse>(
			"/metric/:id",
			"GET",
			{
				pathParams: {
					id
				}
			}
		);

		return result.body;
	}

	/**
	 * Update metric.
	 * @param metric The metric details.
	 * @returns Nothing.
	 */
	public async updateMetric(metric: Omit<ITelemetryMetric, "type">): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.id), metric.id);

		await this.fetch<ITelemetryUpdateMetricRequest, INoContentResponse>("/metric/:id", "PUT", {
			pathParams: {
				id: metric.id
			},
			body: {
				label: metric.label,
				description: metric.description,
				unit: metric.unit
			}
		});
	}

	/**
	 * Add a metric value.
	 * @param id The id of the metric.
	 * @param value The value for the add operation.
	 * @param customData The custom data for the add operation.
	 * @returns The created metric value id.
	 */
	public async addMetricValue(
		id: string,
		value: "inc" | "dec" | number,
		customData?: { [key: string]: unknown }
	): Promise<string> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		Guards.defined(this.CLASS_NAME, nameof(value), value);

		const result = await this.fetch<ITelemetryAddMetricValueRequest, ICreatedResponse>(
			"/metric/:id/value",
			"POST",
			{
				pathParams: {
					id
				},
				body: {
					value,
					customData
				}
			}
		);

		return result.headers[HeaderTypes.Location];
	}

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @returns Nothing.
	 */
	public async removeMetric(id: string): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		await this.fetch<ITelemetryRemoveMetricRequest, INoContentResponse>("/metric/:id", "DELETE", {
			pathParams: {
				id
			}
		});
	}

	/**
	 * Query the metrics.
	 * @param type The type of the metric.
	 * @param cursor The cursor to request the next page of entities.
	 * @param pageSize The maximum number of entities in a page.
	 * @returns All the entities for the storage matching the conditions,
	 * and a cursor which can be used to request more entities.
	 * @throws NotImplementedError if the implementation does not support retrieval.
	 */
	public async query(
		type?: MetricType,
		cursor?: string,
		pageSize?: number
	): Promise<{
		/**
		 * The metrics.
		 */
		entities: ITelemetryMetric[];

		/**
		 * An optional cursor, when defined can be used to call find to get more values.
		 */
		cursor?: string;
	}> {
		const result = await this.fetch<ITelemetryListRequest, ITelemetryListResponse>(
			"/metric",
			"GET",
			{
				query: {
					type,
					cursor,
					pageSize
				}
			}
		);

		return result.body;
	}

	/**
	 * Query the metric values.
	 * @param id The id of the metric.
	 * @param timeStart The inclusive time as the start of the metric entries.
	 * @param timeEnd The inclusive time as the end of the metric entries.
	 * @param cursor The cursor to request the next page of entities.
	 * @param pageSize The maximum number of entities in a page.
	 * @returns All the entities for the storage matching the conditions,
	 * and a cursor which can be used to request more entities.
	 * @throws NotImplementedError if the implementation does not support retrieval.
	 */
	public async queryValues(
		id: string,
		timeStart?: number,
		timeEnd?: number,
		cursor?: string,
		pageSize?: number
	): Promise<{
		/**
		 * The metric details.
		 */
		metric: ITelemetryMetric;
		/**
		 * The values for the metric.
		 */
		entities: ITelemetryMetricValue[];
		/**
		 * An optional cursor, when defined can be used to call find to get more values.
		 */
		cursor?: string;
	}> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const result = await this.fetch<ITelemetryValuesListRequest, ITelemetryValuesListResponse>(
			"/metric/:id/value",
			"GET",
			{
				pathParams: {
					id
				},
				query: {
					timeStart,
					timeEnd,
					cursor,
					pageSize
				}
			}
		);

		return result.body;
	}
}
