var Crawler = require('crawler');
var url = require('url');
var fs = require('fs');

var NEWS_JOINS_ROOT = 'http://news.joins.com';
var NEWS_CHOSUN_ROOT = 'http://search.chosun.com';

var c = new Crawler({
  maxConnections : 10,
  forceUTF8: true,
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
      console.log(toQueueUri);
      c.queue(toQueueUri);
    });

    // 기사 본문 내용
    $('body').each(function(index, tag) {
      console.log("URI:", result.uri);
      // 중앙일보 기사
      getNewsJoinsArticleData($, tag);
      // 조선일보 기사
      getChosunArticleData($, tag);
      // 조선비즈 기사
      getChosunBizArticleData($, tag);
      // TODO: 동아일보 기사
      // TODO: 한겨레 기사
    });

  }
});

// 중앙일보 이슈 페이지 URI 가져옴
function getNewsJoinsIssueUri(issue) {
  return NEWS_JOINS_ROOT + '/issue/' + issue;
}

// 조선일보 기사 검색 페이지 URI 가져옴
function getChosunUri(searchStr) {
  return encodeURI(NEWS_CHOSUN_ROOT + '/search/news.search?query=' + searchStr + '&orderby=default');
}


// 중앙일보 기사 페이지에서 데이터 추출해서 DB에 저장
function getNewsJoinsArticleData($, tag) {
  var title = $(tag).find('h1#article_title').text();
  var content = $(tag).find('div#article_body').text();
  if (title.length > 0 && content.length > 0) {
    // TODO: save to db
    console.log(title);
    //console.log(content);
  }
}

// 조선일보 기사 페이지에서 데이터 추출해서 DB에 저장
function getChosunArticleData($, tag) {
  var title = $(tag).find('h1#news_title_text_id').text();
  var content = $(tag).find('div.par').text();
  if (title.length > 0 && content.length > 0) {
    // TODO: save to db
    console.log(title);
    //console.log(content);
  }
}

// 조선비즈 기사 페이지에서 데이터 추출해서 DB에 저장
function getChosunBizArticleData($, tag) {
  var title = $(tag).find('h2#title_text').text();
  var content = $(tag).find('div.article').text();
  if (title.length > 0 && content.length > 0) {
    // TODO: save to db
    console.log(title);
    //console.log(content);
  }
}

var newsJoinsIssueNo = 10357;
var chosunSearchStr = '4대강사업';
var dongaIssueStr = 'List_03000000000068';

c.queue({
  uri: getNewsJoinsIssueUri(newsJoinsIssueNo),
  timeout: 60000
});

c.queue([
  getChosunUri(chosunSearchStr) + '&pageno=1',
  getChosunUri(chosunSearchStr) + '&pageno=2',
  getChosunUri(chosunSearchStr) + '&pageno=3'
]);