{-# LANGUAGE OverloadedStrings #-}

-- | Thin orchestration layer: shells out to the C++ @media-engine@ binary
--   (probe / serve). Set @MEDIA_ENGINE@ to the full path if it is not on PATH.
module Main (main) where

import Control.Monad (unless)
import System.Environment (getArgs, getProgName, lookupEnv)
import System.Exit (ExitCode (..), exitFailure, exitWith)
import System.Info (os)
import System.IO (hPutStrLn, stderr)
import System.Process (readProcessWithExitCode)

defaultEngine :: FilePath
defaultEngine =
  if os == "mingw32"
    then "..\\cpp\\build\\Release\\media-engine.exe"
    else "../cpp/build/media-engine"

usage :: String -> IO ()
usage prog = do
  putStrLn "media-supreme-hs — Haskell façade over the C++ media-engine"
  putStrLn $ "  " ++ prog ++ " probe <url>          — JSON HLS/manifest probe (stdout)"
  putStrLn $ "  " ++ prog ++ " engine-path          — print resolved media-engine path"
  putStrLn ""
  putStrLn "Environment:"
  putStrLn "  MEDIA_ENGINE   Path to media-engine executable (optional if on PATH)."

resolveEngine :: IO FilePath
resolveEngine = do
  env <- lookupEnv "MEDIA_ENGINE"
  case env of
    Just p | not (null p) -> pure p
    _ -> pure defaultEngine

runEngine :: [String] -> IO String
runEngine args = do
  exe <- resolveEngine
  (code, out, err) <- readProcessWithExitCode exe args ""
  unless (null err) $ hPutStrLn stderr err
  case code of
    ExitSuccess -> pure out
    ExitFailure n -> do
      hPutStrLn stderr $ "media-engine exited with " ++ show n
      exitWith code

main :: IO ()
main = do
  args <- getArgs
  prog <- getProgName
  case args of
    ["probe", url] -> do
      out <- runEngine ["probe", url]
      putStr out
    ["engine-path"] -> resolveEngine >>= putStrLn
    _ -> usage prog >> exitFailure
