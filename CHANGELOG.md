# Changelog

## 0.1.1 - 2026-09-15

- Use `@ateve/agent-skills` consistently as the npm package name and installation entry point.
- Clarify that the package contains one search skill and an installer, while the agent's tools execute API requests.
- Remove outdated repository-access and first-publication instructions from the package README.
- Describe project and user-level installation, API key setup, and account-credit requirements.
- Point the package homepage to Ateve and clarify that the HTTP-status example sends a live search request that may consume credits.

## 0.1.0 - 2026-09-14

- Initial public release of the Ateve Search API agent skill installer.
- Bundle `ateve-search-api` and install it through the Skills CLI for supported coding agents.
- Focus search requests on query, pagination, date range, and domain filters; use default content settings and preserve the API's JSON response.
- Align documented pagination and domain limits with the current API contract.
- Add package installation tests and GitHub Actions workflows for validation and npm releases.
