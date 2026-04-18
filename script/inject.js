(function(window){
    if (window.__codeInjectorLoaded) return;
    window.__codeInjectorLoaded = true;

    var INJECTOR_ATTR = 'data-code-injector';
    var RULE_ID_ATTR = 'data-code-injector-rule-id';
    var AUTO_ID_ATTR = 'data-code-injector-auto';
    var VALID_RULE_ID = /^ci_[0-9a-f]+$/;

    // One-time cleanup: remove any injected nodes whose rule-id doesn't match
    // the current short-hash format (ci_<hex>). Catches leftovers from older
    // versions of this extension that wrote full JSON blobs as the ID.
    try{
        var legacy = document.querySelectorAll('[' + RULE_ID_ATTR + ']');
        for (var _li = 0; _li < legacy.length; _li++){
            var _lid = legacy[_li].getAttribute(RULE_ID_ATTR);
            if (_lid && !VALID_RULE_ID.test(_lid) && legacy[_li].parentNode){
                legacy[_li].parentNode.removeChild(legacy[_li]);
            }
        }
    }
    catch(_x){}

    function appendCache(_path){
        return _path + (_path.indexOf('?') !== -1 ? '&' : '?') + 'cache=' + Date.now();
    }

    function ensureDocumentReady() {
        return new Promise(function(resolve){
            if (document.readyState === 'interactive' || document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('DOMContentLoaded', resolve, { once: true });
            }
        });
    }

    function tagElement(_element, _ruleId, _fromAuto){
        if (!_element || _element.nodeType !== 1) return;
        try{
            _element.setAttribute(INJECTOR_ATTR, '');
            if (_ruleId) _element.setAttribute(RULE_ID_ATTR, _ruleId);
            if (_fromAuto) _element.setAttribute(AUTO_ID_ATTR, '');
        }
        catch(_x){
            // Some nodes (like text nodes slipped in) may not accept attributes.
        }
    }

    function removeTaggedElementsForRuleId(_ruleId){
        if (!_ruleId) return 0;
        var selector = '[' + RULE_ID_ATTR + '="' + cssEscape(_ruleId) + '"]';
        var nodes = document.querySelectorAll(selector);
        for (var ind = 0; ind < nodes.length; ind++){
            var node = nodes[ind];
            if (node && node.parentNode){
                node.parentNode.removeChild(node);
            }
        }
        return nodes.length;
    }

    function listInjectedRuleIds(){
        var selector = '[' + RULE_ID_ATTR + ']';
        var nodes = document.querySelectorAll(selector);
        var ids = {};
        for (var ind = 0; ind < nodes.length; ind++){
            var id = nodes[ind].getAttribute(RULE_ID_ATTR);
            if (id) ids[id] = true;
        }
        return Object.keys(ids);
    }

    function cssEscape(_value){
        if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(_value);
        return String(_value).replace(/["\\]/g, '\\$&');
    }

    function injectJS(_rule, _ruleId, _fromAuto){
        return new Promise(function(resolve){
            var el = document.createElement('script');
            el.setAttribute('type', 'text/javascript');
            tagElement(el, _ruleId, _fromAuto);

            if (_rule.path){
                el.onload = resolve;
                el.onerror = function(){
                    console.error("Code-Injector [JS] - Error loading: " + _rule.path);
                    resolve();
                };
                el.src = appendCache(_rule.path);
                document.documentElement.appendChild(el);
            } else {
                el.textContent = _rule.code || '';
                document.documentElement.appendChild(el);
                resolve();
            }
        });
    }

    function injectCSS(_rule, _ruleId, _fromAuto){
        return new Promise(function(resolve){
            var el;
            if (_rule.path){
                el = document.createElement('link');
                el.setAttribute('type', 'text/css');
                el.setAttribute('rel', 'stylesheet');
                tagElement(el, _ruleId, _fromAuto);
                el.onload = resolve;
                el.onerror = function(){
                    console.error("Code-Injector [CSS] - Error loading: " + _rule.path);
                    resolve();
                };
                el.href = appendCache(_rule.path);
                document.documentElement.appendChild(el);
            } else {
                el = document.createElement('style');
                tagElement(el, _ruleId, _fromAuto);
                el.textContent = _rule.code || '';
                document.documentElement.appendChild(el);
                resolve();
            }
        });
    }

    function injectHTML(_rule, _ruleId, _fromAuto){
        return ensureDocumentReady().then(function(){
            if (_rule.path){
                console.error("Code-Injector [HTML] - Cannot request remote HTML files.");
                return;
            }

            var parser = new DOMParser();
            var doc = parser.parseFromString(_rule.code || '', 'text/html');
            var target = document.body || document.documentElement;
            while (doc.body.firstChild){
                var node = doc.body.firstChild;
                target.appendChild(node);
                if (node.nodeType === 1){
                    tagElement(node, _ruleId, _fromAuto);
                }
            }
        });
    }

    function injectRule(_rule, _ruleId, _fromAuto){
        switch(_rule.type){
            case 'js':   return injectJS(_rule, _ruleId, _fromAuto);
            case 'css':  return injectCSS(_rule, _ruleId, _fromAuto);
            case 'html': return injectHTML(_rule, _ruleId, _fromAuto);
            default:     return Promise.resolve();
        }
    }

    function runRulesBatch(_rules, _ruleId, _fromAuto){
        return (_rules || []).reduce(function(_prev, _rule){
            return _prev.then(function(){
                // Per-item ruleId overrides the batch default. Auto-inject passes
                // the hash per emitted entry so multiple rules stay distinguishable.
                var effectiveRuleId = (_rule && _rule.ruleId) ? _rule.ruleId : _ruleId;
                return injectRule(_rule, effectiveRuleId, _fromAuto);
            });
        }, Promise.resolve());
    }

    function injectManualRules(_ruleId, _payload){
        if (!_ruleId) return Promise.resolve();
        removeTaggedElementsForRuleId(_ruleId);

        var onCommit = _payload && Array.isArray(_payload.onCommit) ? _payload.onCommit : [];
        var onLoad = _payload && Array.isArray(_payload.onLoad) ? _payload.onLoad : [];

        return runRulesBatch(onCommit, _ruleId, false).then(function(){
            if (!onLoad.length) return;
            return ensureDocumentReady().then(function(){
                return runRulesBatch(onLoad, _ruleId, false);
            });
        });
    }

    function injectLegacyRules(_payload){
        var onCommit = _payload && Array.isArray(_payload.onCommit) ? _payload.onCommit : [];
        var onLoad = _payload && Array.isArray(_payload.onLoad) ? _payload.onLoad : [];
        var ruleId = _payload && _payload.ruleId ? _payload.ruleId : '';

        return runRulesBatch(onCommit, ruleId, true).then(function(){
            if (!onLoad.length) return;
            return ensureDocumentReady().then(function(){
                return runRulesBatch(onLoad, ruleId, true);
            });
        });
    }

    try{
        chrome.runtime.onMessage.addListener(function(_message, _sender, _sendResponse){
            (async function(){
                try{
                    if (_message && _message.__ci === 'inject'){
                        await injectManualRules(_message.ruleId, _message.rules || { onCommit: [], onLoad: [] });
                        _sendResponse({ ok: true });
                        return;
                    }

                    if (_message && _message.__ci === 'revert'){
                        var removed = removeTaggedElementsForRuleId(_message.ruleId);
                        _sendResponse({ ok: true, removed: removed });
                        return;
                    }

                    if (_message && _message.__ci === 'list'){
                        _sendResponse({ ok: true, ruleIds: listInjectedRuleIds() });
                        return;
                    }

                    if (_message && (_message.onCommit || _message.onLoad)) {
                        await injectLegacyRules(_message);
                        _sendResponse({ ok: true });
                        return;
                    }

                    _sendResponse({ ok: false, error: 'unknown message' });
                }
                catch(_error){
                    _sendResponse({ ok: false, error: _error && _error.message ? _error.message : 'unknown error' });
                }
            }());

            return true;
        });
    }
    catch(_x){
        // Silently fail in restricted contexts.
    }
}(window));
