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
	@property({ type: "integer" })
	public ts!: number;

	/**
	 * The value of the metric.
	 */
	@property({ type: "string" })
	public value!: number;

	/**
	 * The custom data for the metric value.
	 */
	@property({ type: "object" })
	public customData?: { [key: string]: unknown };
}
