using System;
using Crestron.SimplSharp;
using Crestron.SimplSharpPro;
using Crestron.SimplSharpPro.CrestronThread;

namespace WebsocketLogger
{
    public class ControlSystem : CrestronControlSystem
    {
        private WebLogger _log;
        private Thread _looper;

        public ControlSystem()
            : base()
        {
            try
            {
                Thread.MaxNumberOfUserThreads = 20;

                _log = new WebLogger();
            }
            catch (Exception e)
            {
                ErrorLog.Error("Error in Constructor: {0}", e.Message);
            }
        }

        public override void InitializeSystem()
        {
            try
            {
                _log.Start();
                _log.WriteLine("System is ready!");

                _looper = new Thread(Loop, null);
            }
            catch (Exception e)
            {
                ErrorLog.Error("Error in InitializeSystem: {0}", e.Message);
            }
        }

        private object Loop(object o)
        {
            while (true)
            {
                _log.WriteLine("Sleeping for 2 seconds...");
                Thread.Sleep(2000);
            }
        }
    }
}