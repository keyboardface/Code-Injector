/** 
 * get the requested template 
 * 
 * @param {string} _name 
 * @param {function} _cb 
 */
function getTemplate(_name, _cb){

    var elTmpl = document.querySelector('.template[data-name="'+_name+'"]');
    if (elTmpl === null) return null;

    var template = elTmpl.content.cloneNode(true); 
    if (template === undefined) return null;

    if (typeof _cb === 'function') _cb(template);

    return template;
}

/** 
 * loop an array/object 
 * 
 * @param {array|object|HTMLElementsCollection} _obj 
 * @param {function} _fn 
 */
function each(_obj, _fn){

    if (!_obj) return;
    
    if (_obj.constructor === Object){
        for(var ind = 0, keys = Object.keys(_obj), ln = keys.length; ind < ln; ind++)
            if (_fn.call(_obj[keys[ind]], keys[ind], _obj[keys[ind]]) === false) break;
    }
    else{ //if (_obj.constructor === Array){
        for(var ind = 0, ln = _obj.length; ind < ln; ind++)
            if (_fn.call(_obj[ind], ind, _obj[ind]) === false) break;
    }
}

/** 
 * Search from the _el parents the corresponding element with the _fn 
 * 
 * @param {HTMLElement} _el 
 * @param {string|function} _fn 
 */
function closest(_el, _fn) {
    var el = _el;
    var fn = _fn;

    if (typeof fn === 'string'){
        var query = fn.trim();
        if (query[0] === '.') 
            fn = function(_el) { return _el.classList.contains(query.substr(1)); };
        else
        if (query[0] === '#') 
            fn = function(_el) { return _el.id === query.substr(1); };
        else
            fn = function(_el) { return _el.tagName === query.toUpperCase(); };
    }

    while(el) if (fn(el)) return el;
                else el = el.parentElement;

    return null;
}

/**
 * remove the highlight from the page
 */
function clearSelection(){

    if (window.getSelection) 
        window.getSelection().removeAllRanges();

    else 
    if (document.selection)
        document.selection.empty();
}

/** 
 * convert a string to an DOM Element parsing it 
 * with a set of given parameters to be replaced 
 * 
 * @param {string} _string 
 * @param {object} _data 
 */
function stringToElement(_string, _data){

    if (_data && _data.constructor === Object){
        each(_data, function(_key){
            _string = _string.replace(new RegExp('\{'+_key+'\}', 'g'), this);
        });
    }

    var parser = new DOMParser();
    var doc = parser.parseFromString(_string, "text/html");

    return doc.body.firstElementChild;
}

/** 
 * remove every child nodes from the given element
 * 
 * @param {HTMLElement} _element 
 */
function emptyElement(_element){

    if (!_element) 
        return;

    while (_element.firstChild)
        _element.removeChild(_element.firstChild);
}

/** 
 * get the Element position index in the parent's childs list
 * 
 * @param {Element} _el 
 */
function getElementIndex(_el){

    var index = 0;
    var currEl = _el;

    while(currEl.previousElementSibling){
        currEl = currEl.previousElementSibling;
        index++;
    }

    return index; 
}

/** 
 * check if the given editor contains actual code (tripping the comments)
 * 
 * @param {MonacoEditor} _editor 
 */
function editorHasCode(_editor){ 
    return containsCode(_editor.getValue());
}

/** 
 * check if the given scring contains code (tripping the comments)
 * 
 * @param {string} _string 
 */
function containsCode(_string){
    return !!_string.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*|<!--[\s\S]*?-->$/gm, '').trim();
}

/** 
 * check if the given _path is local or remote 
 * 
 * @param {string} _path 
 */
function isLocalURL(_path){
    return !/^(?:[a-z]+:)?\/\//i.test(_path);
}

/** 
 * get the extension of a given string path (only "js", "css", "html" allowed)
 * 
 * @param {string} _path 
 */
