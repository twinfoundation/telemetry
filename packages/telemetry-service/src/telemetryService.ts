// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IServiceRequestContext } from "@gtsc/services";
import {
	type ITelemetryMetric,
	TelemetryConnectorFactory,
	type ITelemetry,
	type ITelemetryConnector,
	type ITelemetryMetricValue,
	type MetricType
} from "@gtsc/telemetry-models";

/**
 * Service for performing telemetry operations to a connector.
 */
export class TelemetryService implements ITelemetry {
	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<TelemetryService>();

	/**
	 * Telemetry connector used by the service.
	 * @internal
	 */
	private readonly _telemetryConnector: ITelemetryConnector;

	/**
	 * Create a new instance of TelemetryService.
	 * @param options The options for the connector.
	 * @param options.telemetryConnectorType The type of the telemetry connector to use, defaults to "telemetry".
	 */
	constructor(options?: { telemetryConnectorType?: string }) {
		this._telemetryConnector = TelemetryConnectorFactory.get(
			options?.telemetryConnectorType ?? "telemetry"
		);
	}

	/**
	 * Create a new metric.
	 * @param metric The metric details.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async createMetric(
		metric: ITelemetryMetric,
		requestContext?: IServiceRequestContext
	): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);

		await this._telemetryConnector.createMetric(metric, requestContext);
	}

	/**
	 * Get the metric details and it's most recent value.
	 * @param id The metric id.
	 * @param requestContext The context for the request.
	 * @returns The metric details and it's most recent value.
	 */
	public async getMetric(
		id: string,
		requestContext?: IServiceRequestContext
	): Promise<{
		metric: ITelemetryMetric;
		value: ITelemetryMetricValue;
	}> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		return this._telemetryConnector.getMetric(id, requestContext);
	}

	/**
	 * Update metric.
	 * @param metric The metric details.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async updateMetric(
		metric: Omit<ITelemetryMetric, "type">,
		requestContext?: IServiceRequestContext
	): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.id), metric.id);
		return this._telemetryConnector.updateMetric(metric, requestContext);
	}

	/**
	 * Add a metric value.
	 * @param id The id of the metric.
	 * @param value The value for the add operation.
	 * @param customData The custom data for the add operation.
	 * @param requestContext The context for the request.
	 * @returns The created metric value id.
	 */
	public async addMetricValue(
		id: string,
		value: "inc" | "dec" | number,
		customData?: { [key: string]: unknown },
		requestContext?: IServiceRequestContext
	): Promise<string> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		Guards.defined(this.CLASS_NAME, nameof(value), value);
		return this._telemetryConnector.addMetricValue(id, value, customData, requestContext);
	}

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async removeMetric(id: string, requestContext?: IServiceRequestContext): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		return this._telemetryConnector.removeMetric(id, requestContext);
	}

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
	public async query(
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
	}> {
		return this._telemetryConnector.query(type, cursor, pageSize, requestContext);
	}

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
	public async queryValues(
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
	}> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		return this._telemetryConnector.queryValues(
			id,
			timeStart,
			timeEnd,
			cursor,
			pageSize,
			requestContext
		);
	}
}
