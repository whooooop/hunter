import { Counter, Gauge, Registry } from "prom-client";

export const registry = new Registry();

export const namespaceGauge = new Gauge({
  name: 'namespace_gauge',
  help: 'A gauge for the namespace',
  labelNames: [],
  registers: [registry],
});

export const connectionsGauge = new Gauge({
  name: 'connections_gauge',
  help: 'A gauge for the connections',
  labelNames: [],
  registers: [registry],
});

export const messageCounter = new Counter({
  name: 'messages_counter',
  help: 'A counter for the messages',
  labelNames: ['direction'],
  registers: [registry],
});

export const collectionTransferCounter = new Counter({
  name: 'collection_transfer_counter',
  help: 'A counter for the collection transfer',
  labelNames: ['name', 'direction', 'event'],
  registers: [registry],
});

export const collectionUpdateCounter = new Counter({
  name: 'collection_update_counter',
  help: 'A counter for the collection update',
  labelNames: ['name', 'origin', 'event'],
  registers: [registry],
});