export class KeyTest {
  constructor(public key: number) { }
  toJSON() { return this.key; }
}
export function keyParser(item: any) {
  return new KeyTest(item);
}
export class ValueTest {
  constructor(public value: number) { }
  toJSON() { return this.value; }
}
export function valueParser(item: any) {
  return new ValueTest(item);
}
export function dateParser(item: any) {
  return new Date(item);
}
export function dateHash(a: Date) {
  return a.valueOf();
}
export function stringIgnoreCase(a: string) {
  return a.toLowerCase();
}
