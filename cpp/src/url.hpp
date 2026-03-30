#pragma once
#include <string>

struct UrlParts {
  std::string scheme;
  std::string host;
  int port = 0;
  std::string path_query;
};

// Splits http(s) URL into parts for httplib::Client("https://host:port")
bool split_http_url(const std::string &url, UrlParts &out);

std::string resolve_against_base(const std::string &base_url, const std::string &relative);
