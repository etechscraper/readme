var GENERIC = require('./generic.js');
var DB = require('./db.js');
var Url = require("url");
var _ = require("lodash");
var fs = require("fs");
var snapshotFolder = 'snapshots'

function analyseSubdomain(url, callback) {
    GENERIC.is_valid_url(url, function(statusCode, finalUrl) {
        if (statusCode != 200) {
            callback(false)
        } else {
            GENERIC.getHtml(finalUrl, function(status, body) {
                    if (status === 'error') {
                        var file = Url.parse(finalUrl).hostname.replace(/\./g, "");
                        GENERIC.take_snapshot(finalUrl, snapshotFolder, file, function(snapshot) {
                            var ret = {
                                url: finalUrl,
                                snapshot: snapshot
                            }
                            callback(ret)
                        })
                    } else {
                        GENERIC.getDom(body, function(jQuery) {
                            var emails = GENERIC.extract_emails_from_dom(jQuery);
                            var text_matched = GENERIC.extract_matched_text(jQuery);
                            var support_help = GENERIC.extract_support_help_links(jQuery);
                            var file = Url.parse(finalUrl).hostname.replace(/\./g, "");
                            GENERIC.take_snapshot(finalUrl, snapshotFolder, file, function(snapshot) {
                                ret = {
                                    url: finalUrl,
                                    emails: emails,
                                    text_matched: text_matched,
                                    support_help: support_help,
                                    snapshot: snapshot
                                }
                                callback(ret)
                            })
                        })
                    }
                })
                // })
        }
    })
}

function analyseDomain(sub_domains_to_check, domain, valid_sub_domains_list, callback) {
    if (sub_domains_to_check.length == 0) {
        callback(valid_sub_domains_list);
    } else {
        var sub_domain = sub_domains_to_check.splice(0, 1);
        sub_domain = sub_domain[0];

        var domain_url = Url.parse(domain.domain_url).hostname;
        var domain_url = domain_url.replace("www.", "");

        var subdomainURL = sub_domain + domain_url;

        console.log('\n analyse sub domain ------ ' + subdomainURL)

        analyseSubdomain(subdomainURL, function(subdomainRESULT) {
            if (subdomainRESULT === false) {
                console.log('--------------------------------------------------Invalid Sub Domain')
                analyseDomain(sub_domains_to_check, domain, valid_sub_domains_list, callback)
            } else {
                console.log('--------------------------------------------------Valid Sub Domain')
                valid_sub_domains_list.push(subdomainRESULT);
                analyseDomain(sub_domains_to_check, domain, valid_sub_domains_list, callback)
            }

        })
    }
}

function processDomains(domains, callback) {
    console.log('__________________________________________________________________________pending domains ----- ' + domains.length)
    console.log('\n')
    if (domains.length == 0) {
        callback();
    } else {
        var domainToProcess = domains.splice(0, 1);
        domainToProcess = domainToProcess[0];
        var sub_domains_to_check = GENERIC.valid_sub_domains();

        var valid_sub_domains_list = [];
        analyseDomain(sub_domains_to_check, domainToProcess, valid_sub_domains_list, function(result_valid_sub_domains) {
            var _id = domainToProcess._id;
            console.log('Valid subdomains found ------------------------------------------------------------------ ' + result_valid_sub_domains.length)
            console.log('\n')
            DB.domains.findOneAndUpdate({ "_id": _id }, { final_valid_sub_domains: result_valid_sub_domains, status: 1 }).exec((err, response) => {
                processDomains(domains, callback);
            })
        })
    }
}

function start() {
    DB.domains.find({ status: 0 }).exec(function(err, result) {
        processDomains(result, function() {
            console.log('all are done!!!');
            process.exit(0);
        })
    })
}
var path = __dirname + "/"+snapshotFolder;
if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
}

start();
