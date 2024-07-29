// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@gtsc/entity";
import { nameof } from "@gtsc/nameof";
import { TelemetryMetricEntry } from "./entities/telemetryMetricEntry";
import { TelemetryMetricValueEntry } from "./entities/telemetryMetricValueEntry";

/**
 * Initialize the schema for the telemetry connector entity storage.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<TelemetryMetricEntry>(), () =>
		EntitySchemaHelper.getSchema(TelemetryMetricEntry)
	);
	EntitySchemaFactory.register(nameof<TelemetryMetricValueEntry>(), () =>
		EntitySchemaHelper.getSchema(TelemetryMetricValueEntry)
	);
}
