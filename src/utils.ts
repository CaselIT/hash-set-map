
/** Parser function interface */
export interface Parser<T> {
  /**
   * A function that takes as argument the serialization of an object
   * and returns a new instance of the object.
   * @param {any} item The serialized representation of the object.
   * @return {T} The loaded object instance.
   */
  (item: any): T;
}

/** Return type of the key derivation function */
export type KeyValueType = number | string;

/** Key derivation function interface */
export interface KeyDerivation<T> {
  /**
   * A function that takes an instance of the object returns its identification value in the form of a string or a number.
   * This value identifies the object instance.
   * @param {T} item The object used to create the key value
   * @return {number | string} The value used to identify the object
   */
  (item: T): KeyValueType;
}
