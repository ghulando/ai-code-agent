# Code Agent

A lightweight HTTP wrapper service that provides REST API access to OpenAI Codex CLI functionality. This tool enables seamless integration of AI-powered code generation and repository analysis capabilities into applications.

## Purpose

This service bridges the gap between OpenAI's powerful Codex CLI tool and HTTP-based applications by providing:

- **Code Generation**: Generate code snippets, functions, and solutions based on natural language prompts
- **Repository Analysis**: Perform intelligent analysis of codebases to understand structure, patterns, and implementation details  
- **Development Assistance**: Get AI-powered insights for debugging, optimization, and code review tasks
- **Integration Ready**: Easy-to-use REST API that can be integrated into existing development tools and workflows

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
  -d '{"repositoryPath": "/Users/andranik.ghulyan/Development/Bandit/Services-Bandit-Framework", "query": "Find all static variables in this C# codebase"}'
```

**Parameters:**

- `repositoryPath` (required): Absolute path to the repository or project directory
- `query` (required): Question or analysis request about the codebase
- `config` (optional): Additional configuration options
