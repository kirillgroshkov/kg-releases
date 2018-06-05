
# releases.netlify.com

> 🔥 Keep track of opensource releases 📦.

[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m780525367-7efd11da78ed3262679d967a.svg?style=flat-square)](https://stats.uptimerobot.com/LvXvNC2j5)
![](https://circleci.com/gh/kirillgroshkov/kg-releases.svg?style=shield&circle-token=0726fc25e3099b913bea54e5f6980e8ba15abea9)
[![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

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

Backend with all the magic is [here](https://github.com/kirillgroshkov/kg-backend).

# Features

- Free, opensource.
- Simple github login. Automatically gets github stars.
- Built with free tear of cloud infrastructure. Big thanks to Now.sh, Firebase, Netlify. 
- Near-realtime release notification (currently checks every 10 minutes).

Feature requests, issues, PRs are welcome!

# Roadmap

- [x] Reorganize history to allow go further back in time.
- [ ] Email notifications
- [ ] Get browser push notification on all or selected releases.
- [ ] Parse `changelog.md`, `history.md` (and similar) in case when github release notes are empty.

# Stack (frontend)

- Vue
- Vue-material
- Typescript
- Firebase Auth
- Hosted at amazing Netlify

## Develop

Serve with hot reload at localhost:8080

    yarn serve

Build for production with minification

    yarn build

Build for production and view the bundle analyzer report

    yarn build --report


*Support me with a Star!*
