\copy (SELECT row_to_json(fc)
 FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type
      , ST_AsGeoJSON(ST_Transform(ST_SetSRID(ST_MakePoint(lg.rd_x, lg.rd_y), 28992), 4326), 5, 0)::json As geometry
          , row_to_json((SELECT l FROM (SELECT quaycode, quayname as publicname, stopplacecode) As l
                )) As properties
                   FROM chb.current_quay As lg   ) As f )  As fc
                   ) to '/tmp/quays.geojson';

\copy (SELECT row_to_json(fc)
 FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features
  FROM (SELECT 'Feature' As type
      , ST_AsGeoJSON(ST_Transform(surface, 4326), 5, 0)::json As geometry
          , row_to_json((SELECT l FROM (SELECT stopplacecode, publicname, street, town, stopplacetype) As l
                )) As properties
                   FROM chb.current_stopplace As lg JOIN (select stopplacecode, ST_ConvexHull(ST_Collect(ST_SetSRID(ST_MakePoint(rd_x, rd_y), 28992))) as surface FROM chb.current_quay GROUP BY stopplacecode) as geo USING (stopplacecode) ) As f )  As fc
                   ) to '/tmp/stopplaces.geojson';

