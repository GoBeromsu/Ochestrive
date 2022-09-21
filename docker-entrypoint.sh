dockerize -wait tcp://mysql:13306 -timeout 20s

echo "Start server"
node server.js