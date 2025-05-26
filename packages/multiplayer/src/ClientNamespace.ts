import { BaseNamespace, BaseNamespaceConfig } from "./BaseNamespace";
import { ClientMultiplayer } from "./ClientMultiplayer";
import { StorageSpace } from "./StorageSpace";
import { NamespaceId } from "./types";

export interface ClientNamespaceConfig extends BaseNamespaceConfig {}

export class ClientNamespace extends BaseNamespace {
    constructor(
        public readonly client: ClientMultiplayer,
        public readonly id: NamespaceId,
        protected readonly storage: StorageSpace,
        protected readonly config: ClientNamespaceConfig = {}
    ) {
        super(id, storage, config);
    }

    protected broadcast(messageBytes: Uint8Array) {
        this.client.send(messageBytes);
    }

}
