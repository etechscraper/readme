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
    var url = domain_array.splice(0, 1);
    GENERIC.test_domain_data(url, function(err, res) {
        if (res == true) {
            passed_domain.push({ url: url[0] })
        }
        if (domain_array.length) {
            test_domains_url(domain_array, callback)
        } else {
            console.log(passed_domain)
            callback(passed_domain)
        }
    })
}

function test_valid_sub_domains(domains_list, valid_sub_domains, callback) {
    var _id = domains_list[0]._id;
    var domain_url1 = Url.parse(domains_list.splice(0, 1)[0].domain_url).hostname;
    var domain_url = domain_url1.replace("www.", "");
    console.log(domain_url)
    var domains = []
    _.forEach(valid_sub_domains, (val, key) => {
        domains.push(val + domain_url)
    })
    test_domains_url(domains, function(result) {
        DB.domains.findOneAndUpdate({ "_id": _id }, { final_valid_sub_domains: result, status: 1 }).exec((err, response) => {
            if (response) {
                console.log("left pages:-----------", domains_list.length)
                console.log(response)
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
            GENERIC.valid_sub_domains(function(sub_domains) {
                test_valid_sub_domains(domains_list, sub_domains, function(result) {
                    console.log(result)
                    process.exit(0)
                })
            })
        } else {
            console.log("Nothing to Fetch!!!")
            process.exit(0)
        }

    })
}
var passed_domain = []

valid_subdomains_main()
