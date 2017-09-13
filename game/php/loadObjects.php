<?php

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}


$directory = '../objects/';

if(! is_dir($directory))
{
    exit('invalid directory');
}

$objects = array();


//iterate through objects in folder

$files = scandir($directory);

for($i = 0; $i < count($files); $i++)
{
    $objectFile = $directory . $files[$i];

    if($objectFile === '.' || $objectFile === '..' || !endsWith($objectFile, '.json'))
        continue;
        
    $fileHandle = fopen($objectFile, 'r');
    
    $objects[] = json_decode(fread($fileHandle, filesize($objectFile)));
    
    fclose($fileHandle);     
}

echo json_encode($objects);


?>