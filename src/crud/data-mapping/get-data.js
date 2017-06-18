import _ from 'lodash';
import getDataFromReq from './get-data-from-req';

export default function getData(rules, req) {
    if (!rules) {
        return;
    }
    const fromReq = getDataFromReq(rules.fromReq, req);
    return _.merge({}, rules.static, fromReq);
}
