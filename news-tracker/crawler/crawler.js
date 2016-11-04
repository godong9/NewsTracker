var Crawler = require('crawler');
var url = require('url');
var fs = require('fs');
var articleModel = new (require('../models/articles'));

var NEWS_JOINS_ROOT = 'http://news.joins.com';
var NEWS_CHOSUN_ROOT = 'http://search.chosun.com';
var NEWS_DONGA_ROOT = 'http://news.donga.com';
var NEWS_HANI_ROOT = 'http://www.hani.co.kr';

var NEWS_JOINS_COMPANY_ID = 1;
var NEWS_CHOSUN_COMPANY_ID = 2;
var NEWS_DONGA_COMPANY_ID = 3;
var NEWS_HANI_COMPANY_ID = 4;

var c = new Crawler({
  maxConnections : 10,
  forceUTF8: true,
  skipDuplicates: true,
  // This will be called for each crawled page
  callback : function (error, result, $) {
    // 중앙일보 이슈 태그에서 기사 URI 추출해서 큐에 추가
    $('div.issue_tile_wrap').each(function(index, tag) {
      var toQueueUri = $(tag).find('strong.headline > a').attr('href');
      c.queue(NEWS_JOINS_ROOT + toQueueUri);
    });

    // 중앙일보 이슈 더보기 태그에서 페이지 URI 추출해서 큐에 추가
    $('span.more_comm a').each(function(index, a) {
      var toQueueUri = $(a).attr('href');
      c.queue(NEWS_JOINS_ROOT + toQueueUri);
    });

    // 조선일보 검색 페이지 태그에서 기사 페이지 URI 추출해서 큐에 추가
    $('section.news dl > dt > a').each(function(index, a) {
      var toQueueUri = $(a).attr('href');
      c.queue(toQueueUri);
    });

    // 동아일보 기사 페이지에서 페이지 번호에 해당하는 URI 추출해서 큐에 추가
    $('div.page > a').each(function(index, a) {
      var toQueueUri = $(a).attr('href');
      c.queue(result.uri + toQueueUri);
    });

    // 동아일보 기사 URI 추출해서 큐에 추가
    $('div.articleList p.title a').each(function(index, a) {
      var toQueueUri = $(a).attr('href');
      c.queue(toQueueUri);
    });

    // 한겨레 기사 페이지에서 페이지 번호에 해당하는 URI 추출해서 큐에 추가
    $('div.paginate > a').each(function(index, a) {
      var toQueueUri = $(a).attr('href');
      c.queue(NEWS_HANI_ROOT + toQueueUri);
    });

    // 한겨레 기사 URI 추출해서 큐에 추가
    $('h4.article-title > a').each(function(index, a) {
      var toQueueUri = $(a).attr('href');
      c.queue(NEWS_HANI_ROOT + toQueueUri);
    });


    // 기사 본문 내용
    $('body').each(function(index, tag) {
      console.log("URI:", result.uri);
      // 중앙일보 기사
      getNewsJoinsArticleData($, tag, result.uri);
      // 조선일보 기사
      getChosunArticleData($, tag, result.uri);
      // 조선비즈 기사
      getChosunBizArticleData($, tag, result.uri);
      // 동아일보 기사
      getNewsDongaArticleData($, tag, result.uri);
      // 한겨레 기사
      getNewsHaniArticleData($, tag, result.uri);
    });

  }
});

// 중앙일보 기사 페이지에서 데이터 추출해서 DB에 저장
function getNewsJoinsArticleData($, tag, uri) {
  var title = $(tag).find('h1#article_title').text();
  var content = $(tag).find('div#article_body').text();
  if (title.length > 0 && content.length > 0) {
    var criteria = {
      title: title,
      content: content,
      write_at: $(tag).find('div.byline > em').last().text().split('입력 ')[1],
      uri: uri,
      company_id: NEWS_JOINS_COMPANY_ID
    };
    articleModel.insert(criteria);
  }
}

// 조선일보 기사 페이지에서 데이터 추출해서 DB에 저장
function getChosunArticleData($, tag, uri) {
  var title = $(tag).find('h1#news_title_text_id').text();
  var content = $(tag).find('div.par').text();
  if (title.length > 0 && content.length > 0) {
    var criteria = {
      title: title,
      content: content,
      write_at: $(tag).find('p#date_text').text().trim().split(' : ')[1],
      uri: uri,
      company_id: NEWS_CHOSUN_COMPANY_ID
    };
    articleModel.insert(criteria);
  }
}

// 조선비즈 기사 페이지에서 데이터 추출해서 DB에 저장
function getChosunBizArticleData($, tag, uri) {
  var title = $(tag).find('h2#title_text').text();
  var content = $(tag).find('div.article').text();
  if (title.length > 0 && content.length > 0) {
    var criteria = {
      title: title,
      content: content,
      write_at: $(tag).find('p#date_text').text().trim().split(' : ')[1],
      uri: uri,
      company_id: NEWS_CHOSUN_COMPANY_ID
    };
    articleModel.insert(criteria);
  }
}

// 동아일보 기사 페이지에서 데이터 추출해서 DB에 저장
function getNewsDongaArticleData($, tag, uri) {
  var title = $(tag).find('div.article_title02 > h1').text();
  var content = $(tag).find('div.article_txt').text();
  if (title.length > 0 && content.length > 0) {
    var criteria = {
      title: title,
      content: content,
      write_at: $(tag).find('p.title_foot > span.date').text(),
      uri: uri,
      company_id: NEWS_DONGA_COMPANY_ID
    };
    articleModel.insert(criteria);
  }
}

// 한겨레 기사 페이지에서 데이터 추출해서 DB에 저장
function getNewsHaniArticleData($, tag, uri) {
  var title = $(tag).find('span.title').text();
  var content = $(tag).find('div.article-text div.text').text();
  if (title.length > 0 && content.length > 0) {
    var criteria = {
      title: title,
      content: content,
      write_at: $(tag).find('p.date-time > span').first().text().split(' :')[1],
      uri: uri,
      company_id: NEWS_HANI_COMPANY_ID
    };
    articleModel.insert(criteria);
  }
}


// 중앙일보 이슈 페이지 URI 가져옴
function getNewsJoinsIssueUri(issue) {
  return NEWS_JOINS_ROOT + '/issue/' + issue;
}

// 조선일보 기사 검색 페이지 URI 가져옴
function getChosunUri(searchStr) {
  return encodeURI(NEWS_CHOSUN_ROOT + '/search/news.search?query=' + searchStr + '&orderby=default');
}

// 동아일보 기사 검색 페이지 URI 가져옴
function getDongaUri(issueStr) {
  return encodeURI(NEWS_DONGA_ROOT + '/Issue/' + issueStr);
}

function getHaniUri(issueNo) {
  return encodeURI(NEWS_HANI_ROOT + '/arti/ISSUE/' + issueNo + '/list.html');
}

var newsJoinsIssueNo = 10357;
var chosunSearchStr = '4대강사업';
var dongaIssueStr = 'List_03000000000068';
var haniIssueNo = 78;

c.queue({
  uri: getNewsJoinsIssueUri(newsJoinsIssueNo),
  timeout: 60000
});

c.queue([
  getChosunUri(chosunSearchStr) + '&pageno=1',
  getChosunUri(chosunSearchStr) + '&pageno=2',
  getChosunUri(chosunSearchStr) + '&pageno=3'
]);

c.queue({
  uri: getDongaUri(dongaIssueStr),
  timeout: 60000
});

c.queue({
  uri: getHaniUri(haniIssueNo),
  timeout: 60000
});