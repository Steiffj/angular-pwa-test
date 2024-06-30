/**
 * A compound data type that supports reading/writing collections of objects grouped by type,
 * as well as individually by ID.
 */
export class GroupedMap<
  T extends string,
  K extends string | number,
  V extends { id: K; [key: string]: unknown }
> {
  private readonly objects: Map<string, V>;
  private readonly groups: Map<T, Set<K>>;

  constructor() {
    this.objects = new Map();
    this.groups = new Map();
  }

  set(type: T, value: V) {
    this.initTypeListIfEmpty(type);
    this.objects.set(this.key(type, value.id), value);
  }

  get(type: T, key: K) {
    this.objects.get(this.key(type, key));
  }

  getListOfType(type: T) {
    const values: V[] = [];
    for (const key of this.groups.get(type)?.values() ?? []) {
      const val = this.objects.get(this.key(type, key));
      if (val) {
        values.push(val);
      } else {
        throw new Error(
          `Expected to find item of type: '${type}' with id: '${key}'`
        );
      }
    }

    return values;
  }

  setItemsOfType(type: T, values: V[]) {
    this.initTypeListIfEmpty(type);
    for (const val of values) {
      this.set(type, val);
    }
  }

  replaceItemsOfType(type: T, values: V[]) {
    this.clearItemsOfType(type);
    this.initTypeListIfEmpty(type);
    this.setItemsOfType(type, values);
  }

  clearItemsOfType(type: T) {
    const keys = this.groups.get(type);
    if (!keys) {
      return;
    }

    for (const key of keys) {
      this.objects.delete(this.key(type, key));
    }

    keys.clear();
  }

  private initTypeListIfEmpty(type: T) {
    if (this.groups.has(type)) {
      return;
    }

    this.groups.set(type, new Set());
  }

  private key(type: T, key: K) {
    return `${type}.${key}`;
  }
}
