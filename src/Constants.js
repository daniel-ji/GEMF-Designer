/* eslint-disable */
/**
 * Constant values to share across components. 
 */
// on larger devices, the width proportion of the graph 
export const WIDTH_RATIO = 0.6;
// breakpoint between small laptops and tablets 
export const CSS_BREAKPOINT = 768;
// other than during node creation, nodes can completely overlap
export const NODE_COLLIDE_RADIUS = 0;
// arrow size of links
export const ARROW_SIZE = 5;
// gap between gridlines
export const GRID_GAP = 30;
// length for which node text overflows
export const NODE_TEXT_OVERFLOW = 6; 
// possible node shapes
export const NODE_SHAPES = ['circle', 'square', 'diamond', 'triangle', 'pentagon', 'hexagon'];
// list of select elements for edge creation
export const LINK_NODE_SELECT_IDS = ["selectSource", "selectTarget", "selectInducer"];
// length for which rate text overflows
export const RATE_TEXT_OVERFLOW = 6; 
// number of form steps, including welcome
export const FORM_STEPS = 6;
// time to delay graphiz parse procedure, ms
export const GRAPHVIZ_PARSE_DELAY = 500;
// interval to retry graphviz parse procedure, ms
export const GRAPHVIZ_PARSE_RETRY_INTERVAL = 200;
// regex for str file node values
export const STR_REGEX = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
// error msgs for str validation
export const INVALID_STR_FILE_ERROR = 'Invalid STR file. Please upload a plaintext file.';
export const INVALID_STR_ENTRY_ERROR = 'Invalid STR file entry. Please ensure correct formatting.';
export const INVALID_STR_NODE_NAME_ERROR = 'Invalid state name. Please ensure valid characters.';
export const INVALID_STR_SELF_LOOP_ERROR = 'Invalid link entry. Please ensure no self-loops.';
export const INVALID_STR_RATE_ERROR = 'Invalid rate. Please ensure numeric, positive transition rate.';
/**
 * Convert deg to radians.
 */
export const TO_RAD = (deg) => {
    return deg * Math.PI / 180;
}
/**
 * Create shortened name from link object.
 * @param {*} link link object 
 * @param {*} data graph data
 * @returns shortened name
 */
export const LINK_SHORT_NAME = (link, data) => {
    return (
    data.nodes.find(node => node.id === (link.source?.id ?? link.source)).name + " to " + 
    data.nodes.find(node => node.id === (link.target?.id ?? link.target)).name +
    (link.inducer !== undefined ? (" by " + data.nodes.find(node => node.id === (link.inducer?.id ?? link.inducer)).name) : " (nodal)") + 
    ", " + parseFloat(parseFloat(link.rate).toFixed(3)))
}
/**
 * Creates a new id for entries.
 */
export const CREATE_ENTRY_ID = () => {
    return Math.floor(Math.random() * 1000000000);
}
/**
 * Compare two sets of graph data and returns if equal
 */
export const COMPARE_GRAPH = (graph1, graph2) => {
    // names
    if (graph1.name !== graph2.name) {
        return false;
    }

    // nodes
    if (JSON.stringify(graph1.nodes) !== JSON.stringify(graph2.nodes)) {
        return false;
    }

    // links
    if (JSON.stringify(graph1.links) !== JSON.stringify(graph2.links)) {
        return false;
    }

    return true;
}
/**
 * Return graph data as loads (everything empty). Used for when graph is reset.
 * 
 * @returns default graph data
 */
export const DEFAULT_GRAPH_DATA = () => {
    return {
        id: CREATE_ENTRY_ID(),
        // name of graph entry
        name: undefined, 
        lastModified: undefined,
        // order for sorting graphs 
        order: undefined,
        nodes: [],
        links: [],
        // str imports
        STRData: [],
        defaultShape: 'circle',
        defaultNodeColor: '#000000',
        defaultEdgeColor: '#000000',
        // node radius, but is multiplied by relSize, https://github.com/vasturiano/force-graph#node-styling
        nodeRadius: 12,
        // link radius
        linkRadius: 9,
    }
}
/**
 * Updates order of given entries of data, used after entries are re-arranged by user.
 * @param {*} e event from Sortable
 * @param {*} providedData graph data
 * @param {*} entry entry to sort, if not provided, sorts the data itself
 * 
 * @returns new graph data
 */
export const UPDATE_DATA_ORDER = (e, providedData, entry = false) => {
    const iterable = entry ? Object.assign({}, providedData)[entry] : providedData;
    // moved item up
    if (e.newIndex < e.oldIndex) {
        for (const item of iterable) {
            if (item.order === e.oldIndex) {
                item.order = e.newIndex;
            } else if (item.order < e.oldIndex && item.order >= e.newIndex) {
                item.order++;
            }
        }
    // moved item down
    } else {
        for (const item of iterable) {
            if (item.order === e.oldIndex) {
                item.order = e.newIndex;
            } else if (item.order > e.oldIndex && item.order <= e.newIndex) {
                item.order--;
            }
        }
    }
    iterable.sort((a, b) => a.order - b.order)
    return providedData;
}
/**
 * Updates the order of other entries after deleting an entry from data.
 * 
 * @param {*} order the order of the deleted element
 * @param {*} entries the total set of entries
 * @returns updated entries
 */
export const UPDATE_DATA_DEL = (order, entries) => {
    for (const entry of entries) {
        if (entry.order > order) {
            entry.order--;
        }
    }

    return entries;
}