(function() {
    const API_ENDPOINT = 'http://localhost:5000/api/events';
    const VISITOR_STORAGE_KEY = 'sp_visitor_id';

    function getScriptApiKey () {
        const currentScript = document.currentScript;
        return currentScript ? currentScript.getAttribute('data-site-key'): null;

    }

    function getOrCreateVisitorId () {
        let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);

        if(!visitorId) {
            visitorId = crypto.randomUUID();
            localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
        }

        return visitorId;
    }

    function sendEvent (eventData) {
        fetch (API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify(eventData),
        }).catch(() => {})
    }

    function trackPageView(apiKey, visitorId) {
        sendEvent({apiKey, visitorId, type: 'PAGE_VIEW', pageUrl: window.location.href, referrer: document.referrer || null})
    }

    function trackProductClick (apiKey, visitorId, target) {
        sendEvent({
            apiKey, visitorId,
            type: 'PRODUCT_CLICK',
            pageUrl: window.location.href,
            referrer: document.referrer || null,
            productId: target.getAttribute("data-storepulse-product-id"),
            productName: target.getAttribute("data-storepulse-product-name")
        })
    }

    function findTrackedAncestor(element) {
        let current = element;

        while (current && current !== document.body) {
            if(current.hasAttribute("data-storepulse-product-id")){
                return current;
            }
            current = current.parentElement;
        }

        return null;
    }

    function initTracking() {
        const apiKey = getScriptApiKey();

        if(!apiKey) {
            console.error("Storepulse: missing data-site-key attribute on script tag.");
            return;
        }

        const visitorId = getOrCreateVisitorId();

        trackPageView(apiKey, visitorId);

        document.addEventListener('click', (event) => {
            const trackedElement = findTrackedAncestor(event.target);
            if(trackedElement) {
                trackProductClick(apiKey, visitorId, trackedElement)
            }
        });
    }

    initTracking()
})();