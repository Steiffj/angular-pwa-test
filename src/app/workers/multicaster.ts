import { MsgStruct } from '@worker-types/message-types';
import { MsgPort } from '@worker-types/typed-shared-worker';

export class Multicaster<
  T extends string,
  P extends MsgStruct<T, unknown, unknown>
> {
  readonly ports = new Map<T, MessagePort[]>();

  setPort(port: MessagePort | MsgPort<P>, names: T[]) {
    const registered: T[] = [];
    for (const name of names) {
      const ports = this.ports.get(name) ?? [];
      if (!ports.includes(port as MessagePort)) {
        this.ports.set(name, [port as MessagePort, ...ports]);
        registered.push(name);
      }
    }
    return registered;
  }

  clearPort(port: MessagePort | MsgPort<P>) {
    for (const activePorts of this.ports.values()) {
      const index = activePorts.indexOf(port as MessagePort);
      if (index > -1) {
        activePorts.splice(index, 1);
      }
    }
  }

  getPorts(name: T): MsgPort<P>[] {
    return (this.ports.get(name) as MsgPort<P>[]) ?? ([] as MsgPort<P>[]);
  }
}
