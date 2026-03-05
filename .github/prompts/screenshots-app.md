---
description: 'Automated screenshots workflow: builds Android debug/test APKs, captures localized screenshots via fastlane screengrab, and optionally uploads them to Google Play.'
model: Raptor mini (Preview) (copilot)
---

# Take Screenshots Automation Prompt

Execute the following workflow:

1. Ensure an Android emulator or device is connected and unlocked.
2. Inside `android/` run `fastlane android screenshots`.
3. Verify screenshots were generated under `android/fastlane/metadata/android/`.
4. If I ask to upload screenshots to Google Play, run `fastlane android screenshots upload_to_play_store:true`.
5. When everything is finished, tell me `Screenshots are ready`.

If something fails, fix the issue and repeat the steps until screenshots are generated.
