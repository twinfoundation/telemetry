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
	Counter: 0,

	/**
	 * Increment Decrement Counter.
	 */
	IncDecCounter: 1,

	/**
	 * Gauge.
	 */
	Gauge: 2
} as const;

/**
 * The types of metrics.
 */
export type MetricType = (typeof MetricType)[keyof typeof MetricType];
