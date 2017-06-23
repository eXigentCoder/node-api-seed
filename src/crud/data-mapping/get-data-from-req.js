import util from 'util';
import _ from 'lodash';

const defaultDisallowedSuffixList = ['password', 'passwordHash', 'passwordSalt'];
const defaultAllowedPrefixList = ['user', 'process', 'body', 'params', 'query'];
const maxDepth = 10;

export default function getDataFromReq(
    map,
    req,
    depth = 0,
    disallowedSuffixList = defaultDisallowedSuffixList,
    allowedPrefixList = defaultAllowedPrefixList
) {
    if (!map) {
        return;
    }
    if (depth > maxDepth) {
        throw new Error(
            util.format(
                'Circular reference detected in map object after maximum depth (%s) reached. Partial map\n%j\n',
                maxDepth,
                util.inspect(map, true, maxDepth)
            )
        );
    }
    const data = {};
    Object.keys(map).forEach(function(key) {
        const value = map[key];
        if (_.isArray(value)) {
            ensureMapIsString(value[0]);
            if (value.length > 2) {
                throw new Error(
                    util.format('Too many items in array, should be at most 2. %j', value)
                );
            }
            data[key] = getValue(req, value[0], value[1], disallowedSuffixList, allowedPrefixList);
            return;
        }
        if (_.isObject(value)) {
            data[key] = getDataFromReq(
                value,
                req,
                depth + 1,
                disallowedSuffixList,
                allowedPrefixList
            );
            return;
        }
        ensureMapIsString(value);
        data[key] = getValue(req, value, undefined, disallowedSuffixList, allowedPrefixList);
    });
    return data;
}

export function getValue(req, map, defaultValue, disallowedSuffixList, allowedPrefixList) {
    const disallowed = disallowedSuffixList.find(suffix => map.endsWith(suffix));
    if (disallowed) {
        throw new Error('Map is not allowed to end with ' + disallowed);
    }
    const allowed = allowedPrefixList.find(prefix => map.startsWith(prefix));
    if (!allowed) {
        throw new Error(util.format('Map must start with one of %j', allowedPrefixList));
    }
    return _.get(req, map, defaultValue);
}

export function ensureMapIsString(map) {
    if (!_.isString(map)) {
        throw new Error(util.format('Invalid map value, must be a string : \n%j\n', map));
    }
}
