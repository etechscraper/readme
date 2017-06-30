var GENERIC = require('./generic.js');
var DB = require('./db.js');
var _ = require("lodash");

function scrapRawUrls(urls, callback) {
    var url = urls.splice(0, 1)
    if (urls.length == 0) {
        callback();
    } else {
        console.log('pendgin pages ---------- ' + urls.length)
        allDomains = []
        GENERIC.getHtml(url[0], function(status, body) {
            if (status === 'error') {} else {
                GENERIC.getDom(body, function(jQuery) {
                    if (jQuery('table.views-table').length > 0) {
                        jQuery('table.views-table tbody tr').each(function() {
                            var website_name = '';
                            var website_url = '';
                            website_name = jQuery(this).find('td:nth-child(1) a').text();
                            if (typeof website_name != 'undefined' && website_name != '' && website_name != null) {
                                website_url = jQuery(this).find('td:nth-child(1) a').attr("href");
                                if (typeof website_url != 'undefined' && website_url.trim() != '') {
                                    allDomains.push({
                                        domain_name: website_name,
                                        domain_url: "https://www.programmableweb.com" + website_url,
                                        status: 0
                                    })
                                }
                            }
                        })
                    }
                })
                db_insert_programableDomains(allDomains, function(status) {
                    scrapRawUrls(urls, callback)
                })
            }
        })
    }
}

function db_insert_programableDomains(domainsList, callback) {
    if (domainsList.length == 0) {
        callback('All domains inserted!!');
    } else {
        domain = domainsList.splice(0, 1);
        DB.temp_programmableweb.find({ domain_url: domain[0].domain_url }).exec(function(err, result) {
                if (!result[0]) {
                    let model = new DB.temp_programmableweb(domain[0]);
                    model.save(function(err) {
                        if (err) {
                            console.log(err)
                            process.exit(0);
                            //FN_db_insertDomains( domainsList, callback )
                        } else {
                            if (domainsList.length) {
                                db_insert_programableDomains(domainsList, callback)
                            } else {
                                callback("domain inserted");
                            }
                        }
                    });
                } else {
                    db_insert_programableDomains(domainsList, callback)
                }
            })
            //console.log('Pending to insert --------------------------------------- ' + domainsList.length)

    }
}

function scrapRawDomains(urls, callback) {
    var url = urls.splice(0, 1)
    var body_url = url[0].get("domain_url");
    console.log(body_url)
    if (urls.length == 0) {
        callback();
    } else {
        console.log('pendgin pages ---------- ' + urls.length)
        allDomains = []
        GENERIC.getHtml(body_url, function(status, body) {
            if (status === 'error') {

            } else {
                GENERIC.getDom(body, function(jQuery) {
                    var website_name = url[0].get("domain_name");
                    var website_url = jQuery('div.section div.field a').attr("href");
                    GENERIC.filterMainDomainName(website_url, function(hostname) {
                        GENERIC.raw_sub_domains(jQuery, function(raw_sub_domains) {
                            GENERIC.valid_sub_domains(function(valid_sub_domains) {
                                valid_subdomain_list = [];
                                create_valid_subdomains_list(raw_sub_domains, valid_sub_domains, hostname, function(valid_list) {
                                    if (typeof website_name != 'undefined' && website_name != '' && website_name != null) {
                                        if (typeof website_url != 'undefined' && website_url.trim() != '') {
                                            GENERIC.filterMainDomainName(website_url, function(domain_url) {
                                                allDomains.push({
                                                    source_website: 'programmableweb',
                                                    source_website_url: url[0].get("domain_url"),
                                                    domain_name: website_name,
                                                    domain_url: domain_url,
                                                    status: 0
                                                })
                                            });
                                        } else {
                                            updateTempStatus(url[0]._id, function(res) {
                                                scrapRawDomains(urls, callback)
                                            })
                                        }
                                    }
                                })
                            })
                        })
                    })
                })
                GENERIC.db_insertDomains(allDomains, function(status) {
                    updateTempStatus(url[0]._id, function(res) {
                        scrapRawDomains(urls, callback)
                    })
                })
            }
        })
    }
}

function create_valid_subdomains_list(raw_data, valid_data, hostname, callback) {
    var valid_subdomain = valid_data.splice(0, 1);
    var host = hostname.split("//");
    _.forEach(raw_data, (val, key) => {
        if (val.match(new RegExp(valid_subdomain[0] + host[1], 'gi')) && valid_subdomain_list.indexOf(val) == -1) {
            valid_subdomain_list.push(val)
        }
    })
    if (valid_data.length) {
        create_valid_subdomains_list(raw_data, valid_data, hostname, callback)
    } else {
        callback(valid_subdomain_list)
    }
}

function updateTempStatus(mongoid, callback) {
    DB.temp_programmableweb.update({ _id: mongoid }, { status: 1 }).exec(function(err, result) {
        callback(result)
    })
}

function scrapDomains(callback) {
    DB.temp_programmableweb.find({ status: 0 }).exec(function(err, result) {
        callback(result)
    })
}

var allUrls = [];
var valid_subdomain_list = [];
var url = 'https://www.programmableweb.com/category/all/apis?page=';

for (var i = 1; i <= 640; i++) {
    allUrls.push(url + i);
}

var args = process.argv.slice(2)

if (args[0] == "rawScrap") {
    scrapRawUrls(allUrls, function() {
        console.log('All Are done!!!!');
        process.exit(0);
    })
} else if (args[0] == "scrapDomains") {
    scrapDomains(function(res) {
        if (res.length > 0) {
            scrapRawDomains(res, function() {
                console.log("all done")
            })
        } else {
            console.log('No record found to process in temp_programmableweb collection!!')
            process.exit(0);
        }

    })
}
