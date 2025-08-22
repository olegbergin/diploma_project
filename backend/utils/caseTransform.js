/**
 * Utility functions for converting between snake_case and camelCase
 * Used to transform database responses to frontend-friendly format
 */

/**
 * Convert snake_case string to camelCase
 * @param {string} str - The snake_case string to convert
 * @returns {string} The camelCase string
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 * @param {string} str - The camelCase string to convert
 * @returns {string} The snake_case string
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transform object keys from snake_case to camelCase
 * @param {any} obj - The object to transform
 * @returns {any} The transformed object with camelCase keys
 */
function transformSnakeToCamel(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformSnakeToCamel(item));
  }
  
  if (typeof obj === 'object') {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformSnakeToCamel(value);
    }
    return transformed;
  }
  
  return obj;
}

/**
 * Recursively transform object keys from camelCase to snake_case
 * @param {any} obj - The object to transform
 * @returns {any} The transformed object with snake_case keys
 */
function transformCamelToSnake(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformCamelToSnake(item));
  }
  
  if (typeof obj === 'object') {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformCamelToSnake(value);
    }
    return transformed;
  }
  
  return obj;
}

module.exports = {
  snakeToCamel,
  camelToSnake,
  transformSnakeToCamel,
  transformCamelToSnake
};