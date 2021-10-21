require('proof')(10, prove)

function prove (assert) {
    var WildMap = require('..')

    var map = new WildMap

    map.add('.hello.world'.split('.'), 'a')

    assert(map.get('.hello.world'.split('.')), [ 'a' ], 'get')
    assert(map.get('.hello'.split('.')), [], 'get empty parent')
    assert(map.get('.hello.earth'.split('.')), [], 'get null path')

    assert(map.match('.hello.world'.split('.')), [ 'a' ], 'get')

    map.add('.hello'.split('.'), 'c')
    map.add('.hello.*'.split('.'), 'd')
    map.add('.hello.world'.split('.'), 'b')

    assert(map.match('.hello.world'.split('.')), [ 'c', 'a', 'b', 'd' ], 'match many')
    assert(map.match('.hello.earth'.split('.')), [ 'c', 'd' ], 'match wild')

    map.add('.'.split('.'), 'x')
    assert(map.match('.hello.earth'.split('.')), [ 'x', 'c', 'd' ], 'add root')

    // remove from non-existant path
    map.remove('.hello.earth'.split('.'), 'z')

    // remove item not in list at path
    map.remove('.hello'.split('.'), 'y')

    map.remove('.hello'.split('.'), 'c')
    assert(map.match('.hello.earth'.split('.')), [ 'x', 'd' ], 'remove value from parent')
    map.remove('.'.split('.'), 'x')
    assert(map.match('.hello.earth'.split('.')), [ 'd' ], 'remove value from root')
    map.remove('.hello.*'.split('.'), 'd')
    assert(map.match('.hello.world'.split('.')), [ 'a', 'b' ], 'remove leaf')
}
