// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Update a telemetry entry.
 */
export interface ITelemetryUpdateMetricValueRequest {
	/**
	 * The path parameters.
	 */
	pathParams: {
		/**
		 * The id of the metric.
		 */
		id: string;
	};

	/**
	 * The data to be used in the update.
	 */
	body: {
		/**
		 * The value for the update operation.
		 */
		value: "inc" | "dec" | number;

		/**
		 * The custom data for the update operation.
		 */
		customData?: { [key: string]: unknown };
	};
}
