// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@twin.org/entity";

/**
 * Class defining a telemetry metric value.
 */
@entity()
export class TelemetryMetricValue {
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
	@property({ type: "integer", format: "uint64" })
	public ts!: number;

	/**
	 * The value of the metric.
	 */
	@property({ type: "number" })
	public value!: number;

	/**
	 * The custom data for the metric value.
	 */
	@property({ type: "object", optional: true })
	public customData?: { [key: string]: unknown };
}
