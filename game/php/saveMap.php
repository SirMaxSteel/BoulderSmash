<?php

$directory = '../maps/';

$json = file_get_contents('php://input');

$mapObject = json_decode($json);

$fileHandle = fopen($directory . $mapObject->name . '.json', 'w') or die('error');

fwrite($fileHandle, $json);

fclose($fileHandle);

echo $json;
echo 'success';

?>