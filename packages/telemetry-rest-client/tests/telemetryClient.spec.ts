// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { TelemetryClient } from "../src/telemetryClient";

describe("TelemetryClient", () => {
	test("Can create an instance", async () => {
		const client = new TelemetryClient({ endpoint: "http://localhost:8080" });
		expect(client).toBeDefined();
	});
});
