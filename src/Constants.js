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
// number of form steps, including welcome
export const FORM_STEPS = 5;
// time to delay graphiz parse procedure, ms
export const GRAPHVIZ_PARSE_DELAY = 250;
// interval to retry graphviz parse procedure, ms
export const GRAPHVIZ_PARSE_RETRY_INTERVAL = 200;
// regex for str file node values
export const STR_REGEX = /^[a-zA-Z0-9!@#$%^&*()_+\-=[]{};':"\\|,.<>\/?]*$/;
// error msgs for str validation
export const INVALID_STR_ENTRY_ERROR = 'Invalid STR file entry. Please ensure correct formatting.';
export const INVALID_STR_FILE_ERROR = 'Invalid STR file. Please upload a plaintext file.';
export const INVALID_STR_NODE_NAME_ERROR = 'Invalid state name. Please ensure valid characters.';
export const INVALID_STR_SELF_LOOP_ERROR = 'Invalid link entry. Please ensure no self-loops.';
export const INVALID_STR_RATE_ERROR = 'Invalid rate. Please ensure numeric, positive transition rate.';