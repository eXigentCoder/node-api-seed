# node-api-seed
The seed for pretty much any api I write in node.js

![Build status](https://travis-ci.org/eXigentCoder/node-api-seed.svg?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/exigentcoder/node-api-seed/badge.svg)](https://snyk.io/test/github/exigentcoder/node-api-seed)

# Global packages

> npm i pm2 -g

# Scripts

# Todo's
- Set your app info in the package.json file
- Go through the todo's in the seed api and make decisions based on your needs.
- metadata fields to move to their own file, update the hydrate to use this file instead
- Adding the role to a newly created user.
- how to debug es6+ code in WebStorm - https://blog.jetbrains.com/webstorm/2015/05/ecmascript-6-in-webstorm-transpiling/

# Config
[The Twelve-Factor App](https://12factor.net/config) Recommends **not** storing your config in files, there are some pretty good reasons for and against this which can be read [here.](https://gist.github.com/telent/9742059) In my personal experience and based on how my projects run, I find that the advantages of file-based far outweigh the downsides, feel free to disagree. If you would prefer pure env config, check out [dotenv](https://www.npmjs.com/package/dotenv) or simply update the config code here to not load from file.

# Logging
We use [winston](https://github.com/winstonjs/winston) to route our logs to various places as required, and override console.x as per [this article here](http://seanmonstar.com/post/56448644049/consolelog-all-the-things) to allow us to see what's happening with dependencies we may be using.

# Creating a new release

See [http://keepachangelog.com/en/0.3.0/](http://keepachangelog.com/en/0.3.0/) for best parctices and justification on maintaining a changelog.

1. Merge in the pull request(s) on GitHub that make up the release.
1. Decide based on what is going into the release how the version number is going to change, see [Semantic Versioning](http://semver.org/) for more info.
1. The `CHANGELOG.md` file should have pending changes documented in the `Unreleased` section, create a new heading for this version and cut the relevant changes and paste them into the new section.
1. Run the npm command to increment the version number and tag it `npm version [major | minor | patch | premajor | preminor | prepatch | prerelease] -m "A message that makes sense"`
1. Push the updated branch & tag back to origin.
1. Run `chandler push` to push the notes from `CHANGELOG.md` to the GitHub release page. See [chandler](https://github.com/mattbrictson/chandler) for more