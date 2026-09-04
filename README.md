# PR‑Align

PR‑Align is a GitHub Action that automatically reviews pull requests using an LLM (OpenAI). It extracts the diff of changed files, sends a concise prompt to the model, and posts the generated review as a comment on the PR.

## Features
- Detects changed files in a PR.
- Retrieves and truncates diffs to stay within token limits.
- Sends a review request to OpenAI's `gpt-3.5-turbo` (configurable).
- Publishes a single actionable comment on the PR.
- Configurable via environment variable `OPENAI_API_KEY` (store as secret).
- No external webhook server – runs entirely within GitHub Actions.

## Setup
1. **Add the repository secret** `OPENAI_API_KEY` with your OpenAI API key.
2. Ensure the workflow file `.github/workflows/pr-review.yml` is present (created automatically).
3. The action will run on every `pull_request_target` event (opened, synchronize, reopened).

## Usage
Just open a pull request in this repository. The action will automatically post an LLM‑generated review comment.

## Development
```bash
# Clone the repo
git clone https://github.com/Gauranshsgh/PR-Align.git
cd PR-Align
# Install dependencies
npm ci
# Run locally (requires GITHUB_TOKEN and OPENAI_API_KEY env vars)
node src/review.js
```

## License
MIT
