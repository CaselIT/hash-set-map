import { Hash, HashType, Parser } from './utils';

/** Extends the Set class to add object hash and serialization support. */
export default class HashSet<T> extends Set<T> {
  private m_hash: Hash<T>;
  private m_hashMap: Map<HashType, T>;
  /** Default set instance is created */
  constructor();
  /** 
   * Default set instance is created
   * @param {Iterable<T>} iterable Items to add to the set.
   */
  constructor(iterable: Iterable<T> | undefined);
  /** 
   * The provided hash function will be used to itentify the objects
   * @param {(item: T) => number | string} hash Function to create an item hash that can be used to identify it.
   */
  constructor(hash: Hash<T> | undefined);
  /** 
   * The provided hash function will be used to itentify the objects
   * @param {Iterable<T>} iterable Items to add to the set.
   * @param {(item: T) => number | string} hash Function to create an item hash that can be used to identify it.
   */
  constructor(iterable: Iterable<T> | undefined, hash: Hash<T> | undefined);
  constructor(iterable?: Iterable<T> | Hash<T>, hash?: Hash<T>) {
    super();
    if (arguments.length === 1 && iterable && iterable instanceof Function && !(iterable[Symbol.iterator] instanceof Function)) {
      hash = iterable as Hash<T>;
      iterable = undefined;
    }
    if (hash instanceof Function) {
      this.m_hash = hash;
      this.m_hashMap = new Map<HashType, T>();
    } else {
      ['add', 'clear', 'delete', 'has'].forEach(fn => this[fn] = super[fn]);
    }
    if (iterable && iterable[Symbol.iterator] instanceof Function)
      for (let item of iterable as Iterable<T>)
        this.add(item);
  }
  /**
   * Add an item to the set if not already present.
   * Only used if a custom hash function was set in the constructor.
   * @param {T} value The item to add.
   * @return {HashSet<T>} This set instance to enable chaining.
   */
  add(value: T) {
    const hash = this.m_hash(value);
    if (!this.m_hashMap.has(hash)) {
      this.m_hashMap.set(hash, value);
      super.add(value);
    }
    return this;
  }
  /** Removes all the elements in the set. */
  clear() {
    this.m_hashMap.clear();
    super.clear();
  }
  /**
   * Removes an item from the set if found.
   * Only used if a custom hash function was set in the constructor.
   * @param {T} value The item to remode.
   * @return {boolean} True if the set was modified, false otherwise.
   */
  delete(value: T) {
    const hash = this.m_hash(value);
    if (this.m_hashMap.has(hash)) {
      const item = this.m_hashMap.get(hash)!;
      this.m_hashMap.delete(hash);
      return super.delete(item);
    }
    return false;
  }
  /**
   * Check if an item is in the set.
   * Only used if a custom hash function was set in the constructor.
   * @param {T} value The item to check.
   * @return {boolean} True if the value was found, false otherwise.
   */
  has(value: T) {
    return this.m_hashMap.has(this.m_hash(value));
  }
  /**
   * Called automaticly by JSON.stringify
   * @return {T[]} An array of elements.
   */
  toJSON(): T[] {
    return [...this.values()];
  }
  /**
   * Creates a new set instance from the array returned by JSON.parse. 
   * If no parser is specified, this method returns `new HashSet<T>(iterable, hash)`
   * @param {Iterable<any>} iterable Items to add to the set.
   * @param {(item: T) => number | string} [options.hash] Function to create an item hash that can be used to identify it.
   * @param {(item: any) => T} [options.parser] Function to use as parser for the items.
   * @return {HashSet<T>} The set loaded with the values parsed from the array.
   */
  static fromJSON<T>(iterable: Iterable<any>, options?: { hash?: Hash<T>, parser?: Parser<T> }): HashSet<T> {
    options = options || {};
    if (!options.parser)
      return new HashSet<T>(iterable, options.hash);
    const set = new HashSet<T>(options.hash);
    for (let item of iterable)
      set.add(options.parser(item));
    return set;
  }
}
