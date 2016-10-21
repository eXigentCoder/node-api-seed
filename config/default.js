'use strict';
module.exports = {
    "port": 10010,
    "logging": {
        "file": {
            "folder": "./logs",
            "retention": {
                "units": "days",
                "amount": 7
            }
        },
        "loggly": {
            "username": "",
            "password": "",
            "token": "",
            "subdomain": ""
        }
    }
};