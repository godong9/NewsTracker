var mysql = require('../db/db').mysql;
var pool = require('../db/db').pool;
var log4js = require('log4js');
var logger = log4js.getLogger('ArticleModel');

function ArticleModel() {
  if (!(this instanceof ArticleModel)) {
    return new ArticleModel();
  }
}

ArticleModel.prototype.selectById = function (criteria, options, callback) {

};

ArticleModel.prototype.insert = function (criteria, callback) {
  var current_date = new Date();
  var sql = 'INSERT INTO article (title, content, write_at, uri, company_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?);';
  var values = [ criteria.title, criteria.content, criteria.write_at, criteria.uri, criteria.company_id, current_date, current_date ];
  var query = mysql.format(sql, values);

  pool.query(query, function (err, result) {
    if (err) {
      logger.error(err);
    }
    if (callback) {
      callback(err, result);
    }
  });
};

module.exports = ArticleModel;