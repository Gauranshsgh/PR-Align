// src/review.js
// GitHub Action entry point for PR-Align

const core = require('@actions/core');
const github = require('@actions/github');
const { Configuration, OpenAIApi } = require('openai');

async function run() {
  try {
    const token = core.getInput('openai_api_key') || process.env.OPENAI_API_KEY;
    if (!token) {
      core.setFailed('OpenAI API key not provided. Set as secret OPENAI_API_KEY.');
      return;
    }
    const config = new Configuration({ apiKey: token });
    const openai = new OpenAIApi(config);

    const context = github.context;
    const prNumber = context.payload.pull_request?.number;
    const repo = context.repo;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

    if (!prNumber) {
      core.setFailed('No pull request number found in context.');
      return;
    }

    // Get changed files
    const { data: files } = await octokit.rest.pulls.listFiles({ owner: repo.owner, repo: repo.repo, pull_number: prNumber });
    const diffs = [];
    for (const file of files) {
      // Retrieve raw diff via GitHub API
      const { data: rawDiff } = await octokit.rest.repos.getContent({
        owner: repo.owner,
        repo: repo.repo,
        path: file.filename,
        ref: context.payload.pull_request.head.sha,
        mediaType: { format: 'raw' }
      }).catch(() => ({ data: '' }));
      // Simple deterministic truncation to 3000 characters per file
      const truncated = rawDiff.substring(0, 3000);
      diffs.push({ filename: file.filename, diff: truncated });
    }

    // Build prompt
    const prompt = `You are an experienced code reviewer. Review the following changed files for code style, maintainability, and repository conventions. Provide concise, actionable comments. Use markdown format.\n\n${diffs.map(d => `File: ${d.filename}\n\n${d.diff}`).join('\n\n')}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // placeholder, can be changed via input
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });
    const review = response.data.choices[0].message.content.trim();

    // Post review as a single comment on the PR
    await octokit.rest.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: prNumber,
      body: review,
    });

    core.setOutput('review', review);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
