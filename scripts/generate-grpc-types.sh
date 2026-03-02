#!/bin/bash

# Script to generate TypeScript types from Protocol Buffer definitions
# This script creates TypeScript interfaces from proto files

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting gRPC TypeScript generation...${NC}"

# Directories
PROTO_DIR="proto"
OUT_DIR="src/lib/types/generated/grpc"

# Create output directory if it doesn't exist
mkdir -p "$OUT_DIR"

# Clean previous generated files
echo -e "${BLUE}Cleaning previous generated files...${NC}"
rm -rf "$OUT_DIR"/*

# Generate TypeScript definitions using protoc with ts plugin
echo -e "${BLUE}Generating TypeScript definitions...${NC}"

# Find protoc-gen-ts binary
PROTOC_GEN_TS="./node_modules/.bin/protoc-gen-ts"

# Generate for all proto files
npx grpc_tools_node_protoc \
  --plugin=protoc-gen-ts="$PROTOC_GEN_TS" \
  --ts_out="$OUT_DIR" \
  --js_out=import_style=commonjs,binary:"$OUT_DIR" \
  --grpc_out=grpc_js:"$OUT_DIR" \
  -I "$PROTO_DIR" \
  "$PROTO_DIR"/common/*.proto \
  "$PROTO_DIR"/services/*.proto

echo -e "${GREEN}✓ gRPC TypeScript generation completed successfully!${NC}"
echo -e "${BLUE}Generated files are in: $OUT_DIR${NC}"
