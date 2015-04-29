import BaseHTTPServer
import json
import os.path
import thread
import urlparse

#from os.path import dirname, join
#DOC_DIR = os.path.join(os.path.dirname(__file__), 'mmap_app')
#DOC_DIR=os.path.join(os.getcwd(),'MAVProxy/modules/mavproxy_mmap/mmap_app')
#DOC_DIR='/home/gwang/uav/MAVProxy/MAVProxy/modules/mavproxy_mmap/mmap_app'
from cherrypy import wsgiserver
import flask
from werkzeug import wsgi


app = flask.Flask(__name__)

DOC_DIR = os.path.join(os.path.dirname(__file__), 'mmap_app')

app.wsgi_app = wsgi.SharedDataMiddleware(
  app.wsgi_app,
  {'/': DOC_DIR})

class Error(Exception):
  pass


@app.route('/')
def index_view():
  return flask.redirect('/index.html')


class Server(BaseHTTPServer.HTTPServer):
  def __init__(self, handler, address='', port=9999, module_state=None):
    BaseHTTPServer.HTTPServer.__init__(self, (address, port), handler)
    self.allow_reuse_address = True
    self.module_state = module_state


class Handler(BaseHTTPServer.BaseHTTPRequestHandler):
  def do_GET(self):
    scheme, host, path, params, query, frag = urlparse.urlparse(self.path)
    

    if path == '/data':
      print('george')
      state = self.server.module_state
      data = {'lat': state.lat,
              'lon': state.lon,
              'heading': state.heading,
              'alt': state.alt,
              'airspeed': state.airspeed,
              'throttle': state.throttle,
              'groundspeed': state.groundspeed}
      self.send_response(200)
      self.end_headers()
      self.wfile.write(json.dumps(data))
    else:
      # Remove leading '/'.
      path = path[1:]
      # Ignore all directories.  E.g.  for ../../bar/a.txt serve
      # DOC_DIR/a.txt.
      #unused_head, path = os.path.split(path)
      #print(unused_head)
      # for / serve index.html.
      if path == '':
        path = 'index.html'
      content = None
      error = None
      try:
        with open(os.path.join(DOC_DIR, path), 'rb') as f:
          content = f.read()
      except IOError, e:
        error = str(e)
      if content:
        self.send_response(200)
        self.end_headers()
        self.wfile.write(content)
      else:
        self.send_response(404)
        self.end_headers()
        self.wfile.write('Error: %s' % (error,))


def start_server(address, port, module_state):
  server = Server(
    Handler, address=address, port=port, module_state=module_state)
  thread.start_new_thread(server.serve_forever, ())
  print(DOC_DIR)
  return server
