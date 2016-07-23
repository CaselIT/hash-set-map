import { Hash, HashType, Parser } from './utils';

/** Extends the Map class to add object hash and serialization support. */
export default class HashMap<K, V> extends Map<K, V> {
  private m_hash: Hash<K>;
  private m_hashMap: Map<HashType, K>;
  /** Default map instance is created */
  constructor();
  /** 
   * Default map instance is created
   * @param {Iterable<[K, V]>} iterable Key-value pairs to add to the map.
   */
  constructor(iterable: Iterable<[K, V]>);
  /** 
   * The provided hash function will be used to itentify the keys
   * @param {(item: K, other: K) => boolean} hash Function to create a key hash that can be used to identify it.
   */
  constructor(hash: Hash<K>);
  /** 
   * The provided hash function will be used to itentify the keys
   * @param {Iterable<[K, V]>} iterable Key-value pairs to add to the map.
   * @param {(item: K, other: K) => boolean} hash Function to create a key hash that can be used to identify it.
   */
  constructor(iterable: Iterable<[K, V]>, hash: Hash<K>);
  constructor(iterable?: Iterable<[K, V]> | Hash<K>, hash?: Hash<K>) {
    super();
    if (arguments.length === 1 && iterable && iterable instanceof Function && !(iterable[Symbol.iterator] instanceof Function)) {
      hash = iterable as Hash<K>;
      iterable = undefined;
    }
    if (hash instanceof Function) {
      this.m_hash = hash;
      this.m_hashMap = new Map<HashType, K>();
    } else {
      ['clear', 'delete', 'get', 'has', 'set'].forEach(fn => this[fn] = super[fn]);
    }
    if (iterable && iterable[Symbol.iterator] instanceof Function)
      for (let entry of iterable as Iterable<[K, V]>)
        this.set(entry[0], entry[1]);
  }
  /** Removes all the elements in the set. */
  clear() {
    this.m_hashMap.clear();
    super.clear();
  }
  /**
   * Removes a key from the map if found.
   * Only used if a custom hash was set in the constructor.
   * @param {K} key The key to remode.
   * @return {boolean} True if the map was modified, false otherwise.
   */
  delete(key: K) {
    const hash = this.m_hash(key);
    if (this.m_hashMap.has(hash)) {
      const key = this.m_hashMap.get(hash);
      this.m_hashMap.delete(hash);
      return super.delete(key);
    }
    return false;
  }
  /**
   * Gets the value associated with the key if found.
   * Only used if a custom hash was set in the constructor.
   * @param {K} key The key to use.
   * @return {V} The value if the key was found, undefined otherwise.
   */
  get(key: K) {
    const hash = this.m_hash(key);
    if (this.m_hashMap.has(hash)) {
      return super.get(this.m_hashMap.get(hash));
    }
    return undefined;
  }
  /**
   * Check if an key is in the map.
   * Only used if a custom hash was set in the constructor.
   * @param {K} key The key to check.
   * @return {boolean} True if the key was found, false otherwise.
   */
  has(key: K) {
    const hash = this.m_hash(key);
    return this.m_hashMap.has(hash);
  }
  /**
   * Sets a new key value pair. If the kay was already set the value will be replaced.
   * Only used if a custom hash was set in the constructor.
   * @param {K} key The key to set.
   * @param {V} value The value to set.
   * @return {hashMap<[K, V]>} This set instance to enable chaining.
   */
  set(key: K, value?: V) {
    const hash = this.m_hash(key);
    if (this.m_hashMap.has(hash)) {
      const previousKey = this.m_hashMap.get(hash);
      super.delete(previousKey);
    }
    this.m_hashMap.set(hash, key);
    super.set(key, value);
    return this;
  }
  /**
   * Called automaticly by JSON.stringify
   * @return {[K, V][]} An array of two elements tuple.
   */
  toJSON(): [K, V][] {
    return [...this.entries()];
  }
  /**
   * Creates a new map instance from the array of tuple returned by JSON.parse. 
   * If no parsers are specified, this method returns `new hashMap<K, V>(iterable, hash)`
   * @param {any[]} iterable Key-value pairs to add to the map.
   * @param {(item: K, other: K) => boolean} [options.hash] Function to create a key hash that can be used to identify it.
   * @param {(item: any) => K} [options.keyParser] Function to use as parser for the key objects.
   * @param {(item: any) => V} [options.valueParser] Function to use as parser for the value objects.
   * @return {hashMap<K, V>} The map loaded with the values parsed from the array.
   */
  static fromJSON<K, V>(iterable: Iterable<any>, options?: { hash?: Hash<K>, keyParser?: Parser<K>, valueParser?: Parser<V> }): HashMap<K, V> {
    options = options || {};
    if (!options.keyParser && !options.valueParser)
      return new HashMap<K, V>(iterable, options.hash);
    const map = new HashMap<K, V>(options.hash);
    const hasKeyParser = !!options.keyParser, hasValueParser = !!options.valueParser;
    for (let item of iterable)
      map.set(hasKeyParser ? options.keyParser(item[0]) : item[0],
        hasValueParser ? options.valueParser(item[1]) : item[1]);
    return map;
  }
}
