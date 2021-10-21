A path map with wild card matching.

### Synopsis

WildMap is a multimap that maps keys to multiple values. When queried, the
values are returned as an array of values for the key.

Keys used for lookup can be applied directly using `get` to get an array of
values that exactly match that key.

Keys used for lookup can also be applied as wildcard matches using `gather` to
get an array of values that are found along the path described by the key.

```javascript
var assert = require('assert')
var WildMap = require('wildmap')

var map = new WildMap

map.add('.hello.world'.split('.'), 'hello, world one')
map.add('.hello.world'.split('.'), 'hello, world two')
map.add('.hello.earth'.split('.'), 'hello, earth')
map.add('.*.earth'.split('.'), 'star, earth')
map.add('.hello'.split('.'), 'hello, anyone')
map.add('.'.split('.'), 'root')


assert.deepEqual(map.get('.hello.world'.split('.')), [
    'hello, world one', 'hello, world two'
])

assert.deepEqual(map.match('.hello.world'.split('.')), [
    'root', 'hello, anyone', 'hello, world one', 'hello, world two'
])

assert.deepEqual(map.match('.hello.earth'.split('.')), [
    'root', 'hello, anyone', 'star, earth', 'hello, earth'
])

map.remove('.hello.world'.split('.'), 'hello, world one')

assert.deepEqual(map.match('.hello.world'.split('.')), [
    'root', 'hello, anyone', 'hello, world two'
])
```

This structure is useful for messaging. For a practical application see
[Signal](https://github.com/bigeasy/signal).


#### `map = new WildMap`

Create a new empty map.

#### `map.add(path, value)`

Add a value to the set of values at the given path.

#### `map.get(path)`

Get the set of values at the given path.

#### `map.match(pattern)`

Get a collection of all the values along the given path.

#### `map.remove(path, value)`

Remove the value if it is contained by the set at the given path.
