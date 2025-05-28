const data = {
  namespace: 0,
  connections: 0,
  messages: new Map<string, number>(),
  collectionTransfer: new Map<string, number>(),
  collectionUpdate: new Map<string, number>(),
}

export const namespaceGauge = {
  set: (value: number) => {
    data.namespace = value;
  }
};

export const connectionsGauge = {
  set: (connections: number) => {
    data.connections = connections;
  }
};

export const messageCounter = {
  inc: ({ direction }: { direction?: string }, value: number = 1) => {
    const key = direction || 'all';
    data.messages.set(key, (data.messages.get(key) || 0) + value);
  }
};

export const collectionTransferCounter = {
  inc: ({ name, direction, event }: { name?: string, direction?: string, event?: string }, value: number = 1) => {
    const key = `${name}-${direction}-${event}`;
    data.collectionTransfer.set(key, (data.collectionTransfer.get(key) || 0) + 1);
  }
};

export const collectionUpdateCounter = {
  inc: ({ name, origin, event }: { name?: string, origin?: string, event?: string }, value: number = 1) => {
    const key = `${name}-${origin}-${event}`;
    data.collectionUpdate.set(key, (data.collectionUpdate.get(key) || 0) + value);
  }
};

export const registry = {
  metrics: () => Promise.resolve(data),
  clear: () => { },
  resetMetrics: () => { }
}; 
