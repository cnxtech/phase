/* eslint-env browser */
/* global viz:true phase lesMiserablesData */

// Create random groups of nodes and links
function createRandGroups() {
  const randNum = Math.floor(Math.random() * 6);
  viz.nodeGroup('rand_node_group', d => d.group === randNum);
  viz.linkGroup('rand_link_group', d => d.value === randNum);
}

function createMorphs() {
  // Node styling morph
  viz.morph('style_nodes', 'style', { fill: '#7DABFF', stroke: '#AE63D4', 'stroke-width': '3px' });
  // Node data morph
  viz.morph('update_nodes', 'data', { group: '200' });
  // Link styling morph
  viz.morph('style_links', 'style', { stroke: '#D46363', 'stroke-width': '3px' });
  // Link data morph
  viz.morph('update_links', 'data', { value: '200' });
}

/* eslint-disable */
function applyMorphs() {
  // Apply morphs
  viz.getNodeGroup('rand_node_group').morph(viz.getMorph('style_nodes'));
  viz.getNodeGroup('rand_node_group').morph(viz.getMorph('update_nodes'));
  viz.getLinkGroup('rand_link_group').morph(viz.getMorph('style_links'));
  viz.getLinkGroup('rand_link_group').morph(viz.getMorph('update_links'));

  // Prevent hover from removing node styles
  viz.getNodeGroup('rand_node_group').event('mouseover', null);
  viz.getNodeGroup('rand_node_group').event('mouseout', null);
}

function resetStyles() {
  viz.unstyleGraph();
  // Restore hover events on node
  viz.getNodeGroup('rand_node_group').event('mouseover', (d, node) => {
    node.style('stroke', '#7DABFF').style('stroke-width', '3px');
  });
  viz.getNodeGroup('rand_node_group').event('mouseout', (d, node) => {
    node.style('stroke', '#F7F6F2').style('stroke-width', '.8');
  });
}
/* eslint-enable */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize network object
  viz = phase.Network('#viz-container');
  // Attach some initial data
  viz.data(lesMiserablesData);

  createRandGroups();

  // SUBGROUP TESTING: REMOVE WHEN FINISHED
  const subgroup = viz.getNodeGroup('rand_node_group').subgroup('subgroup');
  console.log(subgroup);
  setTimeout(() => {
    subgroup.style({ fill: '#D46363' });
  }, 1000);


  createMorphs();

  console.log('Visualization Loaded');
});
