// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { entity, property } from "@gtsc/entity";

/**
 * Call defining a telemetry metric entry.
 */
@entity()
export class TelemetryMetricEntry {
	/**
	 * The id.
	 */
	@property({ type: "string", isPrimary: true })
	public id!: string;

	/**
	 * The label.
	 */
	@property({ type: "string" })
	public label!: string;

	/**
	 * The type of the metric.
	 */
	@property({ type: "integer" })
	public type!: number;

	/**
	 * The unit.
	 */
	@property({ type: "string" })
	public unit!: string;

	/**
	 * The description.
	 */
	@property({ type: "string" })
	public description!: string;
}
