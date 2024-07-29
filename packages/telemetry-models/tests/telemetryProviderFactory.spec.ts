// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { TelemetryConnectorFactory } from "../src/factories/telemetryConnectorFactory";
import type { ITelemetryConnector } from "../src/models/ITelemetryConnector";

describe("TelemetryConnectorFactory", () => {
	test("can add an item to the factory", async () => {
		TelemetryConnectorFactory.register(
			"my-telemetry",
			() => ({}) as unknown as ITelemetryConnector
		);
	});
});
