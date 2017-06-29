var DB = require('./db.js')
var request = require('request');
var cheerio = require('cheerio');
var psl = require('psl');
var Url = require("url");

var FN_getHtml = function(url, callback) {
    request(url, function(error, response, body) {
        if (!error) {
            callback('success', body);
        } else {
            callback('error', body);
        }
    })
}

var FN_getDOM = function(body, callback) {
    callback(cheerio.load(body));
}

var FN_db_insertDomains = function(domainsList, callback) {
    if (domainsList.length == 0) {
        callback('All domains inserted!!');
    } else {
        domain = domainsList[0];
        domainsList.splice(0, 1);
        console.log(domain)
        console.log('Pending to insert --------------------------------------- ' + domainsList.length)
        let model = new DB.domains(domain);
        model.save(function(err) {
            if (err) {
                console.log(err)
                process.exit(0);
                //FN_db_insertDomains( domainsList, callback )
            } else {
                FN_db_insertDomains(domainsList, callback)
            }
        });
    }
}

var FN_check_subDomain = function(subdomain, callback) {
    var parseUrl = Url.parse(subdomain);
    var u_domainName = parseUrl.hostname;
    var splitArr = u_domainName.split('.');
    var arrLen = splitArr.length;
    if (arrLen > 2) {
        u_domainName = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
    }
    u_domainName = parseUrl.protocol + '//' + u_domainName;
    callback(u_domainName);
}

var FN_raw_sub_domains = function(jQuery, callback) {
    var raw_sub_domain = [];
    if (jQuery('div.field').length > 0) {
        jQuery('div.field a').each(function() {
            var link = Url.parse(jQuery(this).attr("href")).hostname
            if (link && raw_sub_domain.indexOf(link) == -1) {
                raw_sub_domain.push(link)
            }
        })
        callback(raw_sub_domain)
    }
}

var FN_valid_sub_domains = function(callback) {
    var valid_sub_domains = ["api-docs.", "api.", "apidoc.", "dev.", "developer.", "developers.", "doc.", "docs.", "documentation.", "readme."];
    callback(valid_sub_domains)
}

module.exports = {
    getHtml: FN_getHtml,
    getDom: FN_getDOM,
    db_insertDomains: FN_db_insertDomains,
    filterMainDomainName: FN_check_subDomain,
    raw_sub_domains: FN_raw_sub_domains,
    valid_sub_domains: FN_valid_sub_domains
}
