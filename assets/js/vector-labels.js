var getText = function(feature, resolution) {
  var maxResolution = 3;
  var text = feature.get('publicname');
  var stopplacecode = feature.get('stopplacecode');

  if (resolution > maxResolution) {
    text = '';
  } else if (resolution < 1) {
    if (stopplacecode !== undefined)
    // text += '\n' + stopplacecode;
    text = stopplacecode;
  } else {
    text = stringDivider(text, 16, '\n');
  }

  return text;
};

var getText2 = function(feature, resolution) {
  var maxResolution = 1;
  var text = feature.get('publicname');
  var quaycode = feature.get('quaycode');

  if (resolution > maxResolution) {
    text = '';
  } else if (resolution < 0.5) {
    if (quaycode !== undefined)
    // text += '\n' + quaycode;
    text = quaycode;
  } else {
    text = stringDivider(text, 16, '\n');
  }

  return text;
};

var createTextStyle2 = function(feature, resolution) {
  var align = 'center';
  var baseline = 'middle';
  var font = 'Normal 12px Arial';
  var fillColor = "#aa3300";
  var outlineColor = "#ffffff";
  var outlineWidth = 3;
  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText2(feature, resolution),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: 0,
    offsetY: 15
  });
};

var createTextStyle = function(feature, resolution) {
  var align = 'center';
  var baseline = 'middle';
  var font = 'Normal 12px Arial';
  var fillColor = "#0000ff";
  var outlineColor = "#ffffff";
  var outlineWidth = 3;
  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution),
    fill: new ol.style.Fill({color: fillColor}),
    stroke: new ol.style.Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: 0,
    offsetY: 0
  });
};

function calculateRadius(feature, resolution) {
    return 2 + (2 / resolution);
}

// Polygons
var createPolygonStyleFunction = function() {
  return function(feature, resolution) {
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'blue',
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.1)'
      }),
      image: new ol.style.Circle({
        radius: calculateRadius(feature, resolution),
        fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
        stroke: new ol.style.Stroke({color: 'red', width: 1})
      }),
      text: createTextStyle(feature, resolution),
    }
    );
    return [style];
  };
};

var vectorPolygons = new ol.layer.Vector({
  source: new ol.source.GeoJSON({ projection: 'EPSG:3857', url: '/data/stopplaces.geojson' }),
  maxResolution: 200,
  style: createPolygonStyleFunction()
});

function selectQuay(id) {
    var features = vectorPoints.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i].get('quaycode') == id) {
            select.getFeatures().clear();
            select.getFeatures().push(features[i]);
            map.getView().fitExtent(features[i].getGeometry().getExtent(), map.getSize());

            return;
        }
    }
}

function selectStopPlace(id) {
    var features = vectorPolygons.getSource().getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i].get('stopplacecode') == id) {
            select.getFeatures().clear();
            select.getFeatures().push(features[i]);
            map.getView().fitExtent(features[i].getGeometry().getExtent(), map.getSize());

            return;
        }
    }
}

function addFeatures() {
    vectorPolygons.getSource().forEachFeature(function(feature) {
        stopplaceSearch.push({
        name: feature.get('publicname'),
        town: feature.get('town'),
        stopplacecode: feature.get('stopplacecode'),
        source: "stopplaces",
        coordinates: feature.get('geometry').getCoordinates()
        });
        //$("#feature-list tbody").append('<tr class="feature-row" id="'+feature.get('stopplacecode')+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">'+feature.get('publicname')+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
    });
    vectorPoints.getSource().forEachFeature(function(feature) {
        quaySearch.push({
        name: feature.get('publicname'),
        town: feature.get('town'),
        quaycode: feature.get('quaycode'),
        stopplacecode: feature.get('stopplacecoderef'),
        source: "quays",
        coordinates: feature.get('geometry').getCoordinates()
        });

        //$("#feature-list tbody").append('<tr class="feature-row" id="'+feature.get('stopplacecode')+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">'+feature.get('publicname')+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
    });
}

// Lines
var createLineStyleFunction = function() {
  return function(feature, resolution) {
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'green',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
        stroke: new ol.style.Stroke({color: 'red', width: 1})
      }),
      text: createTextStyle(feature, resolution)
    });
    return [style];
  };
};

