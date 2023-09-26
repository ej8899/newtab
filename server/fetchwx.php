<?php
// Enable CORS headers to allow requests from your extension's origin
header("Access-Control-Allow-Origin: *"); // You can replace * with your extension's origin if possible
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");

// Load existing tokens and their timestamps from a JSON file
$tokensFile = 'fetchwxtokens.json';

// Function to verify if the token is valid and not rate-limited
function verifyAuthToken($token) {
    global $tokensFile;

    // Load existing tokens and timestamps
    $tokens = json_decode(file_get_contents($tokensFile), true);

    if (!$tokens) {
        $tokens = [];
    }

    // Check if the token exists in the list
    if (array_key_exists($token, $tokens)) {
        // Get the timestamp when the token was last used
        $lastUsedTimestamp = $tokens[$token];

        // Check if it's been more than 1 hour since the last use
        $currentTimestamp = time();
        $elapsedTime = $currentTimestamp - $lastUsedTimestamp;

        if ($elapsedTime >= 3600) {
            // Update the timestamp to the current time
            $tokens[$token] = $currentTimestamp;
            // TODO - might need to evaluate for file locking here
            file_put_contents($tokensFile, json_encode($tokens));

            // Token is valid, and it's been more than 1 hour since the last use
            return true;
        } else {
            // Token is rate-limited, return 401 Unauthorized
            http_response_code(401);
            exit;
        }
    } else {
        // Token is not in the list, add it with the current timestamp
        $tokens[$token] = time();
        file_put_contents($tokensFile, json_encode($tokens));

        // Token is valid
        return true;
    }
}

// Check if the Authorization header with a Bearer token is present in the request
if (isset($_SERVER['HTTP_AUTHORIZATION']) && preg_match('/^Bearer\s+(.*?)$/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
    $authToken = $matches[1];

    // Verify the authorization token
    if (verifyAuthToken($authToken)) {
        // Token is valid and not rate-limited, get the submitted 'city' parameter
        $city = isset($_GET['city']) ? $_GET['city'] : '';

        // Return the 'Success' message and the 'city' parameter
        echo "Success for city: $city";
    }
} else {
    // Authorization header is missing or not in the expected format, return 401 Unauthorized
    http_response_code(401);
}
?>
