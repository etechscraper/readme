var mongoose = require('mongoose');

let conn = mongoose.connect('mongodb://localhost/readme');
console.log('Mongo - Database has been connected');

let domainsSchema = mongoose.Schema({
    source_website: {
        type: String,
        required: true
    },
    source_website_url: {
        type: String,
        required: true
    },
    domain_name: {
        type: String,
        required: true
    },
    domain_url: {
        type: String,
        required: true
    }
}, {
    strict: false,
    collection: 'domains'
});

let temp_programmableweb = mongoose.Schema({}, {
    strict: false,
    collection: 'temp_programmableweb'
});

collection_domains = conn.model('domains', domainsSchema)
collection_temp_programmableweb = conn.model('temp', temp_programmableweb)

module.exports = {
    domains: collection_domains,
    temp_programmableweb: collection_temp_programmableweb
}
