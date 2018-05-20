# releases.netlify.com

> 🔥 Keep track of opensource releases 📦.

<div align="center">
    <img width="160" src="https://releases.netlify.com/static/img/logo1.png" alt="Releases">
    <br>
    <br>
    <img width="200" src="https://releases.netlify.com/static/img/screen/screen1.png">
    <img width="200" src="https://releases.netlify.com/static/img/screen/screen2.png">
    <br>
    <br>
</div>

Inspired by Sibbell <small>(that was recently closed)</small>.

Login with Github account.

Watch releases of your Github starred repositories.

One click to see release notes.

# Features

- Free, opensource.
- Simple github login. Automatically gets github stars.
- Built with free tear of cloud infrastructure. Big thanks to Now.sh, Firebase, Netlify. 
- Near-realtime release notification (currently checks every 10 minutes).

Feature requests, issues, PRs are welcome!

# Roadmap

- Reorganize history to allow go further back in time.
- Get browser push notification on all or selected releases.
- Parse `changelog.md`, `history.md` (and similar) in case when github release notes are empty.

## Develop

Serve with hot reload at localhost:8080

    yarn serve

Build for production with minification

    yarn build

Build for production and view the bundle analyzer report

    yarn build --report
