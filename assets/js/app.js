var map, featureList, stopplaceSearch = [], quaySearch = [];

$(document).on("click", ".feature-row", function(e) {
  sidebarClick($(this).attr("id"));
});

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(stopplaces.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.dispatchChangeEvent()
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.dispatchChangeEvent()
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.dispatchChangeEvent()
});

function sidebarClick(id) {
  if (id === undefined) return;

  if (id.charAt(3) == 'S') {
     selectStopPlace(id);
  } else if (id.charAt(3) == 'Q') {
     selectQuay(id);
  }

  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", initTypeAhead());


function initTypeAhead () {
  $("#loading").hide();
  // map.fitBounds(stopplaces.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  addFeatures();

  var stopplacesBH = new Bloodhound({
    name: "Stopplaces",
//    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'quaycode'),

    datumTokenizer: function (d) {
      x = Bloodhound.tokenizers.whitespace(d.name);
      y = Bloodhound.tokenizers.whitespace(d.stopplacecode);
      z = Bloodhound.tokenizers.whitespace(d.town);
      return x.concat(y).concat(z);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: stopplaceSearch,
    limit: 10
  });

  stopplacesBH.initialize();

  var quayBH = new Bloodhound({
    name: "Quays",
//    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name', 'quaycode'),

    datumTokenizer: function (d) {
      x = Bloodhound.tokenizers.whitespace(d.name);
      y = Bloodhound.tokenizers.whitespace(d.quaycode);
      z = Bloodhound.tokenizers.whitespace(d.town);
      return x.concat(y).concat(z);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: quaySearch,
    limit: 10
  });

  quayBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Stopplaces",
    displayKey: "publicname",
    source: stopplacesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/museum.png' width='24' height='28'>&nbsp;Stopplaces</h4>",
      suggestion: Handlebars.compile(["{{name}}, {{town}}<br>&nbsp;<small>{{stopplacecode}}</small>"].join(""))
    }
  }, {
    name: "Quays",
    displayKey: "publicname",
    source: quayBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/museum.png' width='24' height='28'>&nbsp;Quays</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{quaycode}}</small>"].join(""))
    }

  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "quays") {
        selectQuay(datum.quaycode);
    } else if (datum.source === "stopplaces") {
        selectStopPlace(datum.stopplacecode);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");

  $("#searchform").show();
}
