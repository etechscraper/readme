# Domain Scraping

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
