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
} from "@gtsc/core";
import {
	ComparisonOperator,
	LogicalOperator,
	SortDirection,
	type EntityCondition
} from "@gtsc/entity";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@gtsc/entity-storage-models";
import { type ILoggingConnector, LoggingConnectorFactory } from "@gtsc/logging-models";
import { nameof } from "@gtsc/nameof";
import type { IServiceRequestContext } from "@gtsc/services";
import {
	type ITelemetryConnector,
	type ITelemetryMetric,
	type ITelemetryMetricValue,
	MetricType
} from "@gtsc/telemetry-models";
import type { TelemetryMetricEntry } from "./entities/telemetryMetricEntry";
import type { TelemetryMetricValueEntry } from "./entities/telemetryMetricValueEntry";

/**
 * Class for performing telemetry operations in entity storage.
 */
export class EntityStorageTelemetryConnector implements ITelemetryConnector {
	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<EntityStorageTelemetryConnector>();

	/**
	 * The entity storage for the telemetry entries.
	 * @internal
	 */
	private readonly _metricStorage: IEntityStorageConnector<TelemetryMetricEntry>;

	/**
	 * The entity storage for the telemetry entry values.
	 * @internal
	 */
	private readonly _metricValueStorage: IEntityStorageConnector<TelemetryMetricValueEntry>;

	/**
	 * The connector for logging.
	 * @internal
	 */
	private readonly _loggingConnector?: ILoggingConnector;

	/**
	 * Create a new instance of EntityStorageTelemetryConnector.
	 * @param options The options for the connector.
	 * @param options.telemetryMetricStorageConnectorType The type of the entity storage connector to use, defaults to "telemetry-metric".
	 * @param options.telemetryMetricValueStorageConnectorType The type of the entity storage connector to use, defaults to "telemetry-metric-value".
	 * @param options.loggingConnectorType The type of the logging connector to use, can be undefined for no logging.
	 */
	constructor(options?: {
		telemetryMetricStorageConnectorType?: string;
		telemetryMetricValueStorageConnectorType?: string;
		loggingConnectorType?: string;
	}) {
		this._metricStorage = EntityStorageConnectorFactory.get(
			options?.telemetryMetricStorageConnectorType ?? "telemetry-metric"
		);
		this._metricValueStorage = EntityStorageConnectorFactory.get(
			options?.telemetryMetricValueStorageConnectorType ?? "telemetry-metric-value"
		);

		if (Is.stringValue(options?.loggingConnectorType)) {
			this._loggingConnector = LoggingConnectorFactory.getIfExists(options.loggingConnectorType);
		}
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
		Guards.stringValue(this.CLASS_NAME, nameof(metric.id), metric.id);
		Guards.stringValue(this.CLASS_NAME, nameof(metric.label), metric.label);
		Guards.arrayOneOf(this.CLASS_NAME, nameof(metric.type), metric.type, Object.values(MetricType));

		if (Is.notEmpty(metric.description)) {
			Guards.string(this.CLASS_NAME, nameof(metric.description), metric.description);
		}
		if (Is.notEmpty(metric.unit)) {
			Guards.string(this.CLASS_NAME, nameof(metric.unit), metric.unit);
		}

		const existingMetric = await this._metricStorage.get(metric.id, undefined, requestContext);
		if (Is.notEmpty(existingMetric)) {
			throw new AlreadyExistsError(this.CLASS_NAME, "metricAlreadyExists", metric.id);
		}

		const entry: TelemetryMetricEntry = {
			id: metric.id,
			label: metric.label,
			type: Object.values(MetricType).indexOf(metric.type),
			unit: metric.unit ?? "",
			description: metric.description ?? ""
		};

		await this._metricStorage.set(entry, requestContext);

		await this._loggingConnector?.log(
			{
				source: this.CLASS_NAME,
				message: "metricCreated",
				level: "info",
				data: { id: metric.id, type: metric.type, label: metric.label }
			},
			requestContext
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
		const metrics = await this.queryValues(id, undefined, undefined, undefined, 1, requestContext);
		return {
			metric: metrics.metric,
			value: metrics.entities[0]
		};
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
		if (Is.notEmpty(metric.description)) {
			Guards.string(this.CLASS_NAME, nameof(metric.description), metric.description);
		}
		if (Is.notEmpty(metric.unit)) {
			Guards.string(this.CLASS_NAME, nameof(metric.unit), metric.unit);
		}

		const existingMetric = await this._metricStorage.get(metric.id, undefined, requestContext);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", metric.id);
		}

		const entry: TelemetryMetricEntry = {
			id: metric.id,
			label: metric.label,
			type: existingMetric.type,
			unit: metric.unit ?? existingMetric.unit,
			description: metric.description ?? existingMetric.description
		};

		await this._metricStorage.set(entry, requestContext);

		await this._loggingConnector?.log(
			{
				source: this.CLASS_NAME,
				message: "metricUpdated",
				level: "info",
				data: { id: metric.id, type: metric.type, label: metric.label }
			},
			requestContext
		);
	}

