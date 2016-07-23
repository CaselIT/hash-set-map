
/** Parser function interface */
export interface Parser<T> {
  /**
   * A function that takes as argument the serialization of an object
   * and returns a new instance of the object.
   * @param {any} item The serialized representation of the objed.
   * @return {T} The loaded object instance.
   */
  (item: any): T;
}

/** Return type of the hash function */
export type HashType = number | string;

/** Hash function interface */
export interface Hash<T> {
  /**
   * A function that takes an instance of the object returns its hash in the form of a string or a number.
   * An hash is a value that identifies the object instance.
   * @param {T} item The object used to create the hash
   * @return {number | string} The hash used to identify the object
   */
  (item: T): HashType;
}
