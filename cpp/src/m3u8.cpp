#include "m3u8.hpp"
#include <algorithm>
#include <cctype>
#include <regex>
#include <sstream>

static std::string trim(std::string s) {
  auto wsfront = std::find_if_not(s.begin(), s.end(), [](int c) { return std::isspace(c); });
  auto wsback = std::find_if_not(s.rbegin(), s.rend(), [](int c) { return std::isspace(c); }).base();
  if (wsfront >= wsback)
    return {};
  return std::string(wsfront, wsback);
}

static int parse_int_attr(const std::string &line, const char *key) {
  std::string pat = std::string(key) + "=";
  size_t p = line.find(pat);
  if (p == std::string::npos)
    return 0;
  p += pat.size();
  size_t end = line.find_first_of(",\r\n", p);
  std::string num = line.substr(p, end == std::string::npos ? end : end - p);
  try {
    return std::stoi(num);
  } catch (...) {
    return 0;
  }
}

static std::string parse_resolution(const std::string &line) {
  std::regex re("RESOLUTION=(\\d+)x(\\d+)");
  std::smatch m;
  if (std::regex_search(line, m, re)) {
    return m[1].str() + "x" + m[2].str();
  }
  return {};
}

bool looks_like_hls(const std::string &body) {
  return body.find("#EXTM3U") != std::string::npos;
}

std::vector<HlsVariant> parse_master_playlist(const std::string &body) {
  std::vector<HlsVariant> out;
  std::istringstream in(body);
  std::string line;
  std::string pending_inf;
  while (std::getline(in, line)) {
    line = trim(line);
    if (line.rfind("#EXT-X-STREAM-INF:", 0) == 0) {
      pending_inf = line;
      size_t uq = line.find("URI=\"");
      if (uq != std::string::npos) {
        uq += 5;
        size_t eq = line.find('"', uq);
        if (eq != std::string::npos) {
          HlsVariant v;
          v.bandwidth = parse_int_attr(line, "BANDWIDTH");
          std::string res = parse_resolution(line);
          if (!res.empty()) {
            size_t x = res.find('x');
            if (x != std::string::npos) {
              v.width = std::stoi(res.substr(0, x));
              v.height = std::stoi(res.substr(x + 1));
            }
          }
          v.uri = line.substr(uq, eq - uq);
          out.push_back(v);
          pending_inf.clear();
        }
      }
      continue;
    }
    if (!pending_inf.empty() && !line.empty() && line[0] != '#') {
      HlsVariant v;
      v.bandwidth = parse_int_attr(pending_inf, "BANDWIDTH");
      std::string res = parse_resolution(pending_inf);
      if (!res.empty()) {
        size_t x = res.find('x');
        if (x != std::string::npos) {
          v.width = std::stoi(res.substr(0, x));
          v.height = std::stoi(res.substr(x + 1));
        }
      }
      v.uri = line;
      out.push_back(v);
      pending_inf.clear();
    }
  }
  return out;
}

std::vector<MediaSegment> parse_media_playlist(const std::string &body) {
  std::vector<MediaSegment> out;
  std::istringstream in(body);
  std::string line;
  double pending_dur = 0;
  while (std::getline(in, line)) {
    line = trim(line);
    if (line.rfind("#EXTINF:", 0) == 0) {
      size_t comma = line.find(',');
      std::string num = line.substr(8, comma == std::string::npos ? line.size() - 8 : comma - 8);
      try {
        pending_dur = std::stod(num);
      } catch (...) {
        pending_dur = 0;
      }
      continue;
    }
    if (!line.empty() && line[0] != '#' && pending_dur >= 0) {
      MediaSegment s;
      s.duration = pending_dur;
      s.uri = line;
      out.push_back(s);
      pending_dur = 0;
    }
  }
  return out;
}
