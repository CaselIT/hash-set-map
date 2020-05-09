import { KeyDerivation, KeyValueType, Parser } from './utils';

/** Extends the Map class to add object hash and serialization support. */
export default class KeyDerivationMap<K, V> extends Map<K, V> {
  private m_kd: KeyDerivation<K> | undefined;
  private m_kdMap: Map<KeyValueType, K> | undefined;
  /** Default map instance is created */
  constructor();
  /**
   * Default map instance is created
   * @param {Iterable<[K, V]>} iterable Key-value pairs to add to the map.
   */
  constructor(iterable: Iterable<[K, V]>);
  /**
   * The provided key derivation function will be used to identify the keys
   * @param {(item: K, other: K) => boolean} kd Function to create a key value that can be used to identify it.
   */
  constructor(kd: KeyDerivation<K> | undefined);
  /**
   * The provided key derivation function will be used to identify the keys
   * @param {Iterable<[K, V]>} iterable Key-value pairs to add to the map.
   * @param {(item: K, other: K) => boolean} kd Function to create a key value that can be used to identify it.
   */
  constructor(iterable: Iterable<[K, V]> | undefined, kd: KeyDerivation<K> | undefined);
  constructor(iterable?: Iterable<[K, V]> | KeyDerivation<K>, kd?: KeyDerivation<K>) {
    super();
    if (arguments.length === 1 && iterable && iterable instanceof Function && !(iterable[Symbol.iterator] instanceof Function)) {
      kd = iterable as KeyDerivation<K>;
      iterable = undefined;
    }
    if (kd instanceof Function) {
      this.m_kd = kd;
      this.m_kdMap = new Map<KeyType, K>();
    } else {
      ['clear', 'delete', 'get', 'has', 'set'].forEach(fn => this[fn] = super[fn]);
    }
    if (iterable && iterable[Symbol.iterator] instanceof Function)
      for (let entry of iterable as Iterable<[K, V]>)
        this.set(entry[0], entry[1]);
  }
  /** Removes all the elements in the set. */
  clear() {
    this.m_kdMap!.clear();
    super.clear();
  }
  /**
   * Removes a key from the map if found.
   * Only used if a custom key derivation was set in the constructor.
   * @param {K} key The key to remove.
   * @return {boolean} True if the map was modified, false otherwise.
   */
  delete(key: K) {
    const kv = this.m_kd!(key);
    if (this.m_kdMap!.has(kv)) {
      const key = this.m_kdMap!.get(kv)!;
      this.m_kdMap!.delete(kv);
      return super.delete(key);
    }
    return false;
  }
  /**
   * Gets the value associated with the key if found.
   * Only used if a custom key derivation was set in the constructor.
   * @param {K} key The key to use.
   * @return {V} The value if the key was found, undefined otherwise.
   */
  get(key: K) {
    const kv = this.m_kd!(key);
    if (this.m_kdMap!.has(kv)) {
      return super.get(this.m_kdMap!.get(kv)!);
    }
    return undefined;
  }
  /**
   * Check if an key is in the map.
   * Only used if a custom key derivation was set in the constructor.
   * @param {K} key The key to check.
   * @return {boolean} True if the key was found, false otherwise.
   */
  has(key: K) {
    const kv = this.m_kd!(key);
    return this.m_kdMap!.has(kv);
  }
  /**
   * Sets a new key value pair. If the kay was already set the value will be replaced.
   * Only used if a custom key derivation was set in the constructor.
   * @param {K} key The key to set.
   * @param {V} value The value to set.
   * @return {KeyDerivationMap<[K, V]>} This set instance to enable chaining.
   */
  set(key: K, value: V) {
    const kv = this.m_kd!(key);
    if (this.m_kdMap!.has(kv)) {
      const previousKey = this.m_kdMap!.get(kv)!;
      super.delete(previousKey);
    }
    this.m_kdMap!.set(kv, key);
    super.set(key, value);
    return this;
  }
  /**
   * Called automatically by JSON.stringify
   * @return {[K, V][]} An array of two elements tuple.
   */
  toJSON(): [K, V][] {
    return [...this.entries()];
  }
  /**
   * Creates a new map instance from the array of tuple returned by JSON.parse.
   * If no parsers are specified, this method returns `new KeyDerivationMap<K, V>(iterable, kd)`
   * @param {any[]} iterable Key-value pairs to add to the map.
   * @param {(item: K, other: K) => boolean} [options.keyDerivation] Function to create a key value that can be used to identify it.
   * @param {(item: any) => K} [options.keyParser] Function to use as parser for the key objects.
   * @param {(item: any) => V} [options.valueParser] Function to use as parser for the value objects.
   * @return {KeyDerivationMap<K, V>} The map loaded with the values parsed from the array.
   */
  static fromJSON<K, V>(iterable: Iterable<any>, options?: { keyDerivation?: KeyDerivation<K>, keyParser?: Parser<K>, valueParser?: Parser<V> }): KeyDerivationMap<K, V> {
    options = options || {};
    if (!options.keyParser && !options.valueParser)
      return new KeyDerivationMap<K, V>(iterable, options.keyDerivation);
    const map = new KeyDerivationMap<K, V>(options.keyDerivation);
    for (let item of iterable)
      map.set(options.keyParser ? options.keyParser(item[0]) : item[0],
        options.valueParser ? options.valueParser(item[1]) : item[1]);
    return map;
  }
}
