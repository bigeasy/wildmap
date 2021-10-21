// [![Actions Status](https://github.com/bigeasy/wildmap/workflows/Node%20CI/badge.svg)](https://github.com/bigeasy/wildmap/actions)
// [![codecov](https://codecov.io/gh/bigeasy/wildmap/branch/master/graph/badge.svg)](https://codecov.io/gh/bigeasy/wildmap)
// [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
//
// A map keyed by path with wildcard matching.
//
// | What          | Where                                         |
// | --- | --- |
// | Discussion    | https://github.com/bigeasy/wildmap/issues/1   |
// | Documentation | https://bigeasy.github.io/wildmap             |
// | Source        | https://github.com/bigeasy/wildmap            |
// | Issues        | https://github.com/bigeasy/wildmap/issues     |
// | CI            | https://travis-ci.org/bigeasy/wildmap         |
// | Coverage:     | https://codecov.io/gh/bigeasy/wildmap         |
// | License:      | MIT                                           |
//
// WildMap installs from NPM.

// ## Living `README.md`
//
// This `README.md` is also a unit test using the
// [Proof](https://github.com/bigeasy/proof) unit test framework. We'll use the
// Proof `okay` function to assert out statements in the readme. A Proof unit test
// generally looks like this.

require('proof')(40, okay => {
    // ## Overview
    //
    // **TODO** Rough draft. Baby English.
    //
    // WildMap is a map keyed on an array that acts as a path. These keys are usually
    // derived from file paths or similar. You can use WildMap to store values by a
    // path and retrieve them individually or through globbing.
    //
    // The WileMap module exports a single `WildMap` class.

    const WildMap = require('..')

    // Wnen you construct a WildMap you provide sigils for globbing.  The `single`
    // sigil is used to match a single element in a path. The `recursive` sigil will
    // match one or more elements in a path.

    const wildmap = new WildMap({ single: '*', recursive: '**' })

    // Items in the wild map are indexed by an array that represents a path. The array
    // must have at least one element representing the root of the path according to
    // your application. Handily enough, when you split an absolute path string, you
    // end up with an empty string as the first element. You can use that as your root.

    okay('/hello/world'.split('/'), [ '', 'hello', 'world' ], 'result of path split')

    // You set a value in the wild map calling `set` with an array path and a key
    // value.

    wildmap.set('/hello/world'.split('/'), 'a')

    // To get a value from the wild map you provide the same array key.

    okay(wildmap.get('/hello/world'.split('/')), 'a', 'get')

    // You can use `undefined` as a value and if you do, you won't be certain if an
    // item exists in your wild map using `get`. To determine if a path exists and it
    // has a value assigned use `has`.

    okay(wildmap.has('/hello/world'.split('/')), 'has')
    okay(! wildmap.has('/hello/earth'.split('/')), 'has not')

    // The `has` method determines if the path exists in the wild and if a value is
    // set. Not every path that exists in wild map has a value set. In our example
    // `/hello` was created automatically when we set `/hello/world`. No value was set
    // for `/hello`.

    okay(! wildmap.has('/hello'.split('/')), 'has not automatically created')

    // It does exist however, and that might be nice to know, so we can use `exists` to
    // determine if a path exists in the wild map regardless of whether it has a value
    // set.

    okay(wildmap.exists('/hello/world'.split('/')), 'exists')
    okay(wildmap.exists('/hello'.split('/')), 'parent exists')
    okay(wildmap.exists([ '' ]), 'root exists')
    okay(! wildmap.exists('/hello/earth'.split('/')), 'does not exist')

    // Notice that neither `get`, `has`, nor `exists` will  perform any sort of parital
    // matching. Matching a parent does not return a list of children. Matching a
    // non-existant child does return a parent. We do that sort of thing with `glob`.

    okay(wildmap.get('/hello'.split('/')), (void(0)), 'get parent')
    okay(wildmap.get('/hello/world/wide'.split('/')), (void(0)), 'get missing child')

    // Only `glob` performs globbing. None of the other functions will evaluate the
    // wildcard.

    okay(wildmap.get('/hello/*'.split('/')), (void(0)), 'get wildcard does not work')

    // Before we look at globbing let's add another element to our wild map.

    wildmap.set('/hello/earth/beings'.split('/'), 'b')

    // We use the `glob` method to perform globbing.

    okay(wildmap.glob('/hello/*'.split('/')), [[ '', 'hello', 'world' ]], 'glob single wildcard')

    // Globbed recursive.

    okay(wildmap.glob('.hello.**'.split('.')), [[
        '', 'hello', 'world'
    ], [
        '', 'hello', 'earth'
    ], [
        '', 'hello', 'earth', 'beings'
    ]], 'glob recursive wildcard end')

    // Globbed recursive midway. Each recursive glob must match at least one part of
    // the path.

    okay(wildmap.glob('/**/world'.split('/')), [[ '', 'hello', 'world' ]], 'glob recursive wildcard end')

    // You can list all the children for a particular node using `list`.

    okay(wildmap.list('/hello'.split('/')), [ 'world', 'earth' ], 'list')

    // If there are no children the list will be empty.

    okay(wildmap.list('/hello/world'.split('/')), [], 'list empty')

    // If there is no such node at all in the wild map, `list` returns `null`.

    okay(wildmap.list('/hello/dolly'.split('/')), null, 'list null')

    okay(wildmap.glob('.**.**'.split('.')), [[
        '', 'hello', 'world'
    ], [
        '', 'hello', 'earth'
    ], [
        '', 'hello', 'earth', 'beings'
    ]], 'glob recursive double wildcards')

    // One application I've found for WileMap is to model a directory structure for an
    // `etcd`-alike called [Addendum](https://github.com/bigeasy/addendum).

    {
        const wildmap = new WildMap({ single: '*', recursive: '**' })

        function write (path, data) {
            const key = path.split('/')
            mkdirp(key.slice(0, 1).join('/'))
            // Assert that we are not writing file data to a directory node.
            const got = wildmap.get(key)
            if (got != null && got.isDirectory) {
                throw new Error('is directory')
            }
            // Set the data.
            wildmap.set(key, { isDirectory: false, data: data })
        }

        function mkdirp (path) {
            const key = path.split('/')
            for (let length = key.length; length != 0; length--) {
                const dir = key.slice(0, length)
                const got = wildmap.get(dir)
                if (got != null && ! got.isDirectory) {
                    throw new Error('exists')
                }
                wildmap.set(dir, { isDirectory: true })
            }
        }

        function ls (path) {
            const key = path.split('/')
            const got = wildmap.get(key)
            if (got == null) {
                throw new Error('no entry')
            }
            if (! got.isDirectory) {
                throw new Error('is not directory')
            }
            return wildmap.list(key)
        }

        function files (path) {
            const key = path.split('/')
            const got = wildmap.get(key)
            if (got == null) {
                throw new Error('no entry')
            }
            if (! got.isDirectory) {
                throw new Error('is not directory')
            }
            return wildmap.glob(key.concat('**'))
                .map(key => ({ key: key, got: wildmap.get(key) }))
                .filter(({ got }) => ! got.isDirectory)
                .map(({ key }) => key.join('/'))
        }

        function cat (path) {
            const key = path.split('/')
            const got = wildmap.get(key)
            if (got == null) {
                throw new Error('no entry')
            }
            if (got.isDirectory) {
                throw new Error('is directory')
            }
            return got.data
        }

        write('/usr/bin/node', 'node')
    }

    // When we want to remove items from our wild map we once again run into the
    // distinction between `has` and `exists`.
    //
    // When we want to move a value from our wild map we use `unset`. If the path has
    // no children then the path is removed from the tree and it no longer `has` the
    // bath and the path no longer `exists`. We then look at the parent path.
    //
    // If we do remove the path we look at the parent path. If it does not have a value
    // set and it has no more children now that the one child has been removed we
    // remove it as well.

    // The map now contains the above tree. When we unset `/hello/earth/beings` the
    // `beings` part no longer has a value and has no children so it is removed from
    // the tree. Then because `/hello/earth` has no value and no longer has children it
    // is removed. `/hello` still has a child so it remains.

    okay(wildmap.exists('/hello'.split('/')), 'grand parent exists')
    okay(wildmap.exists('/hello/earth'.split('/')), 'parent exists')
    okay(wildmap.has('/hello/earth/beings'.split('/')), 'has child')
    okay(wildmap.unset('/hello/earth/beings'.split('/')), 'unset')
    okay(! wildmap.unset('/hello/earth.beings'.split('/')), 'unset does not exist')
    okay(! wildmap.exists('/hello/earth'.split('/')), 'parent does not exist')
    okay(wildmap.exists('/hello'.split('/')), 'grand parent still exists')
    okay(! wildmap.has('/hello/earth/beings'.split('/')), 'does not have child')

    // When we use remove, we remove a path from a tree regardless of whether or not
    // it has child paths. Once removed look at the parent path. If it does not have a
    // value set and it has no more children now that the one child has been removed we
    // remove it as well.
    //
    // Let's add a path to the wild map.

    wildmap.set('/hello/dolly/oh/hello/dolly'.split('/'), 'b')

    // Now our wild map tree looks like this.

    // When we remove `/hello/dolly/oh/hello` we will remove that path and all
    // children. We will then remove `/hello/dolly/oh` and then `/hello/dolly`.

    okay(wildmap.exists('/hello'.split('/')), 'great grand parent exists')
    okay(wildmap.exists('/hello/dolly'.split('/')), 'great parent exists')
    okay(wildmap.exists('/hello/dolly/oh'.split('/')), 'parent exists')
    okay(wildmap.exists('/hello/dolly/oh/hello'.split('/')), 'target exists')
    okay(wildmap.has('/hello/dolly/oh/hello/dolly'.split('/')), 'child has value')
    okay(wildmap.remove('/hello/dolly/oh/hello'.split('/')), 'removed')
    okay(! wildmap.remove('/hello/earth/beings'.split('/')), 'removed does not exist')
    okay(wildmap.exists('/hello'.split('/')), 'great grand parent exists')
    okay(! wildmap.exists('/hello/dolly'.split('/')), 'great parent does not exist')
    okay(! wildmap.exists('/hello/dolly/oh'.split('/')), 'parent does not exist')
    okay(! wildmap.exists('/hello/dolly/oh/hello'.split('/')), 'target does not exist')
    okay(! wildmap.has('/hello/dolly/oh/hello/dolly'.split('/')), 'child does not have value')
    okay(! wildmap.exists('/hello/dolly/oh/hello/dolly'.split('/')), 'child does not exist')
})

// You can run this unit test yourself to see the output from the various
// code sections of the readme.
