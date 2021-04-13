using System;
using System.Collections.Generic;
using Crestron.SimplSharp;
using WebsocketServer;

namespace WebsocketLogger
{
    class WebLogger
    {
        private WebsocketSrvr _server;
        private bool _clientConnected;

        private List<string> _backlog;

        public WebLogger()
        {
            try
            {
                _server = new WebsocketSrvr();
                _server.Initialize(54321);
                _server.OnClientConnectedChange += OnClientConnected;

                _backlog = new List<string>();

                _clientConnected = false;
            }
            catch (Exception e)
            {
                ErrorLog.Error("Exception in WebLogger constructor: {0}", e.Message);
            }
        }

        public void Start()
        {
            _server.StartServer();
        }

        public void Stop()
        {
            _server.StopServer();
        }

        public void WriteLine(string msg, params object[] args)
        {
            var text = String.Format(msg, args) + "\n";

            if (_clientConnected)
            {
                _server.SetIndirectTextSignal(1, text);
            }
            else
            {
                _backlog.Add(text);
            }
        }

        private void OnClientConnected(ushort state)
        {
            if (state == 0)
            {
                // Disconnected
                _clientConnected = false;
            }
            else
            {
                // Connected
                _clientConnected = true;
                _server.SetIndirectTextSignal(1, "\n-- CONNECTED --\n");

                if (_backlog.Count > 0)
                {
                    foreach (var msg in _backlog)
                    {
                        _server.SetIndirectTextSignal(1, msg);
                    }
                }

                _backlog.Clear();
            }
        }
    }
}
