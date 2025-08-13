/**
 * src/ai-providers/aws-q-cli.js
 *
 * Implementation for interacting with AI models via AWS Q CLI
 * using a custom AI SDK implementation that calls Q CLI internally.
 */

import { createAwsQCli } from './custom-sdk/aws-q-cli/index.js';
import { BaseAIProvider } from './base-provider.js';

export class AwsQCliProvider extends BaseAIProvider {
	constructor() {
		super();
		this.name = 'AWS Q CLI';
	}

	getRequiredApiKeyName() {
		return 'AWS_Q_CLI_API_KEY';
	}

	isRequiredApiKey() {
		return false;
	}

	/**
	 * Override validateAuth to skip API key validation for AWS Q CLI
	 * @param {object} params - Parameters to validate
	 */
	validateAuth(params) {
		// AWS Q CLI doesn't require an API key - it uses existing Q CLI authentication
		// No validation needed
	}

	/**
	 * Creates and returns an AWS Q CLI client instance.
	 * @param {object} params - Parameters for client initialization
	 * @param {string} [params.commandName] - Name of the command invoking the service
	 * @param {string} [params.agent] - Q CLI agent to use (defaults to current agent)
	 * @returns {Function} AWS Q CLI client function
	 * @throws {Error} If initialization fails
	 */
	getClient(params) {
		try {
			return createAwsQCli({
				agent: params?.agent,
				defaultSettings: {
					temperature: params?.temperature || 0.7,
					maxTokens: params?.maxTokens || 4000
				}
			});
		} catch (error) {
			this.handleError('client initialization', error);
		}
	}
}
