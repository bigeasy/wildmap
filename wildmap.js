// **TODO** You do not have to prime the root.
class WildMap {
    static SINGLE = Symbol('SINGLE')

    static RECURSIVE = Symbol('RECURSIVE')

    constructor ({ single = WildMap.SINGLE, recursive = WildMap.RECURSIVE } = {}) {
        this.single = single
        this.recursive = recursive
        this._root = { children: {}, values: [] }
        this._root.children[''] = { children: {}, values: [], part: '', parent: null, has: false }
    }

    set (path, value) {
        let node = this._root

        for (let i = 0, I = path.length; i < I; i++) {
            if (! node.children[path[i]]) {
                node.children[path[i]] = { children: {}, values: [], parent: node, part: path[i], has: false }
            }
            node = node.children[path[i]]
        }

        node.values[0] = value
        node.has = true
    }

    get (path) {
        let node = this._root
        for (let i = 0, I = path.length; i < I; i++) {
            node = node.children[path[i]]
            if (node == null) {
                return [][0]
            }
        }
        if (node.has) {
            return node.values[0]
        }
    }

    has (path) {
        let node = this._root
        for (let i = 0, I = path.length; i < I; i++) {
            node = node.children[path[i]]
            if (node == null) {
                return false
            }
        }
        return node.has
    }

    exists (path) {
        let node = this._root
        for (let i = 0, I = path.length; i < I; i++) {
            node = node.children[path[i]]
            if (node == null) {
                return false
            }
        }
        return true
    }

    list (path) {
        let node = this._root
        for (let i = 0, I = path.length; i < I; i++) {
            node = node.children[path[i]]
            if (node == null) {
                return null
            }
        }
        return Object.keys(node.children)
    }

    glob (path) {
        path = path.map((part, index) => {
            return index < path.length && part === this.recursive && path[index + 1] === this.recursive ? this.single : part
        })
        const candidates = [{ node: this._root, path: path }]
        const globbed = []
        while (candidates.length != 0) {
            const candidate = candidates.shift()
            if (candidate.path[0] == this.single) {
                for (const part in candidate.node.children) {
                    const remainder = candidate.path.slice(1)
                    const node = candidate.node.children[part]
                    if (remainder.length == 0) {
                        globbed.push(node)
                    } else {
                        candidates.push({ node: node, path: candidate.path.slice(1) })
                    }
                }
            } else if (candidate.path[0] == this.recursive) {
                for (const part in candidate.node.children) {
                    const node = candidate.node.children[part]
                    if (candidate.path.length == 1) {
                        globbed.push(node)
                    } else {
                        candidates.push({ node: node, path: candidate.path.slice(1) })
                    }
                    candidates.push({ node: node, path: candidate.path })
                }
            } else {
                const node = candidate.node.children[candidate.path[0]]
                if (node != null) {
                    const remainder = candidate.path.slice(1)
                    if (remainder.length == 0) {
                        globbed.push(node)
                    } else {
                        candidates.push({ node: node, path: candidate.path.slice(1) })
                    }
                }
            }
        }
        return globbed.map(found => {
            let iterator = found
            const path = []
            do {
                path.push(iterator.part)
                iterator = iterator.parent
            } while (iterator != null)
            return path.reverse()
        })
    }

    unset (path) {
        let node = this._root
        const nodes = []
        for (let i = 0, I = path.length; i < I; i++) {
            node = node.children[path[i]]
            if (node == null) {
                return false
            }
            nodes.push(node)
        }
        delete node.value
        node.has = false
        nodes.reverse()
        path = path.slice().reverse()
        while (path.length != 1 && Object.keys(nodes[0].children).length == 0 && ! nodes[0].has) {
            const node = nodes.shift()
            const part = path.shift()
            delete nodes[0].children[part]
        }
        return true
    }

    remove (path) {
        let node = this._root
        const parents = []
        for (let i = 0, I = path.length; i < I; i++) {
            parents.push(node)
            node = node.children[path[i]]
            if (node == null) {
                return false
            }
        }
        parents.reverse()
        path = path.slice().reverse()
        let parent
        do {
            parent = parents.shift()
            const part = path.shift()
            delete parent.children[part]
        } while (path.length != 1 && Object.keys(parent.children).length == 0 && ! parent.has)
        return true
    }
}

module.exports = WildMap
