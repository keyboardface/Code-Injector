(function(window){ 
    
    // append a property to the given url trying to force the browser 
    // to do not load a previous cached version of the file
    function appendCache(_path){
        return _path + (_path.indexOf('?') !== -1 ? '&':'?') + 'cache=' + Date.now();
    }

    // inject a JavaScript block of code or request an external JavaScript file
    function injectJS(_rule, _cb){

        // it's a remote file if ".path" is defined 
        if (_rule.path){

            var el = document.createElement('script');

            el.setAttribute('type', 'text/javascript');
            el.onload = _cb;
            el.onerror = function(){
                console.error("Code-Injector [JS] - Error loading: " + _rule.path);
                _cb();
            };

            el.src = appendCache(_rule.path);
            
            document.documentElement.appendChild(el);
        }
        else{

            var el = document.createElement('script');
                el.textContent = _rule.code;

            document.documentElement.appendChild(el);
            
            _cb();
        }
    }

    // inject a CSS block of code or request an external CSS file
    function injectCSS(_rule, _cb){

        // it's a remote file if ".path" is defined 
        if (_rule.path){

            var el = document.createElement('link');

            el.setAttribute('type', 'text/css');
            el.setAttribute('rel', 'stylesheet');
            el.onload = _cb;
            el.onerror = function(){
                console.error("Code-Injector [CSS] - Error loading: " + _rule.path);
                _cb();
            };

            el.href = appendCache(_rule.path);
            
            document.documentElement.appendChild(el);
        }
        else{

            var el = document.createElement('style');
                el.textContent = _rule.code;

            document.documentElement.appendChild(el);

            _cb();
        }
    }

    // inject an HTML block of code 
    function injectHTML(_rule, _cb){

        // it's a remote file if ".path" is defined 
        // !! cannot request remote HTML files
        if (_rule.path) {
            console.error("Code-Injector [HTML] - Error, Cannot request remote HTML files.");
            _cb();
        }
        else{

            var parser = new DOMParser();
            var doc = parser.parseFromString(_rule.code, "text/html");

            while(doc.body.firstChild){
                document.body.appendChild(doc.body.firstChild);
            }

            _cb();
        }
    }

    // Main loop to inject the selected rules by type
    function insertRules(_rules) {
        console.log('[CI Debug] Starting rule insertion:', _rules);
        
        var rule = _rules.shift();
        if (rule === undefined) {
            console.log('[CI Debug] No more rules to insert');
            return;
        }
    
        console.log('[CI Debug] Inserting rule:', rule);
        switch(rule.type) {
            case 'js': 
                console.log('[CI Debug] Injecting JS');
                injectJS(rule, insertRules.bind(null, _rules));
                break;
    
            case 'css': 
                console.log('[CI Debug] Injecting CSS');
                injectCSS(rule, insertRules.bind(null, _rules));
                break;
    
            case 'html': 
                console.log('[CI Debug] Injecting HTML');
                injectHTML(rule, insertRules.bind(null, _rules));
                break;
        }
    }

    function ensureDocumentReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    async function handleOnMessage(_data, _sender, _callback) {
        console.log('[CI Debug] Message received in content script:', _data);
        try {
            console.log('[CI Debug] Checking document ready state:', document.readyState);
            await ensureDocumentReady();
            console.log('[CI Debug] Document ready');
    
            if (_data.onCommit && _data.onCommit.length) {
                console.log('[CI Debug] Injecting onCommit rules:', _data.onCommit);
                insertRules(_data.onCommit);
            }
    
            if (_data.onLoad && _data.onLoad.length) {
                console.log('[CI Debug] Injecting onLoad rules:', _data.onLoad);
                insertRules(_data.onLoad);
            }
    
            console.log('[CI Debug] Injection complete');
            if (typeof _callback === 'function') {
                return _callback(true);
            }
            return true;
        } catch (error) {
            console.error('[CI Debug] Content script injection error:', error);
            return false;
        }
    }

    // messaging handler
    try{
        // listen for extension messages
        chrome.runtime.onMessage.addListener(handleOnMessage);
    }
    catch(_x){
        console.error('[Code-Injector] Failed to listen for messages, Injection failed.', _x);
    }

}(window));