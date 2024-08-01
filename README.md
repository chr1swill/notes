# Web Notes

I am a long-term user of Apple Notes but truly became frustrated with the unreliable web interface they offer to Linux users. On many occasions, I lost notes while using the Apple Notes app via the browser client. Using the web makes me feel like a second-class citizen when trying to access my own data.

Enough is enough, I have taken it upon myself to make a highly portable, web-based, reliable, and notably local-first notes app to get rid of my reliance on Apple and their restrictive Notes app.

## Usage

To test out what I have so far, run:

Clone the repo locally:

```bash
git clone https://github.com/chr1swill/notes.git
cd notes
```

Server the app to your localhost:
```bash
npm run start:server
```

If you don't have Python on your system, you can use anything that will serve an app to your localhost, for example:
```bash
npm install -D live-server
npx live-sever --port=8080
```

Open up the app at [http://localhost:8080](http://localhost:8080) and play around with it.

If you find any problems or think of something you would like to see in the app in the future, feel free to open up a GitHub issue.
