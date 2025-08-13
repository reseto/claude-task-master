---
"task-master-ai": minor
---

Add AWS Q CLI integration as alternative to external AI APIs

- Add new AWS Q CLI provider that uses existing Q CLI authentication
- No additional API keys required - leverages local Q CLI setup
- Support for all Task Master AI features (research, task generation, analysis)
- Add --aws-q-cli flag to models command for easy configuration
- Full integration with existing provider system and configuration management
- Includes three model variants: q-cli/default, q-cli/claude, q-cli/gpt
