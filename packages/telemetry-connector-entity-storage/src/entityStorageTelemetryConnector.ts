// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AlreadyExistsError,
	Converter,
	GeneralError,
	Guards,
	Is,
	NotFoundError,
	RandomHelper
} from "@twin.org/core";
import {
	ComparisonOperator,
	type EntityCondition,
	LogicalOperator,
	SortDirection
} from "@twin.org/entity";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { type ILoggingConnector, LoggingConnectorFactory } from "@twin.org/logging-models";
import { nameof } from "@twin.org/nameof";
import {
	type ITelemetryConnector,
	type ITelemetryMetric,
	type ITelemetryMetricValue,
	MetricType
} from "@twin.org/telemetry-models";
import type { TelemetryMetric } from "./entities/telemetryMetric";
import type { TelemetryMetricValue } from "./entities/telemetryMetricValue";
import type { IEntityStorageTelemetryConnectorConstructorOptions } from "./models/IEntityStorageTelemetryConnectorConstructorOptions";

/**
 * Class for performing telemetry operations in entity storage.
 */
export class EntityStorageTelemetryConnector implements ITelemetryConnector {
	/**
	 * The namespace supported by the telemetry connector.
	 */
	public static readonly NAMESPACE: string = "entity-storage";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<EntityStorageTelemetryConnector>();

	/**
	 * The entity storage for the telemetry metrics.
	 * @internal
	 */
	private readonly _metricStorage: IEntityStorageConnector<TelemetryMetric>;

	/**
	 * The entity storage for the telemetry metric values.
	 * @internal
	 */
	private readonly _metricValueStorage: IEntityStorageConnector<TelemetryMetricValue>;

	/**
	 * The connector for logging.
	 * @internal
	 */
	private readonly _loggingConnector?: ILoggingConnector;

	/**
	 * Create a new instance of EntityStorageTelemetryConnector.
	 * @param options The options for the connector.
	 */
	constructor(options?: IEntityStorageTelemetryConnectorConstructorOptions) {
		this._metricStorage = EntityStorageConnectorFactory.get(
			options?.telemetryMetricStorageConnectorType ?? "telemetry-metric"
		);
		this._metricValueStorage = EntityStorageConnectorFactory.get(
			options?.telemetryMetricValueStorageConnectorType ?? "telemetry-metric-value"
		);

		if (Is.stringValue(options?.loggingConnectorType)) {
			this._loggingConnector = LoggingConnectorFactory.get(options.loggingConnectorType);
		}
	}

