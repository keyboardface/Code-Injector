
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

// manifest JSON
var manifest = chrome.runtime.getManifest() || {};

// state of dragging 
var isDragging = false;

// timeout indexes
var unsavedChangesTimeout = null;
var editorCodeDotsTimeout = null;

// object of the current active tab
var currentTabData = {};

// rules id generator
var rulesCounter = 0;

// monaco editor object for each language block
var editorJS    = null;
var editorCSS   = null;
var editorHTML  = null;

// monaco editor config
var editorConfig = {
    cursorBlinking: "phase",
    fontSize: 11,
    folding: true,
    renderIndentGuides: true,
    renderLineHighlight: 'none',
    scrollbar: {
        verticalScrollbarSize: '0px'
    },
    minimap: {
        enabled: true,
        renderCharacters: false,
        showSlider: "always"
    }
};

// reserved vertical space for editor chrome (selector + controls)
var editorVerticalReservedSpace = 166;

// DOM elements references, assigned on itialization
var el = {};

// popup settings state
var popupSettings = {
    filterRulesByMatchingDomain: false,
    ruleIndexPrimaryLabel: 'domain'
};

// manual-injection state keyed by deterministic rule key
var injectedIds = new Set();

/**
 * normalize and return the configured rule index primary label
 *
 * @param {string} _value
 */
function normalizeRuleIndexPrimaryLabel(_value){
    return _value === 'title' ? 'title' : 'domain';
}

/**
 * compose the visible rule label in the rules list
 *
 * @param {string} _selector
 * @param {string} _title
 */
function getRuleDisplayLabel(_selector, _title){
    var selector = String(_selector || '').trim();
    var title = String(_title || '').trim();

    if (!title)
        return selector;

    return popupSettings.ruleIndexPrimaryLabel === 'title'
        ? title +' - '+ selector
        : selector +' - '+ title;
}

function normalizeRuleForInjectionKey(_rule){
    var rule = _rule || {};
    var code = rule.code || {};

    return {
        selector: String(rule.selector || '').trim(),
        enabled: rule.enabled === true,
        onLoad: rule.onLoad === true,
        topFrameOnly: rule.topFrameOnly !== false,
        code: {
            js: String(code.js || ''),
            css: String(code.css || ''),
            html: String(code.html || ''),
            files: (code.files || []).map(function(_file){
                return {
                    path: String((_file && _file.path) || ''),
                    type: String((_file && _file.type) || ''),
                    ext: String((_file && _file.ext) || '')
                };
            })
        }
    };
}

// djb2 hash -> short hex string. Must match the identical implementation in
// script/background.js so manual and auto injection produce the same ID for
// the same rule definition.
function hashStringToId(_str){
    var hash = 5381;
    for (var i = 0; i < _str.length; i++){
        hash = ((hash << 5) + hash + _str.charCodeAt(i)) | 0;
    }
    return 'ci_' + (hash >>> 0).toString(16);
}

function getInjectionRuleId(_rule){
    try{
        return hashStringToId(JSON.stringify(normalizeRuleForInjectionKey(_rule)));
    }
    catch(_x){
        return '';
    }
}

function setEditorInjectButtonState(_state){
    if (!el.editorInjectBtn) return;

    if (_state === 'loading'){
        el.editorInjectBtn.dataset.mode = 'loading';
        el.editorInjectBtn.innerHTML = '<i class="material-icons">\uE627</i>';
        el.editorInjectBtn.title = 'Working...';
        return;
    }

    var isInjected = _state === true;
    el.editorInjectBtn.dataset.mode = isInjected ? 'remove' : 'inject';
    el.editorInjectBtn.innerHTML = '<i class="material-icons">'+ (isInjected ? '\uE5CD' : '\uE3E7') +'</i>';
    el.editorInjectBtn.title = isInjected
        ? 'Remove injected nodes from this tab'
        : 'Inject';
}

function setRuleContextInjectState(_state){
    if (!el.rulesCtxMenu) return;

    var ctxInjectBtn = el.rulesCtxMenu.querySelector('[data-name="btn-rule-inject"]');
    if (!ctxInjectBtn) return;

    if (_state === 'loading'){
        ctxInjectBtn.dataset.mode = 'loading';
        ctxInjectBtn.innerHTML = '<i class="material-icons">\uE627</i> Working...';
        return;
    }

    var isInjected = _state === true;
    ctxInjectBtn.dataset.mode = isInjected ? 'remove' : 'inject';
    ctxInjectBtn.innerHTML = '<i class="material-icons">'+ (isInjected ? '\uE5CD' : '\uE3E7') +'</i> '+ (isInjected ? 'Remove' : 'Inject');
}

function refreshEditorInjectButtonState(){
    if (!el.editor || !el.editorInjectBtn || !el.body || !el.body.dataset.editing) return;

    var ruleData = getEditorPanelData();
    var ruleKey = getInjectionRuleId(ruleData);
    var isInjected = !!(ruleKey && injectedIds.has(ruleKey));
    setEditorInjectButtonState(isInjected);
}

function serializeRuleForManual(_rule){
    var rule = _rule || {};
    var code = rule.code || {};
    var files = Array.isArray(code.files) ? code.files : [];
    var result = [];

    each(files, function(){
        if (!this || !this.ext || !this.path) return;
        if (this.type === 'local') return;

        result.push({
            type: this.ext,
            selector: String(rule.selector || ''),
            topFrameOnly: rule.topFrameOnly === true,
            path: this.path,
            onLoad: rule.onLoad === true
        });
    });

    if (containsCode(code.css)){
        result.push({
            type: 'css',
            selector: String(rule.selector || ''),
            topFrameOnly: rule.topFrameOnly === true,
            code: String(code.css || ''),
            onLoad: rule.onLoad === true
        });
    }

    if (containsCode(code.html)){
        result.push({
            type: 'html',
            selector: String(rule.selector || ''),
            topFrameOnly: rule.topFrameOnly === true,
            code: String(code.html || ''),
            onLoad: rule.onLoad === true
        });
    }

    if (containsCode(code.js)){
        result.push({
            type: 'js',
            selector: String(rule.selector || ''),
            topFrameOnly: rule.topFrameOnly === true,
            code: String(code.js || ''),
            onLoad: rule.onLoad === true
        });
    }

    return result;
}

function splitManualRulesByInjectionType(_rules){
    var result = { onCommit: [], onLoad: [] };
    each(_rules, function(){
        result[this.onLoad ? 'onLoad':'onCommit'].push(this);
    });
    return result;
}

async function getActiveTabForManualInject(){
    var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs && tabs[0] ? tabs[0] : null;
}

