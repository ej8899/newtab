<?php
// Enable CORS headers to allow requests from your extension's origin
header("Access-Control-Allow-Origin: *"); // You can replace * with your extension's origin if possible
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");

// Specify the content type as JSON
header("Content-Type: application/json");

// Define the path to the version.json file
$filePath = "version.json";

// Check if the file exists
if (file_exists($filePath)) {
    // Read the file contents
    $jsonContent = file_get_contents($filePath);

    // Check if the JSON content is valid
    $jsonData = json_decode($jsonContent);

    if ($jsonData !== null) {
        // Output the JSON content
        echo json_encode($jsonData, JSON_PRETTY_PRINT);
    } else {
        // Return an error message if the JSON is invalid
        echo json_encode(["error" => "Invalid JSON"]);
    }
} else {
    // Return an error message if the file does not exist
    echo json_encode(["error" => "File not found"]);
}
?>
