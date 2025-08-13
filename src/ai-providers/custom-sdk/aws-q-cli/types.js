/**
 * @fileoverview Type definitions for AWS Q CLI provider
 */

/**
 * @typedef {Object} AwsQCliSettings
 * @property {number} [temperature] - Temperature for text generation
 * @property {number} [maxTokens] - Maximum tokens to generate
 * @property {string} [agent] - Q CLI agent to use
 */

/**
 * @typedef {'q-cli/default' | 'q-cli/claude' | 'q-cli/gpt'} AwsQCliModelId
 */

/**
 * @typedef {Object} AwsQCliProviderSettings
 * @property {AwsQCliSettings} [defaultSettings] - Default settings for all models
 * @property {string} [agent] - Default Q CLI agent to use
 */

/**
 * @typedef {Function} AwsQCliProvider
 * @param {AwsQCliModelId} modelId - Model ID
 * @param {AwsQCliSettings} [settings] - Model settings
 * @returns {import('./language-model.js').AwsQCliLanguageModel}
 */

export {};
