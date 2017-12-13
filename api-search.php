<?php
$ini    = parse_ini_file('db.ini');
$dbhost = $ini['dbhost'];
$un     = $ini['un'];
$pw     = $ini['pw'];
$dbname = $ini['dbname'];

function autocompleteShows($text) {
    $result = "SELECT id,
                    headline AS text
                FROM mmj_shows
                WHERE headline LIKE '%$text%'";
    

    return $result;
}

function autocompleteSongs($text) {
    $result = "SELECT id,".
            " CONCAT(name, CASE WHEN length(original_artist) > 0 THEN CONCAT(' (',original_artist,')') ELSE '' END) AS text".
            " FROM mmj_songs".
            " WHERE name LIKE '%%$text%%'".
            " OR original_artist LIKE '%%$text%%'";


    return $result;
}

$mysqli = new mysqli("localhost", "meganmeg_admin", $pw, "meganmeg_wedding");

// get the HTTP method and path of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$customtype = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
$key = $mysqli->real_escape_string($_GET['q']);

// check connection 
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

switch ($customtype) {
    case "shows":
        $sql = autocompleteShows($key);
        break;
    case "songs":
        $sql = autocompleteSongs($key);
        break;
}

$result = mysqli_query($mysqli,$sql);

echo '{"results":[';
for ($i=0;$i<mysqli_num_rows($result);$i++) {
    echo ($i>0?',':'').json_encode(mysqli_fetch_object($result), JSON_NUMERIC_CHECK);
}
echo ']}';
//printf($sql);

$mysqli->close();

?>