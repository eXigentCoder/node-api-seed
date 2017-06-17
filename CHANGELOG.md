# Node Api Seed Change Log

## [Unreleased](https://github.com/eXigentCoder/node-api-seed/compare/v1.1.1...HEAD)
* Refactoring generic CRUD functions to export all their functions as properties on an object rather than tacked on to the primary function. This will allow for easier unit testing
* Creating a new npm script `unit-test` to run just the unit tests with coverage to get a better idea of where to add tests or where problems may lie.

Check here for upcoming changes

## [1.1.1](https://github.com/eXigentCoder/node-api-seed/compare/v1.1.0...v1.1.1) (2017-06-16)
* Adding instructions to the README of how to do a release

## [1.1.0](https://github.com/eXigentCoder/node-api-seed/compare/v1.0.0...v1.1.0) (2017-06-16)

Creating this initial `CHANGELOG.md` file to make upgrading easier.

* [#13](https://github.com/eXigentCoder/node-api-seed/pull/13): Upgrading the running version of node to 8.1.2, deleted and reinstalled node_modules to upgrade the `package-lock.json` file. - [@eXigentCoder](https://github.com/eXigentCoder)
* [#12](https://github.com/eXigentCoder/node-api-seed/pull/12): Upgrading dependencies as part of routine maintenance. - [@eXigentCoder](https://github.com/eXigentCoder)
* [#11](https://github.com/eXigentCoder/node-api-seed/pull/11): Updating the code so that on creation of objects that use statuses you can either set some static data in the status log or get some data from the `req` object. These rules are specified in the schema file. - [@eXigentCoder](https://github.com/eXigentCoder)
	* In your object's schema, on the **first** status in the `statuses` root property you can now add a property called `initialData`. This controls how the first status log entry will be generated. This can have both `static` data and data that comes from the request, specified in the `fromReq` property. If both are specified and there is a conflict merging the two objects, `fromReq` will take precedence. Subproperties specified in `fromReq` can either be:
		* A string - the path to the value on the `req` object, using lodash's get method
		* Array with a string and other entries - the first value is the path as above, the second is the default value if one is not found.


## 1.0.0 (2017-06-16)

* Going forward i'd like to use releases and CHANGELOG.md to keep track of things, so for now i'm putting a take in the ground and saying that this is the start point.