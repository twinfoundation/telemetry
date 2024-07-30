// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntitySchemaFactory, EntitySchemaHelper } from "@gtsc/entity";
import { nameof } from "@gtsc/nameof";
import { TelemetryMetric } from "./entities/telemetryMetric";
import { TelemetryMetricValue } from "./entities/telemetryMetricValue";

/**
 * Initialize the schema for the telemetry connector entity storage.
 */
export function initSchema(): void {
	EntitySchemaFactory.register(nameof<TelemetryMetric>(), () =>
		EntitySchemaHelper.getSchema(TelemetryMetric)
	);
	EntitySchemaFactory.register(nameof<TelemetryMetricValue>(), () =>
		EntitySchemaHelper.getSchema(TelemetryMetricValue)
	);
}