async function sendInjectDirect(_ruleId, _ruleData){
    var tab = await getActiveTabForManualInject();
    if (!tab) return { success: false, error: 'No active tab' };

    var serialized = serializeRuleForManual(_ruleData);
    var splittedRules = splitManualRulesByInjectionType(serialized);
    if (!splittedRules.onCommit.length && !splittedRules.onLoad.length){
        return { success: false, error: 'Nothing to inject. Add JS, CSS, HTML, or valid remote file entries first.' };
    }

    try{
        await chrome.scripting.executeScript({
            target: { tabId: tab.id, frameIds: [0] },
            files: ['script/inject.js']
        });
        await chrome.tabs.sendMessage(tab.id, {
            __ci: 'inject',
            ruleId: _ruleId,
            rules: splittedRules
        }, {
            frameId: 0
        });
        return { success: true };
    }
    catch(ex){
        return { success: false, error: ex && ex.message ? ex.message : 'Failed to inject.' };
    }
}

async function sendRevertDirect(_ruleId){
    var tab = await getActiveTabForManualInject();
    if (!tab) return { success: true };

    try{
        await chrome.tabs.sendMessage(tab.id, {
            __ci: 'revert',
            ruleId: _ruleId
        }, {
            frameId: 0
        });
    }
    catch(_x){
        // If the tab navigated, there is nothing left to revert.
    }

    return { success: true };
}

async function sendListDirect(){
    var tab = await getActiveTabForManualInject();
    if (!tab) return [];

    // Inject the content script first so it can observe existing
    // data-code-injector tags even when nothing was manually injected on this
    // session (e.g. auto-inject fired before the popup opened, then was
    // dismissed). On restricted pages (chrome://, web store) this will throw
    // and we simply return an empty list.
    try{
        await chrome.scripting.executeScript({
            target: { tabId: tab.id, frameIds: [0] },
            files: ['script/inject.js']
        });
    }
    catch(_x){
        return [];
    }

    try{
        var response = await chrome.tabs.sendMessage(tab.id, { __ci: 'list' }, { frameId: 0 });
        return response && Array.isArray(response.ruleIds) ? response.ruleIds : [];
    }
    catch(_x){
        return [];
    }
}

// Ensures loading UI is visible long enough to be perceived. Without this,
// fast inject operations (<100ms) flash the spinner imperceptibly.
function withMinDuration(_promise, _minMs){
    var start = Date.now();
    return _promise.then(function(_value){
        var elapsed = Date.now() - start;
        var remaining = Math.max(0, _minMs - elapsed);
        if (!remaining) return _value;
        return new Promise(function(resolve){
            setTimeout(function(){ resolve(_value); }, remaining);
        });
    });
}

function refreshAllInjectButtonStates(){
    refreshEditorInjectButtonState();

    if (el.rulesCtxMenu && el.rulesCtxMenu.dataset.hidden === 'false' && el.rulesCtxMenu.dataset.id){
        var openRuleEl = document.querySelector('.rule[data-id="'+el.rulesCtxMenu.dataset.id+'"]');
        if (openRuleEl){
            var openRuleKey = getInjectionRuleId(getRuleData(openRuleEl));
            setRuleContextInjectState(!!(openRuleKey && injectedIds.has(openRuleKey)));
        }
    }
}

async function reconcileInjectedState(){
    var ids = await sendListDirect();
    injectedIds = new Set(ids);
    refreshAllInjectButtonStates();
}

/**
 * refresh each rule visible label from stored selector/title
 */
function refreshRulesDisplayLabels(){
    if (!el.rulesList) return;

    each(el.rulesList.children, function(){
        if (!this.classList || !this.classList.contains('rule')) return;

        var selector = (this.dataset.selector || '').trim();
        var title = (this.dataset.title || '').trim();
        var ruleName = this.querySelector('.r-name');
        if (!ruleName) return;

        ruleName.textContent = getRuleDisplayLabel(selector, title);
        ruleName.setAttribute('title', getRuleDisplayLabel(selector, title));
    });
}

/**
 * set the matching filter state in storage
 *
 * @param {boolean} _state
 */
function setFilterRulesByMatchingDomainSetting(_state){
    popupSettings.filterRulesByMatchingDomain = !!_state;

    chrome.storage.local.get('settings').then(function(_data){
        var settings = _data.settings && _data.settings.constructor === Object ? _data.settings : {};
        settings.filterRulesByMatchingDomain = popupSettings.filterRulesByMatchingDomain;
        chrome.storage.local.set({ settings: settings });
    });
}

/**
 * apply the current matching-domain filter state to the rules list
 */
function applyRulesMatchingDomainFilter(){
    if (!el.rulesList) return;

    var showOnlyMatching = popupSettings.filterRulesByMatchingDomain === true;
    var visibleRulesCounter = 0;
    var matchingRulesCounter = 0;

    each(el.rulesList.children, function(){
        if (!this.classList || !this.classList.contains('rule')) return;

        var ruleMatchesDomain = this.dataset.active === 'true' || this.dataset.innerActive === 'true';
        if (ruleMatchesDomain) matchingRulesCounter++;
        var shouldDisplay = showOnlyMatching === false || ruleMatchesDomain === true;

        this.dataset.visible = shouldDisplay;
        if (shouldDisplay) visibleRulesCounter++;
    });

    el.rulesList.dataset.filtermatching = showOnlyMatching;
    el.rulesList.dataset.filterempty = showOnlyMatching && visibleRulesCounter === 0;

    if (el.rulesMatchingBadge){
        el.rulesMatchingBadge.textContent = String(matchingRulesCounter);
        el.rulesMatchingBadge.dataset.empty = matchingRulesCounter === 0;
        el.rulesMatchingBadge.title = matchingRulesCounter === 1
            ? '1 rule matches the current tab URL'
            : matchingRulesCounter + ' rules match the current tab URL';
    }
}


/**
 * Initialize
 */
