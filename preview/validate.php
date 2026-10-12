<?php
// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method Not Allowed"
    ]);
    exit;
}

// Retrieve and sanitize inputs
$name = isset($_POST["agent_name"]) ? trim($_POST["agent_name"]) : "";
$email = isset($_POST["agent_email"]) ? trim($_POST["agent_email"]) : "";
$reason = isset($_POST["agent_reason"]) ? trim($_POST["agent_reason"]) : "";

$errors = [];

// 1. Validate Codename
if (empty($name)) {
    $errors["name"] = "Agent codename is required.";
} elseif (strlen($name) < 2) {
    $errors["name"] = "Agent codename must be at least 2 characters.";
} elseif (strlen($name) > 50) {
    $errors["name"] = "Agent codename must not exceed 50 characters.";
}

// 2. Validate Email
if (empty($email)) {
    $errors["email"] = "Email address is required.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors["email"] = "Please enter a valid secure email address.";
}

// 3. Validate Reason (optional)
if (!empty($reason) && strlen($reason) > 1000) {
    $errors["reason"] = "Motivation message must not exceed 1000 characters.";
}

// Determine if validation succeeded
if (empty($errors)) {
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Link Established. Welcome to E.O.M, Agent " . htmlspecialchars($name) . "!"
    ]);
} else {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "System override rejected. Please fix errors below.",
        "errors" => $errors
    ]);
}
exit;
