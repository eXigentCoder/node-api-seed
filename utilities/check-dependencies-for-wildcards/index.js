'use strict';
var packageJson = require('../../package.json');
var util = require('util');
console.log("Checking dependencies for wildcards");
var dependencySections = [packageJson.dependencies, packageJson.devDependencies];
dependencySections.forEach(checkDependencySection);

function checkDependencySection(dependencySection) {
    Object.keys(dependencySection).forEach(function (dependencyName) {
        var versionString = dependencySection[dependencyName];
        if (versionString.startsWith('http')) {
            console.warn(util.format('Http dependency detected (%s), skipping.', versionString));
            return;
        }
        var allowedCharacters = /^[a-zA-Z\d\.]{1,}$/;
        var valid = allowedCharacters.test(versionString);
        if (!valid) {
            throw new Error(util.format("Dependency %s has a version string (%s) with invalid characters", dependencyName, versionString));
        }
    });
}
console.log("All dependencies are wildcard free");