# GitHub deploy setup

This project is prepared for automatic hosting deployment with GitHub Actions.

## Required GitHub secrets

Add these in GitHub repo settings:

- `FTP_SERVER`: hosting FTP/FTPS server, for example `ftp.phuonglam.com`
- `FTP_USERNAME`: hosting username
- `FTP_PASSWORD`: hosting password
- `FTP_PROTOCOL`: usually `ftp` or `ftps`
- `FTP_PORT`: usually `21` for FTP or `990` for FTPS
- `FTP_SERVER_DIR`: hosting public folder, usually `/public_html/`

If the hosting account only supports SFTP, replace the workflow action with an SFTP deploy action before adding secrets.

## How it works

Every push to the `main` branch runs `.github/workflows/deploy-host.yml` and uploads the website files to the hosting folder.

The workflow excludes GitHub files, local deploy bundles, `.DS_Store`, and local documentation files.
