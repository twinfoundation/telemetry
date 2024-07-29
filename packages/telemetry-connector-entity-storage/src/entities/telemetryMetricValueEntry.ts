// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@gtsc/entity";

/**
 * Call defining a telemetry metric entry value.
 */
@entity()
export class TelemetryMetricValueEntry {
	/**
	 * The value id.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The metric id.
	 */
	@property({ type: "string" })
	public metricId!: string;

	/**
	 * The timestamp.
	 */
	@property({ type: "integer" })
	public ts!: number;

	/**
	 * The value of the metric.
	 */
	@property({ type: "string" })
	public value!: number;
}
