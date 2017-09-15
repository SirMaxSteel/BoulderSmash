<?php

    $themeFile= '../assets/themes.json';

    if(!file_exists($themeFile))
        echo json_encode( '{ "errorMsg": "file themes.json does not exists in folder Assets" }');

        
    $fileHandle = fopen($themeFile, 'r');
    
    $json = fread($fileHandle, filesize($themeFile));
    $json = utf8_encode($json);

    $json = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $json);

    $json = str_replace('&quot;', '"', $json);

    $themes = json_decode($json);

    
    fclose($fileHandle);     

    echo json_encode($themes);

?>