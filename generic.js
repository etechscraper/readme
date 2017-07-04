var DB = require('./db.js')
var request = require('request');
var cheerio = require('cheerio');
var Url = require("url");
var urlExists = require('url-exists');
try {
    var Spooky = require('spooky');
} catch (e) {
    var Spooky = require('../lib/spooky');
}


var FN_getHtml = function(url, callback) {

    var options = {
        url: url,
        timeout: 10000
    }
    request(options, function(error, response, body) {
        if (!error) {
            callback('success', body);
        } else {
            console.log(error)
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
        // console.log(domain.domain_url)
        console.log('Pending to insert --------------------------------------- ' + domainsList.length)
        DB.domains.find({ domain_url: domain.domain_url }).exec(function(err, result) {
            if (result.length) {
                FN_db_insertDomains(domainsList, callback)
            } else {
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
        })
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

var FN_valid_sub_domains = function() {
    var valid_sub_domains = ["api-docs.", "api.", "apidoc.", "dev.", "developer.", "developers.", "doc.", "docs.", "documentation.", "readme."];
    return valid_sub_domains;
}


var FN_is_valid_url = function(url, callback) {
    var domain = "http://" + url;
    request({
        url: domain,
        method: 'HEAD',
        timeout: 10000
    }, function(err, res) {
        if (err) {
            callback('', domain);
        } else {
            callback(res.statusCode, domain);
        }
    });
}


function extractEmails(text) {
    var emails = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (emails == null || emails.length == 0) {
        return [];
    }
    return emails;
}

function findText(text, string) {
    text = text.toLowerCase();
    string = string.toLowerCase();
    if (string.indexOf(text) == -1) {
        return false;
    }
    return true;
}

var FN_extract_emails_from_dom = function(body) {
    var body = body.text();
    return extractEmails(body);
}

var FN_extract_matched_text = function(body) {
    var ret = [];
    var body = body.text();
    var textArray = ['swagger', 'open api'];
    for (var t in textArray) {
        txt = textArray[t];
        if (findText(txt, body)) {
            ret.push(txt);
        }
    }
    return ret;
}

var FN_extract_support_help_links = function(jQuery) {
    let emails = [];
    let links = [];
    jQuery('a').each(function() {
        lnk = jQuery(this).text().toLowerCase();
        if (lnk.indexOf('help') != -1 || lnk.indexOf('support') != -1) {
            lnk_href = jQuery(this).attr('href');
            if (lnk_href.indexOf('mailto:') != -1) {
                var aa = lnk_href.split(":");
                if (typeof aa[1] != 'undefined') {
                    emails.push(aa[1])
                }
            } else {
                links.push(lnk_href)
            }
        }
    })
    return {
        'email': emails,
        'link': links,
    }
}

var FN_take_snapshot = function(url, fileName, callback) {
    var name = __dirname + "/snapshots/" + fileName + ".png";
    console.log(name)
    var spooky = new Spooky({
        child: {
            transport: 'http'
        },
        casper: {
            logLevel: 'debug',
            verbose: true
        }
    }, function(err) {
        if (err) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }
        spooky.start(url);
        spooky.then([{ name: name }, function() {
            this.capture(name)
            this.emit("return", [{ name: name }, function() {
                return name
            }])
        }]);

        spooky.run();

        spooky.on('exit', function() {
            console.log('###############EXIT');
            callback(name);

        });
        spooky.on('return', function(data) {
            this.exit()
        });
    });

    spooky.on('error', function(e, stack) {
        console.error(e);

        if (stack) {
            console.log(stack);
        }
    });
}

module.exports = {
    getHtml: FN_getHtml,
    getDom: FN_getDOM,
    db_insertDomains: FN_db_insertDomains,
    filterMainDomainName: FN_check_subDomain,
    raw_sub_domains: FN_raw_sub_domains,
    valid_sub_domains: FN_valid_sub_domains,
    is_valid_url: FN_is_valid_url,
    extract_emails_from_dom: FN_extract_emails_from_dom,
    extract_matched_text: FN_extract_matched_text,
    extract_support_help_links: FN_extract_support_help_links,
    take_snapshot: FN_take_snapshot
}