function initialize(){
    //var p = requireMonaco();

    // get the settings
    chrome.storage.local.get('settings').then(function(_data){
        
        if (_data.settings){

            // set the custom window size
            if (_data.settings.size){
                var size = _data.settings.size || { width: 500, height: 450 };
                setBodySize(size.width, size.height);
            }

            popupSettings.filterRulesByMatchingDomain = _data.settings.filterRulesByMatchingDomain === true;
            popupSettings.ruleIndexPrimaryLabel = normalizeRuleIndexPrimaryLabel(_data.settings.ruleIndexPrimaryLabel);
            refreshRulesDisplayLabels();
        }
    });

    // on load
    window.addEventListener('load', function(){

        // DOM elements references
        el = {
            body:           document.querySelector('#body'),
            hiddenInput:    document.querySelector('#body .txt-hidden'),
            rulesList:      document.querySelector('#rules .rules-list'),
            rulesCtxMenu:   document.querySelector('#rules .ctx-menu'),
            editor:         document.querySelector('#editor'),
            editorTitle:    document.querySelector('#editor .editor-selector [data-name="txt-editor-title"]'),
            editorInjectBtn: document.querySelector('#editor .editor-selector [data-name="btn-editor-inject"]'),
            editorToggleEnabledBtn: document.querySelector('#editor .editor-selector [data-name="btn-editor-toggle-enabled"]'),
            editorSelector: document.querySelector('#editor .editor-selector [data-name="txt-editor-selector"]'),
            editorDeleteBtn: document.querySelector('#editor [data-name="btn-editor-delete"]'),
            editorCancelBtn: document.querySelector('#editor [data-name="btn-editor-cancel"]'),
            editorSaveBtn:  document.querySelector('#editor [data-name="btn-editor-save"]'),
            tab:            document.querySelector('#editor .tab'),
            tabContents:    document.querySelector('#editor .tab .tab-contents'),
            filesList:      document.querySelector('#editor .files-list'),
            resizeLabelW:   document.querySelector('#resize .r-size-width'),
            resizeLabelH:   document.querySelector('#resize .r-size-height'),
            infoTitle:      document.querySelector('#info .info-header .ih-title'),
            filterRulesByMatchingDomain: document.querySelector('#rules [data-name="cb-filter-matching-domain"]'),
            rulesMatchingBadge: document.querySelector('#rules [data-name="rules-match-badge"]')
        };

        if (el.filterRulesByMatchingDomain)
            el.filterRulesByMatchingDomain.checked = popupSettings.filterRulesByMatchingDomain;

        setEditorInjectButtonState(false);

        // listen for background.js messages
        chrome.runtime.onMessage.addListener(handleOnMessage);

        // request the active tab info
        chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            chrome.runtime.sendMessage({ action: 'get-current-tab-data', tabId: tabs[0].id });
        });
        reconcileInjectedState();

        // request monaco editor
        requireMonaco().then(function(){

            // initialize the editors
            editorJS    = monaco.editor.create(document.querySelector('#editor-js')  , Object.assign(editorConfig, {language: 'javascript'}) );
            editorCSS   = monaco.editor.create(document.querySelector('#editor-css') , Object.assign(editorConfig, {language: 'css'})        );
            editorHTML  = monaco.editor.create(document.querySelector('#editor-html'), Object.assign(editorConfig, {language: 'html'})       );
        
            var onFocus = function(){
                el.tab.dataset.focus = true;
            };
            var onBlur = function(){
                el.tab.dataset.focus = false;
            };
    
            // assign events to the monaco editors
            editorJS.onDidFocusEditorWidget(onFocus);
            editorCSS.onDidFocusEditorWidget(onFocus);
            editorHTML.onDidFocusEditorWidget(onFocus);
    
            editorJS.onDidBlurEditorWidget(onBlur);
            editorCSS.onDidBlurEditorWidget(onBlur);
            editorHTML.onDidBlurEditorWidget(onBlur);
    
            // assign names to the editors inputarea
            document.querySelector('#editor-js .inputarea').dataset.name = "txt-editor-inputarea";
            document.querySelector('#editor-css .inputarea').dataset.name = "txt-editor-inputarea";
            document.querySelector('#editor-html .inputarea').dataset.name = "txt-editor-inputarea";

            // resize the monaco editors
            editorJS.layout();
            editorCSS.layout();
            editorHTML.layout();
    
            // stop loading
            delete document.body.dataset.loading;
            
            //if (el.infoTitle && manifest.description)
            //    el.infoTitle.dataset.description = manifest.description.trim().replace(/\(.*?\)/, '');
            
        });
        
        // set info page details
        if (el.infoTitle && manifest.version){
            el.infoTitle.dataset.version = 'v'+ manifest.version;
        }
    });
}

/**
 * require monaco editor scripts with promise
 */
function requireMonaco(){
    return new Promise(function(_resolve){
        require.config({ paths: { 'vs': '../script/vs' }});
        require(['vs/editor/editor.main'], _resolve);
    });
}

/**
 * updates the languages dots on each tabs (if contains code or not)
 */
function checkEditorDots(){
    clearTimeout(editorCodeDotsTimeout);

    editorCodeDotsTimeout = setTimeout(function(){

        var data = {
            js: editorJS.getValue(),
            css: editorCSS.getValue(),
            html: editorHTML.getValue(),
            files: []
        };

        // filter empty files
        each(el.filesList.children, function(){
            var input = this.querySelector('input');

            if (!(input && input.value.trim())) return;
            
            data.files.push(1);
        });

        el.tab.querySelector('.color-js').dataset.active = containsCode(data.js);
        el.tab.querySelector('.color-css').dataset.active = containsCode(data.css);
        el.tab.querySelector('.color-html').dataset.active = containsCode(data.html);
        el.tab.querySelector('.color-files').dataset.active = data.files.length > 0;


        // free data object

        data.files.length = 0;

        delete data.js;
        delete data.css;
        delete data.html;
        delete data.files;

        data = null;

    }, 1000);
}

/**
 * set the last istance while the editor panel is visible
 */
function setLastSession(){

    // check for code changes to set the languages dots
    checkEditorDots();
    // Preserve the transient loading UI while a manual inject/revert is pending.
    if (!el.editorInjectBtn || el.editorInjectBtn.dataset.mode !== 'loading'){
        refreshEditorInjectButtonState();
    }

    // stop the previous timeout if not fired yet
    clearTimeout(unsavedChangesTimeout);

    // exit if not in edit mode
    if (!el.body.dataset.editing) return;

    unsavedChangesTimeout = setTimeout(function(){
        if (el.body.dataset.editing
        &&  isDragging === false){
            chrome.storage.local.set({
                lastSession: getEditorPanelData()
            });
        }
    }, 750);
}

/**
 * set the popup window size
 * 
 * @param {number} _width 
 * @param {number} _height 
 */
function setBodySize(_width, _height){

    // set the new body size
    document.body.style.width  = _width  +'px';
    document.body.style.height = _height +'px';

    // set the editors container height
    var el = document.querySelector('.tab .tab-contents');
        el.style.height = (_height - editorVerticalReservedSpace) +'px';

    // resize the monaco editors
    if (editorJS) editorJS.layout();
    if (editorCSS) editorCSS.layout();
    if (editorHTML) editorHTML.layout();
}

/**
 * get the rule's data from a rule DOM Element 
 * 
 * @param {Element} _el 
 */
function getRuleData(_el){

    if (!_el) return null;
    if ( _el.className !== 'rule') return null;

    var ruleData = {

        enabled:        _el.dataset.enabled === 'true',
        onLoad:         _el.dataset.onload === 'true',
        topFrameOnly:   _el.dataset.topframeonly === 'true',
        title:          (_el.dataset.title || _el.querySelector('.d-title').value || '').trim(),
        selector:       (_el.dataset.selector || _el.querySelector('.r-name').textContent || '').trim(),

        code:{
            js:     _el.querySelector('.d-js').value,
            css:    _el.querySelector('.d-css').value,
            html:   _el.querySelector('.d-html').value,
            files:  JSON.parse(_el.querySelector('.d-files').value)
        }

    };

    return ruleData;

}

