\# 🚀 Content Agent Dashboard



A team of 5 AI agents that run your Instagram content operation — built with Node.js, Claude AI, and the Instagram Graph API.



\## What it does



| Agent | Function |

|---|---|

| 💡 Ideator | Scouts content ideas from your niche + competitors |

| ✍️ Hook \& Script | Writes hooks, captions, and reel scripts |

| 📅 Planner | Plans your daily content calendar |

| 📊 Analyst | Analyses your stats vs competitors |

| 💬 DM Manager | Monitors DMs and suggests replies |



Reports daily to \*\*Telegram\*\* at 8 AM automatically.



\## Built by

\[@vpspaceman](https://www.instagram.com/vpspaceman/) — Travel \& Space Creator, Tamil Nadu, India



\## Tech Stack

\- Node.js

\- Apify (Instagram profile scraper)

\- Instagram Graph API

\- Anthropic Claude API

\- Telegram Bot API

\- GitHub Actions (CI/CD)

\- GitHub Pages (dashboard hosting)



\## Setup for your own account



1\. Fork this repo

2\. Clone it locally

3\. Copy `.env.example` to `.env` and fill in your tokens

4\. Run `npm install`

5\. Run `node scripts/pull-data.js`

6\. Run `serve dashboard`



Full setup guide: see \[SOP document](./docs/SOP.md)



\## Environment variables needed



| Variable | Where to get it |

|---|---|

| `APIFY\_TOKEN` | console.apify.com |

| `ANTHROPIC\_API\_KEY` | console.anthropic.com |

| `INSTAGRAM\_ACCESS\_TOKEN` | Meta Developer Dashboard |

| `TELEGRAM\_BOT\_TOKEN` | Telegram @BotFather |

| `TELEGRAM\_CHAT\_ID` | Telegram getUpdates API |



\## License

MIT — free to use, fork, and adapt for your own creator account.

