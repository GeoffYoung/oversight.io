// boilerplate includes
var config = require("../config/config"),
    elasticsearch = require("elasticsearch"),
    es = new elasticsearch.Client({
      host: config.elasticsearch,
      log: 'trace'
    });


module.exports = {

  // The homepage. A temporary search page.
  index: function(req, res) {
    search("*").then(function(results) {
      res.render("index.html", {
        results: results,
        agencies: require("./agencies"),
        query: req.param("query")
      });
    }, function(err) {
      console.log("Noooo!");
      res.render("index.html", {
        results: null,
        query: null
      });
    })
  },

  redirect: function(req, res){
    res.redirect( '/results/'+encodeURIComponent(req.param('query')) );
  },

  results: function(req, res) {
    search(encodeURIComponent( req.param("query") ) || "*").then(function(results) {
      res.render("results.html", {
        results: results,
        query: req.param("query")
      });
    }, function(err) {
      console.log("Noooo!");
      res.render("results.html", {
        results: null,
        query: null
      });
    });
  },

  queryFeed: function(req, res) {
    search(encodeURIComponent( req.param("query") ) || "*").then(function(results) {
      res.send(renderFeed(results));
    });
  },

  agency: function(req, res) {
    agencyList(req.param('agency')).then(function(results){
      // console.log( results.hits.total );
      // res.send(results);
      res.render("results.html", {
        results: results,
        agencies: require("./agencies"),
        agency: req.param("agency")
      });
    });
  },

  agencyFeed: function(req, res){
    agencyList(req.param('agency')).then(function(results){
      res.send(renderFeed(results));
    });
  },

  report: function(req, res) {
    get(req.param("report_id")).then(function(result) {
      res.render("report.html", {
        report: result._source
      });
    }, function(err) {
      console.log("Nooooo! " + err);
      res.render("report.html", {
        report: null
      });
    })
  }

};

function get(id) {
  return es.get({
    index: 'oversight',
    type: 'reports',
    id: id
  });
}

function agencyList(agency) {
  return es.search({
    index: 'oversight',
    type: 'reports',
    body: {
      "from": 0,
      "size": 10,
      query: {
        match: {
          agency: agency
        }
      }
    }
  });
}

function search(query) {
  return es.search({
    index: 'oversight',
    type: 'reports',
    body: {
      "from": 0,
      "size": 10,
      "query": {
        "filtered": {
          "query": {
            "query_string": {
            "query": query,
            "default_operator": "AND",
            "use_dis_max": true,
            "fields": ["text", "title", "summary"]
            }
          }
        }
      },
      "sort": [{
        "published_on": "desc"
      }],
      "highlight": {
        "fields": {
          "*": {}
        }
      },
      "_source": ["report_id", "year", "inspector", "agency", "title", "agency_name", "url", "landing_url", "inspector_url", "published_on", "type"]
    }
  });
}

var renderFeed = function(results) {
  var hits = results.hits.hits;
  var RSS = require('rss');
  var feed = new RSS({
    title: 'oversight.io',
    description: 'description',
    site_url: 'http://oversight.io',
    language: 'en',
    ttl: '60'
  });

  for (var i=0; i<hits.length; i++) {
    var report = hits[i]._source;
    feed.item({
      title:  report.title,
      content: report.text,
      url: 'http://oversight.io/report/'+report.inspector+'/'+report.report_id,
      date: report.published_on
    });
  }

  return feed.xml();

}