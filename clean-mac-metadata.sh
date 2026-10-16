#!/usr/bin/env bash
# Script dọn dẹp file AppleDouble (._*) và .DS_Store trên USB / ổ ngoại vi

TARGET_DIR="${1:-.}"
echo "Đang dọn dẹp metadata macOS tại: $TARGET_DIR..."

if command -v dot_clean >/dev/null 2>&1; then
    dot_clean -m "$TARGET_DIR" 2>/dev/null || true
fi

find "$TARGET_DIR" \( -name "._*" -o -name ".DS_Store" \) -type f -delete 2>/dev/null || true
echo "Hoàn tất dọn dẹp metadata!"
