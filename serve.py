import http.server, os
os.chdir('/Users/jieunkim/Desktop/phlocalyst')
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=8082, bind='127.0.0.1')
