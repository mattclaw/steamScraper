var request = require('request'),
	cheerio = require('cheerio'),
	beautify = require('js-beautify').js_beautify,
	fs = require('fs'),
    util = require('util');

var steamScraper = function(){ 
    this._baseUrlApp = 'http://store.steampowered.com/app/';
}

steamScraper.prototype.getGameFeatures = function(appId) {
	if (typeof appId != 'string') return false;
	var url = this._baseUrlApp + appId;
	request(url,
				function(err, resp, body) {					
			    	if (err){
			    		console.log(err);
				        throw err;
			    	}

				    var features = [];
				    $ = cheerio.load(body);

				    $('.game_area_details_specs .name').each(function(){ features.push( $(this).text()) });

					fs.writeFile(appId + "features.json",
								beautify ( util.inspect(features,{depth: null}), {indent_size: 2}),
								function(err) {	
			            			if (err) {
			                			console.log(err);
			            			} else {
			                			console.log("The file was saved!");
			            			}	
			       				}
			       	);
		    	}
	);
}

var myScraper = new steamScraper();
myScraper.getGameFeatures(process.argv[2]);
console.log('\nGetting Features for App ' + process.argv[2] + '\n');