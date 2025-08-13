/**
 * @fileoverview AWS Q CLI provider factory and exports
 */

import { NoSuchModelError } from 'ai';
import { AwsQCliLanguageModel } from './language-model.js';

/**
 * @typedef {import('./types.js').AwsQCliSettings} AwsQCliSettings
 * @typedef {import('./types.js').AwsQCliModelId} AwsQCliModelId
 * @typedef {import('./types.js').AwsQCliProvider} AwsQCliProvider
 * @typedef {import('./types.js').AwsQCliProviderSettings} AwsQCliProviderSettings
 */

/**
 * Create an AWS Q CLI provider
 * @param {AwsQCliProviderSettings} [options={}] - Provider configuration options
 * @returns {AwsQCliProvider} AWS Q CLI provider instance
 */
export function createAwsQCli(options = {}) {
	/**
	 * Create a language model instance
	 * @param {AwsQCliModelId} modelId - Model ID
	 * @param {AwsQCliSettings} [settings={}] - Model settings
	 * @returns {AwsQCliLanguageModel}
	 */
	const createModel = (modelId, settings = {}) => {
		return new AwsQCliLanguageModel({
			id: modelId,
			settings: {
				...options.defaultSettings,
				...settings,
				agent: settings.agent || options.agent
			}
		});
	};

	/**
	 * Provider function
	 * @param {AwsQCliModelId} modelId - Model ID
	 * @param {AwsQCliSettings} [settings] - Model settings
	 * @returns {AwsQCliLanguageModel}
	 */
	const provider = function (modelId, settings) {
		if (new.target) {
			throw new Error(
				'The AWS Q CLI model function cannot be called with the new keyword.'
			);
		}

		return createModel(modelId, settings);
	};

	// Add model creation methods
	provider.languageModel = createModel;
	provider.textModel = createModel; // Alias for compatibility

	// Add supported models
	provider.models = {
		'q-cli/default': 'Default Q CLI model',
		'q-cli/claude': 'Q CLI with Claude preference',
		'q-cli/gpt': 'Q CLI with GPT preference'
	};

	return provider;
}

export { AwsQCliLanguageModel };
