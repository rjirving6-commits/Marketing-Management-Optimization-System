# Optional Feature Toggle Guidance

This repository supports modular features.

To disable a feature:

- Remove its rule file
- Remove related dependencies
- Remove related env vars

Claude should infer active capabilities from:

- Installed dependencies
- Existing folder structure
- Presence of rule files

Never assume a module exists if its rule file is missing.
