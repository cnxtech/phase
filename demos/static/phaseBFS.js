document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

// Constructs phase for BFS
function bfsPhase(startNode) {
    resetGraph()
    // Initialize phase with root node
    let phase = viz.phase("bfs");

    // Keeps track of node depth
    let depth = 0;

    let morph = createMorph(depth++);
    let root = phase.root(viz.nodeGroup(startNode, "id", startNode), morph);

    // Contains visited nodes
    let visited = new Set([startNode]);
    // Contains children in a given layer that haven't been visited
    let validChildren = new Set([startNode]);
    // Contains children in the next layer
    let newValidChildren;

    function filter(elem) {
        return validChildren.has(elem.id);
    }

    const childDict = viz.getGraph()

    while (validChildren.size > 0) {
        // Get all children in the next layer that haven't been visited
        let newValidChildren = new Set();
        validChildren.forEach(node => {
            childDict[node].forEach(child => {
                if(!visited.has(child)) {
                    newValidChildren.add(child);
                    visited.add(child);
                }
            });
        });

        validChildren = newValidChildren;

        // Add a node group and branch
        let ng = viz.nodeGroup("depth_" + depth, filter);
        morph = createMorph(depth++);
        root = root.branch(ng, morph._label);
    }

    return phase;
}

// Reset graph nodes back to default color on phase creation
function resetGraph() {
    const nodeGroups = viz.getAllNodeGroups()
    for(group in nodeGroups){
        nodeGroups[group].addStyle({'fill': '#333'})
    }
}

function createPhase() {
    const startNode = document.getElementById("startNode").value;
    bfsPhase(startNode);
}

// Creates the morph that changes the color of the node
function createMorph(depth) {
    const colors = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
    return viz.morph("style_nodes_" + depth, "style", {"fill": colors[depth % colors.length]});
}

// Starts the phase
function startPhase() {
    viz.getPhase("bfs").start();
}