/**
 * set a rule's data to a rule DOM Element 
 * 
 * @param {Element} _el 
 * @param {Object} _data 
 */
function setRuleData(_el, _data){ 

    if (!_el) return null;
    if ( _el.className !== 'rule') return null;

    var selector = String(_data.selector || '').trim();
    var title = String(_data.title || '').trim();

    _el.dataset.selector = selector;
    _el.dataset.title = title;
    _el.querySelector('.r-name').textContent = getRuleDisplayLabel(selector, title);
    _el.querySelector('.r-name').setAttribute('title', getRuleDisplayLabel(selector, title));

    _el.querySelector('.color-js').dataset.active = containsCode(_data.code.js);
    _el.querySelector('.color-css').dataset.active = containsCode(_data.code.css);
    _el.querySelector('.color-html').dataset.active = containsCode(_data.code.html);
    _el.querySelector('.color-files').dataset.active = _data.code.files.length > 0;

    _el.querySelector('.r-data .d-title').value = title;
    _el.querySelector('.r-data .d-js').value = _data.code.js;
    _el.querySelector('.r-data .d-css').value = _data.code.css;
    _el.querySelector('.r-data .d-html').value = _data.code.html;
    _el.querySelector('.r-data .d-files').value = JSON.stringify(_data.code.files);

    _el.dataset.enabled      = _data.enabled === undefined ? true : _data.enabled;
    _el.dataset.onload       = _data.onLoad === undefined ? true : _data.onLoad;
    _el.dataset.topframeonly = _data.topFrameOnly === undefined ? true : _data.topFrameOnly;
    _el.dataset.active       = new RegExp(selector).test(currentTabData.topURL);
    _el.dataset.innerActive  = false;

    if (_el.dataset.topframeonly === 'false') {
        each(currentTabData.innerURLs, function(){
            if (new RegExp(selector).test(this)) {
                _el.dataset.innerActive = true;
            }
        });        
    }
}

/**
 * sync enabled toggle button label/state in editor header
 */
function refreshEditorEnabledToggle(){
    if (!el.editor || !el.editorToggleEnabledBtn) return;

    var cbEnabled = el.editor.querySelector('[data-name="cb-editor-enabled"]');
    if (!cbEnabled) return;

    var enabled = cbEnabled.checked === true;
    el.editorToggleEnabledBtn.dataset.enabled = enabled;
    el.editorToggleEnabledBtn.textContent = enabled ? 'Enabled' : 'Disabled';
    el.editorToggleEnabledBtn.title = enabled
        ? 'Click to disable this rule'
        : 'Click to enable this rule';
}

/**
 * sync delete button visibility/confirm state in editor footer
 */
function refreshEditorDeleteButton(){
    if (!el.editorDeleteBtn || !el.editor) return;

    var canDelete = el.editor.dataset.target && el.editor.dataset.target !== 'NEW';
    el.editorDeleteBtn.dataset.visible = canDelete;

    delete el.editorDeleteBtn.dataset.confirm;
    el.editorDeleteBtn.textContent = 'Delete';
    el.editorDeleteBtn.title = canDelete
        ? 'Delete this rule'
        : 'Delete is available after saving';
}

/**
 * set a rule's data to the editor panel 
 * 
 * @param {Object} _data 
 */
function setEditorPanelData(_data){

    var data = {
        target:         _data.target        || 'NEW',
        onLoad:         _data.onLoad        || false,
        enabled:        _data.enabled       || false,
        title:          _data.title         || '',
        selector:       _data.selector      || '',
        topFrameOnly:   _data.topFrameOnly  || false,

        code:{
            js:     _data.code.js    || '',
            css:    _data.code.css   || '',
            html:   _data.code.html  || '',
            files:  _data.code.files || [],
        },
    };

    // define if the languages contains code (or elements for the files one)
    data.active = {
        js: containsCode(data.code.js),
        css: containsCode(data.code.css),
        html: containsCode(data.code.html),
        files: data.code.files.length > 0
    };

    // check which is the tab panel that should be visible at first
    var activeTab = '';
         if (data.active.js) activeTab = 'js';
    else if (data.active.css) activeTab = 'css';
    else if (data.active.html) activeTab = 'html';
    else if (data.active.files) activeTab = 'files';
    else activeTab = 'js';

    // set the code into the editor
    editorJS.setValue(data.code.js);
    editorCSS.setValue(data.code.css);
    editorHTML.setValue(data.code.html);

    // stylish things..
    el.tab.querySelector('.color-js').dataset.active = data.active.js;
    el.tab.querySelector('.color-css').dataset.active = data.active.css;
    el.tab.querySelector('.color-html').dataset.active = data.active.html;
    el.tab.querySelector('.color-files').dataset.active = data.active.files;

    // insert the files list 
    emptyElement(el.filesList);
    data.code.files.push({type:'', path:''});
    each(data.code.files, function(){
        var file = this;
        el.filesList.appendChild( 
            getTemplate('file', function(_fragment){
                var elFile = _fragment.querySelector('.file');
                    elFile.dataset.type = file.type;
                    elFile.dataset.ext  = file.ext;

                var elInput = _fragment.querySelector('.file .f-input');
                    elInput.value = file.path;
            }) 
        );
    });

    // final assignments
    el.tab.dataset.selected = activeTab;
    el.editorTitle.value = data.title.trim();
    el.editorSelector.value = data.selector.trim();
    el.editorSelector.dataset.active = data.selector.trim() ? new RegExp(data.selector.trim()).test(currentTabData.topURL) : false;
    el.editorSelector.dataset.error = false;
    el.editor.dataset.target = data.target;
    el.editor.querySelector('[data-name="cb-editor-enabled"]').checked = data.enabled;
    el.editor.querySelector('[data-name="cb-editor-onload"]').checked = data.onLoad;
    el.editor.querySelector('[data-name="cb-editor-topframeonly"]').checked = data.topFrameOnly;
    refreshEditorEnabledToggle();
    refreshEditorDeleteButton();
    refreshEditorInjectButtonState();

    // set the focus on the URL pattern input
    // (after a timeout to avoid a performance rendering bug)
    setTimeout(function(){
        el.editorSelector.focus();
    }, 400);
}

/**
 * get the rule's data from the editor panel 
 */
