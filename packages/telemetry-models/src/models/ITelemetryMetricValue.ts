// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface describing a telemetry metric value.
 */
export interface ITelemetryMetricValue {
	/**
	 * The timestamp of the metric.
	 */
	ts: number;

	/**
	 * The value of the metric.
	 */
	value: number;
}
