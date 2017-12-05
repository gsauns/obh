<?php
$ini    = parse_ini_file('db.ini');
$dbhost = $ini['dbhost'];
$un     = $ini['un'];
$pw     = $ini['pw'];
$dbname = $ini['dbname'];

$mysqli = new mysqli("localhost", "meganmeg_admin", $pw, "meganmeg_wedding");

// get the HTTP method and path of the request
$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$table = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));
$key = array_shift($request)+0;

// check connection 
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

if (is_numeric($key)) {
    $sql = "select * from $table".($key?" WHERE id=$key":'');
}
else {
    $sql = "";
}

// excecute SQL statement
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