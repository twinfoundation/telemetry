// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Update a telemetry metric.
 */
export interface ITelemetryUpdateMetricRequest {
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
		 * The label of the metric.
		 */
		label: string;

		/**
		 * The description of the metric.
		 */
		description?: string;

		/**
		 * The unit of the metric.
		 */
		unit?: string;
	};
}
