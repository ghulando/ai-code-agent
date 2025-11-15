# Code Agent

A lightweight HTTP wrapper service that provides REST API access to AI-powered CLI tools including OpenAI Codex CLI, Google Gemini CLI, and Claude Code. This tool enables seamless integration of AI-powered code generation and repository analysis capabilities into applications.

## Purpose

This service bridges the gap between AI CLI tools and HTTP-based applications by providing:

- **Code Generation**: Generate code snippets, functions, and solutions based on natural language prompts
- **Repository Analysis**: Perform intelligent analysis of codebases to understand structure, patterns, and implementation details  
- **Development Assistance**: Get AI-powered insights for debugging, optimization, and code review tasks
- **Integration Ready**: Easy-to-use REST API that can be integrated into existing development tools and workflows
- **Multi-CLI Support**: Switch between Codex CLI, Gemini CLI, and Claude Code using environment variables
- **LiteLLM Compatible**: All CLIs are designed to work with LiteLLM Proxy for unified model access

## Supported CLIs

### OpenAI Codex CLI
The default CLI that interfaces with OpenAI models through LiteLLM.

### Google Gemini CLI
Alternative CLI that interfaces with Gemini models through LiteLLM. See [Gemini CLI Integration](#gemini-cli-integration) for setup instructions.

### Claude Code
Alternative CLI that interfaces with Claude models through LiteLLM. See [Claude Code Integration](#claude-code-integration) for setup instructions.

## Configuration

### Environment Variables

#### Common Variables
- `PORT`: HTTP server port (default: 3002)
- `NODE_ENV`: Environment mode (development, production)
- `DEFAULT_MODEL`: Default model to use (e.g., 'azure/gpt-5-mini', 'gemini-2.5-pro')
- `CLI_TYPE`: Choose CLI implementation - 'codex' (default), 'gemini', or 'claude'

#### Codex CLI Variables
- `OPENAI_API_KEY`: Your OpenAI API key (or LiteLLM Proxy key)
- `OPENAI_BASE_URL`: LiteLLM Proxy URL (e.g., 'http://localhost:4000')

#### Gemini CLI Variables
- `GEMINI_API_KEY`: Your Gemini API key (or LiteLLM Proxy key)
- `GOOGLE_GEMINI_BASE_URL`: LiteLLM Proxy URL (e.g., 'http://localhost:4000')

#### Claude Code Variables
- `ANTHROPIC_AUTH_TOKEN`: Your Anthropic API key (or LiteLLM Proxy key)
- `ANTHROPIC_BASE_URL`: LiteLLM Proxy URL (e.g., 'http://localhost:4000')

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

## Claude Code Integration

This section shows you how to integrate Claude Code with LiteLLM Proxy, allowing you to route requests through LiteLLM's unified interface.

### Prerequisites

Before you begin, ensure you have:
- Node.js and npm installed on your system
- A running LiteLLM Proxy instance
- A valid LiteLLM Proxy API key or Anthropic API key
- Claude Code installed on your system

### Quick Start Guide

#### Step 1: Install Claude Code

Install Claude Code following the official Anthropic installation instructions. Visit [Anthropic's website](https://www.anthropic.com) for the latest installation guide.

#### Step 2: Setup LiteLLM Proxy Configuration

Create a `config.yaml` file with your desired Claude models:

```yaml
model_list:
  # Claude models
  - model_name: claude-3-5-sonnet-20241022    
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
  
  - model_name: claude-3-5-haiku-20241022
    litellm_params:
      model: anthropic/claude-3-5-haiku-20241022
      api_key: os.environ/ANTHROPIC_API_KEY

litellm_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

Set your environment variables:

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export LITELLM_MASTER_KEY="sk-1234567890"  # Generate a secure key
```

#### Step 3: Start LiteLLM Proxy

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### Step 4: Verify Setup

Test that your proxy is working correctly:

```bash
curl -X POST http://0.0.0.0:4000/v1/messages \
-H "Authorization: Bearer $LITELLM_MASTER_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
}'
```

#### Step 5: Configure Claude Code

Configure Claude Code to use LiteLLM's unified endpoint:

```bash
export ANTHROPIC_BASE_URL="http://0.0.0.0:4000"
export ANTHROPIC_AUTH_TOKEN="$LITELLM_MASTER_KEY"
```

**Tip:** `LITELLM_MASTER_KEY` gives Claude Code access to all proxy models, whereas a virtual key would be limited to the models set in the LiteLLM UI.

#### Step 6: Configure the Code Agent Service

Set the required environment variables to use Claude Code:

```bash
export CLI_TYPE=claude
export ANTHROPIC_BASE_URL="http://localhost:4000"
export ANTHROPIC_AUTH_TOKEN=sk-1234567890
export DEFAULT_MODEL="claude-3-5-sonnet-20241022"
```

**Note:** Replace the values with your actual LiteLLM Proxy configuration:
- `CLI_TYPE`: Set to 'claude' to use Claude Code
- `ANTHROPIC_BASE_URL`: The URL where your LiteLLM Proxy is running
- `ANTHROPIC_AUTH_TOKEN`: Your LiteLLM Proxy master key
- `DEFAULT_MODEL`: The Claude model to use (e.g., 'claude-3-5-sonnet-20241022')

#### Step 7: Start the Service

```bash
npm install
npm run build
npm start
```

#### Step 8: Test the Integration

Once the service is running, test with a simple code generation request:

```bash
curl -X POST http://localhost:3002/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a Python function to calculate fibonacci numbers"}'
```

These requests will be automatically routed through LiteLLM Proxy to the configured Claude model.

### Benefits of using Claude Code with LiteLLM

When you use Claude Code with LiteLLM you get the following benefits:

**Developer Benefits:**
- **Universal Model Access**: Use any LiteLLM supported model (OpenAI, Gemini, Vertex AI, Bedrock, etc.) through the Claude Code interface
- **Higher Rate Limits & Reliability**: Load balance across multiple models and providers to avoid hitting individual provider limits, with fallbacks to ensure you get responses even if one provider fails

**Proxy Admin Benefits:**
- **Centralized Management**: Control access to all models through a single LiteLLM proxy instance without giving your developers API Keys to each provider
- **Budget Controls**: Set spending limits and track costs across all Claude Code usage

### Advanced Configuration

#### Use OpenAI, Gemini, Bedrock, etc. models on Claude Code

To use non-Claude models on Claude Code, you need to set a `model_group_alias` in the LiteLLM Proxy config. This tells LiteLLM that requests with `model = claude-3-5-sonnet-20241022` should be routed to your desired model from any provider.

**Example: Route claude-3-5-sonnet-20241022 requests to GPT-4**

Create a `proxy_config.yaml`:

```yaml
model_list:
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  model_group_alias: {"claude-3-5-sonnet-20241022": "gpt-4o"}
```

With this configuration, when you use `claude-3-5-sonnet-20241022` in the CLI, LiteLLM will automatically route your requests to the configured provider(s) with load balancing and fallbacks.

#### Multi-Provider Load Balancing

You can configure multiple providers for high availability:

```yaml
model_list:
  - model_name: claude-model
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
  - model_name: claude-model
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

router_settings:
  model_group_alias: {"claude-3-5-sonnet-20241022": "claude-model"}
```

#### Using Multiple Claude Models

Switch between different Claude models seamlessly:

```bash
# Use Claude Sonnet for complex reasoning
export DEFAULT_MODEL="claude-3-5-sonnet-20241022"

# Use Claude Haiku for fast responses
export DEFAULT_MODEL="claude-3-5-haiku-20241022"
```

### Connecting MCP Servers

You can also connect MCP servers to Claude Code via LiteLLM Proxy.

**Note:** Currently, only HTTP MCP servers are supported.

#### Add the MCP server to your config.yaml

Example with GitHub MCP:

```yaml
mcp_servers:
  github_mcp:
    url: "https://api.githubcopilot.com/mcp"
    auth_type: oauth2
    authorization_url: https://github.com/login/oauth/authorize
    token_url: https://github.com/login/oauth/access_token
    client_id: os.environ/GITHUB_OAUTH_CLIENT_ID
    client_secret: os.environ/GITHUB_OAUTH_CLIENT_SECRET
    scopes: ["public_repo", "user:email"]
```

#### Start LiteLLM Proxy

```bash
litellm --config /path/to/config.yaml

# RUNNING on http://0.0.0.0:4000
```

#### Use the MCP server in Claude Code

```bash
claude mcp add --transport http litellm_proxy http://0.0.0.0:4000/github_mcp/mcp --header "Authorization: Bearer sk-LITELLM_VIRTUAL_KEY"
```

For MCP servers that require dynamic client registration (such as Atlassian), set `x-litellm-api-key: Bearer sk-LITELLM_VIRTUAL_KEY` instead of using `Authorization: Bearer LITELLM_VIRTUAL_KEY`.

#### Authenticate via Claude Code

1. Start Claude Code:
   ```bash
   claude
   ```

2. Authenticate via Claude Code:
   ```
   /mcp
   ```

3. Select the MCP server:
   ```
   > litellm_proxy
   ```

4. Start OAuth flow via Claude Code:
   ```
   > 1. Authenticate
     2. Reconnect
     3. Disable
   ```

5. Once completed, you should see a success message.

### Troubleshooting

If you encounter issues:

- **Claude Code not connecting**: 
  - Verify your proxy is running: `curl http://0.0.0.0:4000/health`
  - Check that `ANTHROPIC_BASE_URL` is set correctly
  - Ensure your `ANTHROPIC_AUTH_TOKEN` matches your LiteLLM master key

- **Authentication errors**: 
  - Verify your environment variables are set: `echo $LITELLM_MASTER_KEY`
  - Check that your API keys are valid and have sufficient credits
  - Ensure the `ANTHROPIC_AUTH_TOKEN` matches your LiteLLM master key

- **Model not found**: 
  - Ensure the model name in Claude Code matches exactly with your `config.yaml`
  - Check LiteLLM logs for detailed error messages

- **CLI not found**: 
  - Make sure Claude Code is installed and in your PATH
  - Verify installation with `claude --version`

- **Wrong CLI being used**: 
  - Verify `CLI_TYPE=claude` environment variable is set

## Switching Between CLIs

To switch between Codex, Gemini, and Claude CLIs, simply change the `CLI_TYPE` environment variable:

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

**For Claude Code:**
```bash
export CLI_TYPE=claude
export ANTHROPIC_AUTH_TOKEN=your-key
export ANTHROPIC_BASE_URL=http://localhost:4000
```

The service will automatically use the appropriate CLI implementation without any code changes.
