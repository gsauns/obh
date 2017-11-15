<?php
$ini    = parse_ini_file('../../db.ini');
$pw     = $ini['pw'];
$mysqli = new mysqli("localhost", "meganmeg_admin", $pw, "meganmeg_wedding");

/* check connection */
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

$name               = $mysqli->real_escape_string($_POST['name']);
$original_artist    = $mysqli->real_escape_string($_POST['original_artist']);
$original_album     = $mysqli->real_escape_string($_POST['original_album']);
$year_released      = $_POST['year_released'];
$notes 			    = $mysqli->real_escape_string($_POST['notes']);
$user               = "username";

$sql = "INSERT INTO mmj_songs ".
		"(name, original_artist, original_album, year_released, notes, created_by, created) ".
  		"VALUES ('$name', '$original_artist', '$original_album', '$year_released', '$notes', '$user', NOW())";

if (!$mysqli->query($sql)) {
    printf("Error: %s\n", $mysqli->sqlstate);
}
else {
	printf("success");
}

$mysqli->close();

?>
