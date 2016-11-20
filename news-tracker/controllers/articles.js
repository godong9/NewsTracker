var log4js = require('log4js');
var logger = log4js.getLogger('ArticleModel');

var ArticleModel = require('../models/articles');

function ArticleController() {

}

ArticleController.getArticles = function(req, res) {

};

module.exports = new ArticleController();