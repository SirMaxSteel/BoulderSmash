<?php

function endsWith($haystack, $needle)
{
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }

    return (substr($haystack, -$length) === $needle);
}

$directory = '../maps/';

if(! is_dir($directory))
{
    exit('invalid directory');
}

$maps = array();


//iterate through objects in folder

$files = scandir($directory);

for($i = 0; $i < count($files); $i++)
{
   $file = $files[$i];
    
    if(!$file || $file ==='' || $file === '.' || $file === '..' || !endsWith($file, '.json'))
        continue;

    $mapFile= $directory . $files[$i];

    if(!file_exists($mapFile))
        continue;

        
    $fileHandle = fopen($mapFile, 'r');
    
    $json = fread($fileHandle, filesize($mapFile));
    $json = utf8_encode($json);

    $json = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $json);

    $json = str_replace('&quot;', '"', $json);

    $maps[] = json_decode($json);

    
    fclose($fileHandle);     
}

echo json_encode($maps);

?>