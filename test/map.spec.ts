import * as test from 'tape';

import { Map as HashMap } from '../index';

import { dateHash, dateParser, keyParser, KeyTest, valueParser, ValueTest, stringIgnoreCase } from './test-utils';

function instanceAndSize(t: test.Test, map: HashMap<any, any>, array: any[]) {
  t.ok(map instanceof HashMap, 'Is HashMap instance');
  t.ok(map instanceof Map, 'Is Map instance');
  t.equal(map.size, array.length);
  return 3;
}

test('Map tests', t => {
  const entries: [Date, number][] = [[new Date(1), 1], [new Date(2), 2], [new Date(3), 3], [new Date(1), 5]];
  const fns = ['clear', 'delete', 'get', 'has', 'set'];
  t.test('Constructor', st => {
    st.test('No args', sst => {
      const map = new HashMap<any, any>();
      sst.plan(fns.length + 1);
      fns.forEach(fn => sst.equal(map[fn], Map.prototype[fn], `When no hash fn is used HashMap has the default ${fn}`));
      sst.equal(map.size, 0, 'The map is empty');
      sst.end();
    });
    st.test('Iterable', sst => {
      const map = new HashMap<number, number>([[1, 1], [2, 4], [3, 9], [3, 9]]);
      sst.plan(fns.length + 1);
      fns.forEach(fn => sst.equal(map[fn], Map.prototype[fn], `When no hash fn is used HashMap has the default ${fn}`));
      sst.equal(map.size, 3, 'The item where added to the map');
      sst.end();
    });
    st.test('Hash fn', sst => {
      const map = new HashMap<Date, string>(dateHash);
      sst.plan(fns.length + 3);
      fns.forEach(fn => sst.equal(map[fn], HashMap.prototype[fn], `Custom ${fn} is used`));
      sst.equal(map.size, 0, 'The map is empty');
      map.set(new Date(1), 'a');
      map.set(new Date(1), 'b');
      sst.equal(map.size, 1, 'The item are compared with the custom hash fn');
      sst.equal(map.get(new Date(1)), 'b', 'The values was updated correctly');
      sst.end();
    });
    st.test('Iterable and hash fn', sst => {
      const map = new HashMap<Date, number>(entries, dateHash);
      sst.plan(fns.length + 1 + entries.length);
      fns.forEach(fn => sst.equal(map[fn], HashMap.prototype[fn], `Custom ${fn} is used`));
      sst.equal(map.size, 3, 'The item where added to the map using the custom hash fn');
      for (let entry of entries)
        sst.ok(map.has(entry[0]), 'All item where added');
      sst.end();
    });
  });
  t.test('Method clear', st => {
    st.test('No hash fn', sst => {
      const map = new HashMap<Date, number>(entries);
      sst.plan(1);
      map.clear();
      sst.equal(map.size, 0, 'All item where removed');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const map = new HashMap<Date, number>(entries, dateHash);
      sst.plan(3);
      map.clear();
      sst.equal(map.size, 0, 'All item where removed');
      map.set(entries[0][0], entries[0][1]);
      sst.equal(map.size, 1, 'Item could be readded');
      map.clear();
      sst.equal(map.size, 0, 'All item where removed');
      sst.end();
    });
  });
  t.test('Method delete', st => {
    st.test('No hash fn', sst => {
      const map = new HashMap<Date, number>(entries);
      sst.plan(3);
      sst.ok(map.delete(entries[0][0]), 'Item was removed');
      sst.equal(map.size, entries.length - 1, 'Item was removed');
      sst.notOk(map.delete(new Date(entries[1][0].valueOf())), 'Item was not removed');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const map = new HashMap<Date, number>(entries, dateHash);
      sst.plan(5);
      sst.ok(map.delete(entries[0][0]), 'Item was removed');
      sst.equal(map.size, entries.length - 2, 'Item was removed');
      sst.notOk(map.delete(new Date(12345)), 'Item was not removed');
      sst.ok(map.delete(new Date(entries[1][0].valueOf())), 'Item was removed');
      sst.equal(map.size, 1, 'Map dimenstion is correct');
      sst.end();
    });
  });
  t.test('Method get', st => {
    st.test('No hash fn', sst => {
      const set = new HashMap<Date, number>(entries);
      sst.plan(3);
      sst.equal(set.get(entries[0][0]), entries[0][1], 'Map returns the explected item');
      sst.equal(set.get(new Date(entries[1][0].valueOf())), undefined, 'Map does not find the item');
      set.set(entries[0][0], 42);
      sst.equal(set.get(entries[0][0]), 42, 'Map returns the explected item');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const set = new HashMap<Date, number>(entries, dateHash);
      sst.plan(4);
      sst.equal(set.get(entries[2][0]), entries[2][1], 'Map returns the explected item');
      sst.equal(set.get(new Date(entries[1][0].valueOf())), entries[1][1], 'Map does find the item');
      sst.equal(set.get(new Date(1234)), undefined, 'Map does not find the item');
      set.set(entries[0][0], 42);
      sst.equal(set.get(entries[0][0]), 42, 'Map returns the explected item');
      sst.end();
    });
  });
  t.test('Method has', st => {
    st.test('No hash fn', sst => {
      const set = new HashMap<Date, number>(entries);
      sst.plan(2);
      sst.ok(set.has(entries[0][0]), 'Map has item');
      sst.notOk(set.has(new Date(entries[1][0].valueOf())), 'Map has not the item');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const set = new HashMap<Date, number>(entries, dateHash);
      sst.plan(3);
      sst.ok(set.has(entries[0][0]), 'Map has item');
      sst.ok(set.has(new Date(entries[1][0].valueOf())), 'Map has item');
      sst.notOk(set.has(new Date(12345)), 'Map has not the item');
      sst.end();
    });
  });
  t.test('Method set', st => {
    st.test('No hash fn', sst => {
      const set = new HashMap<Date, number>();
      sst.plan(1 + entries.length);
      for (let entry of entries)
        set.set(entry[0], entry[1]);
      sst.equal(set.size, entries.length, 'All item where added');
      for (let entry of entries)
        sst.equal(set.get(entry[0]), entry[1], 'The value is correct');
      sst.end();
    });
    st.test('Custom hash fn', sst => {
      const set = new HashMap<Date, number>(dateHash);
      sst.plan(1 + entries.length);
      for (let entry of entries)
        set.set(entry[0], entry[1]);
      sst.equal(set.size, entries.length - 1, 'Only different item where added');
      for (let entry of entries)
        if (entry[0].valueOf() === 1 && entry[1] === 1)
          sst.notEqual(set.get(entry[0]), entry[1], 'The value is updated to the by the second set');
        else
          sst.equal(set.get(entry[0]), entry[1], 'The value is correct');
      sst.end();
    });
  });
  t.test('Method toJSON', st => {
    st.plan(2);
    const entries: [number, number][] = [[1, 2], [3, 4]];
    const map = new HashMap<number, number>(entries);
    st.deepEqual(map.toJSON(), entries);
    st.deepEqual(JSON.stringify(map), JSON.stringify(entries));
    st.end();
  });
  t.test('Method fromJSON', st => {
    st.test('Call with empty array', sst => {
      const map = HashMap.fromJSON([]);
      sst.plan(instanceAndSize(sst, map, []));
      sst.end();
    });
    st.test('Call with array', sst => {
      const entries: [number, number][] = [[1, 2], [3, 4]];
      const map = HashMap.fromJSON<number, number>(entries);
      sst.plan(instanceAndSize(sst, map, entries) + 2 * entries.length);
      for (let entry of entries) {
        sst.ok(map.has(entry[0]), 'Has element');
        sst.equal(map.get(entry[0]), entry[1]);
      }
      sst.end();
    });
    st.test('Call with custom hash fn', sst => {
      const entries: [string, number][] = [['a', 2], ['b', 4], ['c', 4], ['C', 5]];
      const map = HashMap.fromJSON<string, number>(entries, { hash: stringIgnoreCase });
      sst.plan(instanceAndSize(sst, map, entries.slice(0, 3)) + 1 + 2 * entries.length);
      sst.ok(map.has('C'), 'Duplicate is ignored');
      for (let entry of entries) {
        sst.ok(map.has(entry[0]), 'Has element');
        if (entry[0] === 'c')
          sst.notEqual(map.get(entry[0]), entry[1]);
        else
          sst.equal(map.get(entry[0]), entry[1]);
      }
      sst.end();
    });
    st.test('Use keyParser', sst => {
      const entries: [number, number][] = [[1, 2], [3, 4]];
      const map = HashMap.fromJSON<KeyTest, number>(entries, { keyParser });
      sst.plan(instanceAndSize(sst, map, entries) + 3 * entries.length);
      for (let mapEntry of map) {
        sst.ok(mapEntry[0] instanceof KeyTest, 'Key was parsed');
        sst.equal(typeof mapEntry[1], 'number', 'Value was not parsed');
        for (let entry of entries)
          if (entry[0] === mapEntry[0].key) {
            sst.equal(mapEntry[1], entry[1]);
            break;
          }
      }
      sst.end();
    });
    st.test('Use keyParser and custom hash fn', sst => {
      const entries: [string, number][] = [[new Date(1).toJSON(), 1], [new Date(2).toJSON(), 2], [new Date(3).toJSON(), 3], [new Date(1).toJSON(), 5]];
      const map = HashMap.fromJSON<Date, number>(entries, { keyParser: dateParser, hash: dateHash });
      sst.plan(instanceAndSize(sst, map, entries.slice(0, 3)) + entries.length + map.size);
      for (let entry of map) {
        sst.ok(entry[0] instanceof Date, 'Item was parsed');
      }
      for (let entry of entries)
        sst.ok(map.has(new Date(entry[0])), 'The item was added to the Map');
      sst.end();
    });
    st.test('Use valueParser', sst => {
      const entries: [number, number][] = [[1, 2], [3, 4]];
      const map = HashMap.fromJSON<number, ValueTest>(entries, { valueParser });
      sst.plan(instanceAndSize(sst, map, entries) + 3 * entries.length);
      for (let mapEntry of map) {
        sst.equal(typeof mapEntry[0], 'number', 'key was not parsed');
        sst.ok(mapEntry[1] instanceof ValueTest, 'Value was parsed');
        for (let entry of entries)
          if (entry[0] === mapEntry[0]) {
            sst.equal(mapEntry[1].value, entry[1]);
            break;
          }
      }
      sst.end();
    });
    st.test('Use key and valueParser', sst => {
      const entries: [number, number][] = [[1, 2], [3, 4]];
      const map = HashMap.fromJSON<KeyTest, ValueTest>(entries, { keyParser, valueParser });
      sst.plan(instanceAndSize(sst, map, entries) + 3 * entries.length);
      for (let mapEntry of map) {
        sst.ok(mapEntry[0] instanceof KeyTest, 'Key was parsed');
        sst.ok(mapEntry[1] instanceof ValueTest, 'Value was parsed');
        for (let entry of entries)
          if (entry[0] === mapEntry[0].key) {
            sst.equal(mapEntry[1].value, entry[1]);
            break;
          }
      }
      sst.end();
    });
  });
});
