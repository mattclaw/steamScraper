##Intro

This script represents my first substantial work with Node.js beyond playing around with web application frameworks like Express.  It would definitely need heavy refactoring to make the code more readable and re-usable.

##Background

One of the hobby projects I'm working on is related to video games and the digital distribution platform Steam.  VALVe software provides an API for Steam, but there are certain data points for Steam products that weren't surfaced by their API.

For example, you can get a list of owned games from the API:

    https://developer.valvesoftware.com/wiki/Steam_Web_API#GetOwnedGames_.28v0001.29

However, there is no official API for retrieving a list of the features a game supports.  Luckily, VALVe's online store listings have a clean HTML structure that make it super-easy to reliably retrieve this information.  Enter, my first web scraper.

##Description of script

I originally wrote this to experiment with Node.js modules such as request and cheerio.  However, a few challenges quickly became apparent:

  * Simply looping over thousands of IDs and firing off HTTP requests was not a suitable solution due to open connection limits locally and remote throttling by my ISP or VAVLE's servers
  * Storing results on the filesystem is cumbersome and duplicating efforts on already-scraped data is slow
  * Asynchronous programming was definitely a model I was not used to (and admittedly I'm still learning)

I quickly realized I could use some help from the node module async and played around with the queue function in order to limit simultaneous requests.  I then introduced Mongoose.js which I have used in other hobby projects and added an extra layer to the scraper to first check if a given APP ID had already been scraped.

There are still a few other odd artifacts from previous iterations hanging around and there are surely many neglected best practices.

##Requirements

  * MongoDB

##Directions

  * npm install
  * node steamScraper.js
  * Sit back and relax