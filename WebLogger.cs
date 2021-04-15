using System;
using System.Collections.Generic;
using Crestron.SimplSharp;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace WebsocketLogger
{
    class WebLoggerService : WebSocketBehavior
    {
        private List<string> _backlog;

        public WebLoggerService(List<string> backlog)
        {
            _backlog = backlog;
        }

        protected override void OnOpen()
        {
            SendSerial(1, "-- CONNECTED --");

            if (_backlog.Count > 0)
            {
                foreach (var msg in _backlog)
                    SendSerial(1, msg);
            }

            _backlog.Clear();
        }

        protected override void OnClose(CloseEventArgs e)
        {
        }

        public void WriteLine(string msg, params object[] args)
        {
            var text = String.Format(msg, args);

            if (this.State == WebSocketState.Open)
                SendSerial(1, text);
            else
                _backlog.Add(text);
        }

        protected void SendSerial(ushort channel, string text)
        {
            // Encode data to match CCI's format
            Send(String.Format("STRING[{0},{1}]", channel, text));
        }
    }

    class WebLogger
    {
        private WebSocketServer _server;
        private WebLoggerService _logger;
        private List<string> _backlog;

        public WebLogger()
        {
            try
            {
                _backlog = new List<string>();
                _server = new WebSocketServer(54321);

                _server.AddWebSocketService<WebLoggerService>("/", () =>
                {
                    _logger = new WebLoggerService(_backlog);
                    return _logger;
                });
            }
            catch (Exception e)
            {
                ErrorLog.Error("Exception in WebLogger constructor: {0}", e.Message);
            }
        }

        public void Start()
        {
            _server.Start();
        }

        public void Stop()
        {
            _server.Stop();
        }

        public void WriteLine(string msg, params object[] args)
        {
            try
            {
                if (_logger == null)
                    _backlog.Add(String.Format(msg, args));
                else
                    _logger.WriteLine(msg, args);
            }
            catch (Exception e)
            {
                ErrorLog.Error("Exception in WriteLine: {0}", e.Message);
            }
        }
    }
}
