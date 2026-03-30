! Stream-quality heuristic (linked into C++ when USE_FORTRAN=ON)
function me_stream_metric(n_variants, max_bandwidth) bind(c, name="me_stream_metric")
  use, intrinsic :: iso_c_binding, only: c_int, c_double
  implicit none
  integer(c_int), value :: n_variants
  real(c_double), value :: max_bandwidth
  real(c_double) :: me_stream_metric
  real(c_double) :: x
  if (n_variants <= 0 .or. max_bandwidth <= 0.0_c_double) then
    me_stream_metric = 0.0_c_double
    return
  end if
  x = log(max_bandwidth / 100000.0_c_double)
  me_stream_metric = min(100.0_c_double, max(0.0_c_double, 15.0_c_double * x + 10.0_c_double))
end function me_stream_metric
