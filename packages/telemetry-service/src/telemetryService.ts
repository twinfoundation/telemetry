// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Guards } from "@twin.org/core";
import { nameof } from "@twin.org/nameof";
import {
	TelemetryConnectorFactory,
	type ITelemetryComponent,
	type ITelemetryConnector,
	type ITelemetryMetric,
	type ITelemetryMetricValue,
	type MetricType
} from "@twin.org/telemetry-models";

/**
 * Service for performing telemetry operations to a connector.
 */
export class TelemetryService implements ITelemetryComponent {
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
	 * @returns Nothing.
	 */
	public async createMetric(metric: ITelemetryMetric): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);

		await this._telemetryConnector.createMetric(metric);
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
		return this._telemetryConnector.getMetric(id);
	}

	/**
	 * Update metric.
	 * @param metric The metric details.
	 * @returns Nothing.
	 */
	public async updateMetric(metric: Omit<ITelemetryMetric, "type">): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.id), metric.id);
		return this._telemetryConnector.updateMetric(metric);
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
		return this._telemetryConnector.addMetricValue(id, value, customData);
	}

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @returns Nothing.
	 */
	public async removeMetric(id: string): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);
		return this._telemetryConnector.removeMetric(id);
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
		return this._telemetryConnector.query(type, cursor, pageSize);
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
		return this._telemetryConnector.queryValues(id, timeStart, timeEnd, cursor, pageSize);
	}
}
