import { BaseNamespace, BaseNamespaceConfig } from "./BaseNamespace";
import { ClientMultiplayer } from "./ClientMultiplayer";
import { NamespaceId } from "./types";

export interface ClientNamespaceConfig extends BaseNamespaceConfig {}

export class ClientNamespace extends BaseNamespace {
    constructor(
        public readonly client: ClientMultiplayer,
        public readonly id: NamespaceId,
        public readonly config: ClientNamespaceConfig
    ) {
        super(id, config);
    }

    protected broadcast(messageBytes: Uint8Array) {
        this.client.send(messageBytes);
    }

}