	/**
	 * Add a metric value.
	 * @param id The id of the metric.
	 * @param value The value for the add operation.
	 * @param customData The custom data for the metric value.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async addMetricValue(
		id: string,
		value: "inc" | "dec" | number,
		customData?: { [key: string]: unknown },
		requestContext?: IServiceRequestContext
	): Promise<string> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const existingMetric = await this._metricStorage.get(id, undefined, requestContext);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", id);
		}

		const existingMetricValue = await this._metricValueStorage.query(
			{ property: "metricId", operator: ComparisonOperator.Equals, value: id },
			[
				{
					property: "ts",
					sortDirection: SortDirection.Descending
				}
			],
			undefined,
			undefined,
			1,
			requestContext
		);

		const lastMetric = existingMetricValue.entities[0];
		let newValue = Is.notEmpty(lastMetric) ? (lastMetric.value as number) : 0;

		const type = Object.values(MetricType)[existingMetric.type];
		if (type === MetricType.Counter) {
			if (value === "inc") {
				newValue++;
			} else if (Is.integer(value) && value > 0) {
				newValue += value;
			} else {
				throw new GeneralError(this.CLASS_NAME, "counterIncOnly");
			}
		} else if (type === MetricType.IncDecCounter) {
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

		const entryValue: TelemetryMetricValueEntry = {
			id: Converter.bytesToHex(RandomHelper.generate(16)),
			metricId: id,
			ts: Date.now(),
			value: newValue,
			customData
		};

		await this._metricValueStorage.set(entryValue, requestContext);

		await this._loggingConnector?.log(
			{
				source: this.CLASS_NAME,
				message: "metricValueCreated",
				level: "info",
				data: { id, value: newValue }
			},
			requestContext
		);

		return entryValue.id;
	}

	/**
	 * Remove metric.
	 * @param id The id of the metric.
	 * @param requestContext The context for the request.
	 * @returns Nothing.
	 */
	public async removeMetric(id: string, requestContext?: IServiceRequestContext): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(id), id);

		const existingMetric = await this._metricStorage.get(id, undefined, requestContext);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", id);
		}

		await this._metricStorage.remove(id, requestContext);

		let remainingCount = 0;
		do {
			const existingMetricValues = await this._metricValueStorage.query(
				{ property: "metricId", operator: ComparisonOperator.Equals, value: id },
				undefined,
				undefined,
				undefined,
				undefined,
				requestContext
			);
			await Promise.allSettled(
				existingMetricValues.entities.map(async entry => {
					this._metricValueStorage.remove((entry as TelemetryMetricValueEntry).id, requestContext);
				})
			);
			remainingCount = existingMetricValues.totalEntities;
		} while (remainingCount > 0);

		await this._loggingConnector?.log(
			{
				source: this.CLASS_NAME,
				message: "metricRemoved",
				level: "info",
				data: { id }
			},
			requestContext
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
		const metricTypes: MetricType[] = Object.values(MetricType);

		const condition: EntityCondition<TelemetryMetricEntry> = {
			conditions: [],
			logicalOperator: LogicalOperator.And
		};

		if (Is.stringValue(type) && Is.arrayOneOf(type, metricTypes)) {
			condition.conditions.push({
				property: "type",
				operator: ComparisonOperator.Equals,
				value: metricTypes.indexOf(type)
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
			pageSize,
			requestContext
		);

		return {
			entities: result.entities.map(
				t =>
					({
						...t,
						type: metricTypes[t.type as number]
					}) as ITelemetryMetric
			),
			cursor: result.cursor,
			pageSize: result.pageSize,
			totalEntities: result.totalEntities
		};
	}

	/**
	 * Query the metrics.
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

		const existingMetric = await this._metricStorage.get(id, undefined, requestContext);
		if (Is.undefined(existingMetric)) {
			throw new NotFoundError(this.CLASS_NAME, "metricNotFound", id);
		}

		const condition: EntityCondition<TelemetryMetricValueEntry> = {
			conditions: [],
			logicalOperator: LogicalOperator.And
		};

		condition.conditions.push({
			property: "metricId",
			operator: ComparisonOperator.Equals,
			value: id
		});

		if (Is.number(timeStart)) {
			condition.conditions.push({
				property: "ts",
				operator: ComparisonOperator.GreaterThanOrEqual,
				value: timeStart
			});
		}

		if (Is.number(timeEnd)) {
			condition.conditions.push({
				property: "ts",
				operator: ComparisonOperator.LessThanOrEqual,
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
			pageSize,
			requestContext
		);

		const types: MetricType[] = Object.values(MetricType);

		return {
			metric: {
				...existingMetric,
				type: types[existingMetric.type as number]
			},
			entities: result.entities as TelemetryMetricValueEntry[],
			cursor: result.cursor,
			pageSize: result.pageSize,
			totalEntities: result.totalEntities
		};
	}
}