/*
var vectorLines = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection: 'EPSG:3857',
    url: 'data/geojson/line-samples.geojson'
  }),
  style: createLineStyleFunction()
});
*/

// Points
var createPointStyleFunction = function() {
  return function(feature, resolution) {
    var style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
        stroke: new ol.style.Stroke({color: 'red', width: 1})
      }),
      text: createTextStyle2(feature, resolution)
    });
    return [style];
  };

};

var vectorPoints = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
    projection: 'EPSG:3857',
    url: '/data/quays.geojson'
  }),
  style: createPointStyleFunction(),
  maxResolution: 2
});

var select = new ol.interaction.Select({
        style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 100, 0, 1.0)',
        width: 3
      }),
      fill: new ol.style.Fill({
        color: 'rgba(0, 255, 0, 0.1)'
      }),

            image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({color: 'rgba(0, 255, 0, 0.1)'}),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 100, 0, 1.0)',
                width: 3
            })
            })
        })
        });

select.getFeatures().on('change:length', function(e) {

    if (e.target.getArray().length === 0) {
        // this means it's changed to no features selected
    } else {
        $("#feature-attr tbody").empty();
        $("#feature-list tbody").empty();
        // this means there is at least 1 feature selected
        for (var i = 0; i < e.target.getArray().length; i++) {
            var feature = e.target.item(i);
            if (feature.get('quaycode') === undefined) {
                $("#feature-name").text(feature.get('publicname'));
                var keys = feature.getKeys();
                $("#feature-name").text(feature.get('publicname'));

                for (k = 0; k < keys.length; k++) {
                    var val = feature.get(keys[k]);
                    if (keys[k] == 'geometry' || val === undefined || val == null) continue;

                    $("#feature-attr tbody").append('<tr class="attrib-row"><td>'+keys[k]+'</td><td>'+val+'</td><td></td></tr>');
                }

                var stopplacecode = feature.get('stopplacecode');
                $("#feature-list tbody").append('<tr class="feature-row" id="'+stopplacecode+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">'+stopplacecode+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

                for (var j = 0; j < quaySearch.length; j++) {
                    if (quaySearch[j].stopplacecode != stopplacecode) continue;
                    $("#feature-list tbody").append('<tr class="feature-row" id="'+quaySearch[j].quaycode+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">'+quaySearch[j].quaycode+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
                }

           } else {
                var quaycode = feature.get('quaycode');
                var keys = feature.getKeys();
                $("#feature-name").text(feature.get('publicname'));

                for (k = 0; k < keys.length; k++) {
                    var val = feature.get(keys[k]);
                    if (keys[k] == 'geometry' || val === undefined || val == null) continue;

                    $("#feature-attr tbody").append('<tr class="attrib-row"><td>'+keys[k]+'</td><td>'+val+'</td><td></td></tr>');
                }

                $("#feature-list tbody").append('<tr class="feature-row" id="'+quaycode+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/theater.png"></td><td class="feature-name">'+quaycode+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

                var stopplacecode = feature.get('stopplacecoderef');
                if (stopplacecode !== undefined) {
                    $("#feature-list tbody").append('<tr class="feature-row" id="'+stopplacecode+'"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/museum.png"></td><td class="feature-name">'+stopplacecode+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
                }
            }
        }
    }
});

var map = new ol.Map({
   interactions: ol.interaction.defaults().extend([ select ]),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM({
      url: 'http://{a-c}.tile.stamen.com/toner/{z}/{x}/{y}.png'
      }),
      opacity: 0.2
    }),
    vectorPolygons,
    vectorPoints
  ],
  target: 'map',
  view: new ol.View({
    center: [547619, 6825101],
    zoom: 9,
    minZoom: 9
  })
});

setTimeout(function() {
    if (quaySearch.length == 0) initTypeAhead();
}, 5000);

/**
 * @param {number} n The max number of characters to keep.
 * @return {string} Truncated string.
 */
String.prototype.trunc = String.prototype.trunc ||
    function(n) {
      return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
    };


// http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    var p = width;
    for (; p > 0 && (str[p] != ' ' && str[p] != '-'); p--) {
    }
    if (p > 0) {
      var left;
      if (str.substring(p, p + 1) == '-') {
        left = str.substring(0, p + 1);
      } else {
        left = str.substring(0, p);
      }
      var right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
}
