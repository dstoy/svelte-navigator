(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('svelte/internal'), require('svelte'), require('svelte/store')) :
  typeof define === 'function' && define.amd ? define(['exports', 'svelte/internal', 'svelte', 'svelte/store'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SvelteNavigator = {}, global.internal, global.svelte, global.store));
}(this, (function (exports, internal, svelte, store) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /*
   * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
   *
   * https://github.com/reach/router/blob/master/LICENSE
   */
  const isUndefined = value => typeof value === "undefined";
  const isFunction = value => typeof value === "function";
  const isNumber = value => typeof value === "number";
  /**
   * Decides whether a given `event` should result in a navigation or not.
   * @param {object} event
   */

  function shouldNavigate(event) {
    return !event.defaultPrevented && event.button === 0 && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  }
  function createCounter() {
    let i = 0;
    /**
     * Returns an id and increments the internal state
     * @returns {number}
     */

    return () => i++;
  }
  /**
   * Create a globally unique id
   *
   * @returns {string} An id
   */

  function createGlobalId() {
    return Math.random().toString(36).substring(2);
  }
  function findClosest(tagName, element) {
    while (element && element.tagName !== tagName) {
      // eslint-disable-next-line no-param-reassign
      element = element.parentNode;
    }

    return element;
  }
  const isSSR = typeof window === "undefined";
  function addListener(target, type, handler) {
    target.addEventListener(type, handler);
    return () => target.removeEventListener(type, handler);
  }

  /*
   * Adapted from https://github.com/EmilTholin/svelte-routing
   *
   * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
   */
  const createKey = ctxName => "@@svnav-ctx__" + ctxName; // Use strings instead of objects, so different versions of
  // svelte-navigator can potentially still work together


  const LOCATION = createKey("LOCATION");
  const ROUTER = createKey("ROUTER");
  const ROUTE = createKey("ROUTE");
  const ROUTE_PARAMS = createKey("ROUTE_PARAMS");
  const FOCUS_ELEM = createKey("FOCUS_ELEM");

  const paramRegex = /^:(.+)/;
  /**
   * Check if `string` starts with `search`
   * @param {string} string
   * @param {string} search
   * @return {boolean}
   */

  const startsWith = (string, search) => string.substr(0, search.length) === search;
  /**
   * Check if `segment` is a root segment
   * @param {string} segment
   * @return {boolean}
   */

  const isRootSegment = segment => segment === "";
  /**
   * Check if `segment` is a dynamic segment
   * @param {string} segment
   * @return {boolean}
   */

  const isDynamic = segment => paramRegex.test(segment);
  /**
   * Check if `segment` is a splat
   * @param {string} segment
   * @return {boolean}
   */

  const isSplat = segment => segment[0] === "*";
  /**
   * Strip potention splat and splatname of the end of a path
   * @param {string} str
   * @return {string}
   */

  const stripSplat = str => str.replace(/\*.*$/, "");
  /**
   * Strip `str` of potential start and end `/`
   * @param {string} str
   * @return {string}
   */

  const stripSlashes = str => str.replace(/(^\/+|\/+$)/g, "");
  /**
   * Split up the URI into segments delimited by `/`
   * @param {string} uri
   * @return {string[]}
   */

  function segmentize(uri, filterFalsy = false) {
    const segments = stripSlashes(uri).split("/");
    return filterFalsy ? segments.filter(Boolean) : segments;
  }
  /**
   * Add the query to the pathname if a query is given
   * @param {string} pathname
   * @param {string} [query]
   * @return {string}
   */

  const addQuery = (pathname, query) => pathname + (query ? "?" + query : "");
  /**
   * Normalizes a basepath
   *
   * @param {string} path
   * @returns {string}
   *
   * @example
   * normalizePath("base/path/") // -> "/base/path"
   */

  const normalizePath = path => "/" + stripSlashes(path);
  /**
   * Joins and normalizes multiple path fragments
   *
   * @param {...string} pathFragments
   * @returns {string}
   */

  function join(...pathFragments) {
    const joinFragment = fragment => segmentize(fragment, true).join("/");

    const joinedSegments = pathFragments.map(joinFragment).join("/");
    return normalizePath(joinedSegments);
  }

  // by using `originId || <fallback>`

  const LINK_ID = 1;
  const ROUTE_ID = 2;
  const ROUTER_ID = 3;
  const USE_FOCUS_ID = 4;
  const USE_LOCATION_ID = 5;
  const USE_MATCH_ID = 6;
  const USE_NAVIGATE_ID = 7;
  const USE_PARAMS_ID = 8;
  const USE_RESOLVABLE_ID = 9;
  const USE_RESOLVE_ID = 10;
  const NAVIGATE_ID = 11;
  const labels = {
    [LINK_ID]: "Link",
    [ROUTE_ID]: "Route",
    [ROUTER_ID]: "Router",
    [USE_FOCUS_ID]: "useFocus",
    [USE_LOCATION_ID]: "useLocation",
    [USE_MATCH_ID]: "useMatch",
    [USE_NAVIGATE_ID]: "useNavigate",
    [USE_PARAMS_ID]: "useParams",
    [USE_RESOLVABLE_ID]: "useResolvable",
    [USE_RESOLVE_ID]: "useResolve",
    [NAVIGATE_ID]: "navigate"
  };
  const createLabel = labelId => labels[labelId];
  function createIdentifier(labelId, props) {
    let attr;

    if (labelId === ROUTE_ID) {
      attr = props.path ? "path=\"" + props.path + "\"" : "default";
    } else if (labelId === LINK_ID) {
      attr = "to=\"" + props.to + "\"";
    } else if (labelId === ROUTER_ID) {
      attr = "basepath=\"" + (props.basepath || "") + "\"";
    }

    return "<" + createLabel(labelId) + " " + (attr || "") + " />";
  }
  function createMessage(labelId, message, props, originId) {
    const origin = props && createIdentifier(originId || labelId, props);
    const originMsg = origin ? "\n\nOccurred in: " + origin : "";
    const label = createLabel(labelId);
    const msg = isFunction(message) ? message(label) : message;
    return "<" + label + "> " + msg + originMsg;
  }
  const createMessageHandler = handler => (...args) => handler(createMessage(...args));
  const fail = createMessageHandler(message => {
    throw new Error(message);
  }); // eslint-disable-next-line no-console

  const warn = createMessageHandler(console.warn);

  const SEGMENT_POINTS = 4;
  const STATIC_POINTS = 3;
  const DYNAMIC_POINTS = 2;
  const SPLAT_PENALTY = 1;
  const ROOT_POINTS = 1;
  /**
   * Score a route depending on how its individual segments look
   * @param {object} route
   * @param {number} index
   * @return {object}
   */

  function rankRoute(route, index) {
    const score = route.default ? 0 : segmentize(route.fullPath).reduce((acc, segment) => {
      let nextScore = acc;
      nextScore += SEGMENT_POINTS;

      if (isRootSegment(segment)) {
        nextScore += ROOT_POINTS;
      } else if (isDynamic(segment)) {
        nextScore += DYNAMIC_POINTS;
      } else if (isSplat(segment)) {
        nextScore -= SEGMENT_POINTS + SPLAT_PENALTY;
      } else {
        nextScore += STATIC_POINTS;
      }

      return nextScore;
    }, 0);
    return {
      route,
      score,
      index
    };
  }
  /**
   * Give a score to all routes and sort them on that
   * @param {object[]} routes
   * @return {object[]}
   */

  function rankRoutes(routes) {
    return routes.map(rankRoute) // If two routes have the exact same score, we go by index instead
    .sort((a, b) => {
      if (a.score < b.score) {
        return 1;
      }

      if (a.score > b.score) {
        return -1;
      }

      return a.index - b.index;
    });
  }
  /**
   * Ranks and picks the best route to match. Each segment gets the highest
   * amount of points, then the type of segment gets an additional amount of
   * points where
   *
   *  static > dynamic > splat > root
   *
   * This way we don't have to worry about the order of our routes, let the
   * computers do it.
   *
   * A route looks like this
   *
   *  { fullPath, default, value }
   *
   * And a returned match looks like:
   *
   *  { route, params, uri }
   *
   * @param {object[]} routes
   * @param {string} uri
   * @return {?object}
   */

  function pick(routes, uri) {
    let bestMatch;
    let defaultMatch;
    const [uriPathname] = uri.split("?");
    const uriSegments = segmentize(uriPathname);
    const isRootUri = uriSegments[0] === "";
    const ranked = rankRoutes(routes);

    for (let i = 0, l = ranked.length; i < l; i++) {
      const {
        route
      } = ranked[i];
      let missed = false;
      const params = {}; // eslint-disable-next-line no-shadow

      const createMatch = uri => _objectSpread2(_objectSpread2({}, route), {}, {
        params,
        uri
      });

      if (route.default) {
        defaultMatch = createMatch(uri);
        continue;
      }

      const routeSegments = segmentize(route.fullPath);
      const max = Math.max(uriSegments.length, routeSegments.length);
      let index = 0;

      for (; index < max; index++) {
        const routeSegment = routeSegments[index];
        const uriSegment = uriSegments[index];

        if (!isUndefined(routeSegment) && isSplat(routeSegment)) {
          // Hit a splat, just grab the rest, and return a match
          // uri:   /files/documents/work
          // route: /files/* or /files/*splatname
          const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);
          params[splatName] = uriSegments.slice(index).map(decodeURIComponent).join("/");
          break;
        }

        if (isUndefined(uriSegment)) {
          // URI is shorter than the route, no match
          // uri:   /users
          // route: /users/:userId
          missed = true;
          break;
        }

        const dynamicMatch = paramRegex.exec(routeSegment);

        if (dynamicMatch && !isRootUri) {
          const value = decodeURIComponent(uriSegment);
          params[dynamicMatch[1]] = value;
        } else if (routeSegment !== uriSegment) {
          // Current segments don't match, not dynamic, not splat, so no match
          // uri:   /users/123/settings
          // route: /users/:id/profile
          missed = true;
          break;
        }
      }

      if (!missed) {
        bestMatch = createMatch(join(...uriSegments.slice(0, index)));
        break;
      }
    }

    return bestMatch || defaultMatch || null;
  }
  /**
   * Check if the `route.fullPath` matches the `uri`.
   * @param {Object} route
   * @param {string} uri
   * @return {?object}
   */

  function match(route, uri) {
    return pick([route], uri);
  }
  /**
   * Resolve URIs as though every path is a directory, no files. Relative URIs
   * in the browser can feel awkward because not only can you be "in a directory",
   * you can be "at a file", too. For example:
   *
   *  browserSpecResolve('foo', '/bar/') => /bar/foo
   *  browserSpecResolve('foo', '/bar') => /foo
   *
   * But on the command line of a file system, it's not as complicated. You can't
   * `cd` from a file, only directories. This way, links have to know less about
   * their current path. To go deeper you can do this:
   *
   *  <Link to="deeper"/>
   *  // instead of
   *  <Link to=`{${props.uri}/deeper}`/>
   *
   * Just like `cd`, if you want to go deeper from the command line, you do this:
   *
   *  cd deeper
   *  # not
   *  cd $(pwd)/deeper
   *
   * By treating every path as a directory, linking to relative paths should
   * require less contextual information and (fingers crossed) be more intuitive.
   * @param {string} to
   * @param {string} base
   * @return {string}
   */

  function resolve(to, base) {
    // /foo/bar, /baz/qux => /foo/bar
    if (startsWith(to, "/")) {
      return to;
    }

    const [toPathname, toQuery] = to.split("?");
    const [basePathname] = base.split("?");
    const toSegments = segmentize(toPathname);
    const baseSegments = segmentize(basePathname); // ?a=b, /users?b=c => /users?a=b

    if (toSegments[0] === "") {
      return addQuery(basePathname, toQuery);
    } // profile, /users/789 => /users/789/profile


    if (!startsWith(toSegments[0], ".")) {
      const pathname = baseSegments.concat(toSegments).join("/");
      return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
    } // ./       , /users/123 => /users/123
    // ../      , /users/123 => /users
    // ../..    , /users/123 => /
    // ../../one, /a/b/c/d   => /a/b/one
    // .././one , /a/b/c/d   => /a/b/c/one


    const allSegments = baseSegments.concat(toSegments);
    const segments = [];
    allSegments.forEach(segment => {
      if (segment === "..") {
        segments.pop();
      } else if (segment !== ".") {
        segments.push(segment);
      }
    });
    return addQuery("/" + segments.join("/"), toQuery);
  }
  /**
   * Normalizes a location for consumption by `Route` children and the `Router`.
   * It removes the apps basepath from the pathname
   * and sets default values for `search` and `hash` properties.
   *
   * @param {Object} location The current global location supplied by the history component
   * @param {string} basepath The applications basepath (i.e. when serving from a subdirectory)
   *
   * @returns The normalized location
   */

  function normalizeLocation(location, basepath) {
    const {
      pathname,
      hash = "",
      search = "",
      state
    } = location;
    const baseSegments = segmentize(basepath, true);
    const pathSegments = segmentize(pathname, true);

    while (baseSegments.length) {
      if (baseSegments[0] !== pathSegments[0]) {
        fail(ROUTER_ID, "Invalid state: All locations must begin with the basepath \"" + basepath + "\", found \"" + pathname + "\"");
      }

      baseSegments.shift();
      pathSegments.shift();
    }

    return {
      pathname: join(...pathSegments),
      hash,
      search,
      state
    };
  }

  const normalizeUrlFragment = frag => frag.length === 1 ? "" : frag;
  /**
   * Creates a location object from an url.
   * It is used to create a location from the url prop used in SSR
   *
   * @param {string} url The url string (e.g. "/path/to/somewhere")
   *
   * @returns {{ pathname: string; search: string; hash: string }} The location
   */


  function createLocation(url) {
    const searchIndex = url.indexOf("?");
    const hashIndex = url.indexOf("#");
    const hasSearchIndex = searchIndex !== -1;
    const hasHashIndex = hashIndex !== -1;
    const hash = hasHashIndex ? normalizeUrlFragment(url.substr(hashIndex)) : "";
    const pathnameAndSearch = hasHashIndex ? url.substr(0, hashIndex) : url;
    const search = hasSearchIndex ? normalizeUrlFragment(pathnameAndSearch.substr(searchIndex)) : "";
    const pathname = hasSearchIndex ? pathnameAndSearch.substr(0, searchIndex) : pathnameAndSearch;
    return {
      pathname,
      search,
      hash
    };
  }
  /**
   * Resolves a link relative to the parent Route and the Routers basepath.
   *
   * @param {string} path The given path, that will be resolved
   * @param {string} routeBase The current Routes base path
   * @param {string} appBase The basepath of the app. Used, when serving from a subdirectory
   * @returns {string} The resolved path
   *
   * @example
   * resolveLink("relative", "/routeBase", "/") // -> "/routeBase/relative"
   * resolveLink("/absolute", "/routeBase", "/") // -> "/absolute"
   * resolveLink("relative", "/routeBase", "/base") // -> "/base/routeBase/relative"
   * resolveLink("/absolute", "/routeBase", "/base") // -> "/base/absolute"
   */

  function resolveLink(path, routeBase, appBase) {
    return join(appBase, resolve(path, routeBase));
  }
  /**
   * Get the uri for a Route, by matching it against the current location.
   *
   * @param {string} routePath The Routes resolved path
   * @param {string} pathname The current locations pathname
   */

  function extractBaseUri(routePath, pathname) {
    const fullPath = normalizePath(stripSplat(routePath));
    const baseSegments = segmentize(fullPath, true);
    const pathSegments = segmentize(pathname, true).slice(0, baseSegments.length);
    const routeMatch = match({
      fullPath
    }, join(...pathSegments));
    return routeMatch && routeMatch.uri;
  }

  const POP = "POP";
  const PUSH = "PUSH";
  const REPLACE = "REPLACE";

  function getLocation(source) {
    return _objectSpread2(_objectSpread2({}, source.location), {}, {
      pathname: encodeURI(decodeURI(source.location.pathname)),
      state: source.history.state,
      _key: source.history.state && source.history.state._key || "initial"
    });
  }

  function createHistory(source) {
    let listeners = [];
    let location = getLocation(source);
    let action = POP;

    const notifyListeners = (listenerFns = listeners) => listenerFns.forEach(listener => listener({
      location,
      action
    }));

    return {
      get location() {
        return location;
      },

      listen(listener) {
        listeners.push(listener);

        const popstateListener = () => {
          location = getLocation(source);
          action = POP;
          notifyListeners([listener]);
        }; // Call listener when it is registered


        notifyListeners([listener]);
        const unlisten = addListener(source, "popstate", popstateListener);
        return () => {
          unlisten();
          listeners = listeners.filter(fn => fn !== listener);
        };
      },

      /**
       * Navigate to a new absolute route.
       *
       * @param {string|number} to The path to navigate to.
       *
       * If `to` is a number we will navigate to the stack entry index + `to`
       * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
       * @param {Object} options
       * @param {*} [options.state] The state will be accessible through `location.state`
       * @param {boolean} [options.replace=false] Replace the current entry in the history
       * stack, instead of pushing on a new one
       */
      navigate(to, options) {
        const {
          state = {},
          replace = false
        } = options || {};
        action = replace ? REPLACE : PUSH;

        if (isNumber(to)) {
          if (options) {
            warn(NAVIGATE_ID, "Navigation options (state or replace) are not supported, " + "when passing a number as the first argument to navigate. " + "They are ignored.");
          }

          action = POP;
          source.history.go(to);
        } else {
          const keyedState = _objectSpread2(_objectSpread2({}, state), {}, {
            _key: createGlobalId()
          }); // try...catch iOS Safari limits to 100 pushState calls


          try {
            source.history[replace ? "replaceState" : "pushState"](keyedState, "", to);
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }
        }

        location = getLocation(source);
        notifyListeners();
      }

    };
  }

  function createStackFrame(state, uri) {
    return _objectSpread2(_objectSpread2({}, createLocation(uri)), {}, {
      state
    });
  } // Stores history entries in memory for testing or other platforms like Native


  function createMemorySource(initialPathname = "/") {
    let index = 0;
    let stack = [createStackFrame(null, initialPathname)];
    return {
      // This is just for testing...
      get entries() {
        return stack;
      },

      get location() {
        return stack[index];
      },

      addEventListener() {},

      removeEventListener() {},

      history: {
        get state() {
          return stack[index].state;
        },

        pushState(state, title, uri) {
          index++; // Throw away anything in the stack with an index greater than the current index.
          // This happens, when we go back using `go(-n)`. The index is now less than `stack.length`.
          // If we call `go(+n)` the stack entries with an index greater than the current index can
          // be reused.
          // However, if we navigate to a path, instead of a number, we want to create a new branch
          // of navigation.

          stack = stack.slice(0, index);
          stack.push(createStackFrame(state, uri));
        },

        replaceState(state, title, uri) {
          stack[index] = createStackFrame(state, uri);
        },

        go(to) {
          const newIndex = index + to;

          if (newIndex < 0 || newIndex > stack.length - 1) {
            return;
          }

          index = newIndex;
        }

      }
    };
  } // Global history uses window.history as the source if available,
  // otherwise a memory history


  const canUseDOM = !!(!isSSR && window.document && window.document.createElement); // Use memory history in iframes (for example in Svelte REPL)

  const isEmbeddedPage = !isSSR && window.location.origin === "null";
  const globalHistory = createHistory(canUseDOM && !isEmbeddedPage ? window : createMemorySource());
  const {
    navigate
  } = globalHistory;

  // not update, when we mutate it.
  // Also, we need a single global reference, because taking focus needs to
  // work globally, even if we have multiple top level routers
  // eslint-disable-next-line import/no-mutable-exports

  let focusCandidate = null; // eslint-disable-next-line import/no-mutable-exports

  let initialNavigation = true;
  /**
   * Check if RouterA is above RouterB in the document
   * @param {number} routerIdA The first Routers id
   * @param {number} routerIdB The second Routers id
   */

  function isAbove(routerIdA, routerIdB) {
    const routerMarkers = document.querySelectorAll("[data-svnav-router]");

    for (let i = 0; i < routerMarkers.length; i++) {
      const node = routerMarkers[i];
      const currentId = Number(node.dataset.svnavRouter);
      if (currentId === routerIdA) return true;
      if (currentId === routerIdB) return false;
    }

    return false;
  }
  /**
   * Check if a Route candidate is the best choice to move focus to,
   * and store the best match.
   * @param {{
       level: number;
       routerId: number;
       route: {
         id: number;
         focusElement: import("svelte/store").Readable<Promise<Element>|null>;
       }
     }} item A Route candidate, that updated and is visible after a navigation
   */


  function pushFocusCandidate(item) {
    if ( // Best candidate if it's the only candidate...
    !focusCandidate || // Route is nested deeper, than previous candidate
    // -> Route change was triggered in the deepest affected
    // Route, so that's were focus should move to
    item.level > focusCandidate.level || // If the level is identical, we want to focus the first Route in the document,
    // so we pick the first Router lookin from page top to page bottom.
    item.level === focusCandidate.level && isAbove(item.routerId, focusCandidate.routerId)) {
      focusCandidate = item;
    }
  }
  /**
   * Reset the focus candidate.
   */

  function clearFocusCandidate() {
    focusCandidate = null;
  }
  function initialNavigationOccurred() {
    initialNavigation = false;
  }
  /*
   * `focus` Adapted from https://github.com/oaf-project/oaf-side-effects/blob/master/src/index.ts
   *
   * https://github.com/oaf-project/oaf-side-effects/blob/master/LICENSE
   */

  function focus(elem) {
    if (!elem) return false;
    const TABINDEX = "tabindex";

    try {
      if (!elem.hasAttribute(TABINDEX)) {
        elem.setAttribute(TABINDEX, "-1");
        let unlisten; // We remove tabindex after blur to avoid weird browser behavior
        // where a mouse click can activate elements with tabindex="-1".

        const blurListener = () => {
          elem.removeAttribute(TABINDEX);
          unlisten();
        };

        unlisten = addListener(elem, "blur", blurListener);
      }

      elem.focus();
      return document.activeElement === elem;
    } catch (e) {
      // Apparently trying to focus a disabled element in IE can throw.
      // See https://stackoverflow.com/a/1600194/2476884
      return false;
    }
  }
  function isEndMarker(elem, id) {
    return Number(elem.dataset.svnavRouteEnd) === id;
  }
  function isHeading(elem) {
    return /^H[1-6]$/i.test(elem.tagName);
  }

  function query(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function queryHeading(id) {
    const marker = query("[data-svnav-route-start=\"" + id + "\"]");
    let current = marker.nextElementSibling;

    while (!isEndMarker(current, id)) {
      if (isHeading(current)) {
        return current;
      }

      const heading = query("h1,h2,h3,h4,h5,h6", current);

      if (heading) {
        return heading;
      }

      current = current.nextElementSibling;
    }

    return null;
  }
  function handleFocus(route) {
    Promise.resolve(store.get(route.focusElement)).then(elem => {
      const focusElement = elem || queryHeading(route.id);

      if (!focusElement) {
        warn(ROUTER_ID, "Could not find an element to focus. " + "You should always render a header for accessibility reasons, " + 'or set a custom focus element via the "useFocus" hook. ' + "If you don't want this Route or Router to manage focus, " + 'pass "primary={false}" to it.', route, ROUTE_ID);
      }

      const headingFocused = focus(focusElement);
      if (headingFocused) return;
      focus(document.documentElement);
    });
  }
  const createTriggerFocus = (a11yConfig, announcementText, location) => (manageFocus, announceNavigation) => // Wait until the dom is updated, so we can look for headings
  svelte.tick().then(() => {
    if (!focusCandidate || initialNavigation) {
      initialNavigationOccurred();
      return;
    }

    if (manageFocus) {
      handleFocus(focusCandidate.route);
    }

    if (a11yConfig.announcements && announceNavigation) {
      const {
        path,
        fullPath,
        meta,
        params,
        uri
      } = focusCandidate.route;
      const announcementMessage = a11yConfig.createAnnouncement({
        path,
        fullPath,
        meta,
        params,
        uri
      }, store.get(location));
      Promise.resolve(announcementMessage).then(message => {
        announcementText.set(message);
      });
    }

    clearFocusCandidate();
  });
  const visuallyHiddenStyle = "position:fixed;" + "top:-1px;" + "left:0;" + "width:1px;" + "height:1px;" + "padding:0;" + "overflow:hidden;" + "clip:rect(0,0,0,0);" + "white-space:nowrap;" + "border:0;";

  function create_if_block(ctx) {
    let div;
    let t;
    return {
      c() {
        div = internal.element("div");
        t = internal.text(
        /*$announcementText*/
        ctx[0]);
        internal.attr(div, "role", "status");
        internal.attr(div, "aria-atomic", "true");
        internal.attr(div, "aria-live", "polite");
        internal.attr(div, "style", visuallyHiddenStyle);
      },

      m(target, anchor) {
        internal.insert(target, div, anchor);
        internal.append(div, t);
      },

      p(ctx, dirty) {
        if (dirty[0] &
        /*$announcementText*/
        1) internal.set_data(t,
        /*$announcementText*/
        ctx[0]);
      },

      d(detaching) {
        if (detaching) internal.detach(div);
      }

    };
  }

  function create_fragment(ctx) {
    let div;
    let t0;
    let t1;
    let if_block_anchor;
    let current;
    const default_slot_template =
    /*#slots*/
    ctx[20].default;
    const default_slot = internal.create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[19], null);
    let if_block =
    /*isTopLevelRouter*/
    ctx[2] &&
    /*manageFocus*/
    ctx[4] &&
    /*a11yConfig*/
    ctx[1].announcements && create_if_block(ctx);
    return {
      c() {
        div = internal.element("div");
        t0 = internal.space();
        if (default_slot) default_slot.c();
        t1 = internal.space();
        if (if_block) if_block.c();
        if_block_anchor = internal.empty();
        internal.set_style(div, "display", "none");
        internal.attr(div, "aria-hidden", "true");
        internal.attr(div, "data-svnav-router",
        /*routerId*/
        ctx[3]);
      },

      m(target, anchor) {
        internal.insert(target, div, anchor);
        internal.insert(target, t0, anchor);

        if (default_slot) {
          default_slot.m(target, anchor);
        }

        internal.insert(target, t1, anchor);
        if (if_block) if_block.m(target, anchor);
        internal.insert(target, if_block_anchor, anchor);
        current = true;
      },

      p(ctx, dirty) {
        if (default_slot) {
          if (default_slot.p && dirty[0] &
          /*$$scope*/
          524288) {
            internal.update_slot(default_slot, default_slot_template, ctx,
            /*$$scope*/
            ctx[19], dirty, null, null);
          }
        }

        if (
        /*isTopLevelRouter*/
        ctx[2] &&
        /*manageFocus*/
        ctx[4] &&
        /*a11yConfig*/
        ctx[1].announcements) if_block.p(ctx, dirty);
      },

      i(local) {
        if (current) return;
        internal.transition_in(default_slot, local);
        current = true;
      },

      o(local) {
        internal.transition_out(default_slot, local);
        current = false;
      },

      d(detaching) {
        if (detaching) internal.detach(div);
        if (detaching) internal.detach(t0);
        if (default_slot) default_slot.d(detaching);
        if (detaching) internal.detach(t1);
        if (if_block) if_block.d(detaching);
        if (detaching) internal.detach(if_block_anchor);
      }

    };
  }

  const createId = createCounter();
  const defaultBasepath = "/";

  function instance($$self, $$props, $$invalidate) {
    let $location;
    let $routes;
    let $prevLocation;
    let $activeRoute;
    let $announcementText;
    let {
      $$slots: slots = {},
      $$scope
    } = $$props;
    let {
      basepath = defaultBasepath
    } = $$props;
    let {
      url = null
    } = $$props;
    let {
      history = globalHistory
    } = $$props;
    let {
      primary = true
    } = $$props;
    let {
      a11y = {}
    } = $$props;

    const a11yConfig = _objectSpread2({
      createAnnouncement: route => "Navigated to " + route.uri,
      announcements: true
    }, a11y); // Remember the initial `basepath`, so we can fire a warning
    // when the user changes it later


    const initialBasepath = basepath;
    const normalizedBasepath = normalizePath(basepath);
    const locationContext = svelte.getContext(LOCATION);
    const routerContext = svelte.getContext(ROUTER);
    const isTopLevelRouter = !locationContext;
    const routerId = createId();
    const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
    const announcementText = store.writable("");
    internal.component_subscribe($$self, announcementText, value => $$invalidate(0, $announcementText = value));
    const routes = store.writable([]);
    internal.component_subscribe($$self, routes, value => $$invalidate(16, $routes = value));
    const activeRoute = store.writable(null);
    internal.component_subscribe($$self, activeRoute, value => $$invalidate(18, $activeRoute = value)); // Used in SSR to synchronously set that a Route is active.

    let hasActiveRoute = false; // Nesting level of router.
    // We will need this to identify sibling routers, when moving
    // focus on navigation, so we can focus the first possible router

    const level = isTopLevelRouter ? 0 : routerContext.level + 1; // If we're running an SSR we force the location to the `url` prop

    const getInitialLocation = () => normalizeLocation(isSSR ? createLocation(url) : history.location, normalizedBasepath);

    const location = isTopLevelRouter ? store.writable(getInitialLocation()) : locationContext;
    internal.component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    const prevLocation = store.writable($location);
    internal.component_subscribe($$self, prevLocation, value => $$invalidate(17, $prevLocation = value));
    const triggerFocus = createTriggerFocus(a11yConfig, announcementText, location);

    const createRouteFilter = routeId => routeList => routeList.filter(routeItem => routeItem.id !== routeId);

    function registerRoute(route) {
      if (isSSR) {
        // In SSR we should set the activeRoute immediately if it is a match.
        // If there are more Routes being registered after a match is found,
        // we just skip them.
        if (hasActiveRoute) {
          return;
        }

        const matchingRoute = match(route, $location.pathname);

        if (matchingRoute) {
          hasActiveRoute = true; // Return the match in SSR mode, so the matched Route can use it immediatly.
          // Waiting for activeRoute to update does not work, because it updates
          // after the Route is initialized

          return matchingRoute; // eslint-disable-line consistent-return
        }
      } else {
        routes.update(prevRoutes => {
          // Remove an old version of the updated route,
          // before pushing the new version
          const nextRoutes = createRouteFilter(route.id)(prevRoutes);
          nextRoutes.push(route);
          return nextRoutes;
        });
      }
    }

    function unregisterRoute(routeId) {
      routes.update(createRouteFilter(routeId));
    }

    if (!isTopLevelRouter && basepath !== defaultBasepath) {
      warn(ROUTER_ID, "Only top-level Routers can have a \"basepath\" prop. It is ignored.", {
        basepath
      });
    }

    if (isTopLevelRouter) {
      // The topmost Router in the tree is responsible for updating
      // the location store and supplying it through context.
      svelte.onMount(() => {
        const unlisten = history.listen(changedHistory => {
          const normalizedLocation = normalizeLocation(changedHistory.location, normalizedBasepath);
          prevLocation.set($location);
          location.set(normalizedLocation);
        });
        return unlisten;
      });
      svelte.setContext(LOCATION, location);
    }

    svelte.setContext(ROUTER, {
      activeRoute,
      registerRoute,
      unregisterRoute,
      manageFocus,
      level,
      id: routerId,
      history: isTopLevelRouter ? history : routerContext.history,
      basepath: isTopLevelRouter ? normalizedBasepath : routerContext.basepath
    });

    $$self.$$set = $$props => {
      if ("basepath" in $$props) $$invalidate(10, basepath = $$props.basepath);
      if ("url" in $$props) $$invalidate(11, url = $$props.url);
      if ("history" in $$props) $$invalidate(12, history = $$props.history);
      if ("primary" in $$props) $$invalidate(13, primary = $$props.primary);
      if ("a11y" in $$props) $$invalidate(14, a11y = $$props.a11y);
      if ("$$scope" in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    };

    $$self.$$.update = () => {
      if ($$self.$$.dirty[0] &
      /*basepath*/
      1024) {
         if (basepath !== initialBasepath) {
          warn(ROUTER_ID, "You cannot change the \"basepath\" prop. It is ignored.");
        }
      }

      if ($$self.$$.dirty[0] &
      /*$routes, $location*/
      98304) {
        // This reactive statement will be run when the Router is created
        // when there are no Routes and then again the following tick, so it
        // will not find an active Route in SSR and in the browser it will only
        // pick an active Route after all Routes have been registered.
         {
          const bestMatch = pick($routes, $location.pathname);
          activeRoute.set(bestMatch);
        }
      }

      if ($$self.$$.dirty[0] &
      /*$location, $prevLocation*/
      163840) {
        // Manage focus and announce navigation to screen reader users
         {
          if (isTopLevelRouter) {
            const hasHash = !!$location.hash; // When a hash is present in the url, we skip focus management, because
            // focusing a different element will prevent in-page jumps (See #3)

            const shouldManageFocus = !hasHash && manageFocus; // We don't want to make an announcement, when the hash changes,
            // but the active route stays the same

            const announceNavigation = !hasHash || $location.pathname !== $prevLocation.pathname;
            triggerFocus(shouldManageFocus, announceNavigation);
          }
        }
      }

      if ($$self.$$.dirty[0] &
      /*$activeRoute*/
      262144) {
        // Queue matched Route, so top level Router can decide which Route to focus.
        // Non primary Routers should just be ignored
         if (manageFocus && $activeRoute && $activeRoute.primary) {
          pushFocusCandidate({
            level,
            routerId,
            route: $activeRoute
          });
        }
      }
    };

    return [$announcementText, a11yConfig, isTopLevelRouter, routerId, manageFocus, announcementText, routes, activeRoute, location, prevLocation, basepath, url, history, primary, a11y, $location, $routes, $prevLocation, $activeRoute, $$scope, slots];
  }

  class Router extends internal.SvelteComponent {
    constructor(options) {
      super();
      internal.init(this, options, instance, create_fragment, internal.safe_not_equal, {
        basepath: 10,
        url: 11,
        history: 12,
        primary: 13,
        a11y: 14
      }, [-1, -1]);
    }

  }

  /**
   * Check if a component or hook have been created outside of a
   * context providing component
   * @param {number} componentId
   * @param {*} props
   * @param {string?} ctxKey
   * @param {number?} ctxProviderId
   */

  function usePreflightCheck(componentId, props, ctxKey = ROUTER, ctxProviderId = ROUTER_ID) {
    const ctx = svelte.getContext(ctxKey);

    if (!ctx) {
      fail(componentId, label => "You cannot use " + label + " outside of a " + createLabel(ctxProviderId) + ".", props);
    }
  }

  const toReadonly = ctx => {
    const {
      subscribe
    } = svelte.getContext(ctx);
    return {
      subscribe
    };
  };
  /**
   * Access the current location via a readable store.
   * @returns {import("svelte/store").Readable<{
      pathname: string;
      search: string;
      hash: string;
      state: {};
    }>}
   *
   * @example
    ```html
    <script>
      import { useLocation } from "svelte-navigator";

      const location = useLocation();

      $: console.log($location);
      // {
      //   pathname: "/blog",
      //   search: "?id=123",
      //   hash: "#comments",
      //   state: {}
      // }
    </script>
    ```
   */


  function useLocation() {
    usePreflightCheck(USE_LOCATION_ID);
    return toReadonly(LOCATION);
  }
  /**
   * @typedef {{
      path: string;
      fullPath: string;
      uri: string;
      params: {};
    }} RouteMatch
   */

  /**
   * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
   */

  /**
   * Access the history of top level Router.
   */

  function useHistory() {
    const {
      history
    } = svelte.getContext(ROUTER);
    return history;
  }
  /**
   * Access the base of the parent Route.
   */

  function useRouteBase() {
    const route = svelte.getContext(ROUTE);
    return route ? store.derived(route, _route => _route.base) : store.writable("/");
  }
  /**
   * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
   * It is used under the hood in `Link` and `useNavigate`.
   * You can use it to manually resolve links, when using the `link` or `links` actions.
   *
   * @returns {(path: string) => string}
   *
   * @example
    ```html
    <script>
      import { link, useResolve } from "svelte-navigator";

      const resolve = useResolve();
      // `resolvedLink` will be resolved relative to its parent Route
      // and the Routers `basepath`
      const resolvedLink = resolve("relativePath");
    </script>

    <a href={resolvedLink} use:link>Relative link</a>
    ```
   */

  function useResolve() {
    usePreflightCheck(USE_RESOLVE_ID);
    const routeBase = useRouteBase();
    const {
      basepath: appBase
    } = svelte.getContext(ROUTER);
    /**
     * Resolves the path relative to the current route and basepath.
     *
     * @param {string} path The path to resolve
     * @returns {string} The resolved path
     */

    const resolve = path => resolveLink(path, store.get(routeBase), appBase);

    return resolve;
  }
  /**
   * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
   * It is used under the hood in `Link` and `useNavigate`.
   * You can use it to manually resolve links, when using the `link` or `links` actions.
   *
   * @returns {import("svelte/store").Readable<string>}
   *
   * @example
    ```html
    <script>
      import { link, useResolvable } from "svelte-navigator";

      // `resolvedLink` will be resolved relative to its parent Route
      // and the Routers `basepath`.
      const resolvedLink = useResolvable("relativePath");
    </script>

    <a href={$resolvedLink} use:link>Relative link</a>
    ```
   */

  function useResolvable(path) {
    usePreflightCheck(USE_RESOLVABLE_ID);
    const routeBase = useRouteBase();
    const {
      basepath: appBase
    } = svelte.getContext(ROUTER);
    return store.derived(routeBase, _routeBase => resolveLink(path, _routeBase, appBase));
  }
  /**
   * A hook, that returns a context-aware version of `navigate`.
   * It will automatically resolve the given link relative to the current Route.
   * It will also resolve a link against the `basepath` of the Router.
   *
   * @example
    ```html
    <!-- App.svelte -->
    <script>
      import { link, Route } from "svelte-navigator";
      import RouteComponent from "./RouteComponent.svelte";
    </script>

    <Router>
      <Route path="route1">
        <RouteComponent />
      </Route>
      <!-- ... -->
    </Router>

    <!-- RouteComponent.svelte -->
    <script>
      import { useNavigate } from "svelte-navigator";

      const navigate = useNavigate();
    </script>

    <button on:click="{() => navigate('relativePath')}">
      go to /route1/relativePath
    </button>
    <button on:click="{() => navigate('/absolutePath')}">
      go to /absolutePath
    </button>
    ```
    *
    * @example
    ```html
    <!-- App.svelte -->
    <script>
      import { link, Route } from "svelte-navigator";
      import RouteComponent from "./RouteComponent.svelte";
    </script>

    <Router basepath="/base">
      <Route path="route1">
        <RouteComponent />
      </Route>
      <!-- ... -->
    </Router>

    <!-- RouteComponent.svelte -->
    <script>
      import { useNavigate } from "svelte-navigator";

      const navigate = useNavigate();
    </script>

    <button on:click="{() => navigate('relativePath')}">
      go to /base/route1/relativePath
    </button>
    <button on:click="{() => navigate('/absolutePath')}">
      go to /base/absolutePath
    </button>
    ```
   */

  function useNavigate() {
    usePreflightCheck(USE_NAVIGATE_ID);
    const resolve = useResolve();
    const {
      navigate
    } = useHistory();
    /**
     * Navigate to a new route.
     * Resolves the link relative to the current route and basepath.
     *
     * @param {string|number} to The path to navigate to.
     *
     * If `to` is a number we will navigate to the stack entry index + `to`
     * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
     * @param {Object} options
     * @param {*} [options.state]
     * @param {boolean} [options.replace=false]
     */

    const navigateRelative = (to, options) => {
      // If to is a number, we navigate to the target stack entry via `history.go`.
      // Otherwise resolve the link
      const target = isNumber(to) ? to : resolve(to);
      return navigate(target, options);
    };

    return navigateRelative;
  }
  /**
   * Use Svelte Navigators matching without needing to use a Route.
   * Returns a readable store with the potential match,
   * that changes, when the location changes.
   *
   * The provided path will be resolved relatively,
   * as you're used to with all paths in Svelte Navigator
   *
   * @param {string} path The path, to match against.
   * It works just like a Route path
   * @returns {RouteMatchStore} The matched route.
   * Returns `null`, when nothing could be matched
   *
   * @example
    ```html
    <script>
      import { useMatch } from "svelte-navigator";

      const relativeMatch = useMatch("relative/path/:to/*somewhere");
      const absoluteMatch = useMatch("/absolute/path/:to/*somewhere");

      $: console.log($relativeMatch.params.to);
      $: console.log($absoluteMatch.params.somewhere);
    </script>
    ```
   */

  function useMatch(path) {
    usePreflightCheck(USE_MATCH_ID);
    const location = useLocation();
    const resolve = useResolve();
    const {
      basepath: appBase
    } = svelte.getContext(ROUTER);
    const resolvedPath = resolve(path);
    const {
      pathname: fullPath
    } = normalizeLocation({
      pathname: resolvedPath
    }, appBase);
    return store.derived(location, loc => match({
      fullPath,
      path
    }, loc.pathname));
  }
  /**
   * Access the parent Routes matched params and wildcards
   * @returns {import("svelte/store").Readable<{
       [param: string]: any;
     }>} A readable store containing the matched parameters and wildcards
   *
   * @example
    ```html
    <!--
      Somewhere inside <Route path="user/:id/*splat" />
      with a current url of "/myApp/user/123/pauls-profile"
    -->
    <script>
      import { useParams } from "svelte-navigator";

      const params = useParams();

      $: console.log($params); // -> { id: "123", splat: "pauls-profile" }
    </script>

    <h3>Welcome user {$params.id}! bleep bloop...</h3>
    ```
   */

  function useParams() {
    usePreflightCheck(USE_PARAMS_ID, null, ROUTE, ROUTE_ID);
    return toReadonly(ROUTE_PARAMS);
  }
  /**
   * Provide a custom element to focus, when the parent route is visited.
   * It returns the `registerFocus` function you can call manually with an
   * Element or use as a Svelte action via the `use` directive.
   *
   * @example
    ```html
    <!-- Using `registerFocus` as a Svelte action: -->
    <!-- Somewhere inside a Route -->
    <script>
      import { useFocus } from "svelte-navigator";

      const registerFocus = useFocus();
    </script>

    <h1>Don't worry about me...</h1>
    <p use:registerFocus>Here, look at me!</p>
    ```
    * @example
    ```html
    <!-- Calling `registerFocus` manually: -->
    <!-- Somewhere inside a Route -->
    <script>
      import { onMount } from "svelte";
      import { useFocus } from "svelte-navigator";

      const registerFocus = useFocus();

      let focusElement;

      onMount(() => registerFocus(focusElement))
    </script>

    <h1>Don't worry about me...</h1>
    <p bind:this={focusElement}>Here, look at me!</p>
    ```
    * @example
    ```html
    <!-- Using `registerFocus` asyncronously: -->
    <!-- Somewhere inside a Route -->
    <script>
      import { onMount } from "svelte";
      import { useFocus } from "svelte-navigator";

      const registerFocus = useFocus();

      const lazyImport = import("./MyComponent.svelte").then(module => module.default);
    </script>

    {#await lazyImport then MyComponent}
      <MyComponent {registerFocus} />
    {/await}

    <!-- MyComponent.svelte -->
    <script>
      export let registerFocus;
    </script>

    <h1 use:registerFocus>Hi there!</h1>
    ```
   */

  function useFocus() {
    usePreflightCheck(USE_FOCUS_ID, null, ROUTE, ROUTE_ID);
    const location = useLocation();
    const focusElement = svelte.getContext(FOCUS_ELEM);
    let resolve;
    const unsubscribe = location.subscribe(() => {
      const lazyElement = new Promise(_resolve => {
        resolve = _resolve;
      });
      focusElement.set(lazyElement);
    });
    svelte.onDestroy(unsubscribe);
    return node => {
      let unmounted = false;
      const innerUnsubscribe = location.subscribe(() => {
        svelte.tick().then(() => {
          if (!unmounted) {
            resolve(node);
          }
        });
      });
      return {
        destroy() {
          unmounted = true;
          innerUnsubscribe();
        }

      };
    };
  }

  /* src/Route.svelte generated by Svelte v3.31.2 */

  const get_default_slot_changes = dirty => ({
    params: dirty &
    /*$params*/
    16,
    location: dirty &
    /*$location*/
    4
  });

  const get_default_slot_context = ctx => ({
    params: isSSR ? store.get(
    /*params*/
    ctx[9]) :
    /*$params*/
    ctx[4],
    location:
    /*$location*/
    ctx[2],
    navigate:
    /*navigate*/
    ctx[10]
  }); // (104:0) {#if isActive}


  function create_if_block$1(ctx) {
    let router;
    let current;
    router = new Router({
      props: {
        primary:
        /*primary*/
        ctx[1],
        $$slots: {
          default: [create_default_slot]
        },
        $$scope: {
          ctx
        }
      }
    });
    return {
      c() {
        internal.create_component(router.$$.fragment);
      },

      m(target, anchor) {
        internal.mount_component(router, target, anchor);
        current = true;
      },

      p(ctx, dirty) {
        const router_changes = {};
        if (dirty &
        /*primary*/
        2) router_changes.primary =
        /*primary*/
        ctx[1];

        if (dirty &
        /*$$scope, component, $location, $params, $$restProps*/
        264213) {
          router_changes.$$scope = {
            dirty,
            ctx
          };
        }

        router.$set(router_changes);
      },

      i(local) {
        if (current) return;
        internal.transition_in(router.$$.fragment, local);
        current = true;
      },

      o(local) {
        internal.transition_out(router.$$.fragment, local);
        current = false;
      },

      d(detaching) {
        internal.destroy_component(router, detaching);
      }

    };
  } // (120:2) {:else}


  function create_else_block(ctx) {
    let current;
    const default_slot_template =
    /*#slots*/
    ctx[17].default;
    const default_slot = internal.create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[18], get_default_slot_context);
    return {
      c() {
        if (default_slot) default_slot.c();
      },

      m(target, anchor) {
        if (default_slot) {
          default_slot.m(target, anchor);
        }

        current = true;
      },

      p(ctx, dirty) {
        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope, $params, $location*/
          262164) {
            internal.update_slot(default_slot, default_slot_template, ctx,
            /*$$scope*/
            ctx[18], dirty, get_default_slot_changes, get_default_slot_context);
          }
        }
      },

      i(local) {
        if (current) return;
        internal.transition_in(default_slot, local);
        current = true;
      },

      o(local) {
        internal.transition_out(default_slot, local);
        current = false;
      },

      d(detaching) {
        if (default_slot) default_slot.d(detaching);
      }

    };
  } // (112:2) {#if component !== null}


  function create_if_block_1(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [{
      location:
      /*$location*/
      ctx[2]
    }, {
      navigate:
      /*navigate*/
      ctx[10]
    }, isSSR ? store.get(
    /*params*/
    ctx[9]) :
    /*$params*/
    ctx[4],
    /*$$restProps*/
    ctx[11]];
    var switch_value =
    /*component*/
    ctx[0];

    function switch_props(ctx) {
      let switch_instance_props = {};

      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = internal.assign(switch_instance_props, switch_instance_spread_levels[i]);
      }

      return {
        props: switch_instance_props
      };
    }

    if (switch_value) {
      switch_instance = new switch_value(switch_props());
    }

    return {
      c() {
        if (switch_instance) internal.create_component(switch_instance.$$.fragment);
        switch_instance_anchor = internal.empty();
      },

      m(target, anchor) {
        if (switch_instance) {
          internal.mount_component(switch_instance, target, anchor);
        }

        internal.insert(target, switch_instance_anchor, anchor);
        current = true;
      },

      p(ctx, dirty) {
        const switch_instance_changes = dirty &
        /*$location, navigate, isSSR, get, params, $params, $$restProps*/
        3604 ? internal.get_spread_update(switch_instance_spread_levels, [dirty &
        /*$location*/
        4 && {
          location:
          /*$location*/
          ctx[2]
        }, dirty &
        /*navigate*/
        1024 && {
          navigate:
          /*navigate*/
          ctx[10]
        }, dirty &
        /*isSSR, get, params, $params*/
        528 && internal.get_spread_object(isSSR ? store.get(
        /*params*/
        ctx[9]) :
        /*$params*/
        ctx[4]), dirty &
        /*$$restProps*/
        2048 && internal.get_spread_object(
        /*$$restProps*/
        ctx[11])]) : {};

        if (switch_value !== (switch_value =
        /*component*/
        ctx[0])) {
          if (switch_instance) {
            internal.group_outros();
            const old_component = switch_instance;
            internal.transition_out(old_component.$$.fragment, 1, 0, () => {
              internal.destroy_component(old_component, 1);
            });
            internal.check_outros();
          }

          if (switch_value) {
            switch_instance = new switch_value(switch_props());
            internal.create_component(switch_instance.$$.fragment);
            internal.transition_in(switch_instance.$$.fragment, 1);
            internal.mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },

      i(local) {
        if (current) return;
        if (switch_instance) internal.transition_in(switch_instance.$$.fragment, local);
        current = true;
      },

      o(local) {
        if (switch_instance) internal.transition_out(switch_instance.$$.fragment, local);
        current = false;
      },

      d(detaching) {
        if (detaching) internal.detach(switch_instance_anchor);
        if (switch_instance) internal.destroy_component(switch_instance, detaching);
      }

    };
  } // (105:1) <Router {primary}>


  function create_default_slot(ctx) {
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block_1, create_else_block];
    const if_blocks = [];

    function select_block_type(ctx, dirty) {
      if (
      /*component*/
      ctx[0] !== null) return 0;
      return 1;
    }

    current_block_type_index = select_block_type(ctx);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        if_block.c();
        if_block_anchor = internal.empty();
      },

      m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        internal.insert(target, if_block_anchor, anchor);
        current = true;
      },

      p(ctx, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx);

        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx, dirty);
        } else {
          internal.group_outros();
          internal.transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          internal.check_outros();
          if_block = if_blocks[current_block_type_index];

          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
            if_block.c();
          } else {
            if_block.p(ctx, dirty);
          }

          internal.transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },

      i(local) {
        if (current) return;
        internal.transition_in(if_block);
        current = true;
      },

      o(local) {
        internal.transition_out(if_block);
        current = false;
      },

      d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching) internal.detach(if_block_anchor);
      }

    };
  }

  function create_fragment$1(ctx) {
    let div0;
    let t0;
    let t1;
    let div1;
    let current;
    let if_block =
    /*isActive*/
    ctx[3] && create_if_block$1(ctx);
    return {
      c() {
        div0 = internal.element("div");
        t0 = internal.space();
        if (if_block) if_block.c();
        t1 = internal.space();
        div1 = internal.element("div");
        internal.set_style(div0, "display", "none");
        internal.attr(div0, "aria-hidden", "true");
        internal.attr(div0, "data-svnav-route-start",
        /*id*/
        ctx[5]);
        internal.set_style(div1, "display", "none");
        internal.attr(div1, "aria-hidden", "true");
        internal.attr(div1, "data-svnav-route-end",
        /*id*/
        ctx[5]);
      },

      m(target, anchor) {
        internal.insert(target, div0, anchor);
        internal.insert(target, t0, anchor);
        if (if_block) if_block.m(target, anchor);
        internal.insert(target, t1, anchor);
        internal.insert(target, div1, anchor);
        current = true;
      },

      p(ctx, [dirty]) {
        if (
        /*isActive*/
        ctx[3]) {
          if (if_block) {
            if_block.p(ctx, dirty);

            if (dirty &
            /*isActive*/
            8) {
              internal.transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$1(ctx);
            if_block.c();
            internal.transition_in(if_block, 1);
            if_block.m(t1.parentNode, t1);
          }
        } else if (if_block) {
          internal.group_outros();
          internal.transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          internal.check_outros();
        }
      },

      i(local) {
        if (current) return;
        internal.transition_in(if_block);
        current = true;
      },

      o(local) {
        internal.transition_out(if_block);
        current = false;
      },

      d(detaching) {
        if (detaching) internal.detach(div0);
        if (detaching) internal.detach(t0);
        if (if_block) if_block.d(detaching);
        if (detaching) internal.detach(t1);
        if (detaching) internal.detach(div1);
      }

    };
  }

  const createId$1 = createCounter();

  function instance$1($$self, $$props, $$invalidate) {
    let isActive;
    const omit_props_names = ["path", "component", "meta", "primary"];
    let $$restProps = internal.compute_rest_props($$props, omit_props_names);
    let $parentBase;
    let $location;
    let $activeRoute;
    let $params;
    let {
      $$slots: slots = {},
      $$scope
    } = $$props;
    let {
      path = ""
    } = $$props;
    let {
      component = null
    } = $$props;
    let {
      meta = {}
    } = $$props;
    let {
      primary = true
    } = $$props;
    usePreflightCheck(ROUTE_ID, $$props);
    const id = createId$1();
    const {
      registerRoute,
      unregisterRoute,
      activeRoute
    } = svelte.getContext(ROUTER);
    internal.component_subscribe($$self, activeRoute, value => $$invalidate(16, $activeRoute = value));
    const parentBase = useRouteBase();
    internal.component_subscribe($$self, parentBase, value => $$invalidate(15, $parentBase = value));
    const location = useLocation();
    internal.component_subscribe($$self, location, value => $$invalidate(2, $location = value));
    const focusElement = store.writable(null); // In SSR we cannot wait for $activeRoute to update,
    // so we use the match returned from `registerRoute` instead

    let ssrMatch;
    const route = store.writable();
    const params = store.writable({});
    internal.component_subscribe($$self, params, value => $$invalidate(4, $params = value));
    svelte.setContext(ROUTE, route);
    svelte.setContext(ROUTE_PARAMS, params);
    svelte.setContext(FOCUS_ELEM, focusElement); // We need to call useNavigate after the route is set,
    // so we can use the routes path for link resolution

    const navigate = useNavigate(); // There is no need to unregister Routes in SSR since it will all be
    // thrown away anyway

    if (!isSSR) {
      svelte.onDestroy(() => unregisterRoute(id));
    }

    $$self.$$set = $$new_props => {
      $$invalidate(23, $$props = internal.assign(internal.assign({}, $$props), internal.exclude_internal_props($$new_props)));
      $$invalidate(11, $$restProps = internal.compute_rest_props($$props, omit_props_names));
      if ("path" in $$new_props) $$invalidate(12, path = $$new_props.path);
      if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
      if ("meta" in $$new_props) $$invalidate(13, meta = $$new_props.meta);
      if ("primary" in $$new_props) $$invalidate(1, primary = $$new_props.primary);
      if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    };

    $$self.$$.update = () => {
      if ($$self.$$.dirty &
      /*path, $parentBase, meta, $location, primary*/
      45062) {
         {
          // The route store will be re-computed whenever props, location or parentBase change
          const isDefault = path === "";
          const rawBase = join($parentBase, path);
          const updatedRoute = {
            id,
            path,
            meta,
            // If no path prop is given, this Route will act as the default Route
            // that is rendered if no other Route in the Router is a match
            default: isDefault,
            fullPath: isDefault ? "" : rawBase,
            base: isDefault ? $parentBase : extractBaseUri(rawBase, $location.pathname),
            primary,
            focusElement
          }; // Use the parent base when the base is null. This prevents an error
          // when routes transition out.

          if (updatedRoute.base === null) {
            updatedRoute.base = $parentBase || "/";
          }

          route.set(updatedRoute); // If we're in SSR mode and the Route matches,
          // `registerRoute` will return the match

          $$invalidate(14, ssrMatch = registerRoute(updatedRoute));
        }
      }

      if ($$self.$$.dirty &
      /*ssrMatch, $activeRoute*/
      81920) {
         $$invalidate(3, isActive = !!(ssrMatch || $activeRoute && $activeRoute.id === id));
      }

      if ($$self.$$.dirty &
      /*isActive, ssrMatch, $activeRoute*/
      81928) {
         if (isActive) {
          const {
            params: activeParams
          } = ssrMatch || $activeRoute;
          params.set(activeParams);
        }
      }
    };

    $$props = internal.exclude_internal_props($$props);
    return [component, primary, $location, isActive, $params, id, activeRoute, parentBase, location, params, navigate, $$restProps, path, meta, ssrMatch, $parentBase, $activeRoute, slots, $$scope];
  }

  class Route extends internal.SvelteComponent {
    constructor(options) {
      super();
      internal.init(this, options, instance$1, create_fragment$1, internal.safe_not_equal, {
        path: 12,
        component: 0,
        meta: 13,
        primary: 1
      });
    }

  }

  function create_fragment$2(ctx) {
    let a;
    let current;
    let mounted;
    let dispose;
    const default_slot_template =
    /*#slots*/
    ctx[13].default;
    const default_slot = internal.create_slot(default_slot_template, ctx,
    /*$$scope*/
    ctx[12], null);
    let a_levels = [{
      href:
      /*href*/
      ctx[0]
    },
    /*ariaCurrent*/
    ctx[1],
    /*props*/
    ctx[2]];
    let a_data = {};

    for (let i = 0; i < a_levels.length; i += 1) {
      a_data = internal.assign(a_data, a_levels[i]);
    }

    return {
      c() {
        a = internal.element("a");
        if (default_slot) default_slot.c();
        internal.set_attributes(a, a_data);
      },

      m(target, anchor) {
        internal.insert(target, a, anchor);

        if (default_slot) {
          default_slot.m(a, null);
        }

        current = true;

        if (!mounted) {
          dispose = internal.listen(a, "click",
          /*onClick*/
          ctx[4]);
          mounted = true;
        }
      },

      p(ctx, [dirty]) {
        if (default_slot) {
          if (default_slot.p && dirty &
          /*$$scope*/
          4096) {
            internal.update_slot(default_slot, default_slot_template, ctx,
            /*$$scope*/
            ctx[12], dirty, null, null);
          }
        }

        internal.set_attributes(a, a_data = internal.get_spread_update(a_levels, [(!current || dirty &
        /*href*/
        1) && {
          href:
          /*href*/
          ctx[0]
        }, dirty &
        /*ariaCurrent*/
        2 &&
        /*ariaCurrent*/
        ctx[1], dirty &
        /*props*/
        4 &&
        /*props*/
        ctx[2]]));
      },

      i(local) {
        if (current) return;
        internal.transition_in(default_slot, local);
        current = true;
      },

      o(local) {
        internal.transition_out(default_slot, local);
        current = false;
      },

      d(detaching) {
        if (detaching) internal.detach(a);
        if (default_slot) default_slot.d(detaching);
        mounted = false;
        dispose();
      }

    };
  }

  function instance$2($$self, $$props, $$invalidate) {
    let href;
    let isPartiallyCurrent;
    let isCurrent;
    let ariaCurrent;
    let props;
    const omit_props_names = ["to", "replace", "state", "getProps"];
    let $$restProps = internal.compute_rest_props($$props, omit_props_names);
    let $location;
    let {
      $$slots: slots = {},
      $$scope
    } = $$props;
    let {
      to
    } = $$props;
    let {
      replace = false
    } = $$props;
    let {
      state = {}
    } = $$props;
    let {
      getProps = null
    } = $$props;
    usePreflightCheck(LINK_ID, $$props);
    const location = useLocation();
    internal.component_subscribe($$self, location, value => $$invalidate(9, $location = value));
    const dispatch = svelte.createEventDispatcher();
    const resolve = useResolve();
    const {
      navigate
    } = useHistory();

    function onClick(event) {
      dispatch("click", event);

      if (shouldNavigate(event)) {
        event.preventDefault(); // Don't push another entry to the history stack when the user
        // clicks on a Link to the page they are currently on.

        const shouldReplace = isCurrent || replace;
        navigate(href, {
          state,
          replace: shouldReplace
        });
      }
    }

    $$self.$$set = $$new_props => {
      $$invalidate(17, $$props = internal.assign(internal.assign({}, $$props), internal.exclude_internal_props($$new_props)));
      $$invalidate(18, $$restProps = internal.compute_rest_props($$props, omit_props_names));
      if ("to" in $$new_props) $$invalidate(5, to = $$new_props.to);
      if ("replace" in $$new_props) $$invalidate(6, replace = $$new_props.replace);
      if ("state" in $$new_props) $$invalidate(7, state = $$new_props.state);
      if ("getProps" in $$new_props) $$invalidate(8, getProps = $$new_props.getProps);
      if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    };

    $$self.$$.update = () => {
      if ($$self.$$.dirty &
      /*to, $location*/
      544) {
        // We need to pass location here to force re-resolution of the link,
        // when the pathname changes. Otherwise we could end up with stale path params,
        // when for example an :id changes in the parent Routes path
         $$invalidate(0, href = resolve(to, $location));
      }

      if ($$self.$$.dirty &
      /*$location, href*/
      513) {
         $$invalidate(10, isPartiallyCurrent = startsWith($location.pathname, href));
      }

      if ($$self.$$.dirty &
      /*href, $location*/
      513) {
         $$invalidate(11, isCurrent = href === $location.pathname);
      }

      if ($$self.$$.dirty &
      /*isCurrent*/
      2048) {
         $$invalidate(1, ariaCurrent = isCurrent ? {
          "aria-current": "page"
        } : {});
      }

       $$invalidate(2, props = (() => {
        if (isFunction(getProps)) {
          const dynamicProps = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          });
          return _objectSpread2(_objectSpread2({}, $$restProps), dynamicProps);
        }

        return $$restProps;
      })());
    };

    $$props = internal.exclude_internal_props($$props);
    return [href, ariaCurrent, props, location, onClick, to, replace, state, getProps, $location, isPartiallyCurrent, isCurrent, $$scope, slots];
  }

  class Link extends internal.SvelteComponent {
    constructor(options) {
      super();
      internal.init(this, options, instance$2, create_fragment$2, internal.safe_not_equal, {
        to: 5,
        replace: 6,
        state: 7,
        getProps: 8
      });
    }

  }

  /*
   * Adapted from https://github.com/EmilTholin/svelte-routing
   *
   * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
   */

  const createAction = getAnchor => (node, navigate$1 = navigate) => {
    const handleClick = event => {
      const anchor = getAnchor(event);

      if (anchor && anchor.target === "" && shouldNavigate(event)) {
        event.preventDefault();
        const to = anchor.pathname + anchor.search + anchor.hash;
        navigate$1(to, {
          replace: anchor.hasAttribute("replace")
        });
      }
    };

    const unlisten = addListener(node, "click", handleClick);
    return {
      destroy: unlisten
    };
  }; // prettier-ignore

  /**
   * A link action that can be added to <a href=""> tags rather
   * than using the <Link> component.
   *
   * Example:
   * ```html
   * <a href="/post/{postId}" use:link>{post.title}</a>
   * ```
   */


  const link = /*#__PURE__*/createAction(event => event.currentTarget); // eslint-disable-line spaced-comment, max-len
  // prettier-ignore

  /**
   * An action to be added at a root element of your application to
   * capture all relative links and push them onto the history stack.
   *
   * Example:
   * ```html
   * <div use:links>
   *   <Router>
   *     <Route path="/" component={Home} />
   *     <Route path="/p/:projectId/:docId" component={ProjectScreen} />
   *     {#each projects as project}
   *       <a href="/p/{project.id}">{project.title}</a>
   *     {/each}
   *   </Router>
   * </div>
   * ```
   */

  const links = /*#__PURE__*/createAction(event => {
    // eslint-disable-line spaced-comment
    const anchor = findClosest("A", event.target);

    if (anchor && isFunction(anchor.hasAttribute) && !anchor.hasAttribute("noroute")) {
      return anchor;
    }

    return null;
  });

  exports.Link = Link;
  exports.Route = Route;
  exports.Router = Router;
  exports.createHistory = createHistory;
  exports.createMemorySource = createMemorySource;
  exports.globalHistory = globalHistory;
  exports.link = link;
  exports.links = links;
  exports.navigate = navigate;
  exports.useFocus = useFocus;
  exports.useLocation = useLocation;
  exports.useMatch = useMatch;
  exports.useNavigate = useNavigate;
  exports.useParams = useParams;
  exports.useResolvable = useResolvable;
  exports.useResolve = useResolve;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
