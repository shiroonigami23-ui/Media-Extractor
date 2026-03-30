cmake_minimum_required(VERSION 3.16)
project(media-engine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)

option(USE_FORTRAN "Link Fortran stream_metric.f90" OFF)

add_executable(media-engine
  src/main.cpp
  src/m3u8.cpp
  src/url.cpp
  src/fetch.cpp
  src/metrics_cpp.cpp
)

target_include_directories(media-engine PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include)

if(USE_FORTRAN)
  enable_language(Fortran)
  add_library(fortran_metric STATIC ${CMAKE_CURRENT_SOURCE_DIR}/../fortran/stream_metric.f90)
  target_link_libraries(media-engine PRIVATE fortran_metric)
  target_compile_definitions(media-engine PRIVATE USE_FORTRAN_METRICS=1)
endif()

if(MSVC)
  target_compile_definitions(media-engine PRIVATE _CRT_SECURE_NO_WARNINGS)
endif()
