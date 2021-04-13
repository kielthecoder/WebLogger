var websocket = null;

function getBoundString(msg, startChar, stopChar)
{
    let response = "";
        
    if (msg != null && msg.length > 0)
    {
        let start = msg.indexOf(startChar);
            
        if (start >= 0)
        {
            start += startChar.length;
                
            let end = msg.indexOf(stopChar, start);
            
            if (start < end)
            {
                response = msg.substring(start, end);
            }
        }
    }
        
    return response;
}

function getBoundString_EndLastIndex(msg, startChar, stopChar)
{
    let response = "";
        
    if (msg != null && msg.length > 0)
    {
        let start = msg.indexOf(startChar);
            
        if (start >= 0)
        {
            start += startChar.length;
                
            let end = msg.lastIndexOf(stopChar);
            
            if (start < end)
            {
                response = msg.substring(start, end);
            }
        }
    }
        
    return response;
}	

function onMessage(event) 
{ 
    if (event != null)
    {
        const msg = event.data;
        
        //ON[CHANNEL]
        if (msg.indexOf("ON[") == 0)
        {
            const channel = parseInt(getBoundString(msg, "ON[", "]"), 10);
            
            /*
            if (isNaN(channel) == false)
            {
                var button = document.getElementById("fb" + channel);
                
                if (button != null)
                    button.style.background = "green";
            }
            */
        }
        //OFF[CHANNEL]
        else if (msg.indexOf("OFF[") == 0)
        {
            const channel = parseInt(getBoundString(msg, "OFF[", "]"), 10);

            /*
            if (isNaN(channel) == false)
            {
                var button = document.getElementById("fb" + channel);
                
                if (button != null)
                    button.style.background = "";
            }
            */
        }
        // LEVEL[LEVEL,VALUE]
        else if (msg.indexOf("LEVEL[") == 0)
        {
            const level = parseInt(getBoundString(msg, "LEVEL[", ","), 10);
            const value = parseInt(getBoundString(msg, ",", "]"), 10);					

            /*
            // set slider level
            var slider = document.getElementById("sliderInput" + level);
            
            if (slider != null)
                slider.value = value;
            
            // set feedback text
            var text = document.getElementById("analogValue" + level);
            
            if (text != null)
                text.innerHTML = "" + value;
            */
        }
        // STRING[SIG,DATA]
        else if (msg.indexOf("STRING[") == 0)
        {
            const text = parseInt(getBoundString(msg, "STRING[", ","), 10);
            const value = getBoundString_EndLastIndex(msg, ",", "]");					
                            
            // set receiving text
            const consoleElement = document.querySelector('#console');
            consoleElement.innerHTML += value;
        }
    }
}  

function doSend(message) 
{
    if (websocket !== null) {
        websocket.send(message); 
    }
}  

function socketclose()
{
    if (websocket !== null) {
        websocket.close();
    }
}

function doPush(channel)
{
    doSend("PUSH[" + channel + "]");
}

function doRelease(channel)
{
    doSend("RELEASE[" + channel + "]");
}

function sendLevel(sig)
{
    /*
    var inputRange = document.getElementById("sliderInput" + sig);

    if (inputRange != null)
        doSend("LEVEL[" + sig + "," + inputRange.value + "]");
    */
}

function sendString(sig)
{
    /*
    var inputText = document.getElementById("stringInput" + sig);
    
    if (inputText != null)
        doSend("STRING[" + sig + "," + inputText.value + "]");
    */
}

function startWebsocket() 
{ 
    const hostAddress = document.querySelector('#host');
    const ip = hostAddress.value;
    
    if (ip != '')
    {
        let wsUri = "ws://";

        if (ip.includes(':')) {
            wsUri += ip;
        }
        else {
            wsUri += ip + ":8081/";
        }
        
        websocket = new WebSocket(wsUri); 
        
        websocket.onopen = function (event) {
            const topArea = document.querySelector('#top');
            const connectBtn = document.querySelector('#connect');

            topArea.style.backgroundColor = 'lightgreen';
            connectBtn.innerHTML = 'Disconnect';
            connectBtn.style.backgroundColor = 'red';
            connectBtn.disabled = false;
        }; 
        
        websocket.onclose = function (event) { 
            const topArea = document.querySelector('#top');
            const hostAddress = document.querySelector('#host');
            const connectBtn = document.querySelector('#connect');

            topArea.style.backgroundColor = 'lightgray';
            connectBtn.innerHTML = 'Connect';
            connectBtn.style.backgroundColor = 'steelblue';
            hostAddress.disabled = false;
            connectBtn.disabled = false;
        }; 
        
        websocket.onmessage = function(event) { 
            onMessage(event) 
        }; 
        
        websocket.onerror = function(event) { 
            // todo
        };
    }
}

window.addEventListener("DOMContentLoaded", function () {
    const hostAddress = document.querySelector('#host');
    const connectBtn = document.querySelector('#connect');
    const clearBtn = document.querySelector('#clear');

    connectBtn.addEventListener('click', function () {
        if (hostAddress.value !== '') {
            if (connectBtn.innerHTML == 'Connect') {
                hostAddress.disabled = true;
                connectBtn.disabled = true;
                startWebsocket();
            }
            else {
                socketclose();
            }
        }
    });

    clearBtn.addEventListener('click', function () {
        const consoleElement = document.querySelector('#console');
        consoleElement.innerHTML = '';
    });
});  
