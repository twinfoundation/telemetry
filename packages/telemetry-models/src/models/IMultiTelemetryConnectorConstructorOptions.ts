// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The options for the multi telemetry connector constructor.
 */
export interface IMultiTelemetryConnectorConstructorOptions {
	/**
	 * The telemetry connector types to multiplex.
	 */
	telemetryConnectorTypes: string[];
}
