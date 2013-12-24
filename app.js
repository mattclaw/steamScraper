var request = require('request'),
	cheerio = require('cheerio'),
	_baseURL = "http://store.steampowered.com/app/",
	_app = '10',
	_appList = ['10'];

var url = _baseURL + _app;
request(url, function(err, resp, body) {
    if (err)
        throw err;
    $ = cheerio.load(body);
    console.log(_app);
    // TODO: scraping goes here!
    $('.game_area_details_specs .name').each(function(i){console.log($(this).text());})
});