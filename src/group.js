const NODE_SELECTOR = 'circle';
const LINK_SELECTOR = 'line';

class Group {
  constructor(network, label, filterer, val, selector, parent = undefined) {
    this.network = network;
    this.label = label;
    this.filterer = filterer;
    this.val = val;
    this.selector = selector; // "circle" or "line"
    this.parent = parent;

    // Phase the group is associated with
    this.phase = null;

    if (this.parent !== undefined) {
      this.createFilterer(filterer, val, this.parent.filterer);
      this.filterSelection(this.parent.selection);
    } else {
      this.createFilterer(filterer, val);
      this.filterSelection();
    }

    // Style history
    this.styles = {};

    // Event handlers associated with this group
    this.eventHandlers = {};

    return this;
  }

  subgroup(label, filterer, val) {
    return new Group(this.network, label, filterer, val, this.selector, this);
  }

  // Creates the selection by filtering the parent group's selection (if it exists) or all elements
  filterSelection(parentSelection) {
    const isNodeGroup = this.selector === NODE_SELECTOR;
    let containers;
    if (parentSelection !== undefined) {
      containers = parentSelection;
    } else {
      containers = isNodeGroup ? this.network.nodeContainers : this.network.linkContainers;
    }
    this.selection = containers.filter(d => this.filterer(d));
  }

  // TODO: evaluateMember() function for individual data entries

  // Creates the filter function used to assess element membership
  createFilterer(filterer, val, parentFilterer) {
    let subFilterer;
    if (typeof filterer === 'string') {
      subFilterer = d => (val === undefined ? true : d[filterer] === val);
    } else if (typeof filterer === 'function') {
      subFilterer = filterer;
    } else if (Array.isArray(filterer) || filterer instanceof Set) {
      const set = new Set(filterer);
      if (this.selector === NODE_SELECTOR) {
        subFilterer = d => (set.has(d.id));
      } else {
        subFilterer = d => (set.has(d.source.id) || set.has(d.target.id));
      }
    } else {
      throw Error('Invalid filterer type');
    }

    if (parentFilterer !== undefined) {
      this.filterer = d => (subFilterer(d) && parentFilterer(d));
    } else {
      this.filterer = subFilterer;
    }
  }

  // Applies styles from the stylemap to the selection
  style(styleMap) {
    // Use foreach on styleMap
    Object.keys(styleMap).forEach((attr) => {
      this.styles[attr] = styleMap[attr];
      // Check for unsupported styles (eg. Firefox only supports 'r' as an attribute, not a style)
      if (['r'].includes(attr)) {
        this.selection.select(this.selector).attr(attr, styleMap[attr]);
      } else {
        this.selection.select(this.selector).style(attr, styleMap[attr]);
      }
    });
  }

  // Sets style history to an existing map when rebinding to new svg
  setStyle(styleMap) {
    this.styles = styleMap;
  }

  getStyle() {
    return this.styles;
  }

  restyle() {
    this.style(this.styles);
  }

  labels(labeler) {
    this.selection.select('text').text(labeler);
  }

  morph(morph) {
    if (morph.type === 'style') {
      this.style(morph.change);
    }
    if (morph.type === 'data') {
      const newData = this.selection.data();
      Object.keys(newData).forEach((datum) => {
        Object.keys(morph.change).forEach((update) => {
          newData[datum][update] = morph.change[update];
        });
      });
      this.selection.data(newData);
    }
  }

  event(eventName, func) {
    /* global d3 */
    let func1 = func;
    if (func == null) {
      func1 = () => {};
    }
    const wrapperFunc = function wrapper(d) {
      // TODO: Modify stylemap
      func1.call(this, d, d3.select(this.childNodes[0]), d3.select(this.childNodes[1]));
    };

    this.selection.on(eventName, wrapperFunc);
    // TODO: If an element is reevaluated into multiple groups after being
    // added, which handler is it assigned?
    this.eventHandlers[eventName] = wrapperFunc;
  }

  // TODO: If group belongs to a phase, this will not properly remove the reference
  destroy() {
    if (this.label in this.network.nodeGroups) {
      delete this.network.nodeGroups[this.label];
    } else if (this.label in this.network.linkGroups) {
      delete this.network.linkGroups[this.label];
    }
  }
} // End Group Class

export class NodeGroup extends Group {
  // Creates a node group based on attributes or a passed in selection
  constructor(network, label, filterer, val) {
    super(network, label, filterer, val, NODE_SELECTOR);
  }

  unstyle() {
    super.style(this.network.defaultNodeStyles);
  }
} // End NodeGroup Class

export class LinkGroup extends Group {
  // Creates a link group based on attributes or a passed in selection
  constructor(network, label, filterer, val) {
    super(network, label, filterer, val, LINK_SELECTOR);
  }

  unstyle() {
    super.style(this.network.defaultLinkStyles);
  }
} // End LinkGroup Class
