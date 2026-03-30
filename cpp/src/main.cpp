#include "fetch.hpp"
#include "m3u8.hpp"
#include "url.hpp"
#include "httplib.h"
#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>

#ifdef USE_FORTRAN_METRICS
extern "C" double me_stream_metric(int n_variants, double max_bandwidth);
#else
extern "C" double me_stream_metric_cpp(int n_variants, double max_bandwidth);
#endif

static double stream_quality_score(int n, double maxbw) {
#ifdef USE_FORTRAN_METRICS
  return me_stream_metric(n, maxbw);
#else
  return me_stream_metric_cpp(n, maxbw);
#endif
}

static std::string json_escape(const std::string &s) {
  std::string o;
  o.reserve(s.size() + 8);
  for (char c : s) {
    if (c == '"' || c == '\\')
      o += '\\';
    o += c;
  }
  return o;
}

static std::string probe_body_to_json(const std::string &url, const std::string &body) {
  std::ostringstream js;
  js << "{\"url\":\"" << json_escape(url) << "\",";
  if (looks_like_hls(body)) {
    auto vars = parse_master_playlist(body);
    if (!vars.empty()) {
      int max_bw = 0;
      for (const auto &v : vars)
        max_bw = std::max(max_bw, v.bandwidth);
      js << "\"type\":\"hls_master\",\"variants\":[";
      for (size_t i = 0; i < vars.size(); ++i) {
        if (i)
          js << ',';
        std::string absu = resolve_against_base(url, vars[i].uri);
        js << "{\"bandwidth\":" << vars[i].bandwidth << ",\"width\":" << vars[i].width
           << ",\"height\":" << vars[i].height << ",\"uri\":\"" << json_escape(absu) << "\"}";
      }
      js << "],\"score\":" << stream_quality_score((int)vars.size(), (double)max_bw) << "}";
      return js.str();
    }
    auto segs = parse_media_playlist(body);
    if (!segs.empty()) {
      double total = 0;
      for (const auto &s : segs)
        total += s.duration;
      js << "\"type\":\"hls_media\",\"segments\":" << segs.size() << ",\"total_duration_sec\":"
         << total << ",\"first_segment\":\"" << json_escape(resolve_against_base(url, segs[0].uri))
         << "\"}";
      return js.str();
    }
  }
  js << "\"type\":\"unknown\",\"bytes\":" << body.size() << "}";
  return js.str();
}

static std::string probe_url(const std::string &url) {
  std::string body = curl_fetch(url);
  if (body.empty())
    return std::string("{\"error\":\"fetch_failed\",\"url\":\"") + json_escape(url) + "\"}";
  return probe_body_to_json(url, body);
}

static std::string extract_json_url_field(const std::string &req_body) {
  auto k = req_body.find("\"url\"");
  if (k == std::string::npos)
    return {};
  auto q = req_body.find('"', req_body.find(':', k) + 1);
  if (q == std::string::npos)
    return {};
  q = req_body.find('"', q + 1);
  if (q == std::string::npos)
    return {};
  auto q2 = req_body.find('"', q + 1);
  if (q2 == std::string::npos)
    return {};
  return req_body.substr(q + 1, q2 - q - 1);
}

int main(int argc, char **argv) {
  if (argc < 2) {
    std::cerr << "Media Engine (C++ core)\n"
              << "  " << argv[0] << " probe <url>     — fetch & parse HLS manifest, JSON to stdout\n"
              << "  " << argv[0] << " serve [port]    — local HTTP API for the browser extension (default 17474)\n";
    return 1;
  }
  std::string cmd = argv[1];
  if (cmd == "probe" && argc >= 3) {
    std::string url = argv[2];
    std::cout << probe_url(url) << "\n";
    return 0;
  }
  if (cmd == "serve") {
    int port = 17474;
    if (argc >= 3)
      port = std::atoi(argv[2]);
    httplib::Server svr;
    svr.set_default_headers({{"Access-Control-Allow-Origin", "*"},
                             {"Access-Control-Allow-Methods", "GET, POST, OPTIONS"},
                             {"Access-Control-Allow-Headers", "Content-Type"}});
    svr.Options(".*", [](const httplib::Request &, httplib::Response &res) { res.status = 204; });
    svr.Get("/health", [](const httplib::Request &, httplib::Response &res) {
      res.set_content("{\"ok\":true}", "application/json");
    });
    svr.Post("/probe", [](const httplib::Request &req, httplib::Response &res) {
      std::string u = extract_json_url_field(req.body);
      if (u.empty()) {
        res.status = 400;
        res.set_content("{\"error\":\"missing url\"}", "application/json");
        return;
      }
      res.set_content(probe_url(u), "application/json");
    });
    std::cerr << "media-engine listening on http://127.0.0.1:" << port << "\n";
    if (!svr.listen("127.0.0.1", port)) {
      std::cerr << "bind failed\n";
      return 1;
    }
    return 0;
  }
  std::cerr << "unknown command\n";
  return 1;
}
