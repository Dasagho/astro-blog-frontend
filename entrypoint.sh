#!/bin/sh
set -e
npm run build
mkdir -p /run/nginx
exec nginx -g 'daemon off;'
