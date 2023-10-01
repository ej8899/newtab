<?php
/* 
self hosted private images to use -- put this PHP in your folder with the images 
- adjust client code as required
*/

// Enable CORS headers to allow requests from your extension's origin
header("Access-Control-Allow-Origin: *"); // You can replace * with your extension's origin if possible
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");


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
