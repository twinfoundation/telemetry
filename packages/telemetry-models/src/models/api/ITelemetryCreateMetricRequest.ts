// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { MetricType } from "../metricType";

/**
 * Create a new telemetry entry.
 */
export interface ITelemetryCreateMetricRequest {
	/**
	 * The data to be used in the create.
	 */
	body: {
		/**
		 * The id of the metric.
		 */
		id: string;

		/**
		 * The label of the metric.
		 */
		label: string;

		/**
		 * The type of the metric.
		 */
		type: MetricType;

		/**
		 * The description of the metric.
		 */
		description?: string;

		/**
		 * The unit of the metric.
		 */
		unit?: string;

		/**
		 * The initial value of the metric.
		 */
		initialValue?: number;
	};
}
