/**
 * Constant values to share across components. 
 */
// on larger devices, the width proportion of the graph 
export const WIDTH_RATIO = 0.6;
// breakpoint between small laptops and tablets 
export const CSS_BREAKPOINT = 768;
// other than during node creation, nodes can completely overlap
export const NODE_COLLIDE_RADIUS = 0;
// radius of nodes, but is multiplied by relSize, https://github.com/vasturiano/force-graph#node-styling
export const NODE_RADIUS = 12;
// arrow size of links
export const ARROW_SIZE = 4;
// gap between gridlines
export const GRID_GAP = 40;
// default font size of node text label
export const NODE_FONT_SIZE = 6;
// length for which node text overflows
export const NODE_TEXT_OVERFLOW = 6; 
// default font size of rate text label
export const RATE_FONT_SIZE = 5;
// length for which rate text overflows
export const RATE_TEXT_OVERFLOW = 6; 
// number of form steps, including welcome
export const FORM_STEPS = 5;
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