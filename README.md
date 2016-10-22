# node-api-seed
The seed for pretty much any api I write in node.js

![Build status](https://travis-ci.org/eXigentCoder/node-api-seed.svg?branch=master)

# Global packages

> npm i pm2 -g

# Scripts

# Todo's
- Set your app info in the package.json file
- Go through the todo's in the seed api and make decisions based on your needs.

# Config
[The Twelve-Factor App](https://12factor.net/config) Recommends **not** storing your config in files, there are some pretty good reasons for and against this which can be read [here.](https://gist.github.com/telent/9742059) In my personal experience and based on how my projects run, I find that the advantages of file-based far outweigh the downsides, feel free to disagree. If you would prefer pure env config, check out [dotenv](https://www.npmjs.com/package/dotenv) or simply update the config code here to not load from file.

# Logging
We use [winston](https://github.com/winstonjs/winston) to route our logs to various places as required, and override console.x as per [this article here](http://seanmonstar.com/post/56448644049/consolelog-all-the-things) to allow us to see what's happening with dependencies we may be using.

# To Do

- Sys admin auth for kill process route to verify it's working on live
- ES6 upgrade (Use strict, export, import, var => const,let etc.
- Auth example
- json-schema-filter required?
- set deployment date in package.json
- websocket crud stuff
- rest crud
- patch
- rabbitmq call to worker
- data generation