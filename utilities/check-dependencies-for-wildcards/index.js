'use strict';
const packageJson = require('../../package.json');
const util = require('util');
console.log('Checking dependencies for wildcards');
const dependencySections = [packageJson.dependencies, packageJson.devDependencies];
dependencySections.forEach(checkDependencySection);

function checkDependencySection(dependencySection) {
    Object.keys(dependencySection).forEach(function(dependencyName) {
        const versionString = dependencySection[dependencyName];
        if (versionString.startsWith('http')) {
            console.warn(util.format('Http dependency detected (%s), skipping.', versionString));
            return;
        }
        const allowedCharacters = /^[a-zA-Z\d\.]{1,}$/;
        let valid = allowedCharacters.test(versionString);
        if (!valid) {
            throw new Error(
                util.format(
                    'Dependency %s has a version string (%s) with invalid characters',
                    dependencyName,
                    versionString
                )
            );
        }
    });
}
console.log('All dependencies are wildcard free');
