#pragma once
#include <string>
#include <vector>

struct HlsVariant {
  int bandwidth = 0;
  int width = 0;
  int height = 0;
  std::string uri;
};

struct MediaSegment {
  double duration = 0;
  std::string uri;
};

// Parses HLS master or media playlist body.
std::vector<HlsVariant> parse_master_playlist(const std::string &body);
std::vector<MediaSegment> parse_media_playlist(const std::string &body);

bool looks_like_hls(const std::string &body);
