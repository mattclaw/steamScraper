var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    util = require('util'),
    async = require('async'),
    mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/steamScraper2');

var SteamGameSchema = new mongoose.Schema({
    appId: Number,
    name: String,
    features: [String],
    genres: [String],
    isGame: Boolean
});

var SteamGame = mongoose.model('SteamGame', SteamGameSchema);

function lookupGame(appId, scraper, callback) {
    SteamGame.findOne({
        appId: appId
    }, function(err, game) {
        if (err == null && game) {
            console.log('found ' + appId + ' as [' + game.name + ']');
            if (typeof game.isGame == 'undefined') {
                scraper.getGameFeatures(appId, true, saveGame, callback)
            } else {
                console.log('already processed');
                callback();
            }
        } else {
            newCount++;
            scraper.getGameFeatures(appId, false, saveGame, callback)
        }
    });
}

function saveGame(game, appId, exists, callback) {
    if (exists) {
        SteamGame.findOne({
            appId: appId
        }, function(err, existGame) {
            existGame.name = game.name;
            existGame.features = game.features;
            existGame.genres = game.genres;
            existGame.isGame = game.isGame;
            existGame.save(function(err) {
                callback(err);
            });
        });
    } else {
        var newGame = new SteamGame(game);
        newGame.save(function(err, game) {
            callback(err);
        });
    }
}

var steamScraper = function() {
    this._baseUrlApp = 'http://store.steampowered.com/app/';
}

steamScraper.prototype.getGameFeatures = function(appId, exists, saveCallback, callback) {
    if (typeof appId != 'string') return false;
    var myUrl = this._baseUrlApp + appId;

    /*Set the options for request.  If we don't do not set the cookie for
    birthtime, GETs for M-rated games will return the birthdate-check page
    */

    var options = {
        url: myUrl,
        headers: {
            'Cookie': 'birthtime=157795201; lastagecheckage=1-January-1975'
        }
    };

    request(options,
        function(err, resp, body) {
            var result = {
                'appId': appId,
                'name': '',
                'features': [],
                'genres': []
            };

            if (err) {
                console.log(err);
                result.isGame = false;
                saveCallback(result, appId, exists, callback);
                return;
            }

            $ = cheerio.load(body);

            result.name = $('.apphub_AppName').text();

            console.log('\nGetting Features for ' + result.name + ' (App ' + appId + ')');

            //Get the list of features for the game
            $('.game_area_details_specs .name').each(function() {
                console.log($(this).text());
                result.features.push($(this).text())
            });

            //Get a list of genres associated with the game
            $('.details_block a').each(function() {
                var url = $(this).attr('href');
                if (url && url.indexOf('/genre/') > -1) {
                    result.genres.push($(this).text());
                }
            });

            /*
            Check the breadcrumbs at the top of the page
            to see if this item found under 'All Games'
            Non-games (software, trailers) won't have this value.
            */
            if ($('.breadcrumbs').text().indexOf('All Games') == -1) {
                result.isGame = false;
            } else {
                result.isGame = true;
                if (!exists) {
                    newGames++;
                }
            }

            saveCallback(result, appId, exists, callback);
        }
    );
};

var myScraper = new steamScraper();
// myScraper.getGameFeatures(process.argv[2], fileWriter);

// create a queue object with concurrency 2
var appIds = ['10', '20', '30', '205', '210', '60', '70', '80', '100', '130'];

var q = async.queue(function(task, callback) {
    lookupGame(task, myScraper, callback);
}, 10);


// assign a callback
q.drain = function() {
    console.log("Processed all AppIDs.");
}

// add some items to the queue (batch-wise)

function readJSONFile(filename, callback) {
    require("fs").readFile(filename, function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        try {
            callback(null, JSON.parse(data));
        } catch (exception) {
            callback(exception);
        }
    });
}

// q.push('49520', function (err) {
//   console.log('finished processing app');
// });
var appIDArray = [];
var newCount;
var newGames;

readJSONFile("myGames.json", function(err, json) {
    if (err) {
        throw err;
    }
    console.log("Read " + json.response.games.length + " app IDs.");
    var appIDArray = [];
    for (var i = 0; i < json.response.games.length; i++) {
        appIDArray.push(json.response.games[i].appid + '');
    }
    q.push(appIDArray, function(err) {
        console.log('finished processing app');
    });
});