function getPathExtension(_path){

    if (!_path) return '';

    try{
        _path = _path.trim();
        _path = isLocalURL(_path) ? 'file://local/'+_path : 'https://'+_path;

        var url = new URL(_path);
        var spl = url.pathname.split('.');
        var ext = spl.length > 1 && spl[0] && (spl.pop() || '').toLowerCase();
        if (ext === false) ext = '';

        return ext && ['js', 'css', 'html'].indexOf(ext) !== -1 ? ext : '';
    }
    catch(ex){
        return '';
    }    
    
    /*
    if (!_path) return '';

    var splitted = _path.trim().split('.');
    var ext = splitted.length > 1 && splitted[0] && (splitted.pop() || '').toLowerCase();
    if (ext === false) ext = '';

    return ext && ['js', 'css', 'html'].indexOf(ext) !== -1 ? ext : '';
    */
}

/**
 * remove HTML parts from a given string
 * 
 * @param {string} _string 
 */
function stripHTMLFromString(_string){
    var doc = new DOMParser().parseFromString(_string, 'text/html');
    return doc.body.textContent || "";
}

/**
 * parse the URL address of a given path
 * 
 * @param {*} _path 
 */
function parseURL(_path){

    var result = null;

    try{
        result = new URL(_path); 
    }
    catch(ex){}

    return result;
}

/** 
 * get the hostname of a given path
 * 
 * @param {string} _path 
 */
var getPathHost = (function(){
    
    var a = null;

    if (typeof document !== 'undefined' && document.createElement)
        a = document.createElement('a');

    return function(_path){

        if (!a) return _path;

        a.href = _path;

        return a.hostname;
    };

}());

/** 
 * download a text string as file
 * 
 * @param {string} _fileName 
 * @param {string} _textContent 
 */
var downloadText = (function(){
    
    var a = null;

    if (typeof document !== 'undefined' && document.createElement)
        a = document.createElement('a');
    
    return function(_fileName, _textContent){

        if (!a) return false;

        _fileName    = _fileName    || 'codeInjector';
        _textContent = _textContent || '';

        a.setAttribute('download', _fileName);
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(_textContent));

        a.style.display = 'none';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        return true;
    };

}());

// list of active
var rules = []; 

// settings
var settings = {};

// the currently active tabs data
var activeTabsData = {};

/**
 * @param {array} _rules 
 */
function serializeRules(_rules){

    /*
        {
            type: 'js',
            enabled: true,
            selector: 'google',
            topFrameOnly: rule.topFrameOnly,

            code: 'alert(true);',
        },
        {
            type: 'js',
            enabled: true,
            selector: 'google',
            topFrameOnly: rule.topFrameOnly,

            path: '/var/test.js'
            local: true
        }
    */
    
    var result = [];

    each(_rules, function(){

        // skip if the rule is not enabled
        if (!this.enabled) return;

        var rule = this;
        
        if (rule.code.files.length){
            each(rule.code.files, function(){
                var file = this;
                if (!file.ext) return;
                result.push({
                    type: file.ext,
                    enabled: rule.enabled,
                    selector: rule.selector,
                    topFrameOnly: rule.topFrameOnly,
                    path: file.path,
                    local: file.type === 'local',
                    onLoad: rule.onLoad
                });
            });
        }

        if (containsCode(rule.code.css)){
            result.push({
                type: 'css',
                enabled: rule.enabled,
                selector: rule.selector,
                topFrameOnly: rule.topFrameOnly,
                code: rule.code.css,
                onLoad: rule.onLoad
            });
        }

        if (containsCode(rule.code.html)){
            result.push({
                type: 'html',
                enabled: rule.enabled,
                selector: rule.selector,
                topFrameOnly: rule.topFrameOnly,
                code: rule.code.html,
                onLoad: rule.onLoad
            });
        }

        if (containsCode(rule.code.js)){
            result.push({
                type: 'js',
                enabled: rule.enabled,
                selector: rule.selector,
                topFrameOnly: rule.topFrameOnly,
                code: rule.code.js,
                onLoad: rule.onLoad
            });
        }

    });

    return result;
}

