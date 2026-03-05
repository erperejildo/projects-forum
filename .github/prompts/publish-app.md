---
description: 'Automated deploy workflow: updates version, compiles, update changelogs in all languages and uploads bundle using fastlane.'
model: Raptor mini (Preview) (copilot)
---

# Deploy App Automation Prompt

Execute the following workflowP:

1. Update app version in pubspec.yaml 0.0.1
2. In android/fastlane/metadata/ you will find different languages. Each of them with a changelogs/default.txt. Each file need to be updated from changelog.txt. Do not modify this last file, but take its content and paste in each language changelogs/default.txt translating it to the right language. Do not add or removing anything, just do the proper translation.
3. Inside android folder run "fastlane production"
4. When everything is finished, tell me "Version x.x.x is being on review"

If something fails, downgrade the version in pubspec.yaml to the version it was before and repeat the steps again.
