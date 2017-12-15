<?php
$ini    = parse_ini_file('../../db.ini');
$pw     = $ini['pw'];
$mysqli = new mysqli("localhost", "meganmeg_admin", $pw, "meganmeg_wedding");
$method = $_SERVER['REQUEST_METHOD'];

/* check connection */
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
$key = preg_replace('/[^a-z0-9_]+/i','',array_shift($request));

switch ($method) {
    case 'POST':
        $headline               = "'" . $mysqli->real_escape_string($_POST['headline']) . "'";
        $date                   = "'" . $mysqli->real_escape_string(date('Y-m-d', strtotime($_POST['date']))) . "'";
        $google_place_id        = empty($_POST['google_place_id']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['google_place_id']) . "'";
        $google_place_coords    = empty($_POST['google_place_coords']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['google_place_coords']) . "'";
        $location               = empty($_POST['location']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['location']) . "'";
        $address                = empty($_POST['address']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['address']) . "'";
        $city                   = empty($_POST['city']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['city']) . "'";
        $state                  = empty($_POST['state']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['state']) . "'";
        $zip                    = empty($_POST['zip']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['zip']) . "'";
        $country                = empty($_POST['country']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['country']) . "'";
        $notes 			        = empty($_POST['notes']) ? "NULL" : "'" . $mysqli->real_escape_string($_POST['notes']) . "'";
        $user                   = "'username'";
        $id                     = $mysqli->real_escape_string($_POST['id']);

        if (strlen($id) > 0) {
            $sql = "UPDATE mmj_shows ".
                " SET headline =  $headline, ".
                " date = $date, ".
                " google_place_id = $google_place_id, ".
                " google_place_coords = $google_place_coords, ".
                " location = $location, ".
                " address = $address, ".
                " city = $city, ".
                " state = $state, ".
                " zip = $zip, ".
                " country = $country, ".
                " notes = $notes, ".
                " updated_by = $user, ".
                " updated = NOW() ".
                " WHERE id = $id";

            $success_msg = "update";
        }
        else {
            $sql = "INSERT INTO mmj_shows ".
                "(headline, date, google_place_id, google_place_coords, location, address, city, state, zip, country, notes, created_by, created) ".
                "VALUES ($headline, $date, $google_place_id, $google_place_coords, $location, $address, $city, $state, $zip, $country,$notes, $user, NOW())";

            $success_msg = "insert";
        }
                
        break;

    case 'DELETE':
        if (is_numeric($key)) {
            $sql = "DELETE FROM mmj_shows WHERE id = $key";
        }
        else {
            $sql = "";    
        }

        $success_msg = "delete";
        break;
}

//printf($sql);
if ($mysqli->query($sql)) {
    if ($success_msg == "insert") {
        $newid = $mysqli->insert_id;
        $success_msg = $newid;
    }
	printf($success_msg);
}
else {
    printf("Error: %s\n", $mysqli->sqlstate);
}

$mysqli->close();

?>
