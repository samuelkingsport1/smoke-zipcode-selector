# Deploying to GitHub Pages

This project is configured to deploy to GitHub Pages using the `gh-pages` package.

## Prerequisites

1.  Changes must be committed and pushed to the remote repository (`origin`).
2.  The `gh-pages` branch will be automatically created and updated by the deploy script.

## How to Deploy

Run the following command in your terminal:

```bash
npm run deploy
```

This command will:

1.  Run `npm run build` to create the production build in the `dist` folder.
2.  Push the contents of the `dist` folder to the `gh-pages` branch on GitHub.

## Accessing the Site

Once deployed, your site will be available at:
**[https://samuelkingsport1.github.io/smoke-zipcode-selector](https://samuelkingsport1.github.io/smoke-zipcode-selector)**

## Troubleshooting

- **404 Errors**: Ensure that `vite.config.js` has the correct `base` set to `'/<repo-name>/'`. currently set to `'/smoke-zipcode-selector/'`.
- **Permissions**: Ensure you have write permissions to the repository.
