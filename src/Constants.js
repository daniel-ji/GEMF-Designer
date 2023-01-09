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
export const GRID_GAP = 20;
// length for which node text overflows
export const NODE_TEXT_OVERFLOW = 6; 
// possible node shapes
export const NODE_SHAPES = ['circle', 'square', 'diamond', 'triangle', 'pentagon', 'hexagon'];
// list of select elements for edge creation
export const LINK_NODE_SELECT_IDS = ["selectSource", "selectTarget", "selectInducer"];
// length for which rate text overflows
export const RATE_TEXT_OVERFLOW = 6; 
// ratio between radius of link knot and node
export const KNOT_NODE_RATIO = 0.25;
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
export const INVALID_STR_RATE_ERROR = 'Invalid rate. Please ensure numeric, non-negative transition rate.';
/**
 * Convert deg to radians.
 */
export const TO_RAD = (deg) => {
    return deg * Math.PI / 180;
}
export const CALCULATE_KNOT_POINT_FROM_RATIO = (sourceID, targetID, data, tx, ty = tx) => {
    const source = data.nodes.find(node => node.id === sourceID);
    const target = data.nodes.find(node => node.id === targetID);
    return ({x: source.x * (1 - tx) + target.x * tx, y: source.y * (1 - ty) + target.y * ty, 
        xOffset: source.x * -tx + target.x * tx, yOffset: source.y * -ty + target.y * ty})
}

export const CALCULATE_KNOT_OFFSET = (link, knot1, knot2, data) => {
    const source = data.nodes.find(node => node.id === link.source.id);
    const target = data.nodes.find(node => node.id === link.target.id);
    return [knot1.x - source.x, knot1.y - source.y, knot2.x - target.x, knot2.y - target.y];
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
 * Create shortened name from link entry from an STR import.
 * 
 * @param {*} transition transition array consisting of names of nodes and rate value 
 * @returns shortened name
 */
export const LINK_NAME_FROM_NAMES = (transition) => {
    return (
    transition[0] + " to " + transition[1] + (transition.length === 4 ? " by " + transition[2] : '') +  ", " + parseFloat(parseFloat(transition[transition.length - 1]).toFixed(3)))
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
export const GRAPHS_EQUAL = (graph1, graph2) => {
    let equal = true;

    const oldOrder1 = graph1.order;
    const oldOrder2 = graph2.order;
    graph1.order = undefined;
    graph2.order = undefined;


    if (JSON.stringify(graph1) !== JSON.stringify(graph2)) {
        equal = false;
    }

    graph1.order = oldOrder1;
    graph2.order = oldOrder2;
    return equal;
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
        STRTemplates: undefined,
        defaultShape: 'circle',
        defaultNodeColor: '#000000',
        defaultEdgeColor: '#000000',
        // node radius, but is multiplied by relSize, https://github.com/vasturiano/force-graph#node-styling
        nodeRadius: 12,
        // link radius
        linkRadius: 9,
    }
}
export const FETCH_STR_TEMPLATES = () => {
    return fetch('https://raw.githubusercontent.com/niemasd/FAVITES-Lite/main/global.json')
    .then(response => {
        if (response.status === 200) {
            return response.json();
        }

        return;
    })
    .then(json => {
        if (json !== undefined) {
            const STRTemplates = [];
            const STRs = json['MODELS']['Transmission Network']

            for (const STR in STRs) {
                let STRText = "";
                for (const link in STRs[STR]['PARAM']) {
                    if (link.slice(0, 2) === 'R_') {
                        const linkNodes = link.slice(2).split(/-|_/);
                        STRText += link.slice(2).split(/-|_/).join("\t")
                        if (linkNodes.length === 2) {
                            STRText += "\tNone";
                        }
                        STRText += "\t0\n";
                    }
                }
        
                STRTemplates.push({
                    id: CREATE_ENTRY_ID(),
                    STRText,
                    name: STR,
                    infectedStates: STRs[STR]['INF_STATES'],
                    order: STRTemplates.length,
                    imported: false,
                })
            }

            return STRTemplates;
        }
    })
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
    // special case for nodes
    if (entry === 'nodes') {
        iterable = iterable.filter(node => node.knot === undefined);
    }
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
        if (entry.order === undefined) {
            continue;
        }
        
        if (entry.order > order) {
            entry.order--;
        }
    }

    return entries;
}