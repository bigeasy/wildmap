function WildMap () {
    this._root = {}
    this._root[''] = this._root
}

WildMap.prototype.add = function (path, value) {
    var node = this._root

    for (var i = 0, I = path.length; i < I; i++) {
        if (!node[path[i]]) {
            node[path[i]] = {}
        }
        node = node[path[i]]
    }

    var values = node['.values']
    if (values == null) {
        values =  node['.values'] = []
    }

    values.push(value)
}

WildMap.prototype.remove = function (path, value) {
    var node = this._root, parent

    for (var i = 0, I = path.length; i < I; i++) {
        if (!node[path[i]]) {
            return
        }
        parent = node
        node = node[path[i]]
    }


    var values = node['.values'], index = values.indexOf(value)
    if (index != -1) {
        values.splice(index, 1)
    }

    if (values.length == 0) {
        delete node['.values']
        if (I > 1 && Object.keys(node).length == 0) {
            delete parent[path[I - 1]]
        }
    }
}

WildMap.prototype.get = function (path) {
    var node = this._root, i = 0, values
    for (var i = 0, I = path.length; i < I; i++) {
        node = node[path[i]]
        if (node == null) {
            return []
        }
    }
    return node['.values'] || []
}

WildMap.prototype.match = function (path) {
    var parents = [ this._root ], i = 0, array = [],
        parent, children, node, values, j, J, k, K
    while (i < path.length && parents.length != 0) {
        children = []
        while (parents.length) {
            parent = parents.shift()
            node = parent[path[i]]
            if (node != null) {
                children.push(node)
            }
            node = parent['*']
            if (node != null) {
                children.push(node)
            }
        }
        for (j = 0, J = children.length; j < J; j++) {
            if ((values = children[j]['.values']) != null) {
                for (k = 0, K = values.length; k < K; k++) {
                    array.push(values[k])
                }
            }
        }
        parents = children
        i++
    }
    return array
}

module.exports = WildMap
