#include "fetch.hpp"
#include <cstdio>
#include <sstream>

static std::string shell_quote(const std::string &u) {
  std::ostringstream o;
  o << '"';
  for (char c : u) {
    if (c == '"' || c == '\\' || c == '$' || c == '`')
      o << '\\';
    o << c;
  }
  o << '"';
  return o.str();
}

std::string curl_fetch(const std::string &url) {
#ifdef _WIN32
  std::string cmd = "curl.exe -fsSL " + shell_quote(url);
  FILE *pipe = _popen(cmd.c_str(), "r");
  if (!pipe)
    return {};
  std::ostringstream out;
  char buf[8192];
  while (fgets(buf, sizeof(buf), pipe))
    out << buf;
  _pclose(pipe);
  return out.str();
#else
  std::string cmd = "curl -fsSL " + shell_quote(url);
  FILE *pipe = popen(cmd.c_str(), "r");
  if (!pipe)
    return {};
  std::ostringstream out;
  char buf[8192];
  while (fgets(buf, sizeof(buf), pipe))
    out << buf;
  pclose(pipe);
  return out.str();
#endif
}
