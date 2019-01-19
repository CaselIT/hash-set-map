[![NPM version](https://img.shields.io/npm/v/hash-set-map.svg?style=flat)](https://www.npmjs.com/package/hash-set-map)
[![Build Status](https://travis-ci.org/CaselIT/hash-set-map.svg?branch=master)](https://travis-ci.org/CaselIT/hash-set-map)
[![Coverage Status](https://coveralls.io/repos/github/CaselIT/hash-set-map/badge.svg?branch=master)](https://coveralls.io/github/CaselIT/hash-set-map?branch=master)

# hash-set-map
Extension of `Set` and `Map` classes to proved custom key serialisation function support. It also provides the method `toJSON` and a static `fromJSON` to serialize and deserialize them.

The original `Set` and `Map` object are not modified, so can still be used.

This library does not provides pilifills for Set and Map.

## Install
```sh
npm i hash-set-map
```
The current version supports `node v5+`. Tested on browsers `Chrome v52+`, `Firefox v48+` and `Edge v38+`.

## Usage
* Typescript and es6

```ts
import { Set, Map } from 'hash-set-map'
```
* Nodejs

```js
var Set = require('hash-set-map').Set;
var Map = require('hash-set-map').Map;
```
The unmodified Set and Map class can still be used:

```ts
import { Set as hSet, Map as hMap } from 'hash-set-map'
let originalMap = new Map()
let originalSet = new Set()
let hashMap = new hMap()
let hashSet = new hSet()
```

## Example
```ts
export function dateToKey(d: Date) {
  return d.valueOf();
}
const set = new Set([new Date(1), new Date(1)], dateToKey);
set.size // size is 1
set.has(new Date(1)) // returns true
```
```ts
export function stringIgnoreCase(s: string) {
  return s.toLowerCase();
}
const map = new Map([['a', 1], ['b', 3], ['C', 3]], stringIgnoreCase);
map.get('c') // returns 3
map.set('c', 42);
map.get('C') // returns 42
```


For further documentation on `toJSON` and `fromJSON` methods refer to [json-set-map](https://github.com/CaselIT/json-set-map#readme).

Refer to the JSDoc documentation on the files for mode details.
