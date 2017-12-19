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

function getItemFromSetlist ($ids, $table, $joincol, $foreigncol) {
    $where = '';
    
    if (count($ids) > 1) {
        // is this an array?
        $where = " WHERE sl.$foreigncol IN (";
        $inclause = "";
        foreach ($ids as &$id) {
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
    elseif (count($ids) == 1) {
        $id = $ids[0];
        $where = " WHERE sl.$foreigncol = $id";
    }
    if (!empty($where)) {
        $result = "SELECT DISTINCT main.*
                    FROM $table main
                    INNER JOIN mmj_setlists sl 
                    ON main.id = sl.$joincol" . $where;

        return $result;
    }
    else {
        return "";
    }
}

$mysqli = new mysqli("localhost", "meganmeg_admin", $pw, "meganmeg_wedding");

// get the HTTP method and path of the request
$method     = $_SERVER['REQUEST_METHOD'];
$request    = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$customtype = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
$param      = reset($request);
$key        = array_shift($request)+0;
$ids        = explode(",", $param);

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
        $sql = getItemFromSetlist($ids, "mmj_shows", "show_id", "song_id");
        break;

    case "songsbyshows":
        $sql = $sql = getItemFromSetlist($ids, "songs", "song_id", "show_id");
        break;
}

//printf($sql);
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