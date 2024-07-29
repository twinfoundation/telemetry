// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IService, IServiceRequestContext } from "@gtsc/services";
import type { ITelemetryMetric } from "./ITelemetryMetric";
import type { ITelemetryMetricValue } from "./ITelemetryMetricValue";
import type { MetricType } from "./metricType";

/**
 * Interface describing a telemetry contract.
 */
export interface ITelemetry extends IService {
	/**
	 * Create a new metric.
	 * @param metric The metric details.
	 * @param initialValue The initial value of the metric.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	createMetric(
		metric: ITelemetryMetric,
		initialValue?: number,
		requestContext?: IServiceRequestContext
	): Promise<void>;

	/**
	 * Get the metric details and it's most recent value.
	 * @param id The metric id.
	 * @param requestContext The context for the request.
	 * @returns The metric details and it's most recent value.
	 */
	getMetric(
		id: string,
		requestContext?: IServiceRequestContext
	): Promise<{
		metric: ITelemetryMetric;
		value: ITelemetryMetricValue;
	}>;

	/**
	 * Update metric.
	 * @param metric The metric details.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	updateMetric(
		metric: Omit<ITelemetryMetric, "type">,
		requestContext?: IServiceRequestContext
	): Promise<void>;

	/**
	 * Update metric value.
	 * @param id The id of the metric.
	 * @param value The value for the update operation.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	updateMetricValue(
		id: string,
		value: "inc" | "dec" | number,
		requestContext?: IServiceRequestContext
	): Promise<void>;

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	removeMetric(id: string, requestContext?: IServiceRequestContext): Promise<void>;

	/**
	 * Query the metrics.
	 * @param type The type of the metric.
	 * @param cursor The cursor to request the next page of entities.
	 * @param pageSize The maximum number of entities in a page.
	 * @param requestContext The context for the request.
	 * @returns All the entities for the storage matching the conditions,
	 * and a cursor which can be used to request more entities.
	 * @throws NotImplementedError if the implementation does not support retrieval.
	 */
	query(
		type?: MetricType,
		cursor?: string,
		pageSize?: number,
		requestContext?: IServiceRequestContext
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
	}>;

	/**
	 * Query the metric values.
	 * @param id The id of the metric.
	 * @param timeStart The inclusive time as the start of the metric entries.
	 * @param timeEnd The inclusive time as the end of the metric entries.
	 * @param cursor The cursor to request the next page of entities.
	 * @param pageSize The maximum number of entities in a page.
	 * @param requestContext The context for the request.
	 * @returns All the entities for the storage matching the conditions,
	 * and a cursor which can be used to request more entities.
	 * @throws NotImplementedError if the implementation does not support retrieval.
	 */
	queryValues(
		id: string,
		timeStart?: number,
		timeEnd?: number,
		cursor?: string,
		pageSize?: number,
		requestContext?: IServiceRequestContext
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
	}>;
}
