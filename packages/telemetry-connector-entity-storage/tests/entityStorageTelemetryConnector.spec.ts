// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MemoryEntityStorageConnector } from "@gtsc/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@gtsc/entity-storage-models";
import { nameof } from "@gtsc/nameof";
import { MetricType } from "@gtsc/telemetry-models";
import type { TelemetryMetricEntry } from "../src/entities/telemetryMetricEntry";
import type { TelemetryMetricValueEntry } from "../src/entities/telemetryMetricValueEntry";
import { EntityStorageTelemetryConnector } from "../src/entityStorageTelemetryConnector";
import { initSchema } from "../src/schema";

let telemetryMetricsEntityStorage: MemoryEntityStorageConnector<TelemetryMetricEntry>;
let telemetryMetricsValueEntityStorage: MemoryEntityStorageConnector<TelemetryMetricValueEntry>;

describe("EntityStorageTelemetryConnector", () => {
	beforeEach(() => {
		initSchema();
		telemetryMetricsEntityStorage = new MemoryEntityStorageConnector<TelemetryMetricEntry>({
			entitySchema: nameof<TelemetryMetricEntry>()
		});
		telemetryMetricsValueEntityStorage =
			new MemoryEntityStorageConnector<TelemetryMetricValueEntry>({
				entitySchema: nameof<TelemetryMetricValueEntry>()
			});
		EntityStorageConnectorFactory.register("telemetry-metric", () => telemetryMetricsEntityStorage);
		EntityStorageConnectorFactory.register(
			"telemetry-metric-value",
			() => telemetryMetricsValueEntityStorage
		);
	});

	test("can construct", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		expect(telemetry).toBeDefined();
	});

	test("can create a metric with no initial value", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			undefined,
			{ partitionId: "test" }
		);

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(1);
		expect(entryStore?.[0].id).toEqual("test");
		expect(entryStore?.[0].label).toEqual("Test");
		expect(entryStore?.[0].description).toEqual("Test metric");
		expect(entryStore?.[0].unit).toEqual("kgs");
		expect(entryStore?.[0].type).toEqual(0);

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(1);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(0);
	});

	test("can update a metric details", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			undefined,
			{ partitionId: "test" }
		);

		await telemetry.updateMetric(
			{
				id: "test",
				label: "Test2",
				description: "Test metric2",
				unit: "kgs2"
			},
			{ partitionId: "test" }
		);

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(1);
		expect(entryStore?.[0].id).toEqual("test");
		expect(entryStore?.[0].label).toEqual("Test2");
		expect(entryStore?.[0].description).toEqual("Test metric2");
		expect(entryStore?.[0].unit).toEqual("kgs2");
		expect(entryStore?.[0].type).toEqual(0);
	});

	test("can create a counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			10,
			{ partitionId: "test" }
		);

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(1);
		expect(entryStore?.[0].id).toEqual("test");
		expect(entryStore?.[0].label).toEqual("Test");
		expect(entryStore?.[0].description).toEqual("Test metric");
		expect(entryStore?.[0].unit).toEqual("kgs");
		expect(entryStore?.[0].type).toEqual(0);

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(1);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(10);
	});

	test("can create a inc dec counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.IncDecCounter
			},
			11,
			{ partitionId: "test" }
		);

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(1);
		expect(entryStore?.[0].id).toEqual("test");
		expect(entryStore?.[0].label).toEqual("Test");
		expect(entryStore?.[0].description).toEqual("Test metric");
		expect(entryStore?.[0].unit).toEqual("kgs");
		expect(entryStore?.[0].type).toEqual(1);

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(1);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(11);
	});

	test("can create a gauge metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Gauge
			},
			12.4,
			{ partitionId: "test" }
		);

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(1);
		expect(entryStore?.[0].id).toEqual("test");
		expect(entryStore?.[0].label).toEqual("Test");
		expect(entryStore?.[0].description).toEqual("Test metric");
		expect(entryStore?.[0].unit).toEqual("kgs");
		expect(entryStore?.[0].type).toEqual(2);

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(1);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(12.4);
	});

	test("can increment a counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			10,
			{ partitionId: "test" }
		);

		await telemetry.updateMetricValue("test", "inc", { partitionId: "test" });

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(2);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(10);
		expect(entryValueStore?.[1].id.length).toEqual(32);
		expect(entryValueStore?.[1].metricId).toEqual("test");
		expect(entryValueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[1].value).toEqual(11);
	});

	test("can fail to decrement a counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			10,
			{ partitionId: "test" }
		);

		await expect(
			telemetry.updateMetricValue("test", "dec", { partitionId: "test" })
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "entityStorageTelemetryConnector.counterIncOnly"
		});
	});

	test("can fail to set a value to a counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			10,
			{ partitionId: "test" }
		);

		await expect(
			telemetry.updateMetricValue("test", 5, { partitionId: "test" })
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "entityStorageTelemetryConnector.counterIncOnly"
		});
	});

	test("can increment an inc/dec counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.IncDecCounter
			},
			10,
			{ partitionId: "test" }
		);

		await telemetry.updateMetricValue("test", "inc", { partitionId: "test" });

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(2);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(10);
		expect(entryValueStore?.[1].id.length).toEqual(32);
		expect(entryValueStore?.[1].metricId).toEqual("test");
		expect(entryValueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[1].value).toEqual(11);
	});

	test("can decrement an inc/dec counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.IncDecCounter
			},
			10,
			{ partitionId: "test" }
		);

		await telemetry.updateMetricValue("test", "dec", { partitionId: "test" });

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(2);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(10);
		expect(entryValueStore?.[1].id.length).toEqual(32);
		expect(entryValueStore?.[1].metricId).toEqual("test");
		expect(entryValueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[1].value).toEqual(9);
	});

	test("can fail to set a value to an inc/dec counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.IncDecCounter
			},
			10,
			{ partitionId: "test" }
		);

		await expect(
			telemetry.updateMetricValue("test", 5, { partitionId: "test" })
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "entityStorageTelemetryConnector.upDownCounterIncOrDecOnly"
		});
	});

	test("can set a gauge metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Gauge
			},
			10,
			{ partitionId: "test" }
		);

		await telemetry.updateMetricValue("test", 11, { partitionId: "test" });

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(2);
		expect(entryValueStore?.[0].id.length).toEqual(32);
		expect(entryValueStore?.[0].metricId).toEqual("test");
		expect(entryValueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[0].value).toEqual(10);
		expect(entryValueStore?.[1].id.length).toEqual(32);
		expect(entryValueStore?.[1].metricId).toEqual("test");
		expect(entryValueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(entryValueStore?.[1].value).toEqual(11);
	});

	test("can fail to inc a gauge metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Gauge
			},
			10,
			{ partitionId: "test" }
		);

		await expect(
			telemetry.updateMetricValue("test", "inc", { partitionId: "test" })
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "entityStorageTelemetryConnector.gaugeNoIncDec"
		});
	});

	test("can fail to dec a gauge metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Gauge
			},
			10,
			{ partitionId: "test" }
		);

		await expect(
			telemetry.updateMetricValue("test", "dec", { partitionId: "test" })
		).rejects.toMatchObject({
			name: "GeneralError",
			message: "entityStorageTelemetryConnector.gaugeNoIncDec"
		});
	});

	test("can remove a metric and its values", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			undefined,
			{ partitionId: "test" }
		);

		for (let i = 0; i < 10; i++) {
			await telemetry.updateMetricValue("test", "inc", { partitionId: "test" });
		}

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(1);

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(11);

		await telemetry.removeMetric("test", { partitionId: "test" });
		expect(entryStore?.length).toEqual(0);
		expect(entryValueStore?.length).toEqual(0);
	});

	test("can query metrics", async () => {
		const telemetry = new EntityStorageTelemetryConnector();

		for (let i = 0; i < 11; i++) {
			await telemetry.createMetric(
				{
					id: `test${i}`,
					label: "Test",
					description: "Test metric",
					unit: "kgs",
					type: MetricType.Counter
				},
				undefined,
				{ partitionId: "test" }
			);
		}

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(11);

		const query1 = await telemetry.query(undefined, undefined, 10, {
			partitionId: "test"
		});

		expect(query1.entities.length).toEqual(10);
		expect(query1.totalEntities).toEqual(11);
	});

	test("can query metrics for specific type", async () => {
		const telemetry = new EntityStorageTelemetryConnector();

		for (let i = 0; i < 5; i++) {
			await telemetry.createMetric(
				{
					id: `test-${i}`,
					label: "Test",
					description: "Test metric",
					unit: "kgs",
					type: MetricType.Counter
				},
				undefined,
				{ partitionId: "test" }
			);
		}

		for (let i = 0; i < 3; i++) {
			await telemetry.createMetric(
				{
					id: `test2-${i}`,
					label: "Test",
					description: "Test metric",
					unit: "kgs",
					type: MetricType.IncDecCounter
				},
				undefined,
				{ partitionId: "test" }
			);
		}

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(8);

		const query1 = await telemetry.query(MetricType.IncDecCounter, undefined, 10, {
			partitionId: "test"
		});

		expect(query1.entities.length).toEqual(3);
		expect(query1.totalEntities).toEqual(3);
	});

	test("can query a metric and its values", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			undefined,
			{ partitionId: "test" }
		);

		for (let i = 0; i < 50; i++) {
			await telemetry.updateMetricValue("test", "inc", { partitionId: "test" });
		}

		const entryStore = telemetryMetricsEntityStorage.getStore("test");
		expect(entryStore?.length).toEqual(1);

		const entryValueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(entryValueStore?.length).toEqual(51);

		const query1 = await telemetry.queryValues("test", undefined, undefined, undefined, 20, {
			partitionId: "test"
		});

		expect(query1.metric.id).toEqual("test");
		expect(query1.metric.label).toEqual("Test");
		expect(query1.metric.description).toEqual("Test metric");
		expect(query1.metric.unit).toEqual("kgs");
		expect(query1.metric.type).toEqual(MetricType.Counter);

		expect(query1.entities.length).toEqual(20);
		expect(query1.totalEntities).toEqual(51);

		const query2 = await telemetry.queryValues("test", undefined, undefined, query1.cursor, 20, {
			partitionId: "test"
		});
		expect(query2.entities.length).toEqual(20);
		expect(query2.totalEntities).toEqual(51);

		const query3 = await telemetry.queryValues("test", undefined, undefined, query2.cursor, 20, {
			partitionId: "test"
		});
		expect(query3.entities.length).toEqual(11);
		expect(query3.totalEntities).toEqual(51);
	});
});
