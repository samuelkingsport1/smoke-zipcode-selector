# Deploying to Netlify

You can deploy this application to Netlify in two main ways: using the Netlify CLI (easiest for manual deploys) or connecting to a Git repository (best for continuous deployment).

## Option 1: Netlify Drop (Simplest)

1.  **Build the project locally**:
    Run the following command in your terminal:
    ```bash
    cmd /c npm run build
    ```
    (Or `npm run build` if you have a standard shell).

2.  **Locate the `dist` folder**:
    After the build completes, you will see a `dist` folder in your project directory.

3.  **Drag and Drop**:
    -   Go to [app.netlify.com/drop](https://app.netlify.com/drop).
    -   Drag the entire `dist` folder onto the page.
    -   Netlify will deploy it instantly.

## Option 2: Netlify CLI (Recommended for frequent updates)

1.  **Install Netlify CLI** (if not installed):
    ```bash
    npm install -g netlify-cli
    ```

2.  **Login**:
    ```bash
    netlify login
    ```

3.  **Deploy**:
    Run this command in the project root:
    ```bash
    netlify deploy --prod
    ```
    -   **Publish directory**: It should auto-detect `dist` (thanks to the `netlify.toml` I just added).
    -   **Build command**: `npm run build`.

## Option 3: Git Integration (Best Practice)

1.  **Push your code** to GitHub, GitLab, or Bitbucket.
2.  **Log in to Netlify**.
3.  Click **"Add new site"** > **"Import an existing project"**.
4.  Select your Git provider and repository.
5.  Netlify will detect the settings from `netlify.toml` automatically:
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `dist`
6.  Click **"Deploy"**.

## Configuration Note

I have added a `netlify.toml` file to your project. This file handles:
-   **Build Settings**: Tells Netlify to use `npm run build` and serve the `dist` folder.
-   **SPA Redirects**: Ensures that if you reload a page or use direct links, it redirects to `index.html` (crucial for React apps).
