import { KeyDerivation, KeyValueType, Parser } from './utils';

/** Extends the Set class to add object hash and serialization support. */
export default class KeyDerivationSet<T> extends Set<T> {
  private m_kv: KeyDerivation<T> | undefined;
  private m_kvMap: Map<KeyValueType, T> | undefined;
  /** Default set instance is created */
  constructor();
  /**
   * Default set instance is created
   * @param {Iterable<T>} iterable Items to add to the set.
   */
  constructor(iterable: Iterable<T> | undefined);
  /**
   * The provided key derivation function will be used to identify the objects
   * @param {(item: T) => number | string} kd Function to create an item key derivation that can be used to identify it.
   */
  constructor(kd: KeyDerivation<T> | undefined);
  /**
   * The provided key derivation function will be used to identify the objects
   * @param {Iterable<T>} iterable Items to add to the set.
   * @param {(item: T) => number | string} kd Function to create an item key derivation that can be used to identify it.
   */
  constructor(iterable: Iterable<T> | undefined, kd: KeyDerivation<T> | undefined);
  constructor(iterable?: Iterable<T> | KeyDerivation<T>, kd?: KeyDerivation<T>) {
    super();
    if (arguments.length === 1 && iterable && iterable instanceof Function && !(iterable[Symbol.iterator] instanceof Function)) {
      kd = iterable as KeyDerivation<T>;
      iterable = undefined;
    }
    if (kd instanceof Function) {
      this.m_kv = kd;
      this.m_kvMap = new Map<KeyValueType, T>();
    } else {
      ['add', 'clear', 'delete', 'has'].forEach(fn => this[fn] = super[fn]);
    }
    if (iterable && iterable[Symbol.iterator] instanceof Function)
      for (let item of iterable as Iterable<T>)
        this.add(item);
  }
  /**
   * Add an item to the set if not already present.
   * Only used if a custom key derivation function was set in the constructor.
   * @param {T} value The item to add.
   * @return {KeyDerivationSet<T>} This set instance to enable chaining.
   */
  add(value: T) {
    const kv = this.m_kv!(value);
    if (!this.m_kvMap!.has(kv)) {
      this.m_kvMap!.set(kv, value);
      super.add(value);
    }
    return this;
  }
  /** Removes all the elements in the set. */
  clear() {
    this.m_kvMap!.clear();
    super.clear();
  }
  /**
   * Removes an item from the set if found.
   * Only used if a custom key derivation function was set in the constructor.
   * @param {T} value The item to remove.
   * @return {boolean} True if the set was modified, false otherwise.
   */
  delete(value: T) {
    const kv = this.m_kv!(value);
    if (this.m_kvMap!.has(kv)) {
      const item = this.m_kvMap!.get(kv)!;
      this.m_kvMap!.delete(kv);
      return super.delete(item);
    }
    return false;
  }
  /**
   * Check if an item is in the set.
   * Only used if a custom key derivation function was set in the constructor.
   * @param {T} value The item to check.
   * @return {boolean} True if the value was found, false otherwise.
   */
  has(value: T) {
    return this.m_kvMap!.has(this.m_kv!(value));
  }
  /**
   * Called automatically by JSON.stringify
   * @return {T[]} An array of elements.
   */
  toJSON(): T[] {
    return [...this.values()];
  }
  /**
   * Creates a new set instance from the array returned by JSON.parse.
   * If no parser is specified, this method returns `new KeyDerivationSet<T>(iterable, kd)`
   * @param {Iterable<any>} iterable Items to add to the set.
   * @param {(item: T) => number | string} [options.keyDerivation] Function to create a key value that can be used to identify it.
   * @param {(item: any) => T} [options.parser] Function to use as parser for the items.
   * @return {KeyDerivationSet<T>} The set loaded with the values parsed from the array.
   */
  static fromJSON<T>(iterable: Iterable<any>, options?: { keyDerivation?: KeyDerivation<T>, parser?: Parser<T> }): KeyDerivationSet<T> {
    options = options || {};
    if (!options.parser)
      return new KeyDerivationSet<T>(iterable, options.keyDerivation);
    const set = new KeyDerivationSet<T>(options.keyDerivation);
    for (let item of iterable)
      set.add(options.parser(item));
    return set;
  }
}
