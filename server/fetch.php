<?php
// Enable CORS headers to allow requests from  extension's origin
header("Access-Control-Allow-Origin: *"); // replace * with your extension's origin if possible
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");


/* 
usage:
http://yourwebsite.com/fetch_image.php?keyword=your_keyword_here (default is nature)

example:
https://erniejohnson.ca/tools/fetch.php?keyword=wolf
*/


$api_key = $_SERVER['UNSPLASH_API_KEY'];
$keyword = isset($_GET['keyword']) ? $_GET['keyword'] : 'nature'; // Default to 'nature' if no keyword is provided

if ($keyword === 'trends') {
    $endpoint = 'https://api.unsplash.com/topics?client_id=' . $api_key;
} else {
    $endpoint = 'https://api.unsplash.com/photos/random';
    $query = http_build_query([
        'query' => $keyword,
        'client_id' => $api_key,
        'orientation' => 'landscape',
    ]);
    $endpoint .= '?' . $query;
}

// Initialize cURL session
$ch = curl_init($endpoint);

// Set cURL options
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);

// Execute the cURL session and get the response
$response = curl_exec($ch);

// Check for cURL errors
// Check for cURL errors
if ($response === false) {
    echo json_encode(['error' => 'Curl error: ' . curl_error($ch)]);
} else {
    // Parse the JSON response
    $data = json_decode($response, true);

    // Check if the response contains an image URL
    if (isset($data[0]['id'])) {
      // Return the Unsplash API data as JSON (topics)
      header('Content-Type: application/json');
      echo $response;
    } elseif (isset($data['urls']['regular'])) {
        // Return the Unsplash API data as JSON
        header('Content-Type: application/json');
        echo $response;
    } else {
         // If no image is found, return a JSON response with a local image URL
        $localImage = ['local_image_url' => 'http://www.erniejohnson.ca/tools/local-fallback-image.jpg'];
        header('Content-Type: application/json');
        echo json_encode($localImage);
    }
}

// Close the cURL session
curl_close($ch);
?>