function getEditorPanelData(){ 

    var data = {

        target:         el.editor.dataset.target,
        enabled:        el.editor.querySelector('[data-name="cb-editor-enabled"]').checked,
        onLoad:         el.editor.querySelector('[data-name="cb-editor-onload"]').checked,
        topFrameOnly:   el.editor.querySelector('[data-name="cb-editor-topframeonly"]').checked,
        title:          el.editorTitle.value.trim(),
        selector:       el.editorSelector.value.trim(),

        code:{
            js:     editorJS.getValue(),
            css:    editorCSS.getValue(),
            html:   editorHTML.getValue(),
            files:  []
        }

    };

    // get the files list data from the elements inside the files panel
    each(el.filesList.children, function(){
        var  path = this.querySelector('input').value.trim();
        if (!path) return;
        
        data.code.files.push({
            path: path,
            type: this.dataset.type,
            ext:  this.dataset.ext
        });
    });

    // try to convert the entered URL pattern
    // if fails it will be set as an empty string (which will be blocked later)
    try{
        var testSelector = new RegExp(data.selector).test(currentTabData.topURL);
    }
    catch(ex){
        data.selector = '';
    }

    return data;
}

/**
 * load the previous saved rules from the storage (on page load)
 */
function loadRules(){
    chrome.storage.local
    .get('rules')
    .then(function(_res){
        each(_res.rules, function(){

            var rule = this;
            var ruleEl = getTemplate('rule').querySelector('.rule');
                ruleEl.dataset.id = rulesCounter++;

            setRuleData(ruleEl, rule);

            el.rulesList.appendChild(ruleEl);
        });

        applyRulesMatchingDomainFilter();
    });
}

/**
 * convert and return a JSON of the current rules list from the rules elements
 */
function getRulesJSON(){

    var result = [];

    each(el.rulesList.children, function(){
        result.push(getRuleData(this));
    });

    return result;
}

/**
 * save the rules JSON in the storage
 */
function saveRules(){
    el.body.dataset.saving = true;

    chrome.storage.local.set({
        rules: getRulesJSON()
    })
    .then(function(){
        el.body.dataset.saving = false;
    });
}

/**
 * hide the action contextmenu 
 */
function hideRuleContextMenu(){

    // hide in progress
    if (el.rulesCtxMenu.dataset.hidden === "progress") return;

    el.rulesList.dataset.actionvisible = false;
    each(el.rulesList.querySelectorAll('[data-actionvisible]'), function(){
        this.dataset.actionvisible  = false;
    });

    
    el.rulesCtxMenu.dataset.hidden = "progress";
    setTimeout(function(){
        el.rulesCtxMenu.dataset.hidden = true;
    }, 200);
}

/**
 * show the action contextmenu 
 * @param {object} _config 
 */
function showRuleContextMenu(_config){

    // rule element required
    if (!_config.el) return;
    
    // highlight the linked rule
    el.rulesList.dataset.actionvisible = true;
    _config.el.dataset.actionvisible  = true;

    // set the contextmenu position
    var ul = el.rulesCtxMenu.querySelector('ul');
    
    ul.style.cssText = '';
    ul.style.right = (window.innerWidth - _config.x) +'px';
    
    if (window.innerHeight - _config.y < 248){
        ul.style.bottom = (window.innerHeight - _config.y) +'px';
        el.rulesCtxMenu.dataset.reversed = true;
    }
    else{
        ul.style.top = _config.y +'px';
        el.rulesCtxMenu.dataset.reversed = false;
    }

    // reference the rule "enabled" state
    el.rulesCtxMenu.querySelector('li[data-name="btn-rule-enabled"]').dataset.enabled = _config.el.dataset.enabled;

    // reference the rule id
    el.rulesCtxMenu.dataset.id = _config.el.dataset.id;

    var selectedRuleData = getRuleData(_config.el);
    var selectedRuleKey = getInjectionRuleId(selectedRuleData);
    setRuleContextInjectState(!!(selectedRuleKey && injectedIds.has(selectedRuleKey)));

    // show the context menu
    el.rulesCtxMenu.dataset.hidden = false;
}

/**
 * open a specific rule in the editor panel
 *
 * @param {Element} _ruleEl
 */
function openRuleInEditor(_ruleEl){
    if (_ruleEl === null) return;

    setEditorPanelData({
        target:         _ruleEl.dataset.id,
        enabled:        _ruleEl.dataset.enabled === "true",
        onLoad:         _ruleEl.dataset.onload === "true",
        topFrameOnly:   _ruleEl.dataset.topframeonly === "true",
        title:          (_ruleEl.dataset.title || _ruleEl.querySelector('.r-data .d-title').value || '').trim(),
        selector:       (_ruleEl.dataset.selector || _ruleEl.querySelector('.r-name').textContent || '').trim(),
        code:{
            js: _ruleEl.querySelector('.r-data .d-js').value,
            css: _ruleEl.querySelector('.r-data .d-css').value,
            html: _ruleEl.querySelector('.r-data .d-html').value,
            files: JSON.parse(_ruleEl.querySelector('.r-data .d-files').value),
        }
    });

    // hide the contextmenu if it's visible
    hideRuleContextMenu();

    // switch to the editor page
    el.body.dataset.editing = true;
}

/**
 * 
 * @param {object} _mex 
 * @param {object} _sender 
 * @param {function} _callback 
 */
function handleOnMessage(_mex, _sender, _callback){
    
    // fallback
    _callback = typeof _callback === 'function' ? _callback : function(){};

    // split by action 
    switch(_mex.action){
        case 'get-current-tab-data': 
            currentTabData = _mex.data || { topURL: '', innerURLs: [] };
            loadRules();
            break;
    }

    _callback();

    // return true to define the response as "async"
    return true;
}

