class Node {
  constructor (id, data, parent, children) {
    this.id = id;
    this.data = data;
    this.children = children || [];  // array of Nodes
    this.parent = parent;  // Node
  }
}

class Tree {
  constructor (root) {
    this.root = root;  // Node
  }

  setAsChild(parentId, childId, childData) {
    for (const node of this.preOrderTraversal(this.root)) {
      if (node.id === parentId) {
        node.children.push(new Node(childId, childData, node, []));
        return true;
      }
    }
    return false;
  }

  *preOrderTraversal(node) {
    yield node;
    if (node.children.length) {
      for (const child of node.children) {
        yield* this.preOrderTraversal(child);
      }
    }
  }

  find(id) {
    for (const node of this.preOrderTraversal(this.root)) {
      if (node.id === id) return node;
    }
    return undefined;
  }

  getSubTree(node) {
    return new Tree(node);
  }

  getAllChildren() {
    const nodes = [];
    for (const node of this.preOrderTraversal(this.root)) {
      nodes.push(node);
    }
    nodes.splice(0, 1);  // Delete the root.
    return nodes;
  }
}