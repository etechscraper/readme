# Domain Scraping

## Install casperjs
``` $ sudo npm install -g casperjs ```

## Install phantomjs
``` $ sudo wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2 ```
``` $ sudo tar xjf phantomjs-1.9.7-linux-x86_64.tar.bz2 ```
``` $ sudo mv phantomjs-1.9.7-linux-x86_64 /usr/local/share ```
``` $ sudo ln -sf /usr/local/share/phantomjs-1.9.7-linux-x86_64 /usr/local/bin/ ```

## Install Dependencies

``` $ npm install ```

### Scrap yclist domains

``` $ node scrap_domains_yclist.js ```

### Scrap Programableweb domains 

#### step 1 :- (creating temp collection for raw domain list)

``` $ node scrap_domains_programable.js rawScrap ```

#### step 2 :- (final scraping of domains from temp table )

``` $ node scrap_domains_programable.js scrapDomains ```

### scrap final valid sub-domains list

``` $ node main.js ```

### Snapshots
A folder will be created with name ```snapshots``` which will have snapshots of valid domains and name of file is also save in mongoDB with every domain in domains collection.
