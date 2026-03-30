#pragma once
#include <string>

// Uses system curl (HTTPS). Empty string on failure.
std::string curl_fetch(const std::string &url);
