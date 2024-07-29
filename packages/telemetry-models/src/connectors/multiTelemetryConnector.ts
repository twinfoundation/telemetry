// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseError, Guards, Is, NotImplementedError } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IServiceRequestContext } from "@gtsc/services";
import { TelemetryConnectorFactory } from "../factories/telemetryConnectorFactory";
import type { ITelemetryConnector } from "../models/ITelemetryConnector";
import type { ITelemetryMetric } from "../models/ITelemetryMetric";
import type { ITelemetryMetricValue } from "../models/ITelemetryMetricValue";
import { MetricType } from "../models/metricType";

/**
 * Class for performing telemetry operations on multiple connectors.
 */
export class MultiTelemetryConnector implements ITelemetryConnector {
	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<MultiTelemetryConnector>();

	/**
	 * The connectors to send the telemetry entries to.
	 */
	private readonly _telemetryConnectors: ITelemetryConnector[];

	/**
	 * Create a new instance of MultiTelemetryConnector.
	 * @param options The options for the connector.
	 * @param options.telemetryConnectorTypes The telemetry connectors to multiplex.
	 */
	constructor(options: { telemetryConnectorTypes: string[] }) {
		Guards.object(this.CLASS_NAME, nameof(options), options);
		Guards.arrayValue(
			this.CLASS_NAME,
			nameof(options.telemetryConnectorTypes),
			options.telemetryConnectorTypes
		);
		this._telemetryConnectors = options.telemetryConnectorTypes.map(t =>
			TelemetryConnectorFactory.get(t)
		);
	}

	/**
	 * Create a new metric.
	 * @param metric The metric details.
	 * @param initialValue The initial value of the metric.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async createMetric(
		metric: ITelemetryMetric,
		initialValue?: number,
		requestContext?: IServiceRequestContext
	): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.id), metric.id);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.label), metric.label);
		Guards.arrayOneOf(this.CLASS_NAME, nameof(metric.type), metric.type, Object.values(MetricType));

		if (Is.notEmpty(initialValue)) {
			Guards.number(this.CLASS_NAME, nameof(initialValue), initialValue);
		}

		await Promise.allSettled(
			this._telemetryConnectors.map(async telemetryConnector =>
				telemetryConnector.createMetric(metric, initialValue, requestContext)
			)
		);
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

		// Since all the connectors should have the same data, we can just use the first one.
		return this._telemetryConnectors[0].getMetric(id, requestContext);
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
		Guards.stringValue(this.CLASS_NAME, nameof(metric.label), metric.label);

		await Promise.allSettled(
			this._telemetryConnectors.map(async telemetryConnector =>
				telemetryConnector.updateMetric(metric, requestContext)
			)
		);
	}

	/**
	 * Update metric value.
	 * @param id The id of the metric.
	 * @param value The value for the update operation.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async updateMetricValue(
		id: string,
		value: "inc" | "dec" | number,
		requestContext?: IServiceRequestContext
	): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		await Promise.allSettled(
			this._telemetryConnectors.map(async telemetryConnector =>
				telemetryConnector.updateMetricValue(id, value, requestContext)
			)
		);
	}

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async removeMetric(id: string, requestContext?: IServiceRequestContext): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		await Promise.allSettled(
			this._telemetryConnectors.map(async telemetryConnector =>
				telemetryConnector.removeMetric(id, requestContext)
			)
		);
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
		// See if we can find a connector that supports querying.
		// If it throws anything other than not implemented, we should throw it.
		for (const telemetryConnector of this._telemetryConnectors) {
			try {
				const result = await telemetryConnector.query(type, cursor, pageSize, requestContext);
				return result;
			} catch (error) {
				if (!BaseError.isErrorName(error, NotImplementedError.CLASS_NAME)) {
					throw error;
				}
			}
		}

		throw new NotImplementedError(this.CLASS_NAME, "query");
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
		// See if we can find a connector that supports querying.
		// If it throws anything other than not implemented, we should throw it.
		for (const telemetryConnector of this._telemetryConnectors) {
			try {
				const result = await telemetryConnector.queryValues(
					id,
					timeStart,
					timeEnd,
					cursor,
					pageSize,
					requestContext
				);
				return result;
			} catch (error) {
				if (!BaseError.isErrorName(error, NotImplementedError.CLASS_NAME)) {
					throw error;
				}
			}
		}

		throw new NotImplementedError(this.CLASS_NAME, "queryValues");
	}
}
