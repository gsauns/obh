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

$data = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'PUT':
        $headline       = $mysqli->real_escape_string($_PUT['headline']);
        $date           = date('Y-m-d', strtotime($_PUT['date']));
        $location       = $mysqli->real_escape_string($_PUT['location']);
        $address        = $mysqli->real_escape_string($_PUT['address']);
        $notes 			= $mysqli->real_escape_string($_PUT['notes']);
        $user           = "username";
        $id             = $mysqli->real_escape_string($_PUT['id']);

        $sql = "UPDATE mmj_shows ".
        " SET headline =  '$headline', ".
        " date = '$date', ".
        " location = '$location', ".
        " address = '$address', ".
        " notes = '$notes', ".
        " updated_by = '$user', ".
        " updated = NOW() ".
        " WHERE id = $id";

        break;
    case 'POST':
        $show_id        = $mysqli->real_escape_string($data['show_id']);
        $song_id        = $mysqli->real_escape_string($data['song_id']);
        $order          = $mysqli->real_escape_string($data['order']);
        $length         = empty($data['length']) ? "NULL" : $mysqli->real_escape_string($data['length']);
        $encore         = $mysqli->real_escape_string($data['encore']);
        $notes 		    = empty($data['notes']) ? "NULL" : "'".$mysqli->real_escape_string($data['notes'])."'";
        $user           = "username";
        $id             = $mysqli->real_escape_string($data['id']);

        

        if (strlen($id) > 0) {
            $sql = "UPDATE mmj_setlists ".
                " SET show_id = $show_id, ".
                " SET song_id = $song_id, ".
                " `order` = $order, ".
                " `length` = $length, ".
                " encore = $encore, ".
                " notes = $notes, ".
                " updated_by = '$user', ".
                " updated = NOW() ".
                " WHERE id = $id";

            $success_msg = "update";
        }
        else {
            $sql = "INSERT INTO mmj_setlists ".
                "(show_id, song_id, `order`, `length`, encore, notes, created_by, created) ".
                "VALUES ($show_id, $song_id, $order, $length, $encore, $notes, '$user', NOW())";

            $success_msg = "insert";
        }       
        break;

    case 'DELETE':
        $id = $mysqli->real_escape_string($_PUT['id']);

        $sql = "DELETE FROM mmj_shows WHERE id = $id";

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
