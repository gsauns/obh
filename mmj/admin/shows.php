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
        $headline       = $mysqli->real_escape_string($_POST['headline']);
        $date           = date('Y-m-d', strtotime($_POST['date']));
        $location       = $mysqli->real_escape_string($_POST['location']);
        $address        = $mysqli->real_escape_string($_POST['address']);
        $notes 			= $mysqli->real_escape_string($_POST['notes']);
        $user           = "username";
        $id             = $mysqli->real_escape_string($_POST['id']);

        if (strlen($id) > 0) {
            $sql = "UPDATE mmj_shows ".
                " SET headline =  '$headline', ".
                " date = '$date', ".
                " location = '$location', ".
                " address = '$address', ".
                " notes = '$notes', ".
                " updated_by = '$user', ".
                " updated = NOW() ".
                " WHERE id = $id";

            $success_msg = "update";
        }
        else {
            $sql = "INSERT INTO mmj_shows ".
                "(headline, date, location, address, notes, created_by, created) ".
                "VALUES ('$headline', '$date', '$location', '$address', '$notes', '$user', NOW())";

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
