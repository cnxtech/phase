document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    console.log("Visualization Loaded");
});

// Constructs phase for turning nodes into barriers (search cannot travel through them)
function createBarrierPhase() {
    const oldPhase = viz.getPhase("barriers");
    if (oldPhase) oldPhase.destroy();

    // Initialize phase
    let barrierPhase = viz.phase("barriers");
    barrierPhase.updateTimestep(2000); // Change barriers every 2 seconds

    // Set the phase's initial state
    // TODO: Default should be no-op function
    barrierPhase.initial(function(vizState) {
        barrierPhase.state({
            // NOTE: The morphs are attached to the phase and are destructed with it
            // QUESTION: Should we build "type" parameter into "change" parameter object?
            'enableMorph': barrierPhase.morph("enable_barrier", "style", {"fill": "#D46363"}),
            'disableMorph': barrierPhase.morph("disable_barrier", "style", {"fill": "#333"}),
            'prevBarriers': null
        });
    });

    // TODO: Default should be no-op function
    barrierPhase.next(function(phaseState, vizState) {
        // Remove old barriers
        if (phaseState.prevBarriers != null) {
            phaseState.prevBarriers.morph(phaseState.disableMorph);
            phaseState.prevBarriers.destroy();
        }

        // Create a group with ~20% of nodes as new barriers
        // NOTE: The node group is attached to the phase and is destructed with it
        const randomNodes = barrierPhase.nodeGroup('random_nodes', function(d) {
            return Math.random() < .2;
        });
        // Style new barriers
        randomNodes.morph(phaseState.enableMorph);
        barrierPhase.state({
            'prevBarriers': randomNodes
        });
    });

    // TODO: Default should be always-falsy function
    barrierPhase.end(function(phaseState, vizState) {
        return false;
    });

    return barrierPhase;
}

// Constructs phase for BFS
function createSearchPhase(startNodes) {

    const oldPhase = viz.getPhase("bfs");
    if (oldPhase) oldPhase.destroy();

    // Initialize phase
    let searchPhase = viz.phase("bfs");

    // Set the phase's initial state
    searchPhase.initial(function(vizState) {
        searchPhase.state({
            'visited': new Set(startNodes), // Nodes we've visited
            'validNeighbors': new Set(startNodes), // Neighbors that haven't been visited
            'depth': 0, // Distance from start node
        });
    });

    searchPhase.next(function(phaseState, vizState) {
        let newValidNeighbors = new Set();

        // Adjacency list for quick access to neighbors
        const childDict = viz.getAdjacencyList();

        // Morph the next layer in the BFS
        // NOTE: The node group is attached to the phase and is destructed with it
        const neighbors = searchPhase.nodeGroup("depth_" + phaseState.depth, phaseState.validNeighbors);
        const colorNodes = createMorph(searchPhase, phaseState.depth++);
        neighbors.morph(colorNodes);

        // Classic BFS
        phaseState.validNeighbors.forEach(node => {
            childDict[node].forEach(child => {
                if(!phaseState.visited.has(child)) {
                    newValidNeighbors.add(child);
                    phaseState.visited.add(child);
                }
            });
        });

        // Update the valid neighbors in the phase's state
        phaseState.validNeighbors = newValidNeighbors;
    });

    // Tell the phase when to stop
    searchPhase.end(function(phaseState, vizState) {
        return phaseState.validNeighbors.size <= 0;
    });

    return searchPhase;
}

function createPhases() {
    const startNode1 = document.getElementById("startNode1").value;
    const startNode2 = document.getElementById("startNode2").value;
    // Optional second node
    const startNodes = startNode2 ? [startNode1, startNode2] : [startNode1]
    createSearchPhase(startNodes);

    createBarrierPhase();
    viz.getPhase("barriers").start();
}

// Changes the color of the node based on its distance from the start
function createMorph(searchPhase, depth) {
    const colors = ["#AE63D4", "#63B2D4", "#63D467", "#E5EB7A", "#ED9A55"];
    return searchPhase.morph("style_nodes_" + depth, "style", {"fill": colors[depth % colors.length]});
}

// Starts the phase
function startSearch() {
    viz.getPhase("bfs").start();
}

function resetStyles() {
    viz.unstyleGraph();
    viz.getPhase("bfs").reset();
}
