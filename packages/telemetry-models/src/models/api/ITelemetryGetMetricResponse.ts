// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { ITelemetryMetric } from "../ITelemetryMetric";
import type { ITelemetryMetricValue } from "../ITelemetryMetricValue";

/**
 * Get a telemetry metric response.
 */
export interface ITelemetryGetMetricResponse {
	/**
	 * The body parameters.
	 */
	body: {
		/**
		 * The metric.
		 */
		metric: ITelemetryMetric;

		/**
		 * The latest metric value.
		 */
		value: ITelemetryMetricValue;
	};
}
