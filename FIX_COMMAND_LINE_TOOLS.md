# Fixing Xcode Command Line Tools Error

## The Error
```
xcrun: error: invalid active developer path (/Library/Developer/CommandLineTools), 
missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun
```

This means your macOS Command Line Tools are missing, outdated, or corrupted.

## Solution: Reinstall Command Line Tools

### Option 1: Automatic Installation (Recommended)

Run this command in your terminal:

```bash
xcode-select --install
```

This will:
- Open a popup dialog asking if you want to install the tools
- Click **"Install"** in the dialog
- Wait for the installation to complete (this can take 10-20 minutes)
- You may need to restart your terminal after installation

### Option 2: Manual Reset (If Option 1 doesn't work)

If the automatic installation doesn't work, try resetting the path:

```bash
# Remove the old path
sudo rm -rf /Library/Developer/CommandLineTools

# Reinstall
xcode-select --install
```

### Option 3: Download from Apple Developer (If both above fail)

1. Go to [developer.apple.com/downloads](https://developer.apple.com/downloads/)
2. Sign in with your Apple ID
3. Search for "Command Line Tools"
4. Download and install the latest version for your macOS version

## After Installation

Once installed, verify it works:

```bash
git --version
```

You should see something like: `git version 2.x.x`

Then you can proceed with your GitHub setup!

## Why This Happens

- macOS system updates can break Command Line Tools
- The tools weren't installed initially
- The installation got corrupted
- You're on a fresh Mac setup

---

**Note**: You don't need the full Xcode app installed - just the Command Line Tools, which are much smaller and free.

