require "webrick"
include WEBrick

server = HTTPServer.new(
  :Port => 8080,
  :DocumentRoot => File.join(Dir::pwd, "public")
)
trap("INT"){ server.shutdown }
server.start