/** Inject the given set of rules
 * (must be parsed)
 * 
 * @param {array} _injectionObject 
 */
// Updated injection function for Manifest V3
async function injectRules(_injectionObject) {
    console.log('[CI Debug] Starting injection process:', _injectionObject);
    
    if (!_injectionObject.rules || (_injectionObject.rules.onLoad.length === 0 && _injectionObject.rules.onCommit.length === 0)) {
        console.log('[CI Debug] Skipping injection - no rules for this frame');
        return Promise.resolve();
    }

    if (!_injectionObject.info) {
        console.log('[CI Debug] Missing tab info');
        throw new Error('Unknown tab info.');
    }

    // Content script is already registered in manifest.json, no need to inject it again
    // Just send the message to the existing content script with retry logic
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            console.log('[CI Debug] Sending rules to content script, attempt:', retryCount + 1);
            // Small delay to ensure content script listener is ready
            if (retryCount === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            return await chrome.tabs.sendMessage(_injectionObject.info.tabId, _injectionObject.rules, {
                frameId: _injectionObject.info.frameId
            });
        } catch (error) {
            retryCount++;
            console.error('[CI Debug] Message send attempt failed:', error);
            if (retryCount === maxRetries) {
                throw error;
            }
            console.log('[CI Debug] Retrying in 50ms...');
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

/**
 * @param {info} _info 
 */
async function handleWebNavigationOnCommitted(_info) {
    console.log('[CI Debug] Navigation committed:', _info);
    updateActiveTabsData(_info);

    try {
        console.log('[CI Debug] Getting involved rules...');
        const involvedRules = await getInvolvedRules(_info, rules);
        console.log('[CI Debug] Involved rules:', involvedRules);

        console.log('[CI Debug] Splitting rules by injection type...');
        const splitRules = splitRulesByInjectionType(involvedRules);
        console.log('[CI Debug] Split rules:', splitRules);

        console.log('[CI Debug] Injecting rules...');
        await injectRules(splitRules);
        console.log('[CI Debug] Injection complete');
    } catch (error) {
        console.error('[CI Debug] Injection error:', error);
    }
}
/**  
 * @param {info} _info 
 */
function handleActivated(_info) {
    if (activeTabsData[_info.tabId]) {
        setBadgeCounter(activeTabsData[_info.tabId]);
    } else {
        chrome.tabs.get(_info.tabId, function(_tab) {
            updateActiveTabsData({
                parentFrameId: -1,
                tabId: _tab.id,
                url: _tab.url,
            });
        });    
    }
}

/**  
 * @param {object} _mex 
 */
function handleMessage(message, sender, sendResponse) {
    switch(message.action) {
        case 'inject':
            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                if (!tabs[0]) {
                    sendResponse({success: false, error: "Failed to get the current active tab."});
                    return;
                }

                let tab = { tabId: tabs[0].id, frameId: 0 };
                let rules = serializeRules([message.rule]);
                let injectionObject = splitRulesByInjectionType({rules: rules, info: tab});

                try {
                    await injectRules(injectionObject);
                    chrome.runtime.sendMessage({action: message.action, success: true});
                } catch (err) {
                    chrome.runtime.sendMessage({action: message.action, success: false, error: err.message});
                }
            });
            break;

        case 'get-current-tab-data':
            let activeTabData = activeTabsData[message.tabId];
            let sendData = function(_activeTabData) {
                let tabData = JSON.parse(JSON.stringify(_activeTabData || {}));
                chrome.runtime.sendMessage({action: message.action, data: tabData });
            };

            if (activeTabData && activeTabData.topURL) {
                sendData(activeTabData);
            } else {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    let tab = tabs[0] || {};
                    let tabData = createNewTabData({
                        parentFrameId: -1,
                        tabId: tab.id || -1,
                        url: tab.url || '',
                    }, true);

                    countInvolvedRules(tabData, function() {
                        sendData(tabData);
                    });
                });
            }
            break;
    }

    return true;
}



