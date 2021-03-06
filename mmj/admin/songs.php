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
        break;
    case 'POST':
        $name               = $mysqli->real_escape_string($_POST['name']);
        $original_artist    = $mysqli->real_escape_string($_POST['original_artist']);
        $original_album     = $mysqli->real_escape_string($_POST['original_album']);
        $year_released      = empty($_POST['year_released']) ? "NULL" : $_POST['year_released'];
        $notes 			    = $mysqli->real_escape_string($_POST['notes']);
        $user               = "username";
        $id                 = $mysqli->real_escape_string($_POST['id']);

        if (strlen($id) > 0) {
            $sql = "UPDATE mmj_songs ".
                " SET name =  '$name', ".
                " original_artist = '$original_artist', ".
                " original_album = '$original_album', ".
                " year_released = $year_released, ".
                " notes = '$notes', ".
                " updated_by = '$user', ".
                " updated = NOW() ".
                " WHERE id = $id";

            $success_msg = "update";
        }
        else {
            $sql = "INSERT INTO mmj_songs ".
                "(name, original_artist, original_album, year_released, notes, created_by, created) ".
                "VALUES ('$name', '$original_artist', '$original_album', $year_released, '$notes', '$user', NOW())";

            $success_msg = "insert";
        }

        break;
}

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
