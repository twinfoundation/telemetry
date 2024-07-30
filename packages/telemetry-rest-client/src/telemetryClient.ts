// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@gtsc/api-core";
import type { IBaseRestClientConfig, ICreatedResponse, INoContentResponse } from "@gtsc/api-models";
import { Guards, StringHelper } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type {
	ITelemetry,
	ITelemetryCreateMetricRequest,
	ITelemetryGetMetricRequest,
	ITelemetryGetMetricResponse,
	ITelemetryListRequest,
	ITelemetryListResponse,
	ITelemetryMetric,
	ITelemetryMetricValue,
	ITelemetryRemoveMetricRequest,
	ITelemetryUpdateMetricRequest,
	ITelemetryUpdateMetricValueRequest,
	ITelemetryValuesListRequest,
	ITelemetryValuesListResponse,
	MetricType
} from "@gtsc/telemetry-models";

/**
 * Client for performing telemetry through to REST endpoints.
 */
export class TelemetryClient extends BaseRestClient implements ITelemetry {
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
		super(TelemetryClient._CLASS_NAME, config, StringHelper.kebabCase(nameof<ITelemetry>()));
	}

	/**
	 * Create a new metric.
	 * @param metric The metric details.
	 * @returns Nothing.
	 */
	public async createMetric(metric: ITelemetryMetric): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);

		await this.fetch<ITelemetryCreateMetricRequest, ICreatedResponse>("/", "POST", {
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
			"/:id",
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

		await this.fetch<ITelemetryUpdateMetricRequest, INoContentResponse>("/:id", "PUT", {
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
	 * Update metric value.
	 * @param id The id of the metric.
	 * @param value The value for the update operation.
	 * @param customData The custom data for the update operation.
	 * @returns Nothing.
	 */
	public async updateMetricValue(
		id: string,
		value: "inc" | "dec" | number,
		customData?: { [key: string]: unknown }
	): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		Guards.defined(this.CLASS_NAME, nameof(value), value);

		await this.fetch<ITelemetryUpdateMetricValueRequest, INoContentResponse>("/:id/value", "PUT", {
			pathParams: {
				id
			},
			body: {
				value,
				customData
			}
		});
	}

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @returns Nothing.
	 */
	public async removeMetric(id: string): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		await this.fetch<ITelemetryRemoveMetricRequest, INoContentResponse>("/:id", "DELETE", {
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

		/**
		 * Number of values to return.
		 */
		pageSize?: number;

		/**
		 * Total entities length.
		 */
		totalEntities: number;
	}> {
		const result = await this.fetch<ITelemetryListRequest, ITelemetryListResponse>("/", "GET", {
			query: {
				type,
				cursor,
				pageSize
			}
		});

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
		/**
		 * Number of values to return.
		 */
		pageSize?: number;
		/**
		 * Total entities length.
		 */
		totalEntities: number;
	}> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const result = await this.fetch<ITelemetryValuesListRequest, ITelemetryValuesListResponse>(
			"/:id/values",
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