	/**
	 * Create a new metric.
	 * @param metric The metric details.
	 * @returns Nothing.
	 */
	public async createMetric(metric: ITelemetryMetric): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.id), metric.id);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.label), metric.label);
		Guards.arrayOneOf(this.CLASS_NAME, nameof(metric.type), metric.type, Object.values(MetricType));

		if (Is.notEmpty(metric.description)) {
			Guards.string(this.CLASS_NAME, nameof(metric.description), metric.description);
		}
		if (Is.notEmpty(metric.unit)) {
			Guards.string(this.CLASS_NAME, nameof(metric.unit), metric.unit);
		}

		const existingMetric = await this._metricStorage.get(metric.id);
		if (Is.notEmpty(existingMetric)) {
			throw new AlreadyExistsError(this.CLASS_NAME, "metricAlreadyExists", metric.id);
		}

		const telemetryMetric: TelemetryMetric = {
			id: metric.id,
			label: metric.label,
			type: metric.type,
			unit: metric.unit ?? "",
			description: metric.description ?? ""
		};

		await this._metricStorage.set(telemetryMetric);

		await this._loggingConnector?.log({
			source: this.CLASS_NAME,
			message: "metricCreated",
			level: "info",
			data: { id: metric.id, type: metric.type, label: metric.label }
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
		const metrics = await this.queryValues(id, undefined, undefined, undefined, 1);
		return {
			metric: metrics.metric,
			value: metrics.entities[0]
		};
	}

	/**
	 * Update metric.
	 * @param metric The metric details.
	 * @returns Nothing.
	 */
	public async updateMetric(metric: Omit<ITelemetryMetric, "type">): Promise<void> {
		Guards.object<ITelemetryMetric>(this.CLASS_NAME, nameof(metric), metric);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.id), metric.id);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.label), metric.label);
		if (Is.notEmpty(metric.description)) {
			Guards.string(this.CLASS_NAME, nameof(metric.description), metric.description);
		}
		if (Is.notEmpty(metric.unit)) {
			Guards.string(this.CLASS_NAME, nameof(metric.unit), metric.unit);
		}

		const existingMetric = await this._metricStorage.get(metric.id);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", metric.id);
		}

		const telemetryMetric: TelemetryMetric = {
			id: metric.id,
			label: metric.label,
			type: existingMetric.type,
			unit: metric.unit ?? existingMetric.unit,
			description: metric.description ?? existingMetric.description
		};

		await this._metricStorage.set(telemetryMetric);

		await this._loggingConnector?.log({
			source: this.CLASS_NAME,
			message: "metricUpdated",
			level: "info",
			data: { id: metric.id, type: metric.type, label: metric.label }
		});
	}

	/**
	 * Add a metric value.
	 * @param id The id of the metric.
	 * @param value The value for the add operation.
	 * @param customData The custom data for the metric value.
	 * @returns Nothing.
	 */
	public async addMetricValue(
		id: string,
		value: "inc" | "dec" | number,
		customData?: { [key: string]: unknown }
	): Promise<string> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const existingMetric = await this._metricStorage.get(id);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", id);
		}

		const existingMetricValue = await this._metricValueStorage.query(
			{ property: "metricId", comparison: ComparisonOperator.Equals, value: id },
			[
				{
					property: "ts",
					sortDirection: SortDirection.Descending
				}
			],
			undefined,
			undefined,
			1
		);

		const lastMetric = existingMetricValue.entities[0];
		let newValue = Is.notEmpty(lastMetric) ? (lastMetric.value as number) : 0;

		if (existingMetric.type === MetricType.Counter) {
			if (value === "inc") {
				newValue++;
			} else if (Is.integer(value) && value > 0) {
				newValue += value;
			} else {
				throw new GeneralError(this.CLASS_NAME, "counterIncOnly");
			}
		} else if (existingMetric.type === MetricType.IncDecCounter) {
			if (value === "inc") {
				newValue++;
			} else if (value === "dec") {
				newValue--;
			} else if (Is.integer(value)) {
				newValue += value;
			} else {
				throw new GeneralError(this.CLASS_NAME, "upDownCounterIncOrDecOnly");
			}
		} else if (Is.number(value)) {
			newValue = value;
		} else {
			throw new GeneralError(this.CLASS_NAME, "gaugeNoIncDec");
		}

		const telemetryMetricValue: TelemetryMetricValue = {
			id: Converter.bytesToHex(RandomHelper.generate(16)),
			metricId: id,
			ts: Date.now(),
			value: newValue,
			customData
		};

		await this._metricValueStorage.set(telemetryMetricValue);

		await this._loggingConnector?.log({
			source: this.CLASS_NAME,
			message: "metricValueCreated",
			level: "info",
			data: { id, value: newValue }
		});

		return telemetryMetricValue.id;
	}

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @returns Nothing.
	 */
	public async removeMetric(id: string): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const existingMetric = await this._metricStorage.get(id);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", id);
		}

		await this._metricStorage.remove(id);

		let existingMetricValuesResult;
		do {
			existingMetricValuesResult = await this._metricValueStorage.query(
				{
					property: "metricId",
					comparison: ComparisonOperator.Equals,
					value: id
				},
				undefined,
				undefined,
				existingMetricValuesResult?.cursor
			);
			await Promise.allSettled(
				existingMetricValuesResult.entities.map(async telemetryMetricValue => {
					this._metricValueStorage.remove((telemetryMetricValue as TelemetryMetricValue).id);
				})
			);
		} while (Is.stringValue(existingMetricValuesResult.cursor));

		await this._loggingConnector?.log({
			source: this.CLASS_NAME,
			message: "metricRemoved",
			level: "info",
			data: { id }
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
		const condition: EntityCondition<TelemetryMetric> = {
			conditions: [],
			logicalOperator: LogicalOperator.And
		};

		if (Is.arrayOneOf(type, Object.values(MetricType))) {
			condition.conditions.push({
				property: "type",
				comparison: ComparisonOperator.Equals,
				value: type
			});
		}

		const result = await this._metricStorage.query(
			condition.conditions.length > 0 ? condition : undefined,
			[
				{
					property: "label",
					sortDirection: SortDirection.Ascending
				}
			],
			undefined,
			cursor,
			pageSize
		);

		return {
			entities: result.entities as ITelemetryMetric[],
			cursor: result.cursor
		};
	}

	/**
	 * Query the metrics.
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

		const existingMetric = await this._metricStorage.get(id);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", id);
		}

		const condition: EntityCondition<TelemetryMetricValue> = {
			conditions: [],
			logicalOperator: LogicalOperator.And
		};

		condition.conditions.push({
			property: "metricId",
			comparison: ComparisonOperator.Equals,
			value: id
		});

		if (Is.number(timeStart)) {
			condition.conditions.push({
				property: "ts",
				comparison: ComparisonOperator.GreaterThanOrEqual,
				value: timeStart
			});
		}

		if (Is.number(timeEnd)) {
			condition.conditions.push({
				property: "ts",
				comparison: ComparisonOperator.LessThanOrEqual,
				value: timeEnd
			});
		}

		const result = await this._metricValueStorage.query(
			condition,
			[
				{
					property: "ts",
					sortDirection: SortDirection.Descending
				}
			],
			undefined,
			cursor,
			pageSize
		);

		return {
			metric: existingMetric as ITelemetryMetric,
			entities: result.entities as ITelemetryMetricValue[],
			cursor: result.cursor
		};
	}
}
