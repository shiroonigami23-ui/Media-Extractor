#include "url.hpp"
#include <cstdlib>
#include <sstream>

bool split_http_url(const std::string &url, UrlParts &out) {
  auto pos = url.find("://");
  if (pos == std::string::npos)
    return false;
  out.scheme = url.substr(0, pos);
  size_t i = pos + 3;
  size_t slash = url.find('/', i);
  std::string hostport = (slash == std::string::npos) ? url.substr(i) : url.substr(i, slash - i);
  out.path_query = (slash == std::string::npos) ? "/" : url.substr(slash);

  size_t colon = hostport.find(':');
  if (colon != std::string::npos) {
    out.host = hostport.substr(0, colon);
    out.port = std::atoi(hostport.substr(colon + 1).c_str());
  } else {
    out.host = hostport;
    out.port = (out.scheme == "https") ? 443 : 80;
  }
  return true;
}

std::string resolve_against_base(const std::string &base_url, const std::string &rel) {
  if (rel.empty())
    return base_url;
  if (rel.rfind("http://", 0) == 0 || rel.rfind("https://", 0) == 0)
    return rel;
  size_t scheme = base_url.find("://");
  if (scheme == std::string::npos)
    return rel;
  size_t path_start = base_url.find('/', scheme + 3);
  std::string origin = (path_start == std::string::npos) ? base_url : base_url.substr(0, path_start);
  if (rel[0] == '/')
    return origin + rel;
  std::string base_path = (path_start == std::string::npos) ? "/" : base_url.substr(path_start);
  size_t last_slash = base_path.find_last_of('/');
  std::string dir = (last_slash == std::string::npos) ? "/" : base_path.substr(0, last_slash + 1);
  if (dir[0] != '/')
    dir = "/" + dir;
  return origin + dir + rel;
}
