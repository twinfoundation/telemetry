// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { MemoryEntityStorageConnector } from "@gtsc/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@gtsc/entity-storage-models";
import { nameof } from "@gtsc/nameof";
import { MetricType } from "@gtsc/telemetry-models";
import type { TelemetryMetric } from "../src/entities/telemetryMetric";
import type { TelemetryMetricValue } from "../src/entities/telemetryMetricValue";
import { EntityStorageTelemetryConnector } from "../src/entityStorageTelemetryConnector";
import { initSchema } from "../src/schema";

let telemetryMetricsEntityStorage: MemoryEntityStorageConnector<TelemetryMetric>;
let telemetryMetricsValueEntityStorage: MemoryEntityStorageConnector<TelemetryMetricValue>;

describe("EntityStorageTelemetryConnector", () => {
	beforeEach(() => {
		initSchema();
		telemetryMetricsEntityStorage = new MemoryEntityStorageConnector<TelemetryMetric>({
			entitySchema: nameof<TelemetryMetric>()
		});
		telemetryMetricsValueEntityStorage = new MemoryEntityStorageConnector<TelemetryMetricValue>({
			entitySchema: nameof<TelemetryMetricValue>()
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

	test("can create a metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.Counter
			},
			{ partitionId: "test" }
		);

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(1);
		expect(store?.[0].id).toEqual("test");
		expect(store?.[0].label).toEqual("Test");
		expect(store?.[0].description).toEqual("Test metric");
		expect(store?.[0].unit).toEqual("kgs");
		expect(store?.[0].type).toEqual(0);
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

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(1);
		expect(store?.[0].id).toEqual("test");
		expect(store?.[0].label).toEqual("Test2");
		expect(store?.[0].description).toEqual("Test metric2");
		expect(store?.[0].unit).toEqual("kgs2");
		expect(store?.[0].type).toEqual(0);
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
			{ partitionId: "test" }
		);

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(1);
		expect(store?.[0].id).toEqual("test");
		expect(store?.[0].label).toEqual("Test");
		expect(store?.[0].description).toEqual("Test metric");
		expect(store?.[0].unit).toEqual("kgs");
		expect(store?.[0].type).toEqual(0);
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
			{ partitionId: "test" }
		);

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(1);
		expect(store?.[0].id).toEqual("test");
		expect(store?.[0].label).toEqual("Test");
		expect(store?.[0].description).toEqual("Test metric");
		expect(store?.[0].unit).toEqual("kgs");
		expect(store?.[0].type).toEqual(1);
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
			{ partitionId: "test" }
		);

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(1);
		expect(store?.[0].id).toEqual("test");
		expect(store?.[0].label).toEqual("Test");
		expect(store?.[0].description).toEqual("Test metric");
		expect(store?.[0].unit).toEqual("kgs");
		expect(store?.[0].type).toEqual(2);
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
			{ partitionId: "test" }
		);

		await telemetry.addMetricValue("test", "inc", undefined, { partitionId: "test" });

		const valueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(valueStore?.length).toEqual(1);
		expect(valueStore?.[0].id.length).toEqual(32);
		expect(valueStore?.[0].metricId).toEqual("test");
		expect(valueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[0].value).toEqual(1);

		await telemetry.addMetricValue("test", 5, undefined, { partitionId: "test" });

		expect(valueStore?.length).toEqual(2);
		expect(valueStore?.[1].id.length).toEqual(32);
		expect(valueStore?.[1].metricId).toEqual("test");
		expect(valueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[1].value).toEqual(6);
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
			{ partitionId: "test" }
		);

		await expect(
			telemetry.addMetricValue("test", "dec", undefined, { partitionId: "test" })
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
			{ partitionId: "test" }
		);

		await telemetry.addMetricValue("test", "inc", undefined, { partitionId: "test" });

		const valueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(valueStore?.length).toEqual(1);
		expect(valueStore?.[0].id.length).toEqual(32);
		expect(valueStore?.[0].metricId).toEqual("test");
		expect(valueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[0].value).toEqual(1);

		await telemetry.addMetricValue("test", 5, undefined, { partitionId: "test" });

		expect(valueStore?.[1].id.length).toEqual(32);
		expect(valueStore?.[1].metricId).toEqual("test");
		expect(valueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[1].value).toEqual(6);
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
			{ partitionId: "test" }
		);

		await telemetry.addMetricValue("test", "dec", undefined, { partitionId: "test" });

		const valueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(valueStore?.length).toEqual(1);
		expect(valueStore?.[0].id.length).toEqual(32);
		expect(valueStore?.[0].metricId).toEqual("test");
		expect(valueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[0].value).toEqual(-1);

		await telemetry.addMetricValue("test", -5, undefined, { partitionId: "test" });

		expect(valueStore?.[1].id.length).toEqual(32);
		expect(valueStore?.[1].metricId).toEqual("test");
		expect(valueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[1].value).toEqual(-6);
	});

	test("can fail to set a value to a non integer inc/dec counter metric", async () => {
		const telemetry = new EntityStorageTelemetryConnector();
		await telemetry.createMetric(
			{
				id: "test",
				label: "Test",
				description: "Test metric",
				unit: "kgs",
				type: MetricType.IncDecCounter
			},
			{ partitionId: "test" }
		);

		await expect(
			telemetry.addMetricValue("test", 5.5, undefined, { partitionId: "test" })
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
			{ partitionId: "test" }
		);

		await telemetry.addMetricValue("test", 11, undefined, { partitionId: "test" });

		const valueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(valueStore?.length).toEqual(1);
		expect(valueStore?.[0].id.length).toEqual(32);
		expect(valueStore?.[0].metricId).toEqual("test");
		expect(valueStore?.[0].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[0].value).toEqual(11);

		await telemetry.addMetricValue("test", 12, undefined, { partitionId: "test" });

		expect(valueStore?.[1].id.length).toEqual(32);
		expect(valueStore?.[1].metricId).toEqual("test");
		expect(valueStore?.[1].ts).toBeLessThanOrEqual(Date.now());
		expect(valueStore?.[1].value).toEqual(12);
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
			{ partitionId: "test" }
		);

		await expect(
			telemetry.addMetricValue("test", "inc", undefined, { partitionId: "test" })
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
			{ partitionId: "test" }
		);

		await expect(
			telemetry.addMetricValue("test", "dec", undefined, { partitionId: "test" })
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
			{ partitionId: "test" }
		);

		for (let i = 0; i < 10; i++) {
			await telemetry.addMetricValue("test", "inc", undefined, { partitionId: "test" });
		}

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(1);

		const valueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(valueStore?.length).toEqual(10);

		await telemetry.removeMetric("test", { partitionId: "test" });
		expect(store?.length).toEqual(0);
		expect(valueStore?.length).toEqual(0);
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
				{ partitionId: "test" }
			);
		}

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(11);

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
				{ partitionId: "test" }
			);
		}

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(8);

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
			{ partitionId: "test" }
		);

		for (let i = 0; i < 50; i++) {
			await telemetry.addMetricValue("test", "inc", undefined, { partitionId: "test" });
		}

		const store = telemetryMetricsEntityStorage.getStore("test");
		expect(store?.length).toEqual(1);

		const valueStore = telemetryMetricsValueEntityStorage.getStore("test");
		expect(valueStore?.length).toEqual(50);

		const query1 = await telemetry.queryValues("test", undefined, undefined, undefined, 20, {
			partitionId: "test"
		});

		expect(query1.metric.id).toEqual("test");
		expect(query1.metric.label).toEqual("Test");
		expect(query1.metric.description).toEqual("Test metric");
		expect(query1.metric.unit).toEqual("kgs");
		expect(query1.metric.type).toEqual(MetricType.Counter);

		expect(query1.entities.length).toEqual(20);
		expect(query1.totalEntities).toEqual(50);

		const query2 = await telemetry.queryValues("test", undefined, undefined, query1.cursor, 20, {
			partitionId: "test"
		});
		expect(query2.entities.length).toEqual(20);
		expect(query2.totalEntities).toEqual(50);

		const query3 = await telemetry.queryValues("test", undefined, undefined, query2.cursor, 20, {
			partitionId: "test"
		});
		expect(query3.entities.length).toEqual(10);
		expect(query3.totalEntities).toEqual(50);
	});
});
