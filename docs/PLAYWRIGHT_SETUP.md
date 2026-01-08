# Playwright setup (quick guide)

When you see `ENOSPC` during `npx playwright install` it means the target drive is out of space.

Options:

1. Install browsers on alternative drive
   - Create a folder on an alternate drive (e.g. `D:\playwright-browsers`).
   - Run in PowerShell (Windows):
     ```powershell
     $env:PLAYWRIGHT_BROWSERS_PATH='D:\playwright-browsers'
     npx playwright install --with-deps
     ```
   - Or prefix on one line: `PLAYWRIGHT_BROWSERS_PATH=D:\playwright-browsers npx playwright install --with-deps` (may depend on shell).

2. Free up disk space on the default drive
   - Clear caches, remove heavy build artifacts, or move large files off C:.

3. CI runner recommendations
   - Use `microsoft/playwright-github-action` which caches browsers and installs them on the runner.
   - If using self-hosted runners, ensure the `PLAYWRIGHT_BROWSERS_PATH` is set to a path with sufficient space.

4. Run tests
   - After successful install, run: `npx playwright test` or `npm run test:e2e`.

Troubleshooting:
- If download still fails, check firewall/proxy settings and run with `DEBUG=pw:install` to get verbose logs.
- On Windows, ensure the destination path does not contain characters requiring elevated permissions and there is enough free space.
