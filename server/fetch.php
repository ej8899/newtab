<?php
/* 
usage:
http://yourwebsite.com/fetch_image.php?keyword=your_keyword_here (default is nature)

example:
https://erniejohnson.ca/tools/fetch.php?keyword=wolf
*/


$api_key = $_SERVER['UNSPLASH_API_KEY'];
$keyword = isset($_GET['keyword']) ? $_GET['keyword'] : 'nature'; // Default to 'nature' if no keyword is provided

// Set up the API endpoint
$endpoint = 'https://api.unsplash.com/photos/random';
$query = http_build_query([
    'query' => $keyword,
    'client_id' => $api_key,
    'orientation' => 'landscape',
]);

$url = $endpoint . '?' . $query;

// Initialize cURL session
$ch = curl_init($url);

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
    if (isset($data['urls']['regular'])) {
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
