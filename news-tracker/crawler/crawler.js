var Crawler = require('crawler');
var url = require('url');
var fs = require('fs');

var NEWS_JOINS_ROOT = 'http://news.joins.com';

var c = new Crawler({
  maxConnections : 10,
  // This will be called for each crawled page
  callback : function (error, result, $) {
    // 기사 본문 내용
    $('body').each(function(index, tag) {
      console.log("URI:", result.uri);
      // 중앙일보 기사
      getNewsJoinsArticleData($, tag);
      // TODO: 조선일보 기사
      // TODO: 동아일보 기사
      // TODO: 한겨레 기사
    });

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
  }
});

// 중앙일보 이슈 페이지 URI 가져옴
function getNewsJoinsIssueUri(issue) {
  return NEWS_JOINS_ROOT + '/issue/' + issue;
}

// 중앙일보 기사 페이지에서 데이터 추출해서 DB에 저장
function getNewsJoinsArticleData($, tag) {
  var title = $(tag).find('h1#article_title').text();
  var content = $(tag).find('div#article_body').text();
  if (title.length > 0 && content.length > 0) {
    // TODO: save to db
    console.log(title);
    console.log(content);
  }
}

c.queue({
  uri: getNewsJoinsIssueUri(10357),
  timeout: 10000
});