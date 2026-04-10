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
    async function injectHTML(_rule, _cb){

        // it's a remote file if ".path" is defined 
        // !! cannot request remote HTML files
        if (_rule.path) {
            console.error("Code-Injector [HTML] - Cannot request remote HTML files.");
            _cb();
        }
        else{
            // Ensure document.body exists before injecting HTML
            if (!document.body) {
                await new Promise((resolve) => {
                    if (document.body) {
                        resolve();
                    } else {
                        const observer = new MutationObserver(() => {
                            if (document.body) {
                                observer.disconnect();
                                resolve();
                            }
                        });
                        observer.observe(document.documentElement, { childList: true });
                    }
                });
            }

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
        var rule = _rules.shift();
        if (rule === undefined) {
            return;
        }
    
        switch(rule.type) {
            case 'js': 
                injectJS(rule, insertRules.bind(null, _rules));
                break;
    
            case 'css': 
                injectCSS(rule, insertRules.bind(null, _rules));
                break;
    
            case 'html': 
                injectHTML(rule, insertRules.bind(null, _rules));
                break;
        }
    }

    function ensureDocumentReady() {
        return new Promise((resolve) => {
            // Resolve immediately if document is already interactive or complete
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                resolve();
            } else {
                // Use DOMContentLoaded for faster response (fires before 'load')
                window.addEventListener('DOMContentLoaded', resolve, { once: true });
            }
        });
    }

    async function handleOnMessage(_data, _sender, _callback) {
        try {
            // Inject onCommit rules IMMEDIATELY (don't wait for document ready)
            if (_data.onCommit && _data.onCommit.length) {
                insertRules([..._data.onCommit]); // Create a copy to prevent mutation
            }
    
            // Wait for document ready before injecting onLoad rules
            if (_data.onLoad && _data.onLoad.length) {
                await ensureDocumentReady();
                insertRules([..._data.onLoad]); // Create a copy to prevent mutation
            }
    
            if (typeof _callback === 'function') {
                return _callback(true);
            }
            return true;
        } catch (error) {
            console.error('[Code-Injector] Content script error:', error);
            return false;
        }
    }

    // messaging handler for push-based injection (popup "Inject" button)
    try{
        chrome.runtime.onMessage.addListener(handleOnMessage);
    }
    catch(_x){
        // Silently fail - this can happen in restricted contexts
    }

    // Pull-based injection: request rules from the background script.
    // This eliminates the race condition where background's sendMessage
    // arrives before this listener is registered.
    try {
        chrome.runtime.sendMessage(
            { action: 'get-injection-rules', url: window.location.href },
            function(response) {
                if (chrome.runtime.lastError || !response) return;

                if (response.onCommit && response.onCommit.length) {
                    insertRules([...response.onCommit]);
                }

                if (response.onLoad && response.onLoad.length) {
                    ensureDocumentReady().then(function() {
                        insertRules([...response.onLoad]);
                    });
                }
            }
        );
    } catch(_x) {
        // Silently fail - this can happen in restricted contexts
    }

}(window));