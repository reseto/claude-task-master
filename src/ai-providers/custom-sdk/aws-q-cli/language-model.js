/**
 * @fileoverview AWS Q CLI Language Model implementation
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * AWS Q CLI Language Model implementation
 */
export class AwsQCliLanguageModel {
	specificationVersion = 'v1';
	defaultObjectGenerationMode = 'json';
	supportsImageUrls = false;
	supportsStructuredOutputs = false;

	constructor({ id, settings = {} }) {
		this.modelId = id;
		this.settings = settings;
		this.provider = 'aws-q-cli';
	}

	/**
	 * Execute Q CLI chat command with the given prompt
	 * @param {string} prompt - The prompt to send to Q CLI
	 * @param {Object} options - Additional options
	 * @returns {Promise<string>} - The response from Q CLI
	 */
	async executeQCliChat(prompt, options = {}) {
		try {
			// Create a temporary file for the prompt to handle multiline content
			const tempDir = mkdtempSync(join(tmpdir(), 'q-cli-prompt-'));
			const promptFile = join(tempDir, 'prompt.txt');
			writeFileSync(promptFile, prompt, 'utf8');

			// Build Q CLI command
			let command = 'q chat --no-interactive';
			
			// Add agent if specified
			if (this.settings.agent) {
				command += ` --agent ${this.settings.agent}`;
			}
			
			// Add the prompt from file
			command += ` "$(cat '${promptFile}')"`;

			// Execute the command
			const result = execSync(command, {
				encoding: 'utf8',
				maxBuffer: 1024 * 1024 * 10, // 10MB buffer
				timeout: 120000 // 2 minute timeout
			});

			// Clean up temp file
			try {
				unlinkSync(promptFile);
			} catch (e) {
				// Ignore cleanup errors
			}

			return result.trim();
		} catch (error) {
			throw new Error(`AWS Q CLI execution failed: ${error.message}`);
		}
	}

	/**
	 * Convert prompt to string format
	 * @param {*} prompt - The prompt in various formats
	 * @returns {string} - Formatted prompt string
	 */
	formatPrompt(prompt) {
		if (typeof prompt === 'string') {
			return prompt;
		}
		
		if (Array.isArray(prompt)) {
			// Handle message array format
			return prompt.map(msg => {
				if (msg.role === 'user') {
					return msg.content;
				} else if (msg.role === 'system') {
					return `System: ${msg.content}`;
				} else if (msg.role === 'assistant') {
					return `Assistant: ${msg.content}`;
				}
				return msg.content || '';
			}).join('\n\n');
		}
		
		if (prompt.messages) {
			// Handle messages object format
			return prompt.messages.map(msg => {
				if (msg.role === 'user') {
					return msg.content;
				} else if (msg.role === 'system') {
					return `System: ${msg.content}`;
				} else if (msg.role === 'assistant') {
					return `Assistant: ${msg.content}`;
				}
				return msg.content || '';
			}).join('\n\n');
		}

		return String(prompt);
	}

	/**
	 * Generate text using AWS Q CLI
	 * @param {Object} params - Generation parameters
	 * @returns {Promise<Object>} - Generation result
	 */
	async doGenerate(params) {
		const { prompt, mode } = params;
		
		// Convert prompt to string
		let promptText = this.formatPrompt(prompt);

		// Add mode-specific instructions
		if (mode?.type === 'object') {
			promptText += '\n\nPlease respond with valid JSON only. Do not include any explanatory text outside the JSON.';
		}

		try {
			const response = await this.executeQCliChat(promptText);
			
			// Parse response based on mode
			let parsedResponse = response;
			if (mode?.type === 'object') {
				try {
					// Try to extract JSON from response
					const jsonMatch = response.match(/\{[\s\S]*\}/);
					if (jsonMatch) {
						parsedResponse = JSON.parse(jsonMatch[0]);
					} else {
						// If no JSON found, try to parse the entire response
						parsedResponse = JSON.parse(response);
					}
				} catch (parseError) {
					throw new Error(`Failed to parse JSON response: ${parseError.message}`);
				}
			}

			return {
				text: response,
				object: mode?.type === 'object' ? parsedResponse : undefined,
				finishReason: 'stop',
				usage: {
					promptTokens: Math.ceil(promptText.length / 4), // Rough estimate
					completionTokens: Math.ceil(response.length / 4), // Rough estimate
					totalTokens: Math.ceil((promptText.length + response.length) / 4)
				},
				rawCall: {
					rawPrompt: promptText,
					rawSettings: this.settings
				}
			};
		} catch (error) {
			throw new Error(`AWS Q CLI generation failed: ${error.message}`);
		}
	}

	/**
	 * Stream text generation (not supported by Q CLI, falls back to regular generation)
	 * @param {Object} params - Generation parameters
	 * @returns {Promise<Object>} - Stream result
	 */
	async doStream(params) {
		// Q CLI doesn't support streaming, so we'll simulate it
		const result = await this.doGenerate(params);
		
		// Create a simple async generator that yields the complete result
		const stream = async function* () {
			yield {
				type: 'text-delta',
				textDelta: result.text
			};
			yield {
				type: 'finish',
				finishReason: result.finishReason,
				usage: result.usage
			};
		};

		return {
			stream: stream(),
			rawCall: result.rawCall
		};
	}
}
