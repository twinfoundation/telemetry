// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The types of metrics.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MetricType = {
	/**
	 * Counter.
	 */
	Counter: "Counter",

	/**
	 * Increment Decrement Counter.
	 */
	IncDecCounter: "IncDecCounter",

	/**
	 * Gauge.
	 */
	Gauge: "Gauge"
} as const;

/**
 * The types of metrics.
 */
export type MetricType = (typeof MetricType)[keyof typeof MetricType];
