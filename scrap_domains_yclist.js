var GENERIC = require('./generic.js');

GENERIC.getHtml('http://yclist.com/', function(status, body) {
    if (status === 'error') {

    } else {
        let allDomains = [];
        GENERIC.getDom(body, function(jQuery) {
            if (jQuery('tr.operating').length > 0) {
                jQuery('tr.operating').each(function() {
                    var website_name = '';
                    var website_url = '';
                    website_name = jQuery(this).find('td:nth-child(2)').text();
                    if (typeof website_name != 'undefined' && website_name != '' && website_name != null) {
                        website_url = jQuery(this).find('td:nth-child(3)').find('a');
                        website_url = website_url.attr('href');
                        if (typeof website_url != 'undefined' && website_url.trim() != '') {
                            allDomains.push({
                                source_website: 'yclist',
                                source_website_url: 'http://yclist.com',
                                domain_name: website_name,
                                domain_url: website_url,
                                status: 0
                            });
                        }
                    }
                })
            }
            GENERIC.db_insertDomains(allDomains, function(status) {
                console.log('status :: ' + status)
                process.exit(0);
            })
        });
    }
})
