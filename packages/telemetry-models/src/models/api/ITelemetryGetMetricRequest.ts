// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Get a telemetry metric.
 */
export interface ITelemetryGetMetricRequest {
	/**
	 * The path parameters.
	 */
	pathParams: {
		/**
		 * The id of the metric.
		 */
		id: string;
	};
}