/**
 * @param {object} _tabData 
 */
function setBadgeCounter(_tabData) {
    let text = '';

    if (_tabData) {
        text = _tabData.getTotal();
        text = text ? String(text) : '';
    }

    if (!settings.showcounter) {
        text = '';
    }

    chrome.action.setBadgeText({ text: text });
}



/**
 * create a new tabData of the given tab if does not exist
 * @param {object} _info 
 */
function createNewTabData(_info, _reassign){

    // exit if the tabData already exist
    if (activeTabsData[_info.tabId] && _reassign !== true) return;

    // create a new ruleCounter of the given tab if does not exist
    var tabData = {
        id: _info.tabId,
        top: 0,
        inner: 0,
        topURL: '',
        innerURLs: [],

        getTotal: function(){
            return this.top + this.inner;
        },
        reset: function(){
            this.top = 0;
            this.topURL = '';
            this.inner = 0;
            this.innerURLs.length = 0;
        }
    };

    if (_info.parentFrameId === -1){
        tabData.topURL = _info.url;
    }     
    
    activeTabsData[_info.tabId] = tabData;

    return tabData;
}

/**
 * @param {object} _info 
 */
function updateActiveTabsData(_info){

    // create a new tabData of the given tab if does not exist
    createNewTabData(_info);

    // get the tabData of the given tab
    var tabData = activeTabsData[_info.tabId];

    // (reset the counters if it's the top-level frame)
    if (_info.parentFrameId === -1){
        tabData.reset();
        tabData.topURL = _info.url;
    } else {
        tabData.innerURLs.push(_info.url);
    }

    // update the tabData "top" and "inner" counters
    countInvolvedRules(tabData, function(){

        // update the badge
        setBadgeCounter(tabData);
    });
}

/**
 * return (in promise) the current active tab info
 */
function getActiveTab(){
    return new Promise((resolve) => {
        chrome.tabs.query({ active:true, currentWindow: true}, function(tabs){
            resolve(tabs[0]);
        });
    });
 }

/**
 * @param {object} _data 
 */
function handleStorageChanged(_changes, _areaName) {
    if (_changes.rules && _changes.rules.newValue) {
        rules = serializeRules(_changes.rules.newValue);
        chrome.storage.local.set({parsedRules: rules});
    }

    if (_changes.settings && _changes.settings.newValue) {
        settings = _changes.settings.newValue;
    }
}

/**
 * @param {object} _tabData 
 */
function countInvolvedRules(_tabData, _cb){
    
    if (!_tabData) return;

    clearTimeout(countInvolvedRules.intCounter);

    // wrapped in a timeout to reduce useless spam
    countInvolvedRules.intCounter = setTimeout(function(){
        chrome.storage.local.get('rules', function(_data){

            if (!_data.rules) return;

            // reset the counters
            _tabData.top = 0;
            _tabData.inner = 0;

            each(_data.rules, function(){
                var rule = this;

                if (new RegExp(rule.selector).test(_tabData.topURL)) {
                    _tabData.top++;
                } else {
                    if (rule.topFrameOnly) return;

                    each(_tabData.innerURLs, function(){
                        if (new RegExp(rule.selector).test(this)){
                            _tabData.inner++;
                            return false;
                        }
                    });
                }
            });

            _cb();
        });
    }, 250);

}

/**
 * @param {array} _rules 
 */
function splitRulesByInjectionType(_injectionObject){

    var splittedRules = { onLoad: [], onCommit: [] };

    each(_injectionObject.rules, function(){
        splittedRules[this.onLoad ? 'onLoad':'onCommit'].push(this);
    });

    _injectionObject.rules = splittedRules;
    
    return _injectionObject;
}

/**
 * @param {object} _info 
 * @param {array} _rules 
 */
