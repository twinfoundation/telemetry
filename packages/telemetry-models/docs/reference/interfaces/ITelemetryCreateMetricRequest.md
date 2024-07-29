# Interface: ITelemetryCreateMetricRequest

Create a new telemetry entry.

## Properties

### body

> **body**: `object`

The data to be used in the create.

#### id

> **id**: `string`

The id of the metric.

#### label

> **label**: `string`

The label of the metric.

#### type

> **type**: [`MetricType`](../type-aliases/MetricType.md)

The type of the metric.

#### description?

> `optional` **description**: `string`

The description of the metric.

#### unit?

> `optional` **unit**: `string`

The unit of the metric.

#### initialValue?

> `optional` **initialValue**: `number`

The initial value of the metric.
