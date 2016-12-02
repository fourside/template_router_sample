require "webrick"
include WEBrick

server = HTTPServer.new(
  :Port => 8080,
  :DocumentRoot => File.join(Dir::pwd, "public")
)

class DummyJson < WEBrick::HTTPServlet::AbstractServlet
  def do_GET(req, res)
    res.body = <<EOF
{
  "list":[
    {"name": "hoge"},
    {"name": "fuga"},
    {"name": "piyo"}
  ]
}
EOF
    res.content_type = "application/json"
  end
end

server.mount("/api/list", DummyJson)
trap("INT"){ server.shutdown }
server.start