function getInvolvedRules(_info, _rules){

    /*
        result = [
            {
                type: 'js',
                code: 'alert();',
            },
            {
                type: 'js',
                path: 'https://.../file.js',
            },
            ...
        ]
    */ 

    return new Promise(function(_ok, _ko){

        var result = [];
        var checkRule = function(_ind){ 
    
            // current rule being parsed
            var rule = _rules[_ind];
    
            // exit if there's no value in "rules" at index "_ind" (out of length)
            if (!rule)
                return _ok({rules: result, info: _info});
    
            // skip the current rule if not enabled
            if (!rule.enabled)
                return checkRule(_ind+1);
    
            // skip if the current rule can only be injected to the top-level frame 
            if (rule.topFrameOnly && _info.parentFrameId !== -1)
                return checkRule(_ind+1);

            // skip the current rule if the tap url does not match with the rule one
            if (!new RegExp(rule.selector).test(_info.url))
                return checkRule(_ind+1);

            // if 'path' exist then it's a rule of a file
            if (rule.path){
    
                // if it's a local file path
                if (rule.local){
                    readFile(rule.path, function(_res){
    
                        if (_res.success)
                            result.push({ type: rule.type, onLoad: rule.onLoad , code: _res.response });
                        else if (_res.message)
                            result.push({ type: 'js', onLoad: rule.onLoad , code: 'console.error(\'Code-Injector [ERROR]:\', \''+_res.message.replace(/\\/g, '\\\\')+'\')' });
    
                        checkRule(_ind+1);
                    });
                }
                else{
                    result.push({ type: rule.type, onLoad: rule.onLoad, path: rule.path});
                    checkRule(_ind+1);
                }
            }
            else{
                result.push({ type: rule.type, onLoad: rule.onLoad, code: rule.code});
                checkRule(_ind+1);
            }
        };
    
        // start to check rules
        checkRule(0);
    });
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/FileReader
/**
 * @param {string} _path    
 * @param {boolean} _local  
 * @param {function} _cb    
 */
function readFile(_path, _cb){

    _path = 'file://'+ _path;

    try{
        
        fetch(_path, { mode: 'same-origin' })
    
        .then(
            function(_res) {
                return _res.blob();
            },
            function(_ex){

                // fallback to XMLHttpRequest
                var xhr = new XMLHttpRequest();

                xhr.onload = function() {
                    _cb({ success: true, path: _path, response: xhr.response });
                };
                xhr.onerror = function(error) {
                    _cb({ success: false, path: _path, response: null, message: 'The browser can not load the file "'+_path+'". Check that the path is correct or for file access permissions.' });
                };

                xhr.open('GET', _path);
                xhr.send();

                throw "FALLBACK";
            }
        )
    
        .then(
            function(_blob) {

                if (!_blob) return _cb({ success: false, path: _path, response: null, message: '' });

                var reader = new FileReader();
    
                reader.addEventListener("loadend", function() {
                    _cb({ success: true, path: _path, response: this.result });
                });
                reader.addEventListener("error", function() {
                    _cb({ success: false, path: _path, response: null, message: 'Unable to read the file "'+_path+'".' });
                });
    
                reader.readAsText(_blob);
            },
            function(_ex){
                if (_ex !== "FALLBACK")
                    _cb({ success: false, path: _path, response: null, message: 'The browser can not load the file "'+_path+'".' });
            }
        );
    }
    catch(ex){
        _cb({ success: false, path: _path, response: null, message: 'En error occurred while loading the file "'+_path+'".' });
    }
}

/**
 *  Initialization
 */
async function initialize() {
    const data = await chrome.storage.local.get(null);
    if (data.parsedRules) {
        rules = data.parsedRules;
    }

    if (data.settings) {
        settings = data.settings;
    }
}

chrome.storage.onChanged.addListener(handleStorageChanged);
chrome.tabs.onActivated.addListener(handleActivated);
chrome.webNavigation.onCommitted.addListener(handleWebNavigationOnCommitted);
chrome.runtime.onMessage.addListener(handleMessage);

// start ->
initialize();

