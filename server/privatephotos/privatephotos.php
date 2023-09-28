<?php
/* 
self hosted private images to use -- put this PHP in your folder with the images 
 - adjust client code as required
*/
$directory = __DIR__;
$files = scandir($directory);
$files = array_diff($files, array('.', '..'));

if (($key = array_search("privatephotos.php", $files)) !== false) {
    unset($files[$key]);
}

if (count($files) > 0) {
    $randomIndex = array_rand($files);
    $randomFile = $files[$randomIndex];
    $jsonResponse = json_encode($randomFile);
} else {
    $jsonResponse = json_encode("No files available.");
}

header('Content-Type: application/json');
echo $jsonResponse;
?>
