var GENERIC = require('./generic.js');
var DB = require('./db.js');
var Url = require("url");
var _ = require("lodash");

function fetch_domain_data(cb) {
    DB.domains.find({ status: 0 }).exec(function(err, result) {
        cb(result)
    })
}

function test_domains_url(domain_array, callback) {
    if (domain_array.length == 0) {
        callback(passed_domain)
    } else {
        var url = domain_array.splice(0, 1);
        url = url[0];
        console.log('*********************************')
        console.log('*********************************')
        console.log('Verifying subdomain ---- ' + url )
        console.log('*********************************')
        console.log('*********************************')
        GENERIC.is_valid_url(url, function(statusCode, finalUrl ) {
            url = 'api.structik.com'
            if( statusCode != 200 ){
                console.log('---Result---'+statusCode+'--Invalid')
                test_domains_url(domain_array, callback)   
            }else{
                console.log('---Result---'+statusCode+'--Valid')
                console.log('---Result-----Scraping more info...')
                GENERIC.getHtml(finalUrl, function(status, body) {
                    if (status === 'error') {
                        test_domains_url(domain_array, callback)
                    } else {
                        GENERIC.getDom(body, function(jQuery) {
                            var emails = GENERIC.extract_emails_from_dom(jQuery);
                            var text_matched = GENERIC.extract_matched_text(jQuery);
                            var support_help = GENERIC.extract_support_help_links(jQuery);
                            let uData = { 
                                url: finalUrl,
                                emails : emails,
                                text_matched : text_matched,
                                support_help : support_help
                            }
                            console.log( uData )
                            passed_domain.push( uData)
                            callback(passed_domain)
                            test_domains_url(domain_array, callback)
                        })
                    }   
                })
            }
            
            // if (res == true) {

            //     console.log('check for  emails, help, support ---- ' +  url[0])
            
            // } else {
            //     test_domains_url(domain_array, callback)
            // }
        })
    }
}




function test_valid_sub_domains(domains_list, valid_sub_domains, callback) {
    var _id = domains_list[0]._id;
    var domain_url1 = Url.parse(domains_list.splice(0, 1)[0].domain_url).hostname;
    var domain_url = domain_url1.replace("www.", "");
    console.log("domain url ----------------", "http://" + domain_url1)
    var domains = []
    _.forEach(valid_sub_domains, (val, key) => {
        domains.push(val + domain_url)
    })
    test_domains_url(domains, function(result) {
        DB.domains.findOneAndUpdate({ "_id": _id }, { final_valid_sub_domains: result, status: 1 }).exec((err, response) => {
            if (response) {
                console.log("left domains list ------------------------------------", domains_list.length)
                passed_domain = []
                if (domains_list.length) {
                    test_valid_sub_domains(domains_list, valid_sub_domains, callback)
                } else {
                    callback("All process is done !!")
                }
            }
        })
    })
}


function valid_subdomains_main() {
    fetch_domain_data(function(domains_list) {
        if (domains_list[0]) {
            console.log("left domains list ------------------------------------", domains_list.length)
            GENERIC.valid_sub_domains(function(sub_domains) {
                test_valid_sub_domains(domains_list, sub_domains, function(result) {
                    console.log(result)
                    process.exit(0)
                })
            })
        } else {
            console.log('No record found to process in domains collection!!')
            process.exit(0)
        }

    })
}
var passed_domain = []

valid_subdomains_main()