// global events
window.addEventListener('keydown', function(_e){

    /*
        S: 83
        esc: 27
        ins: 45 
        tab: 9
        arrow_up: 38
        arrow_down: 40
        canc: 46
        enter: 13
    */
    
    // check the pressed key code
    switch(_e.keyCode){

        case 9: // TAB

            var target  = _e.target;
            var reverse = _e.shiftKey;
            var force   = _e.ctrlKey;                

            if (el.body.dataset.editing == 'true') 
            switch(target.dataset.name){

                case 'txt-editor-selector': 
                    if (reverse && el.editorTitle){
                        el.editorTitle.focus();
                        break;
                    }

                    switch(el.tab.dataset.selected){

                        case 'js':
                            editorJS.domElement.querySelector('textarea.inputarea').focus();
                            break;

                        case 'css':
                            editorCSS.domElement.querySelector('textarea.inputarea').focus();
                            break;

                        case 'html':
                            editorHTML.domElement.querySelector('textarea.inputarea').focus();
                            break;

                        case 'files':
                            if (reverse)
                                el.filesList.lastElementChild.querySelector('input').focus();
                            else
                                el.filesList.firstElementChild.querySelector('input').focus();
                            break;
                    }                        
                    break;

                case 'txt-editor-title':
                    if (el.editorSelector)
                        el.editorSelector.focus();
                    break;

                case 'txt-editor-inputarea': /* // TODO: [Do not work on linux]
                    if (!force) break;

                    var li = closest(target, 'li');

                    if (!li) break;

                    el.hiddenInput.focus();

                    switch(li.dataset.target){

                        case 'js': 
                            if (reverse){
                                el.tab.dataset.selected = 'files';

                                setTimeout(function(){
                                    el.filesList.lastElementChild.querySelector('input').focus();
                                    el.tab.dataset.focus = true;
                                }, 200);
                            }
                            else{
                                el.tab.dataset.selected = 'css';

                                setTimeout(function(){
                                    editorCSS.domElement.querySelector('textarea.inputarea').focus();
                                    el.tab.dataset.focus = true;
                                }, 200);
                            }
                            break;

                        case 'css': 
                            if (reverse){
                                el.tab.dataset.selected = 'js';

                                setTimeout(function(){
                                    editorJS.domElement.querySelector('textarea.inputarea').focus();
                                    el.tab.dataset.focus = true;
                                }, 200);
                            }
                            else{
                                el.tab.dataset.selected = 'html';

                                setTimeout(function(){
                                    editorHTML.domElement.querySelector('textarea.inputarea').focus();
                                    el.tab.dataset.focus = true;
                                }, 200);
                            }
                            break;

                        case 'html': 
                            if (reverse){
                                el.tab.dataset.selected = 'css';

                                setTimeout(function(){
                                    editorCSS.domElement.querySelector('textarea.inputarea').focus();
                                    el.tab.dataset.focus = true;
                                }, 200);
                            }
                            else{
                                el.tab.dataset.selected = 'files';

                                setTimeout(function(){
                                    el.filesList.firstElementChild.querySelector('input').focus();
                                    el.tab.dataset.focus = true;
                                }, 200);
                            }
                            break;
                    }*/
                    break;
                    
                case 'txt-file-path': 
                    var file = closest(target, '.file');

                    if (!file) break;

                    if (force){
                        if (reverse){
                            el.tab.dataset.selected = 'html';

                            setTimeout(function(){
                                editorHTML.domElement.querySelector('textarea.inputarea').focus();
                                el.tab.dataset.focus = true;
                            }, 200);
                        }
                        else{
                            el.tab.dataset.selected = 'js';

                            setTimeout(function(){
                                editorJS.domElement.querySelector('textarea.inputarea').focus();
                                el.tab.dataset.focus = true;
                            }, 200);
                        }
                        break;
                    }

                    if (reverse){
                        if (file.previousElementSibling)
                            file.previousElementSibling.querySelector('input').focus();
                        else
                            el.editorSelector.focus();
                    }
                    else{
                        if (file.nextElementSibling)
                            file.nextElementSibling.querySelector('input').focus();
                        else
                            el.editorSelector.focus();
                    }

                    break;

            }

            _e.preventDefault();
            _e.stopPropagation();
            return false;
            break;

        case 83: // S

            if (el.body.dataset.editing == 'true'){
                
                if (_e.ctrlKey === false && _e.metaKey === false) return;

                // CTRL + S  ||  COMMAND + S
                // simulate the save shortcut
                el.editorSaveBtn.click();

                _e.preventDefault();
                _e.stopPropagation();
                return false;
            }
            break;

        case 27: // ESC

            // close the editor page like pressing "Cancel"
            if (el.body.dataset.editing == 'true' && el.editorCancelBtn){
                el.editorCancelBtn.click();

                _e.preventDefault();
                _e.stopPropagation();
                return false;
            }

            // close rule action popup menu first (if visible)
            if (el.rulesCtxMenu && el.rulesCtxMenu.dataset.hidden !== 'true'){
                hideRuleContextMenu();

                _e.preventDefault();
                _e.stopPropagation();
                return false;
            }

            // Close the info page with just ESC
            if (el.body.dataset.info){
                delete el.body.dataset.info;

                _e.preventDefault();
                _e.stopPropagation();
                return false;
            }

            // close the extension popup when focused on rules index
            window.close();

            _e.preventDefault();
            _e.stopPropagation();
            return false;
            break;

    }

    // possible changes in a current editing process
    if (el.body.dataset.editing)
        setLastSession();

});
window.addEventListener('click', function(_e){

    var target = _e.target;
    var handled = false;

    // the event is handled by checking the "data-name" attribute of the target element 
    switch(target.dataset.name){

        // show the action contextmenu of a rule
        case 'btn-rule-action': 

            showRuleContextMenu({ 
                el: closest(target, '.rule'),
                x: _e.pageX, 
                y: _e.pageY
            }); 
            handled = true;
            break;

        // delete a rule
        case 'btn-rule-delete': 

            // if the button was in the "confirm" state
            // the button's relative rule is removed
            if (target.dataset.confirm){ 
                
                // get the rule element by using the id saved into the contextmen
                var elRule = document.querySelector('.rule[data-id="'+el.rulesCtxMenu.dataset.id+'"]');
                if (elRule === null) return;

                // start the slide animation
                elRule.dataset.removing = true;

                // wait few ms to let the animation end
                setTimeout(function(){
                    elRule.remove();
                    saveRules();
                    applyRulesMatchingDomainFilter();
                }, 200);

                // hide the contextmenu
                hideRuleContextMenu();
            }

            // set the "confirm" state to avoid miss-clicks
            else{
                target.dataset.confirm = true;
                target.onmouseleave = function(){ 
                    delete target.dataset.confirm;
                    target.onmouseleave = null;
                };
            }
            handled = true;
            break;

        // open the rule in the editor page
        case 'btn-rule-edit':

            // get the rule element by using the id saved into the contextmen
            var elRule = document.querySelector('.rule[data-id="'+el.rulesCtxMenu.dataset.id+'"]');
            openRuleInEditor(elRule);
            handled = true;
            break;

        // open the rule in the editor page
        case 'btn-rule-movetop':

            // get the rule element by using the id saved into the contextmen
            var elRule = document.querySelector('.rule[data-id="'+el.rulesCtxMenu.dataset.id+'"]');
            if (elRule === null) return;

            // move
            elRule.parentElement.insertBefore(elRule, elRule.parentElement.children[0]);

            // smooth scroll
            el.rulesList.scroll({
                top: 0, 
                left: 0, 
                behavior: 'smooth' 
            });

            // save the rules
            saveRules();
                        
            // hide the contextmenu
            hideRuleContextMenu();
            handled = true;
            break;

        // open the rule in the editor page
        case 'btn-rule-movebottom':

            // get the rule element by using the id saved into the contextmen
            var elRule = document.querySelector('.rule[data-id="'+el.rulesCtxMenu.dataset.id+'"]');
            if (elRule === null) return;

            // move
            elRule.parentElement.append(elRule);
            
            // smooth scroll
            el.rulesList.scroll({
                top: el.rulesList.scrollHeight, 
                left: 0, 
                behavior: 'smooth' 
            });
            
            // save the rules
            saveRules();

            // hide the contextmenu
            hideRuleContextMenu();
            handled = true;
            break;

        // open the rule in the editor page
        case 'btn-rule-enabled':

            // get the rule element by using the id saved into the contextmen
            var elRule = document.querySelector('.rule[data-id="'+el.rulesCtxMenu.dataset.id+'"]');
            if (elRule === null) return;

            // reference the rule "enabled" state
            var ctxOpt = el.rulesCtxMenu.querySelector('li[data-name="btn-rule-enabled"]');
            var state = ctxOpt.dataset.enabled == "true" ? false : true;

            // set the ned enabled state to both the rule element and the contextmenu option
            ctxOpt.dataset.enabled = state;
            elRule.dataset.enabled = state;

            // save the rules
            saveRules();
            handled = true;
            break;

        // open the rule in the editor page
        case 'btn-rule-inject':

            // get the rule element by using the id saved into the contextmen
            var elRule = document.querySelector('.rule[data-id="'+el.rulesCtxMenu.dataset.id+'"]');
            if (elRule === null) return;

            // get the rule data
            var ruleData = getRuleData(elRule);
            var ruleKey = getInjectionRuleId(ruleData);
            var wasInjected = injectedIds.has(ruleKey);
            var ctxInjectBtn = el.rulesCtxMenu.querySelector('[data-name="btn-rule-inject"]');

            setRuleContextInjectState('loading');
            if (el.editorInjectBtn) setEditorInjectButtonState('loading');

            withMinDuration(wasInjected ? sendRevertDirect(ruleKey) : sendInjectDirect(ruleKey, ruleData), 450)
            .then(function(_result){
                if (ctxInjectBtn){
                    ctxInjectBtn.onmouseleave = function(){
                        delete ctxInjectBtn.dataset.action;
                    };
                    ctxInjectBtn.dataset.action = _result && _result.success ? 'success' : 'fail';
                }

                // Re-derive state from the DOM so the UI matches reality even
                // if the tab reloaded mid-request or partial injection failed.
                return reconcileInjectedState();
            });
            handled = true;
            break;

        // set the active tab to be visible (handled by css)
        case 'btn-tab': 
            el.tab.dataset.selected = target.dataset.for;
            handled = true;
            break;

        // abor changes or the creation of a new rule
        case 'btn-editor-cancel': 
            delete el.body.dataset.editing;
            chrome.storage.local.remove('lastSession');
            handled = true;
            break;

        // delete the rule currently opened in the editor
        case 'btn-editor-delete':
            if (el.editor.dataset.target === 'NEW'){
                handled = true;
                break;
            }

            if (target.dataset.confirm){
                var linkedRule = el.rulesList.querySelector('.rule[data-id="'+el.editor.dataset.target+'"]');
                if (linkedRule){
                    linkedRule.dataset.removing = true;
                    setTimeout(function(){
                        linkedRule.remove();
                        saveRules();
                        applyRulesMatchingDomainFilter();
                    }, 200);
                }

                delete el.body.dataset.editing;
                chrome.storage.local.remove('lastSession');
            }
            else{
                target.dataset.confirm = true;
                target.textContent = 'Confirm?';
                target.onmouseleave = function(){
                    delete target.dataset.confirm;
                    target.textContent = 'Delete';
                    target.onmouseleave = null;
                };
            }

            handled = true;
            break;

        // toggle rule enabled state from the title row button
        case 'btn-editor-inject':
            var currentRuleData = getEditorPanelData();

            if (!currentRuleData.selector){
                el.editorSelector.dataset.error = true;
                handled = true;
                break;
            }

            var editorRuleKey = getInjectionRuleId(currentRuleData);
            var editorWasInjected = injectedIds.has(editorRuleKey);

            setEditorInjectButtonState('loading');

            withMinDuration(editorWasInjected ? sendRevertDirect(editorRuleKey) : sendInjectDirect(editorRuleKey, currentRuleData), 450)
            .then(function(){
                return reconcileInjectedState();
            });
            handled = true;
            break;

        // toggle rule enabled state from the title row button
        case 'btn-editor-toggle-enabled':
            var cbEnabled = el.editor.querySelector('[data-name="cb-editor-enabled"]');
            if (cbEnabled){
                cbEnabled.checked = !cbEnabled.checked;
                refreshEditorEnabledToggle();

                // persist immediately for existing rules
                if (el.editor.dataset.target !== 'NEW'){
                    var linkedRule = el.rulesList.querySelector('.rule[data-id="'+el.editor.dataset.target+'"]');
                    if (linkedRule){
                        linkedRule.dataset.enabled = cbEnabled.checked;
                        saveRules();
                    }
                }
            }
            handled = true;
            break;

        // open the editor page with empty values to create a new rule
        case 'btn-rules-add': 

            setEditorPanelData({
                target: 'NEW',
                onLoad:  true,
                topFrameOnly: true,
                enabled: true,
                activeTab: 'js',
                title: '',
                selector: '',
                code:{
                    js: '// Type your JavaScript code here.\n\n',
                    css: '/* Type your CSS code here. */\n\n',
                    html: '<!-- Type your HTML code here. -->\n\n',
                    files: []
                }
            });

            el.body.dataset.editing = true;
            handled = true;
            break;

        // save the editor page values to the linked rule (or a new one if not specified)
        case 'btn-editor-save': 

            var editorData = getEditorPanelData();
            var isNewRule = editorData.target === "NEW";
            var elRule = null;

            if (!editorData.selector){
                el.editorSelector.dataset.error = true;
                return;
            }

            if (isNewRule)
                elRule = getTemplate('rule').querySelector('.rule');
            else
                elRule = el.rulesList.querySelector('.rule[data-id="'+el.editor.dataset.target+'"]');

            setRuleData(elRule, editorData);

            if (isNewRule){
                elRule.dataset.id = rulesCounter++;
                el.rulesList.appendChild(elRule);

                setTimeout(function(){
                    delete elRule.dataset.new;
                }, 400);
            }

            delete el.body.dataset.editing;

            saveRules();
            applyRulesMatchingDomainFilter();

            chrome.storage.local.remove('lastSession');
            handled = true;
            break;

        // remove an element from the files list (if not the last one)
        case 'btn-file-delete': 
            var file = closest(target, '.file');
            if (file && el.filesList.children.length > 1){
                file.dataset.removing = true;

                setTimeout(function(){
                    file.remove();
                }, 200);
            }
            handled = true;
            break;

        // set the hostname of the current active tab address into the URL pattern input
        case 'btn-editor-gethost': 
            el.editorSelector.value = getPathHost(currentTabData.topURL).replace(/\./g, '\\.');
            el.editorSelector.dataset.active = true;
            el.editorSelector.focus();
            handled = true;
            break;
        
        // show the info page
        case 'btn-info-show': 
            el.body.dataset.info = true;
            handled = true;
            break;
        
        // hides the info page
        case 'btn-info-hide': 
            delete el.body.dataset.info;
            handled = true;
            break;

        // hides the info page
        case 'btn-rule-show-contextmenu': 
            el.rulesList.dataset.actionvisible = true;
            target.dataset.actionvisible = true;
            handled = true;
            break;

        // hides the action contextmenu
        case 'ctx-background':

            // hide the contextmenu
            hideRuleContextMenu();
            handled = true;
            break;

        case 'btn-general-options-show':

            // open the Web Extension option page
            chrome.runtime.openOptionsPage();
            handled = true;
            break;
    }

    // clicking a rule row opens it directly in the editor
    if (handled === false){
        var elRule = closest(target, '.rule');
        if (elRule
        &&  target.closest('.r-controls') === null
        &&  target.closest('.r-grip') === null)
            openRuleInEditor(elRule);
    }

    // possible changes in a current editing process
    if (el.body.dataset.editing)
        setLastSession();
    
});
window.addEventListener('mousedown', function(_e){

    var target = _e.target;

    // the event is handled by checking the "data-name" attribute of the target element 
    switch(target.dataset.name){

        // resize the window
        case 'window-resize-grip': 
            
            // save the current window size and cursor position
            var prevData = {
                x: _e.screenX,
                y: _e.screenY,
                w: window.innerWidth,
                h: window.innerHeight
            };

            // display the current size
            el.resizeLabelW.textContent = window.innerWidth;
            el.resizeLabelH.textContent = window.innerHeight;

            var evMM = function(_e){

                // set the new body size
                document.body.style.width  = prevData.w + (prevData.x - _e.screenX) +'px';
                document.body.style.height = prevData.h + (_e.screenY - prevData.y) +'px';

                // display the new size
                el.resizeLabelW.textContent = window.innerWidth;
                el.resizeLabelH.textContent = window.innerHeight;
            };
            var evMU = function(){

                // set the editors container height
                el.tabContents.style.height = (window.innerHeight - editorVerticalReservedSpace) +'px';

                // reset the css
                delete document.body.dataset.resizing;

                // hide the resize view
                editorJS.layout();
                editorCSS.layout();
                editorHTML.layout();

                // save the new window size into the storage 
                chrome.storage.local.get('settings').then(function(_data){
                    
                    var settings = {};

                    // get the local settings object if exist
                    if (_data.settings)
                        settings = _data.settings;

                    // set the new size
                    settings.size = {
                        width:  window.innerWidth,
                        height: window.innerHeight
                    };

                    // push in the storage
                    chrome.storage.local.set({ settings: settings });
                });

                // remove the events
                window.removeEventListener('mousemove', evMM);
                window.removeEventListener('mouseup', evMU);
            };
            
            // show the resize view
            document.body.dataset.resizing = true;

            // set the global events
            window.addEventListener('mousemove', evMM);
            window.addEventListener('mouseup', evMU);
            break;

        // drag and drop logic (valid for rules and files)
        case 'do-grip': 

            isDragging = true;
            clearSelection();

            var item    = closest(target, 'li');
            var parent  = item.parentElement;
            var ghost   = getTemplate('ghost').children[0];

            //var lastUpdate = Date.now();
            //var updateFrequency = 1000 / 90;

            var ruleIndex = getElementIndex(item);
            var Y = _e.screenY;

            var evMM = function(_e){

                //var timestampNow = Date.now();
                //if (timestampNow - lastUpdate > updateFrequency){
                //    lastUpdate = timestampNow;
                    item.style.transform = 'translateY('+(_e.screenY-Y)+'px)';
                //}

                var targetEl = closest(_e.target, function(_el){ return _el.parentElement === parent; });
                if (targetEl === null) return;

                var ghostIndex      = getElementIndex(ghost);
                var targetRuleIndex = getElementIndex(targetEl);

                if (targetRuleIndex < ghostIndex)
                    targetEl.parentElement.insertBefore(ghost, targetEl);
                else
                    targetEl.parentElement.insertBefore(ghost, targetEl.nextElementSibling);

                if (targetRuleIndex > ruleIndex)
                    item.style.marginTop = '0px';
                else
                    item.style.marginTop = '';
            };
            var evMU = function(){

                delete item.dataset.dragging;
                item.style.cssText = "";

                ghost.parentElement.insertBefore(item, ghost);
                ghost.remove();

                delete parent.dataset.dragging;

                window.removeEventListener('mousemove', evMM);
                window.removeEventListener('mouseup', evMU);

                if (item.className === 'rule')
                    saveRules();

                isDragging = false;
                clearSelection();
                
                // possible changes in a current editing process
                if (el.body.dataset.editing)
                    setLastSession();
            };

            item.dataset.dragging = true;
            item.parentElement.insertBefore(ghost, item);

            parent.dataset.dragging = true;

            window.addEventListener('mousemove', evMM);
            window.addEventListener('mouseup', evMU);
            break;

    }

});
window.addEventListener('input', function(_e){

    var target = _e.target;

    // the event is handled by checking the "data-name" attribute of the target element 
    switch(target.dataset.name){

        // check the editor URL pattern input value
        case 'txt-editor-selector': 
            target.dataset.error  = false;
            
            try{
                target.dataset.active = target.value.trim() ? new RegExp(target.value.trim()).test(currentTabData.topURL) : false;
            }
            catch(ex){
                target.dataset.active = false;
                target.dataset.error  = true;
            }
            break;

        // check the file path value to determinate if valid and the type
        case 'txt-file-path': 

            var file = closest(target, '.file');

            if (!target.value.length) {
                file.dataset.type = '';
                file.dataset.ext  = '';
                return;
            }

            if (file === file.parentElement.lastElementChild){
                var newFile = getTemplate('file').children[0];
                    newFile.dataset.new = true;

                el.filesList.appendChild(newFile);

                setTimeout(function(){
                    delete newFile.dataset.new;
                }, 200);
            }

            file.dataset.type = isLocalURL(target.value.trim()) ? 'local':'remote';
            file.dataset.ext  = getPathExtension(target.value);

            var typeSelect = file.querySelector('.f-type select');
                typeSelect.value = file.dataset.ext;
                typeSelect.setAttribute('title', file.dataset.ext ? file.dataset.type +' - '+ file.dataset.ext.toUpperCase() : 'Unknown (will be skipped)');
                
            break;
    }

    // possible changes in a current editing process
    if (el.body.dataset.editing)
        setLastSession();

});
window.addEventListener('change', function(_e){
    
    var target = _e.target;

    // the event is handled by checking the "data-name" attribute of the target element 
    switch(target.dataset.name){

        // force set the file extension type
        case 'sel-file-type': 
            var file = closest(target, '.file');
                file.dataset.ext = target.value;

            target.setAttribute('title', file.dataset.ext ? file.dataset.type +' - '+ file.dataset.ext.toUpperCase() : 'Unknown (will be skipped)');
            break;

        case 'cb-filter-matching-domain':
            setFilterRulesByMatchingDomainSetting(target.checked);
            applyRulesMatchingDomainFilter();
            break;

    }

});

// start ->
initialize();
