document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize network object
    viz = phase.Network("#viz-container");
    // Attach some initial data
    viz.data(lesMiserablesData);

    changeGroups();

    console.log("Visualization Loaded");
});

// Group styling function
// NOTE: It takes no parameters, since it operates on entire groups
function randomColor() {
    let colors = ["#63D467", "#63B2D4", "#AE63D4", "#D46363", "#ED9A55", "#E5EB7A"];
    return colors[Math.floor(Math.random() * 6)];
}

function changeGroups() {

    // Unstyle all nodes
    viz.getNodeGroup("all").unstyle();

    // Create groups of nodes based on data groups they belong to
    var randNum = Math.floor(Math.random() * 8);
    viz.nodeGroup("rand_group_1", function(d) { return d.group == randNum; });
    d3.select("#data-collection-1").text(randNum);

    randNum = Math.floor(Math.random() * 10) + 1;
    viz.nodeGroup("rand_group_2", function(d) { return d.group == randNum; });
    d3.select("#data-collection-2").text(randNum);

    randNum = Math.floor(Math.random() * 8);
    viz.nodeGroup("rand_group_3", function(d) { return d.group == randNum; });
    d3.select("#data-collection-3").text(randNum);

    // Display all node groups
    console.log(viz.getAllNodeGroups());
}

// Style a group with a specific value
function styleGroup(groupNum) {
    viz.getNodeGroup("rand_group_" + groupNum).addStyle({"fill": randomColor()});
}
