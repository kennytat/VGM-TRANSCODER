import { Component } from '@angular/core';

@Component({
  selector: 'vgm-converter-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
})
export class Tab3Page {
  constructor() {}

data:any = [
  { id: 56, parentId: 62 },
  { id: 81, parentId: 80 },
  { id: 74, parentId: null },
  { id: 76, parentId: 80 },
  { id: 63, parentId: 62 },
  { id: 80, parentId: 86 },
  { id: 87, parentId: 86 },
  { id: 62, parentId: 74 },
  { id: 86, parentId: 74 },
];

root;
idMapping;
parentNode;
// map children's node's parent id with parent's node's id
mapChildren() {
  this.idMapping = this.data.reduce((acc, node, index) => {
    acc[node.id] = index;
    return acc;
  }, {});
  this.pushChildren();
}

// push children node to parent node
pushChildren() {
this.data.forEach(node => {
  // Handle the root element
  if (node.parentId === null) {
    this.root = node;
    return;
  }
  // Use our mapping to locate the parent's node in our data array
  this.parentNode = this.data[this.idMapping[node.parentId]];
  // Add our current node to its parent's `children` array
  this.parentNode.children = [...(this.parentNode.children || []), node];
});
console.log(this.root);
}


}
