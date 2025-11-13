# Code Agent

A lightweight HTTP wrapper service that provides REST API access to AI-powered CLI tools including OpenAI Codex CLI and Google Gemini CLI. This tool enables seamless integration of AI-powered code generation and repository analysis capabilities into applications.

## Purpose

This service bridges the gap between AI CLI tools and HTTP-based applications by providing:

- **Code Generation**: Generate code snippets, functions, and solutions based on natural language prompts
- **Repository Analysis**: Perform intelligent analysis of codebases to understand structure, patterns, and implementation details  
- **Development Assistance**: Get AI-powered insights for debugging, optimization, and code review tasks
- **Integration Ready**: Easy-to-use REST API that can be integrated into existing development tools and workflows
- **Multi-CLI Support**: Switch between Codex CLI and Gemini CLI using environment variables
- **LiteLLM Compatible**: Both CLIs are designed to work with LiteLLM Proxy for unified model access

## Supported CLIs

### OpenAI Codex CLI
The default CLI that interfaces with OpenAI models through LiteLLM.

### Google Gemini CLI
Alternative CLI that interfaces with Gemini models through LiteLLM. See [Gemini CLI Integration](#gemini-cli-integration) for setup instructions.

## Configuration

### Environment Variables

#### Common Variables
- `PORT`: HTTP server port (default: 3002)
- `NODE_ENV`: Environment mode (development, production)
- `DEFAULT_MODEL`: Default model to use (e.g., 'azure/gpt-5-mini', 'gemini-2.5-pro')
- `CLI_TYPE`: Choose CLI implementation - 'codex' (default) or 'gemini'

#### Codex CLI Variables
- `OPENAI_API_KEY`: Your OpenAI API key (or LiteLLM Proxy key)
- `OPENAI_BASE_URL`: LiteLLM Proxy URL (e.g., 'http://localhost:4000')

#### Gemini CLI Variables
- `GEMINI_API_KEY`: Your Gemini API key (or LiteLLM Proxy key)
- `GOOGLE_GEMINI_BASE_URL`: LiteLLM Proxy URL (e.g., 'http://localhost:4000')

## API Endpoints

### Code Generation

Generate code based on natural language prompts.

```bash
curl -X POST http://localhost:3002/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a hello world function in C# with error handling"}'
```

**Parameters:**

- `prompt` (required): Natural language description of the code to generate
- `config` (optional): Additional configuration options

### Repository Analysis

Analyze existing codebases and answer questions about their structure and implementation.

```bash
curl -X POST http://localhost:3002/analyze-repo \
  -H "Content-Type: application/json" \
  -d '{"repositoryPath": "/path/to/your/repository", "query": "Find all static variables in this C# codebase"}'
```

**Parameters:**

- `repositoryPath` (required): Absolute path to the repository or project directory
- `query` (required): Question or analysis request about the codebase
- `config` (optional): Additional configuration options

## Gemini CLI Integration

This section shows you how to integrate the Gemini CLI with LiteLLM Proxy, allowing you to route requests through LiteLLM's unified interface.

### Prerequisites

Before you begin, ensure you have:
- Node.js and npm installed on your system
- A running LiteLLM Proxy instance
- A valid LiteLLM Proxy API key
- Git installed for cloning the repository

### Quick Start Guide

#### Step 1: Install Gemini CLI

Install the Gemini CLI globally:

```bash
npm install -g @google/gemini-cli
```

#### Step 2: Configure Environment Variables

Set the required environment variables to use Gemini CLI:

```bash
export CLI_TYPE=gemini
export GOOGLE_GEMINI_BASE_URL="http://localhost:4000"
export GEMINI_API_KEY=sk-1234567890
export DEFAULT_MODEL="gemini-2.5-pro"
```

**Note:** Replace the values with your actual LiteLLM Proxy configuration:
- `CLI_TYPE`: Set to 'gemini' to use Gemini CLI (defaults to 'codex')
- `GOOGLE_GEMINI_BASE_URL`: The URL where your LiteLLM Proxy is running
- `GEMINI_API_KEY`: Your LiteLLM Proxy API key
- `DEFAULT_MODEL`: The model to use (e.g., 'gemini-2.5-pro')

#### Step 3: Start the Service

```bash
npm install
npm run build
npm start
```

#### Step 4: Test the Integration

Once the service is running, test with a simple code generation request:

```bash
curl -X POST http://localhost:3002/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a Python function to calculate fibonacci numbers"}'
```

These requests will be automatically routed through LiteLLM Proxy to the configured Gemini model.

### Benefits of using Gemini CLI with LiteLLM

When you use gemini-cli with LiteLLM you get the following benefits:

**Developer Benefits:**
- **Universal Model Access**: Use any LiteLLM supported model (Anthropic, OpenAI, Vertex AI, Bedrock, etc.) through the gemini-cli interface
- **Higher Rate Limits & Reliability**: Load balance across multiple models and providers to avoid hitting individual provider limits, with fallbacks to ensure you get responses even if one provider fails

**Proxy Admin Benefits:**
- **Centralized Management**: Control access to all models through a single LiteLLM proxy instance without giving your developers API Keys to each provider
- **Budget Controls**: Set spending limits and track costs across all gemini-cli usage

### Advanced Configuration

#### Use Anthropic, OpenAI, Bedrock, etc. models on Gemini CLI

To use non-Gemini models on gemini-cli, you need to set a `model_group_alias` in the LiteLLM Proxy config. This tells LiteLLM that requests with `model = gemini-2.5-pro` should be routed to your desired model from any provider.

**Example: Route gemini-2.5-pro requests to Claude Sonnet**

Create a `proxy_config.yaml`:

```yaml
model_list:
  - model_name: claude-sonnet-4-20250514
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  model_group_alias: {"gemini-2.5-pro": "claude-sonnet-4-20250514"}
```

With this configuration, when you use `gemini-2.5-pro` in the CLI, LiteLLM will automatically route your requests to the configured provider(s) with load balancing and fallbacks.

#### Multi-Provider Load Balancing

You can configure multiple providers for high availability:

```yaml
model_list:
  - model_name: gemini-model
    litellm_params:
      model: vertex_ai/gemini-pro
      api_key: os.environ/VERTEX_API_KEY
  - model_name: gemini-model
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

router_settings:
  model_group_alias: {"gemini-2.5-pro": "gemini-model"}
```

### Troubleshooting

If you encounter issues:

- **Connection errors**: Verify that your LiteLLM Proxy is running and accessible at the configured `GOOGLE_GEMINI_BASE_URL`
- **Authentication errors**: Ensure your `GEMINI_API_KEY` is valid and has the necessary permissions
- **CLI not found**: Make sure Gemini CLI is installed globally with `npm install -g @google/gemini-cli`
- **Wrong CLI being used**: Verify `CLI_TYPE=gemini` environment variable is set

## Switching Between CLIs

To switch between Codex and Gemini CLIs, simply change the `CLI_TYPE` environment variable:

**For Codex CLI (default):**
```bash
export CLI_TYPE=codex
export OPENAI_API_KEY=your-key
export OPENAI_BASE_URL=http://localhost:4000
```

**For Gemini CLI:**
```bash
export CLI_TYPE=gemini
export GEMINI_API_KEY=your-key
export GOOGLE_GEMINI_BASE_URL=http://localhost:4000
```

The service will automatically use the appropriate CLI implementation without any code changes.
