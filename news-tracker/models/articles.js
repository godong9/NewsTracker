var mysql = require('../db/db').mysql;
var pool = require('../db/db').pool;
var log4js = require('log4js');
var logger = log4js.getLogger('ArticleModel');

function ArticleModel() {

}

ArticleModel.selectById = function(criteria, options, callback) {

};

ArticleModel.select = function(criteria, options, callback) {
  var sql = 'SELECT * FROM article WHERE issue_id=? ORDER BY write_at DESC LIMIT ? OFFSET ?;';
  var values = [ criteria.issue_id, options.limit, options.offset ];
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

ArticleModel.insert = function(criteria, callback) {
  var current_date = new Date();
  var sql = 'INSERT INTO article (issue_id, title, content, write_at, uri, company_id, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?);';
  var values = [ criteria.issue_id, criteria.title, criteria.content, criteria.write_at, criteria.uri, criteria.company_id, current_date, current_date ];
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