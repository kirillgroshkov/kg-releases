# releases.netlify.app

> 🔥 Keep track of opensource releases 📦.

[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m780525367-7efd11da78ed3262679d967a.svg?style=flat-square)](https://stats.uptimerobot.com/LvXvNC2j5)
[![](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Maintainability](https://api.codeclimate.com/v1/badges/864acacfc0e17f7531bc/maintainability)](https://codeclimate.com/github/kirillgroshkov/kg-releases/maintainability)
[![Known Vulnerabilities](https://snyk.io/test/github/kirillgroshkov/kg-releases/badge.svg)](https://snyk.io/test/github/kirillgroshkov/kg-releases)

<div align="center">
    <img width="160" src="https://releases.netlify.app/static/img/logo1.png" alt="Releases">
    <br>
    <br>
    <img width="200" src="https://releases.netlify.app/static/img/screen/screen1.png" alt="screenshot">
    <img width="200" src="https://releases.netlify.app/static/img/screen/screen2.png" alt="screenshot">
    <br>
    <br>
</div>

Inspired by Sibbell <small>(that was recently closed)</small>.

Login with Github account.

Watch releases of your Github starred repositories.

One click to see release notes.

Backend with all the magic is [here](https://github.com/kirillgroshkov/kg-backend3).

# Features

- Free, open source.
- Simple github login. Automatically gets github stars.
- Built with free tier of cloud infrastructure. Big thanks to Netlify, Firebase, GCP.
- Near-realtime release notification (currently checks every hour).

Feature requests, issues, PRs are welcome!

# Roadmap

- [x] Reorganize history to allow go further back in time.
- [x] Email notifications
- [ ] Get browser push notification on all or selected releases.
- [ ] Parse `changelog.md`, `history.md` (and similar) in case when github release notes are empty.

# Stack (frontend)

- Vue3
- Vuetify3
- Typescript
- Firebase Auth
- Hosted at Netlify

## Develop

    yarn serve

    yarn build

Serve `dist` folder (http://localhost:3000):

    yarn global add serve
    serve

_Support me with a Star!_
