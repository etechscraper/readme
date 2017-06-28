var GENERIC = require('./generic.js');

function scrapRawUrls(urls, callback) {
    var url = urls.splice(0, 1)
    console.log(url)
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
                GENERIC.db_insert_programableDomains(allDomains, function(status) {
                    scrapRawUrls(urls, callback)
                })
            }
        })
    }
}


var allUrls = [];
var url = 'https://www.programmableweb.com/category/all/apis?page=';
for (var i = 0; i < 10; i++) {
    allUrls.push(url + i);
}
var args = process.argv.slice(2)
if (args[0] == "rawScrap") {
    scrapRawUrls(allUrls, function() {
        console.log('All Are done!!!!');
        process.exit(0);
    })
}
