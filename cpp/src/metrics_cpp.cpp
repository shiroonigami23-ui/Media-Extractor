#include <algorithm>
#include <cmath>

// Pure C++ fallback when Fortran is not linked.
extern "C" double me_stream_metric_cpp(int n_variants, double max_bandwidth) {
  if (n_variants <= 0 || max_bandwidth <= 0)
    return 0;
  double x = std::log(max_bandwidth / 100000.0);
  return std::min(100.0, std::max(0.0, 15.0 * x + 10.0));
}
