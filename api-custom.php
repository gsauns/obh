<?php
$ini    = parse_ini_file('db.ini');
$dbhost = $ini['dbhost'];
$un     = $ini['un'];
$pw     = $ini['pw'];
$dbname = $ini['dbname'];

function getSetlistByShowId($show_id) {
    if (is_numeric($show_id)) {
        $result = "SELECT sl.*,
                shows.headline,
                shows.date,
                shows.location,
                songs.name,
                songs.original_artist
                FROM mmj_shows shows
                LEFT JOIN mmj_setlists sl
                    ON shows.id = sl.show_id 
                LEFT JOIN mmj_songs songs
                    ON sl.song_id = songs.id
                WHERE shows.id = $show_id
                ORDER BY COALESCE(sl.order,9999)";

        return $result;
    }
    else {
        return "";
    }
}

function getSongPlaysbySongId($song_id) {
    if (is_numeric($song_id)) {
        $result = "SELECT *
                FROM songplays
                WHERE song_id = $song_id
                ORDER BY date DESC,
                `order`";

        return $result;
    }
    else {
        return "";
    }
}

function getShowsBySongIds ($song_ids) {
    $where = '';
    
    if (count($song_ids) > 1) {
        // is this an array?
        $where = " WHERE sl.song_id IN (";
        $inclause = "";
        foreach ($song_ids as &$id) {
            if (is_numeric($id)) {
                $inclause = $inclause . $id . ",";
            }
        }
        $inlength = strlen($inclause);
        if ($inlength > 0) {
            $where = $where . substr($inclause, 0, $inlength-1);
        }
        $where = $where . ")";
    }
    elseif (count($song_ids) == 1) {
        $id = $song_ids[0];
        $where = " WHERE song_id = $id";
    }
    if (!empty($where)) {
        $result = "SELECT DISTINCT shows.*
                    FROM mmj_shows shows
                    INNER JOIN mmj_setlists sl 
                    ON shows.id = sl.show_id" . $where;

        return $result;
    }
    else {
        return "";
    }
}

$mysqli = new mysqli("localhost", "meganmeg_admin", $pw, "meganmeg_wedding");

// get the HTTP method and path of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$customtype = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
$param = reset($request);
$key = array_shift($request)+0;

// check connection 
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

switch ($customtype) {
    case "setlists":
        $sql = getSetlistByShowId($key);
        break;

    case "songplays":
        $sql = getSongPlaysbySongId($key);
        break;

    case "showsbysongs":
        $ids = explode(",", $param);
        $sql = getShowsBySongIds($ids);
        break;
}

// printf($sql);
// execute SQL statement
$result = mysqli_query($mysqli,$sql);
 
// die if SQL statement failed
if (!$result) {
  http_response_code(404);
  die(mysqli_error());
}

echo '[';
for ($i=0;$i<mysqli_num_rows($result);$i++) {
    echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
}
echo ']';

$mysqli->close();

?>