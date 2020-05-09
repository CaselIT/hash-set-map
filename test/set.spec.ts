import * as test from 'tape';

import { Set as HashSet } from '../index';

import { dateHash, dateParser, keyParser, KeyTest, stringIgnoreCase } from './test-utils';

function instanceAndSize(t: test.Test, set: HashSet<any>, array: any[]) {
  t.ok(set instanceof HashSet, 'Is HashSet instance');
  t.ok(set instanceof Set, 'Is Set instance');
  t.equal(set.size, array.length);
  return 3;
}

function testNoParser<T>(t: test.Test, set: HashSet<T>, array: T[]) {
  const common = instanceAndSize(t, set, array);
  for (let item of array) {
    t.ok(set.has(item), 'Has element');
  }
  return common + array.length;
}
test('Set tests', t => {
  const items = [new Date(1), new Date(2), new Date(1)];
  const fns = ['add', 'clear', 'delete', 'has'];
  t.test('Constructor', st => {
    st.test('No args', sst => {
      const set = new HashSet<any>();
      sst.plan(5);
      fns.forEach(fn => sst.equal(set[fn], Set.prototype[fn], `When no hash fn is used HashSet has the default ${fn}`));
      sst.equal(set.size, 0, 'The set is empty');
      sst.end();
    });
    st.test('Iterable', sst => {
      const set = new HashSet<number>([1, 2, 3, 3]);
      sst.plan(5);
      fns.forEach(fn => sst.equal(set[fn], Set.prototype[fn], `When no hash fn is used HashSet has the default ${fn}`));
      sst.equal(set.size, 3, 'The item where added to the set');
      sst.end();
    });
    st.test('Hash fn', sst => {
      const set = new HashSet<Date>(dateHash);
      sst.plan(6);
      fns.forEach(fn => sst.equal(set[fn], HashSet.prototype[fn], `Custom ${fn} is used`));
      sst.equal(set.size, 0, 'The set is empty');
      set.add(new Date(1));
      set.add(new Date(1));
      sst.equal(set.size, 1, 'The item are compared with the custom hash fn');
      sst.end();
    });
    st.test('Iterable and hash fn', sst => {
      const set = new HashSet<Date>(items, dateHash);
      sst.plan(5 + items.length);
      fns.forEach(fn => sst.equal(set[fn], HashSet.prototype[fn], `Custom ${fn} is used`));
      sst.equal(set.size, 2, 'The item where added to the set using the custom hash fn');
      for (let item of items)
        sst.ok(set.has(item), 'All item where added');
      sst.end();
    });
  });
  t.test('Method add', st => {
    st.test('No hash fn', sst => {
      const set = new HashSet<Date>();
      sst.plan(1);
      for (let item of items)
        set.add(item);
      sst.equal(set.size, items.length, 'All item where added');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const set = new HashSet<Date>(dateHash);
      sst.plan(1);
      for (let item of items)
        set.add(item);
      sst.equal(set.size, items.length - 1, 'Only different item where added');
      sst.end();
    });
  });
  t.test('Method clear', st => {
    st.test('No hash fn', sst => {
      const set = new HashSet<Date>(items);
      sst.plan(1);
      set.clear();
      sst.equal(set.size, 0, 'All item where removed');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const set = new HashSet<Date>(items, dateHash);
      sst.plan(3);
      set.clear();
      sst.equal(set.size, 0, 'All item where removed');
      set.add(items[0]);
      sst.equal(set.size, 1, 'Item could be re-added');
      set.clear();
      sst.equal(set.size, 0, 'All item where removed');
      sst.end();
    });
  });
  t.test('Method delete', st => {
    st.test('No hash fn', sst => {
      const set = new HashSet<Date>(items);
      sst.plan(3);
      sst.ok(set.delete(items[0]), 'Item was removed');
      sst.equal(set.size, items.length - 1, 'Item was removed');
      sst.notOk(set.delete(new Date(items[1].valueOf())), 'Item was not removed');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const set = new HashSet<Date>(items, dateHash);
      sst.plan(5);
      sst.ok(set.delete(items[0]), 'Item was removed');
      sst.equal(set.size, items.length - 2, 'Item was removed');
      sst.notOk(set.delete(new Date(12345)), 'Item was not removed');
      sst.ok(set.delete(new Date(items[1].valueOf())), 'Item was removed');
      sst.equal(set.size, 0, 'Set is empty');
      sst.end();
    });
  });
  t.test('Method has', st => {
    st.test('No hash fn', sst => {
      const set = new HashSet<Date>(items);
      sst.plan(2);
      sst.ok(set.has(items[0]), 'Set has item');
      sst.notOk(set.has(new Date(items[1].valueOf())), 'Set has not the item');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const set = new HashSet<Date>(items, dateHash);
      sst.plan(3);
      sst.ok(set.has(items[0]), 'Set has item');
      sst.ok(set.has(new Date(items[1].valueOf())), 'Set has item');
      sst.notOk(set.has(new Date(12345)), 'Set has not the item');
      sst.end();
    });
  });
  t.test('Method toJSON', st => {
    st.plan(2);
    const items: number[] = [1, 2, 3, 4];
    const set = new HashSet<number>(items);
    st.deepEqual(set.toJSON(), items);
    st.equal(JSON.stringify(set), JSON.stringify(items));
    st.end();
  });
  t.test('Method fromJSON', st => {
    st.test('Call with empty array', sst => {
      const set = HashSet.fromJSON([]);
      sst.plan(testNoParser(sst, set, []));
      sst.end();
    });
    st.test('Call with array', sst => {
      const items: number[] = [1, 2, 3, 4];
      const set = HashSet.fromJSON<number>(items);
      sst.plan(testNoParser(sst, set, items));
      sst.end();
    });
    st.test('Use parser', sst => {
      const items: number[] = [1, 2, 3, 4];
      const set = HashSet.fromJSON<KeyTest>(items, { parser: keyParser });
      sst.plan(instanceAndSize(sst, set, items) + 2 * items.length);
      for (let setItem of set) {
        sst.ok(setItem instanceof KeyTest, 'Item was parsed');
        let found = false;
        for (let item of items)
          if (item === setItem.key) {
            found = true;
            break;
          }
        sst.ok(found, 'The item was added to the Set');
      }
      sst.end();
    });
    st.test('Call with custom hash fn', sst => {
      const items: string[] = ['a', 'b', 'c', 'C'];
      const set = HashSet.fromJSON<string>(items, { keyDerivation: stringIgnoreCase });
      sst.plan(2 + testNoParser(sst, set, items.slice(0, 3)));
      sst.ok(set.has('C'), 'Duplicate is ignored');
      sst.equal([...set.values()].indexOf('C'), -1, 'Duplicate not added in the set');
      sst.end();
    });
    st.test('Use parser and custom hash fn', sst => {
      const items: string[] = [new Date(1).toJSON(), new Date(2).toJSON(), new Date(3).toJSON(), new Date(1).toJSON()];
      const set = HashSet.fromJSON<Date>(items, { keyDerivation: dateHash, parser: dateParser });
      sst.plan(instanceAndSize(sst, set, items.slice(0, 3)) + set.size + items.length);
      for (let setItem of set) {
        sst.ok(setItem instanceof Date, 'Item was parsed');
      }
      for (let item of items)
        sst.ok(set.has(new Date(item)), 'The item was added to the Set');
      sst.end();
    });
  });
});
