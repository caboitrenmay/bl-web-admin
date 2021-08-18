npm run build:prod &&
pm2 delete static-page-server-4000 && pm2 -f serve dist --spa --port 4000
