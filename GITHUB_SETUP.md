# GitHub Repository Setup

Great news! The **GitHub CLI (gh)** has been installed on your system.

## Step 1: Authenticate

Because the installation just finished, your current terminal might not recognize the `gh` command yet. You can either **restart your terminal/VS Code**, or use the command below.

Run this command to log in to your GitHub account:

```powershell
"C:\Program Files\GitHub CLI\gh.exe" auth login
```

-   Select **GitHub.com**.
-   Select **HTTPS**.
-   Choose **Yes** to authenticate with your web browser.
-   Copy the code provided and paste it into the browser window that opens.

## Step 2: Configure Git Identity

If you haven't used Git on this machine before, you need to tell it who you are (otherwise commits will fail):

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Create and Push Repository

Once authenticated, run these commands to create the repo and push your code:

1.  **Create the repo** (follow the prompts):
    ```powershell
    "C:\Program Files\GitHub CLI\gh.exe" repo create
    ```
    -   Select **Push an existing local repository to GitHub**.
    -   Select **.** (current directory).
    -   Enter a repository name (e.g., `smoke-zipcode-selector`).

2.  **Push the code**:
    (If the create command didn't auto-push):
    ```powershell
    git push -u origin main
    ```

## Alternative: Manual Setup

If the CLI isn't working for you, you can still create the repository manually on [GitHub.com](https://github.com/new) and follow the "Push an existing repository" instructions shown there.
