/* Skins-Pro 2026-07-24T09:14:06.106Z */
const DEFAULT_ASSETS = {
    base: 'base-texture.jpg',
    stage: 'background.jpg',
    theme_css: 'theme.css',
    avatar: 'avatar.png',
    decor: 'decoration.png',
    light: 'icon-light.png',
    switch: 'icon-switch.png',
    button: 'icon-button.png',
    climate: 'icon-ac.png',
    water_heater: 'icon-water_heater.png',
    humidifier: 'icon-humidifier.png',
    fan: 'icon-fan.png',
    speaker: 'icon-speaker.png',
    remote: 'icon-remote.png',
    lock: 'icon-lock.png',
    camera: 'icon-camera.png',
    cover: 'icon-cover.png',
    valve: 'icon-valve.png',
    automation: 'icon-automation.png',
    media_player: 'icon-media_player.png',
    vacuum: 'icon-vacuum.png',
    sensor: 'icon-sensor.png',
    binary_sensor: 'icon-binary_sensor.png',
    update: 'icon-update.png',
    device_tracker: 'icon-device_tracker.png',
    person: 'icon-person.png',
    garden: 'icon-garden-light.png',
    room_living: 'room-living.jpg',
    room_bedroom: 'room-bedroom.jpg',
    room_kitchen: 'room-kitchen.jpg',
    room_garden: 'room-garden.jpg',
};
const DEFAULT_NAV = [
    { key: 'home', icon: 'mdi:home', enabled: true },
    { key: 'devices', icon: 'mdi:devices', enabled: true },
    { key: 'scenes', icon: 'mdi:palette-swatch', enabled: true },
    { key: 'automations', icon: 'mdi:robot', enabled: true },
    { key: 'rooms', icon: 'mdi:door', enabled: true },
    { key: 'security', icon: 'mdi:shield-home', enabled: true },
    { key: 'energy', icon: 'mdi:lightning-bolt', enabled: true },
];
const DEFAULT_DEVICES = [
    { entity: 'light.living_room_lights', image: 'light', color: 'yellow' },
    { entity: 'climate.living_room_ac', image: 'climate', color: 'blue', temperature_entity: 'sensor.living_room_temperature' },
    { entity: 'media_player.living_room_speaker', image: 'speaker', color: 'purple' },
    { entity: 'lock.front_door', image: 'lock', color: 'red' },
    { entity: 'light.garden_light_strip', image: 'garden', color: 'green' },
];
const DEFAULT_ROOMS = [
    { image: 'room_living', info_entity: 'sensor.living_room_summary' },
    { image: 'room_bedroom', info_entity: 'sensor.bedroom_summary' },
    { image: 'room_kitchen', info_entity: 'sensor.kitchen_summary' },
    { image: 'room_garden', info_entity: 'sensor.garden_summary' },
];
const DEFAULT_SCENES = [
    { entity: 'scene.home_mode', tone: 'morning', icon: 'mdi:home-import-outline', confirm: true },
    { entity: 'scene.good_night', tone: 'night', icon: 'mdi:weather-night', confirm: true },
    { entity: 'scene.welcome_home', tone: 'movie', icon: 'mdi:home-heart', confirm: true },
    { entity: 'scene.away_mode', tone: 'game', icon: 'mdi:exit-run', confirm: true },
];
const DEFAULT_ENVIRONMENT = [
    { entity: 'sensor.living_room_temperature', icon: 'mdi:thermometer', unit: '°C', variant: 'temp' },
    { entity: 'sensor.living_room_humidity', icon: 'mdi:water-percent', unit: '%', variant: 'hum' },
    { entity: 'sensor.pm25', icon: 'mdi:leaf', unit: '', variant: 'pm' },
];
const DEFAULT_CONFIG = {
    type: 'custom:skins-pro-card',
    language: 'auto',
    resource_pack: {
        skin: 'modern',
        base_path: '__AUTO__',
        assets: DEFAULT_ASSETS,
    },
    weather: {
        entity: 'weather.home',
        temperature_entity: 'sensor.outdoor_temperature',
    },
    info: {
        entity: 'input_text.daily_quote',
    },
    fullscreen: false,
    fullscreen_users: [],
    use_area_pictures: false,
    downloaded_skins: [],
    devices: DEFAULT_DEVICES,
    rooms: DEFAULT_ROOMS,
    scenes: DEFAULT_SCENES,
    environment: DEFAULT_ENVIRONMENT,
    nav: DEFAULT_NAV,
    energy: {
        entity: '',
        unit: 'kWh',
    },
    media_player: {
        entity: '',
    },
    camera: {
        entity: '',
    },
    security_page: {
        hidden: [],
        cameras: [],
        door_camera: '',
        door_lock: '',
    },
    devices_page: {
        hidden: [],
    },
    scenes_page: {
        selection: [],
    },
    home_limits: {
        devices: 5,
        rooms: 4,
        scenes: 6,
        environment: 12,
    },
    home_selection: {
        devices: [],
        rooms: [],
        scenes: [],
        environment: [],
    },
};

function mergeConfig(config) {
    return {
        ...DEFAULT_CONFIG,
        ...config,
        resource_pack: {
            ...DEFAULT_CONFIG.resource_pack,
            ...config.resource_pack,
            assets: {
                ...DEFAULT_CONFIG.resource_pack?.assets,
                ...config.resource_pack?.assets,
            },
            theme: {
                ...DEFAULT_CONFIG.resource_pack?.theme,
                ...config.resource_pack?.theme,
            },
        },
        weather: {
            ...DEFAULT_CONFIG.weather,
            ...config.weather,
        },
        info: {
            ...DEFAULT_CONFIG.info,
            ...config.info,
        },
        energy: {
            ...DEFAULT_CONFIG.energy,
            ...config.energy,
        },
        media_player: {
            ...DEFAULT_CONFIG.media_player,
            ...config.media_player,
        },
        camera: {
            ...DEFAULT_CONFIG.camera,
            ...config.camera,
        },
        security_page: {
            ...DEFAULT_CONFIG.security_page,
            ...config.security_page,
            hidden: [...new Set((config.security_page?.hidden || DEFAULT_CONFIG.security_page?.hidden || []).filter(Boolean))],
            cameras: [...(config.security_page?.cameras ?? DEFAULT_CONFIG.security_page?.cameras ?? [])].filter(Boolean),
            door_camera: String(config.security_page?.door_camera || DEFAULT_CONFIG.security_page?.door_camera || ''),
            door_lock: String(config.security_page?.door_lock || DEFAULT_CONFIG.security_page?.door_lock || ''),
            selection: [...(config.security_page?.selection ?? [])].filter(Boolean),
            streams: Array.isArray(config.security_page?.streams)
                ? config.security_page.streams
                : DEFAULT_CONFIG.security_page?.streams,
        },
        devices_page: {
            ...DEFAULT_CONFIG.devices_page,
            ...config.devices_page,
            hidden: [...new Set((config.devices_page?.hidden || DEFAULT_CONFIG.devices_page?.hidden || []).filter(Boolean))],
        },
        scenes_page: {
            ...DEFAULT_CONFIG.scenes_page,
            ...config.scenes_page,
            selection: [...new Set((config.scenes_page?.selection || DEFAULT_CONFIG.scenes_page?.selection || []).filter(Boolean))],
        },
        home_limits: {
            ...DEFAULT_CONFIG.home_limits,
            ...config.home_limits,
        },
        home_selection: {
            ...DEFAULT_CONFIG.home_selection,
            ...config.home_selection,
        },
        devices: config.devices && config.devices.length > 0 ? config.devices : DEFAULT_CONFIG.devices,
        rooms: config.rooms && config.rooms.length > 0 ? config.rooms : DEFAULT_CONFIG.rooms,
        scenes: config.scenes && config.scenes.length > 0 ? config.scenes : DEFAULT_CONFIG.scenes,
        environment: config.environment && config.environment.length > 0 ? config.environment : DEFAULT_CONFIG.environment,
        nav: config.nav && config.nav.length > 0
            ? [...config.nav, ...(DEFAULT_CONFIG.nav || []).filter((defaultItem) => !config.nav?.some((item) => (item.key || item.target) === (defaultItem.key || defaultItem.target)))]
            : DEFAULT_CONFIG.nav,
    };
}
function findEntity(states, candidates) {
    const ids = Object.keys(states);
    for (const candidate of candidates) {
        const exact = ids.find((id) => id === candidate);
        if (exact)
            return exact;
    }
    for (const candidate of candidates) {
        const lowerCandidate = candidate.toLowerCase();
        const partial = ids.find((id) => id.toLowerCase().includes(lowerCandidate));
        if (partial)
            return partial;
    }
    return undefined;
}
function findEntities(states, domain, keywords, limit) {
    const ids = Object.keys(states).filter((id) => id.startsWith(`${domain}.`));
    const scored = ids
        .map((id) => {
        const lower = id.toLowerCase();
        const score = keywords.reduce((total, keyword) => total + (lower.includes(keyword) ? 1 : 0), 0);
        return { id, score };
    })
        .filter((entry) => entry.score > 0);
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry) => entry.id);
}
function buildAutoConfig(hass) {
    const states = hass.states || {};
    const defaultDevice0 = DEFAULT_DEVICES[0];
    const defaultDevice1 = DEFAULT_DEVICES[1];
    const defaultDevice2 = DEFAULT_DEVICES[2];
    const defaultDevice3 = DEFAULT_DEVICES[3];
    const defaultDevice4 = DEFAULT_DEVICES[4];
    const defaultEnv0 = DEFAULT_ENVIRONMENT[0];
    const defaultEnv1 = DEFAULT_ENVIRONMENT[1];
    const defaultEnv2 = DEFAULT_ENVIRONMENT[2];
    const weatherEntity = findEntity(states, ['weather.home', 'weather.forecast_home', 'weather.']);
    const outdoorTemp = findEntity(states, ['sensor.outdoor_temperature', 'sensor.outside_temperature', 'sensor.weather_temperature']);
    const quoteEntity = findEntity(states, ['input_text.daily_quote', 'sensor.daily_quote', 'sensor.hitokoto']);
    const energyEntity = findEntity(states, ['sensor.energy_cost_today', 'sensor.energy_today', 'sensor.daily_energy']);
    const livingTemp = findEntity(states, ['sensor.living_room_temperature', 'sensor.living_temperature', 'sensor.temperature_living']);
    const livingHumidity = findEntity(states, ['sensor.living_room_humidity', 'sensor.living_humidity', 'sensor.humidity_living']);
    const pm25 = findEntity(states, ['sensor.pm25', 'sensor.pm2_5', 'sensor.air_pm25']);
    const lightEntities = findEntities(states, 'light', ['living', 'garden', 'bedroom', 'kitchen'], 2);
    const climateEntity = findEntity(states, ['climate.living_room_ac', 'climate.living_room', 'climate.ac']);
    const mediaEntity = findEntity(states, ['media_player.living_room_speaker', 'media_player.speaker', 'media_player.living']);
    const lockEntity = findEntity(states, ['lock.front_door', 'lock.door']);
    const gardenLight = findEntity(states, ['light.garden_light_strip', 'light.garden', 'light.outdoor']);
    const sceneEntities = findEntities(states, 'scene', ['home', 'night', 'welcome', 'away', 'movie'], 4);
    const mappedScenes = DEFAULT_SCENES.map((scene, index) => ({
        ...scene,
        entity: sceneEntities[index] || scene.entity,
    }));
    return mergeConfig({
        type: 'custom:skins-pro-card',
        weather: {
            entity: weatherEntity || DEFAULT_CONFIG.weather?.entity,
            temperature_entity: outdoorTemp || DEFAULT_CONFIG.weather?.temperature_entity,
        },
        info: {
            entity: quoteEntity || DEFAULT_CONFIG.info?.entity,
        },
        energy: {
            ...DEFAULT_CONFIG.energy,
            // Only auto-fill when a real entity exists; never keep a placeholder default.
            entity: energyEntity || '',
        },
        media_player: {
            entity: mediaEntity || DEFAULT_CONFIG.media_player?.entity,
        },
        devices: [
            { ...defaultDevice0, entity: lightEntities[0] || defaultDevice0.entity, temperature_entity: livingTemp || defaultDevice0.temperature_entity },
            { ...defaultDevice1, entity: climateEntity || defaultDevice1.entity, temperature_entity: livingTemp || defaultDevice1.temperature_entity },
            { ...defaultDevice2, entity: mediaEntity || defaultDevice2.entity },
            { ...defaultDevice3, entity: lockEntity || defaultDevice3.entity },
            { ...defaultDevice4, entity: gardenLight || lightEntities[1] || defaultDevice4.entity },
        ],
        rooms: [
            { image: 'room_living', info_entity: findEntity(states, ['sensor.living_room_summary', 'sensor.living_summary']) },
            { image: 'room_bedroom', info_entity: findEntity(states, ['sensor.bedroom_summary', 'sensor.bed_summary']) },
            { image: 'room_kitchen', info_entity: findEntity(states, ['sensor.kitchen_summary']) },
            { image: 'room_garden', info_entity: findEntity(states, ['sensor.garden_summary']) },
        ],
        scenes: mappedScenes,
        environment: [
            { ...defaultEnv0, entity: livingTemp || defaultEnv0.entity },
            { ...defaultEnv1, entity: livingHumidity || defaultEnv1.entity },
            { ...defaultEnv2, entity: pm25 || defaultEnv2.entity },
        ],
    });
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$2=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t=>t,s$1=t$1.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$2=`lit$${Math.random().toFixed(9).slice(2)}$`,n$1="?"+o$2,r$2=`<${n$1}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$2+x):s+o$2+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$2),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$2)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$2),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$1)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$2,t+1));)d.push({type:7,index:l}),t+=o$2.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$1.litHtmlPolyfillSupport;B?.(S,k),(t$1.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n({...r,state:true,attribute:false})}

// Auto-generated by build-skins.cjs
const SKINS = ["modern"];
const DEFAULT_SKIN = "modern";
const SKIN_STRINGS = { "modern": { "author": "Desmond-Dong", "version": "20260717", "title_zh": "欢迎回来！", "title_en": "Welcome back!", "subtitle_zh": "您的智能空间", "subtitle_en": "Your smart space", "profile_subtitle_zh": "简约·现代", "profile_subtitle_en": "Modern·Clean", "icon_map": { "light": "light", "input_boolean": "switch", "button": "button", "scene": "light", "climate": "climate", "water_heater": "water_heater", "humidifier": "humidifier", "media_player": "speaker", "remote": "remote", "lock": "lock", "binary_sensor": "lock", "alarm_control_panel": "lock", "switch": "switch", "fan": "fan", "cover": "switch", "camera": "camera", "automation": "switch", "sensor": "button", "person": "button", "vacuum": "fan", "device_tracker": "button", "valve": "switch", "update": "button" } } };
const SKIN_ICON_MAPS = { "modern": { "light": "light", "input_boolean": "switch", "button": "button", "scene": "light", "climate": "climate", "water_heater": "water_heater", "humidifier": "humidifier", "media_player": "speaker", "remote": "remote", "lock": "lock", "binary_sensor": "lock", "alarm_control_panel": "lock", "switch": "switch", "fan": "fan", "cover": "switch", "camera": "camera", "automation": "switch", "sensor": "button", "person": "button", "vacuum": "fan", "device_tracker": "button", "valve": "switch", "update": "button" } };

const en = {
    home: 'Home',
    devices: 'Devices',
    scenes: 'Scenes',
    automations: 'Automations',
    rooms: 'Rooms',
    security: 'Security',
    energy: 'Energy',
    environment: 'Environment',
    quickControl: 'Quick control',
    roomSnapshots: 'Snapshots',
    modes: 'Modes',
    todayEnergy: 'Energy Today',
    totalEnergy: 'Total Today',
    monthToDate: 'Month to date',
    weekToDate: 'Week to date',
    maintenance: 'Maintenance',
    compareYesterday: 'Yesterday',
    loadingQuote: 'Loading',
    offline: 'Offline',
    noDevices: 'No devices',
    noScenes: 'No scenes',
    noAutomations: 'No automations',
    byArea: 'By area',
    byType: 'By type',
    securityOverview: 'Cameras, locks and arming status',
    on: 'On',
    off: 'Off',
    open: 'Open',
    closed: 'Closed',
    solar: 'Solar',
    battery: 'Battery',
    gas: 'Gas',
    water: 'Water',
    gridReturn: 'Grid Return',
    allRooms: 'All rooms',
    allFloors: 'All floors',
    allTypes: 'All types',
    turnOnAll: 'Turn on all',
    turnOffAll: 'Turn off all',
    confirmAction: 'Confirm this operation?',
    uploadBackground: 'Upload background',
    clearBackground: 'Clear background',
    mediaPlayer: 'Media Player',
    showAll: 'Show all',
    hideUnassigned: 'Hide unassigned',
    editHidden: 'Edit hidden',
    editHiddenDone: 'Done',
    editHiddenSaving: 'Saving…',
    hideSecurityHint: 'Tap cards to hide/restore; Done exits (no auto-exit)',
    hideDevicesHint: 'Long-press to hide, tap hidden cards to restore; exits after 10s idle',
    entityHidden: 'Hidden',
    tapToHide: 'Tap to hide',
    groupLights: 'Lights',
    groupSwitches: 'Switches',
    groupClimate: 'Climate',
    climateTempCurrent: 'Current',
    climateTempTarget: 'Target',
    climateMode: 'Mode',
    climateFanSpeed: 'Fan',
    climateSwing: 'Swing',
    climatePreset: 'Preset',
    hvacAuto: 'Auto',
    hvacCool: 'Cool',
    hvacHeat: 'Heat',
    hvacFanOnly: 'Fan Only',
    hvacDry: 'Dry',
    hvacOff: 'Off',
    fanAuto: 'Auto',
    fanLow: 'Low',
    fanMedium: 'Medium',
    fanHigh: 'High',
    fanOn: 'On',
    fanOff: 'Off',
    fanSilent: 'Silent',
    fanFull: 'Full',
    swingOff: 'Off',
    swingBoth: 'Both',
    swingVertical: 'Vertical',
    swingHorizontal: 'Horizontal',
    presetNone: 'None',
    presetEco: 'Eco',
    presetAway: 'Away',
    presetBoost: 'Boost',
    presetSleep: 'Sleep',
    brightness: 'Brightness',
    colorTemperature: 'Color Temperature',
    colorMode: 'Color Mode',
    fanSpeed: 'Speed',
    fanOscillate: 'Oscillate',
    fanDirection: 'Direction',
    airPurifier: 'Air Purifier',
    humidifying: 'Humidifying',
    drying: 'Drying',
    idle: 'Idle',
    targetHumidity: 'Target Humidity',
    currentHumidity: 'Current Humidity',
    vacuumCleaning: 'Cleaning',
    vacuumDocked: 'Docked',
    vacuumReturning: 'Returning',
    vacuumPaused: 'Paused',
    vacuumIdle: 'Idle',
    vacuumError: 'Error',
    vacuumStart: 'Start',
    vacuumPause: 'Pause',
    vacuumStop: 'Stop',
    vacuumDock: 'Return to dock',
    vacuumLocate: 'Locate',
    vacuumCleanSpot: 'Clean spot',
    alarmDisarmed: 'Disarmed',
    alarmArmedHome: 'Armed home',
    alarmArmedAway: 'Armed away',
    alarmArmedNight: 'Armed night',
    alarmArmedVacation: 'Armed vacation',
    alarmArmedCustom: 'Armed custom',
    alarmArming: 'Arming',
    alarmPending: 'Pending',
    alarmTriggered: 'Triggered',
    alarmDisarming: 'Disarming',
    groupCovers: 'Covers',
    groupMedia: 'Media',
    groupSecurity: 'Security',
    groupOthers: 'Others',
    groupCleaning: 'Cleaning',
    otherGroup: 'Other',
    noEntities: 'No entities',
    areaOccupied: 'Occupied',
    areaEmpty: 'Empty',
    entityCount: '{count} entities',
    deviceEntityCount: '{devices} devices · {entities} entities',
    notActivated: 'Not activated',
    notTriggered: 'Not triggered',
    run: 'Run',
    enabled: 'Enabled',
    disabled: 'Disabled',
    snapshot: 'Snapshot',
    toggleTheme: 'Toggle dark/light theme',
    loadingRegistry: 'Loading Home Assistant data…',
    noAreas: 'No Home Assistant areas found',
    automationsSubtitle: 'Home Assistant automations',
    turnOn: 'Turn on',
    previous: 'Previous',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    editorSkin: 'Skin',
    editorSkinStore: 'Skin Store',
    editorSkinStoreDependency: 'Install the integration to download skins',
    editorSkinStoreClose: 'Close',
    editorSkinStoreLoadFailed: 'Failed to load, please check your network',
    editorSkinStoreDownload: 'Download',
    editorSkinStoreRemove: 'Remove',
    editorSkinStoreRedownload: 'Update',
    editorSkinStoreNewVersion: 'New version',
    editorSkinStoreSearch: 'Search skins...',
    editorStoreClearCache: 'If the layout breaks after updating, try clearing your browser cache first.',
    editorEnergy: 'Energy',
    editorMediaPlayer: 'Media Player',
    editorCamera: 'Camera',
    editorHomeDevices: 'Home Devices',
    editorHomeRooms: 'Home Rooms',
    editorHomeScenes: 'Home Scenes (sidebar)',
    editorScenesPage: 'Scenes Page',
    editorScenesPageHint: 'Controls what appears under the Scenes nav item — not the same as Home Scenes below.',
    editorSecurityPage: 'Security',
    editorSecurityPageHint: 'Regular security cameras; leave empty to hide those cards.',
    editorSecurityCameras: 'Security cameras',
    editorSecurityDoor: 'Door access',
    editorSecurityDoorHint: 'Door access is separate from cameras. Leave lock/camera empty to hide door UI. Door stations use go2rtc (no second RTSP client).',
    editorSecurityDoorLock: 'Door lock / open',
    editorSecurityDoorCamera: 'Door camera',
    editorHomeEnv: 'Home Environment',
    editorInfo: 'Info',
    editorFullscreen: 'Fullscreen',
    editorUseAreaPictures: 'Use Home Assistant Area Pictures',
    editorNavigation: 'Navigation (optional)',
    editorNavigationConfigure: 'Configure',
    editorSkinMode: 'Skin Mode',
    editorSkinModeAuto: 'Auto',
    editorSkinModeLight: 'Light',
    editorSkinModeDark: 'Dark',
    editorCancel: 'Cancel',
    editorSave: 'Save',
    editorBackground: 'Background',
    editorWeather: 'Weather',
    editorEnergyEntity: 'Energy Entity',
    editorLoadingAreas: 'Loading areas...',
    editorDownloading: 'Downloading...',
    editorDownloadFailed: 'Download failed: {message}',
    editorUploadFailed: 'Background upload failed: {message}. Please try again.',
    alarmEnterCode: 'Enter code',
    lockUnlock: 'Unlock',
    lockUnlocking: 'Unlocking…',
    lockAutoClose: 'Closes in {n}s',
    doorbellTitle: 'Someone at the door',
    doorbellPreview: 'Door camera',
    doorbellDismiss: 'Dismiss',
    doorbellWaitPhone: 'Phone alert in {n}s',
    doorbellPhoneNotified: 'Phone notified — you can still unlock or dismiss',
    searchPlaceholder: 'Search devices...',
    searchRecent: 'Recent',
    searchNoResults: 'No matching devices found',
    searchAll: 'All',
};

const zh = {
    home: '首页',
    devices: '设备',
    scenes: '场景',
    automations: '自动化',
    rooms: '房间',
    security: '安全',
    energy: '能源',
    environment: '环境信息',
    quickControl: '快捷控制',
    roomSnapshots: '视窗快照',
    modes: '模式',
    todayEnergy: '今日用电',
    totalEnergy: '今日总用电',
    monthToDate: '本月累计',
    weekToDate: '本周累计',
    maintenance: '维护信息',
    compareYesterday: '昨日',
    loadingQuote: '加载中',
    offline: '离线',
    noDevices: '暂无设备',
    noScenes: '暂无场景',
    noAutomations: '暂无自动化',
    byArea: '按房间',
    byType: '按类型',
    securityOverview: '摄像头、门锁与布撤防',
    on: '开启',
    off: '关闭',
    open: '打开',
    closed: '关闭',
    solar: '太阳能',
    battery: '电池',
    gas: '燃气',
    water: '用水',
    gridReturn: '返送电网',
    allRooms: '全部房间',
    allFloors: '全部楼层',
    allTypes: '全部类型',
    turnOnAll: '全部开启',
    turnOffAll: '全部关闭',
    confirmAction: '确认执行此操作？',
    uploadBackground: '上传背景图',
    clearBackground: '清除背景图',
    mediaPlayer: '媒体播放器',
    showAll: '显示全部',
    hideUnassigned: '隐藏未分配',
    editHidden: '编辑隐藏',
    editHiddenDone: '完成',
    editHiddenSaving: '保存中…',
    hideSecurityHint: '点卡片切换隐藏/恢复，最后点「完成」保存并退出',
    hideDevicesHint: '长按隐藏，点已隐藏卡片恢复；10秒无操作自动退出',
    entityHidden: '已隐藏',
    tapToHide: '点击隐藏',
    groupLights: '灯光',
    groupSwitches: '开关',
    groupClimate: '空调',
    climateTempCurrent: '当前温度',
    climateTempTarget: '目标温度',
    climateMode: '模式',
    climateFanSpeed: '风速',
    climateSwing: '摆风',
    climatePreset: '预设',
    hvacAuto: '自动',
    hvacCool: '制冷',
    hvacHeat: '制热',
    hvacFanOnly: '送风',
    hvacDry: '除湿',
    hvacOff: '关闭',
    fanAuto: '自动',
    fanLow: '低',
    fanMedium: '中',
    fanHigh: '高',
    fanOn: '开',
    fanOff: '关',
    fanSilent: '静音',
    fanFull: '全速',
    swingOff: '关闭',
    swingBoth: '全部',
    swingVertical: '垂直',
    swingHorizontal: '水平',
    presetNone: '无',
    presetEco: '节能',
    presetAway: '离家',
    presetBoost: '强力',
    presetSleep: '睡眠',
    brightness: '亮度',
    colorTemperature: '色温',
    colorMode: '色彩模式',
    fanSpeed: '风速',
    fanOscillate: '摆风',
    fanDirection: '转向',
    airPurifier: '空气净化器',
    humidifying: '加湿中',
    drying: '除湿中',
    idle: '待机',
    targetHumidity: '目标湿度',
    currentHumidity: '当前湿度',
    vacuumCleaning: '清扫中',
    vacuumDocked: '已回充',
    vacuumReturning: '返回中',
    vacuumPaused: '已暂停',
    vacuumIdle: '空闲',
    vacuumError: '故障',
    vacuumStart: '开始',
    vacuumPause: '暂停',
    vacuumStop: '停止',
    vacuumDock: '回充',
    vacuumLocate: '寻找',
    vacuumCleanSpot: '局部清扫',
    alarmDisarmed: '已撤防',
    alarmArmedHome: '居家布防',
    alarmArmedAway: '外出布防',
    alarmArmedNight: '夜间布防',
    alarmArmedVacation: '度假布防',
    alarmArmedCustom: '自定义布防',
    alarmArming: '布防中',
    alarmPending: '待触发',
    alarmTriggered: '已触发',
    alarmDisarming: '撤防中',
    groupCovers: '窗帘',
    groupMedia: '多媒体',
    groupSecurity: '安防',
    groupOthers: '其他',
    groupCleaning: '清洁',
    otherGroup: '其他',
    noEntities: '暂无实体',
    areaOccupied: '有人',
    areaEmpty: '无人',
    entityCount: '{count} 个实体',
    deviceEntityCount: '{devices} 设备 · {entities} 实体',
    notActivated: '未激活',
    notTriggered: '未触发',
    run: '执行',
    enabled: '已启用',
    disabled: '已停用',
    snapshot: '实时快照',
    toggleTheme: '切换深色/浅色模式',
    loadingRegistry: '正在加载 Home Assistant 数据…',
    noAreas: '没有读取到 Home Assistant 房间',
    automationsSubtitle: 'Home Assistant 自动化',
    turnOn: '开启',
    previous: '上一曲',
    next: '下一曲',
    play: '播放',
    pause: '暂停',
    editorSkin: '皮肤',
    editorSkinStore: '皮肤商店',
    editorSkinStoreDependency: '需安装集成方可下载皮肤',
    editorSkinStoreClose: '关闭',
    editorSkinStoreLoadFailed: '加载失败，请检查网络',
    editorSkinStoreDownload: '下载',
    editorSkinStoreRemove: '移除',
    editorSkinStoreRedownload: '更新',
    editorSkinStoreNewVersion: '新版本',
    editorSkinStoreSearch: '搜索皮肤...',
    editorStoreClearCache: '如果更新后页面布局不正常，可以先尝试清除浏览器缓存。',
    editorEnergy: '能源',
    editorMediaPlayer: '媒体播放器',
    editorCamera: '摄像头',
    editorHomeDevices: '首页设备',
    editorHomeRooms: '首页房间',
    editorHomeScenes: '首页场景（侧栏快捷）',
    editorScenesPage: '场景页',
    editorScenesPageHint: '控制左侧菜单「场景」里显示哪些 scene/script；和下面「首页场景」不是同一处。',
    editorSecurityPage: '安防',
    editorSecurityPageHint: '普通监控摄像头；不选则安防页不显示这些画面。',
    editorSecurityCameras: '安防摄像头',
    editorSecurityDoor: '门禁',
    editorSecurityDoorHint: '门禁与摄像头分开配置。不选锁/门口摄像头则不显示门禁；门口机走 go2rtc，不另占 RTSP。',
    editorSecurityDoorLock: '门禁锁 / 开门',
    editorSecurityDoorCamera: '门禁摄像头',
    editorHomeEnv: '首页环境',
    editorInfo: '信息展示',
    editorFullscreen: '全屏',
    editorUseAreaPictures: '使用 Home Assistant 区域图片',
    editorNavigation: '导航菜单（可选）',
    editorNavigationConfigure: '配置',
    editorSkinMode: '皮肤模式',
    editorSkinModeAuto: '自动',
    editorSkinModeLight: '浅色',
    editorSkinModeDark: '深色',
    editorCancel: '取消',
    editorSave: '保存',
    editorBackground: '背景图',
    editorWeather: '天气',
    editorEnergyEntity: '能源实体',
    editorLoadingAreas: '正在加载区域...',
    editorDownloading: '正在下载...',
    editorDownloadFailed: '下载失败：{message}',
    editorUploadFailed: '背景图上传失败：{message}，请重试。',
    alarmEnterCode: '请输入密码',
    lockUnlock: '开门',
    lockUnlocking: '开门中…',
    lockAutoClose: '{n} 秒后自动关闭',
    doorbellTitle: '门口有人',
    doorbellPreview: '门禁监控',
    doorbellDismiss: '忽略',
    doorbellWaitPhone: '{n} 秒后通知手机',
    doorbellPhoneNotified: '已通知手机，仍可在此开门或忽略',
    searchPlaceholder: '搜索设备...',
    searchRecent: '最近',
    searchNoResults: '未找到相关设备',
    searchAll: '全部',
};

const STRINGS = {
    'en': en,
    'zh-CN': zh,
};

async function runScene(hass, entityId) {
    const domain = entityId.split('.')[0] || 'scene';
    const serviceDomain = domain === 'script' ? 'script' : 'scene';
    await hass?.callService(serviceDomain, 'turn_on', { entity_id: entityId });
}
async function toggleEntity(hass, entityId) {
    if (!hass)
        return;
    const [domain] = entityId.split('.');
    if (!domain)
        return;
    await hass.callService(domain, 'toggle', { entity_id: entityId });
}
function moreInfo(element, entityId) {
    element.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId },
    }));
}
function navigatePath(path) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event('location-changed'));
}
function turnOffAreaType(hass, entityIds) {
    if (!hass || entityIds.length === 0)
        return;
    const byDomain = new Map();
    for (const eid of entityIds) {
        const domain = eid.split('.')[0] || '';
        if (!domain)
            continue;
        const list = byDomain.get(domain) || [];
        list.push(eid);
        byDomain.set(domain, list);
    }
    for (const [domain, ids] of byDomain) {
        const service = domain === 'lock' ? 'lock' : 'turn_off';
        void hass.callService(domain, service, { entity_id: ids });
    }
}

const BUNDLED_SKINS = SKINS;
const SKIN_METADATA_CACHE = {
    [DEFAULT_SKIN]: {
        strings: (SKIN_STRINGS[DEFAULT_SKIN] || {}),
        iconMap: (SKIN_ICON_MAPS[DEFAULT_SKIN] || {}),
    },
};
const SKIN_METADATA_LOADING = new Set();
async function loadSkinMetadata(skin) {
    if (SKIN_METADATA_CACHE[skin])
        return false;
    if (SKINS.includes(skin))
        return false;
    if (SKIN_METADATA_LOADING.has(skin))
        return false;
    SKIN_METADATA_LOADING.add(skin);
    try {
        const res = await fetch(`/local/skins-pro/${skin}/strings.json?v=${Date.now()}`);
        if (!res.ok)
            return false;
        const data = (await res.json());
        SKIN_METADATA_CACHE[skin] = {
            strings: data,
            iconMap: data.icon_map || {},
        };
        return true;
    }
    catch {
        return false;
    }
    finally {
        SKIN_METADATA_LOADING.delete(skin);
    }
}
function clearSkinMetadata(skin) {
    if (skin === DEFAULT_SKIN)
        return;
    delete SKIN_METADATA_CACHE[skin];
}
function normalizeLanguage(language) {
    if ((language || '').toLowerCase().startsWith('zh')) {
        return 'zh-CN';
    }
    return 'en';
}
function localizedText(base, zh, en, language, fallback = '') {
    if (language === 'zh-CN') {
        return zh || base || en || fallback;
    }
    return en || base || zh || fallback;
}
function deviceStateLabel(state, language, hass, domain) {
    if (state === 'unavailable' || state === 'unknown') {
        return STRINGS[language].offline;
    }
    if (state === 'on' || state === 'playing' || state === 'cool' || state === 'heat' || state === 'armed') {
        return STRINGS[language].on;
    }
    if (state === 'open' || state === 'unlocked') {
        return STRINGS[language].open;
    }
    if (state === 'locked' || state === 'closed') {
        return STRINGS[language].closed;
    }
    if (state === 'off' || state === 'idle' || state === 'standby') {
        return STRINGS[language].off;
    }
    if (/^armed_|^disarmed|^triggered|^pending|^arming/.test(state)) {
        if (hass && domain && hass.localize) {
            const localized = hass.localize(`state_badge.${domain}.${state}`);
            if (localized)
                return localized;
        }
        return state.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return formatRawState(state, language);
}
function formatRawState(raw, language) {
    const num = Number(raw);
    if (Number.isFinite(num)) {
        return parseFloat(num.toFixed(2)).toString();
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
            const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
            if (isDateOnly) {
                return new Intl.DateTimeFormat(language, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
            }
            return new Intl.DateTimeFormat(language, {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit',
            }).format(d);
        }
    }
    return raw.replace(/\.\d+/, '') || '--';
}
function getTranslate(language) {
    return (key) => STRINGS[language][key];
}
function t(language, key, params) {
    let str = STRINGS[language][key];
    if (params) {
        for (const [name, value] of Object.entries(params)) {
            str = str.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
        }
    }
    return str;
}
function defaultResourceBasePath() {
    try {
        return new URL(DEFAULT_SKIN, import.meta.url).toString();
    }
    catch {
        return `/local/community/skins-pro/${DEFAULT_SKIN}`;
    }
}
function bundledAssetsRootPath() {
    return defaultResourceBasePath().replace(/\/[^/]+\/?$/, '');
}
function bundledSkinBasePath(skin) {
    return `${bundledAssetsRootPath().replace(/\/$/, '')}/${skin}`;
}
function formatNumber(value, decimals) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(decimals) : '--';
}
function stateValue(hass, entityId, language) {
    if (!entityId || !hass) {
        return '';
    }
    return formatRawState(hass.states[entityId]?.state || '', language || 'en');
}
/** Short label for home info line — avoid HA names like「门禁开门」/「Open Relay A». */
function infoLockLabel(friendlyName, zh) {
    const name = friendlyName.trim();
    if (/门禁/.test(name))
        return zh ? '门禁' : 'Door';
    if (/门锁|lock\s*[ab]?/i.test(name))
        return zh ? '门锁' : 'Lock';
    const cleaned = name
        .replace(/开门$/u, '')
        .replace(/\s*Open\s*Relay.*$/i, '')
        .replace(/\s*Relay\s*[ab]?\s*$/i, '')
        .trim();
    return cleaned || (zh ? '门锁' : 'Lock');
}
/** Home welcome「信息展示」line — door contacts / locks show clear Chinese status. */
function infoDisplayValue(hass, entityId, language) {
    if (!entityId || !hass)
        return '';
    const stateObj = hass.states[entityId];
    if (!stateObj)
        return '';
    const name = String(stateObj.attributes?.friendly_name || entityId);
    const domain = entityId.split('.')[0] || '';
    const deviceClass = String(stateObj.attributes?.device_class || '').toLowerCase();
    const zh = language === 'zh-CN';
    if (domain === 'binary_sensor' && ['door', 'garage_door', 'window', 'opening'].includes(deviceClass)) {
        // Door contact: on = open, off = closed (not electronic lock).
        const open = stateObj.state === 'on';
        const label = zh ? (open ? '门开着' : '门关着') : (open ? 'Open' : 'Closed');
        return `${name} · ${label}`;
    }
    if (domain === 'lock') {
        const lockName = infoLockLabel(name, zh);
        if (stateObj.state === 'unavailable' || stateObj.state === 'unknown') {
            return `${lockName} · ${zh ? '离线' : 'Offline'}`;
        }
        // locked / unlocked — covers Akuvox Lock A and R20K 门禁 relay.
        const locked = stateObj.state === 'locked';
        const label = zh ? (locked ? '已上锁' : '未上锁') : (locked ? 'Locked' : 'Unlocked');
        return `${lockName} · ${label}`;
    }
    const raw = stateValue(hass, entityId, language);
    return raw || name;
}
function timeText(hass, language) {
    const locale = hass?.locale?.language || language;
    const fmt24 = hass?.locale?.time_format !== '12h';
    return new Intl.DateTimeFormat(locale, { hour: fmt24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !fmt24 }).format(new Date());
}
function dateText(hass, language) {
    const locale = hass?.locale?.language || language;
    const fmt = hass?.locale?.date_format;
    let opts;
    switch (fmt) {
        case 'MDY':
            opts = { month: '2-digit', day: '2-digit', year: 'numeric', weekday: 'short' };
            break;
        case 'YMD':
            opts = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
            break;
        default:
            opts = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' };
            break;
    }
    return new Intl.DateTimeFormat(locale, opts).format(new Date());
}
function formatRelativeTime(isoDate, language) {
    const then = isoDate?.getTime?.();
    if (!Number.isFinite(then))
        return '';
    const seconds = Math.floor((Date.now() - then) / 1000);
    if (!Number.isFinite(seconds))
        return '';
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
    if (seconds < 0)
        return rtf.format(0, 'seconds');
    if (seconds < 60)
        return rtf.format(-seconds, 'seconds');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return rtf.format(-minutes, 'minutes');
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return rtf.format(-hours, 'hours');
    const days = Math.floor(hours / 24);
    if (days < 30)
        return rtf.format(-days, 'days');
    const months = Math.floor(days / 30);
    if (months < 12)
        return rtf.format(-months, 'months');
    const years = Math.floor(days / 365);
    return rtf.format(-years, 'years');
}
/** Scene state is an ISO timestamp; script state is on/off — never pass script state to Date. */
function formatSceneOrScriptRelativeTime(entity, language) {
    const id = entity.entity_id || '';
    if (id.startsWith('script.')) {
        const triggered = entity.attributes?.last_triggered;
        if (triggered) {
            const formatted = formatRelativeTime(new Date(String(triggered)), language);
            if (formatted)
                return formatted;
        }
        if (entity.last_changed) {
            return formatRelativeTime(new Date(entity.last_changed), language);
        }
        return '';
    }
    if (entity.state && entity.state !== 'unavailable' && entity.state !== 'unknown') {
        return formatRelativeTime(new Date(entity.state), language);
    }
    return '';
}
function weatherIcon(state) {
    const iconMap = {
        sunny: 'mdi:weather-sunny',
        clear: 'mdi:weather-sunny',
        cloudy: 'mdi:weather-cloudy',
        partlycloudy: 'mdi:weather-partly-cloudy',
        rainy: 'mdi:weather-rainy',
        pouring: 'mdi:weather-pouring',
        snowy: 'mdi:weather-snowy',
        fog: 'mdi:weather-fog',
        windy: 'mdi:weather-windy',
        hail: 'mdi:weather-hail',
        lightning: 'mdi:weather-lightning',
    };
    return iconMap[state] || 'mdi:weather-partly-cloudy';
}
function iconForDomain(domain) {
    const icons = {
        light: 'mdi:lightbulb',
        input_boolean: 'mdi:boolean',
        button: 'mdi:gesture-tap',
        scene: 'mdi:palette',
        switch: 'mdi:toggle-switch',
        climate: 'mdi:air-conditioner',
        water_heater: 'mdi:water-boiler',
        humidifier: 'mdi:water-percent',
        media_player: 'mdi:speaker',
        remote: 'mdi:remote',
        lock: 'mdi:lock',
        cover: 'mdi:blinds',
        fan: 'mdi:fan',
        automation: 'mdi:robot',
        sensor: 'mdi:gauge',
        camera: 'mdi:cctv',
        alarm_control_panel: 'mdi:shield-lock',
        person: 'mdi:person',
        vacuum: 'mdi:robot-vacuum',
        device_tracker: 'mdi:map-marker',
        update: 'mdi:package-up',
    };
    return icons[domain] || 'mdi:devices';
}
function assetKeyForDomain(skin, domain) {
    const map = SKIN_METADATA_CACHE[skin]?.iconMap || {};
    if (map[domain]) {
        return map[domain];
    }
    const pool = ['light', 'switch', 'button', 'climate', 'water_heater', 'humidifier', 'fan', 'speaker', 'remote', 'lock', 'camera', 'cover', 'valve', 'automation', 'media_player', 'vacuum', 'sensor', 'binary_sensor', 'update', 'device_tracker', 'person'];
    let hash = 0;
    for (let i = 0; i < domain.length; i += 1) {
        hash = ((hash << 5) - hash + domain.charCodeAt(i)) | 0;
    }
    return pool[Math.abs(hash) % pool.length];
}
function selectedSkin(config) {
    const configuredSkin = config?.resource_pack?.skin;
    if (configuredSkin) {
        return configuredSkin;
    }
    const configuredBasePath = config?.resource_pack?.base_path || '';
    const matchedSkin = BUNDLED_SKINS.find((skin) => configuredBasePath === bundledSkinBasePath(skin) || configuredBasePath.endsWith(`/${skin}`));
    return matchedSkin || DEFAULT_SKIN;
}
const DARK_SUPPORTED_SKINS = new Set(['modern', 'neo-tactile']);
function skinSupportsDark(skin) {
    return DARK_SUPPORTED_SKINS.has(skin);
}
let _darkAssetSkin = null;
function setDarkAssetSkin(skin) {
    _darkAssetSkin = skin && DARK_SUPPORTED_SKINS.has(skin) ? skin : null;
}
function assetUrl(config, key) {
    if (!key)
        return '';
    const skin = selectedSkin(config);
    const configuredBasePath = config?.resource_pack?.base_path || '';
    let basePath = configuredBasePath === '__AUTO__' || !configuredBasePath
        ? bundledSkinBasePath(skin)
        : configuredBasePath;
    if (!SKINS.includes(skin)) {
        basePath = `/local/skins-pro/${skin}/`;
    }
    const asset = config?.resource_pack?.assets?.[key] || DEFAULT_ASSETS[key] || '';
    if (!asset)
        return '';
    let finalAsset = asset;
    if (_darkAssetSkin && skin === _darkAssetSkin && key !== 'theme_css' && !/^https?:\/\//.test(asset) && !asset.startsWith('/')) {
        finalAsset = asset.replace(/(\.[^.]+)$/, '-dark$1');
    }
    if (/^https?:\/\//.test(finalAsset) || finalAsset.startsWith('/'))
        return finalAsset;
    return `${basePath.replace(/\/$/, '')}/${finalAsset}`;
}
function assetHref(config, key) {
    const url = assetUrl(config, key);
    if (!url)
        return '';
    const skin = selectedSkin(config);
    const cacheKey = encodeURIComponent(`${skin}|${config?.resource_pack?.base_path || '__AUTO__'}`);
    return `${url}${url.includes('?') ? '&' : '?'}skin=${cacheKey}`;
}
function skinString(skin, key) {
    const data = SKIN_METADATA_CACHE[skin]?.strings || SKIN_METADATA_CACHE[DEFAULT_SKIN]?.strings || {};
    return data[key] || '';
}

const ENTITY_PICKER_TAG = 'ha-entity-picker';
const CONTROLLABLE_DOMAINS$1 = [
    'light', 'switch', 'fan', 'cover', 'lock', 'climate', 'media_player',
    'vacuum', 'humidifier', 'water_heater', 'valve', 'siren', 'automation',
    'group', 'input_boolean',
];
function escapeAttr(value) {
    return value.replace(/"/g, '&quot;');
}
function entityPicker(label, path, value, domains, deviceClasses) {
    const dFilter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
    const dcFilter = deviceClasses?.length ? ` include-device-classes='${JSON.stringify(deviceClasses)}'` : '';
    return `
    <label>
      <span>${label}</span>
      <${ENTITY_PICKER_TAG} data-path="${path}"${dFilter}${dcFilter} value="${escapeAttr(value || '')}"></${ENTITY_PICKER_TAG}>
    </label>
  `;
}
/** Prefer climate / air-quality sensors in the home environment list. */
const ENVIRONMENT_DEVICE_CLASSES = [
    'temperature',
    'humidity',
    'carbon_dioxide',
    'pm25',
    'pm10',
    'aqi',
    'volatile_organic_compounds',
    'nitrogen_dioxide',
    'carbon_monoxide',
    'pressure',
];
function listPicker(label, path, values, domains, max, deviceClasses) {
    const filter = domains?.length ? ` include-domains='${JSON.stringify(domains)}'` : '';
    const dcFilter = deviceClasses?.length ? ` include-device-classes='${JSON.stringify(deviceClasses)}'` : '';
    // Empty config → no rows (only +). After +, keep '' rows so the entity picker appears.
    const arr = Array.isArray(values) ? values : [];
    const rows = arr.map((val, i) => `
    <div class="selector-row">
      <${ENTITY_PICKER_TAG} data-list-path="${path}" data-list-index="${i}"${filter}${dcFilter} value="${escapeAttr(val || '')}"></${ENTITY_PICKER_TAG}>
      <button type="button" class="sp-move" data-move-path="${path}" data-move-index="${i}" data-move-delta="-1" ${i === 0 ? 'disabled' : ''} title="上移">↑</button>
      <button type="button" class="sp-move" data-move-path="${path}" data-move-index="${i}" data-move-delta="1" ${i >= arr.length - 1 ? 'disabled' : ''} title="下移">↓</button>
      <button class="sp-del" data-del-path="${path}" data-del-index="${i}">✕</button>
    </div>
  `).join('');
    const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-path="${path}" data-add-max="${max ?? ''}">+</button>`;
    return `
    <label>
      <span>${label}</span>
      <div class="sp-list">${rows}</div>
      ${addBtn}
    </label>
  `;
}
function areaPicker(areas, areasLoaded, values, max, language) {
    if (!areasLoaded || areas.length === 0) {
        return `<p class="muted">${t(language, 'editorLoadingAreas')}</p>`;
    }
    const arr = Array.isArray(values) ? values : [];
    const rows = (arr.length > 0 ? arr : ['']).map((val, i) => `
    <div class="selector-row">
      <select data-area-path="home_selection.rooms" data-area-index="${i}">
        <option value="">—</option>
        ${areas.map(a => `<option value="${a.area_id}"${a.area_id === val ? ' selected' : ''}>${a.name}</option>`).join('')}
      </select>
      <button class="sp-del" data-del-area-path="home_selection.rooms" data-del-area-index="${i}">✕</button>
    </div>
  `).join('');
    const addBtn = arr.length >= (max ?? Infinity) ? '' : `<button class="sp-add" data-add-area-path="home_selection.rooms" data-add-max="${max ?? ''}">+</button>`;
    return `
    <div class="sp-list">${rows}</div>
    ${addBtn}
  `;
}

function fire(el, config) {
    el.dispatchEvent(new CustomEvent('config-changed', {
        bubbles: true,
        composed: true,
        detail: { config },
    }));
}
function deepClone(obj) {
    try {
        return structuredClone(obj);
    }
    catch {
        return JSON.parse(JSON.stringify(obj));
    }
}
function drillPath(next, path) {
    const parts = path.split('.');
    let cur = next;
    for (let i = 0; i < parts.length - 1; i += 1) {
        const p = parts[i];
        if (!p)
            return null;
        cur[p] = cur[p] || {};
        cur = cur[p];
    }
    const last = parts[parts.length - 1];
    if (!last)
        return null;
    return { parent: cur, last };
}
function setField(el, current, path, value) {
    const next = deepClone(current);
    const drill = drillPath(next, path);
    if (!drill)
        return current;
    drill.parent[drill.last] = value;
    fire(el, next);
    return next;
}
function setListItem(el, current, path, index, value) {
    const next = deepClone(current);
    const drill = drillPath(next, path);
    if (!drill)
        return current;
    const arr = drill.parent[drill.last] || [];
    if (value) {
        arr[index] = value;
        drill.parent[drill.last] = arr;
        fire(el, next);
        return next;
    }
    arr.splice(index, 1);
    drill.parent[drill.last] = arr;
    fire(el, next);
    return next;
}
function addListItem(el, current, path, max) {
    const next = deepClone(current);
    const drill = drillPath(next, path);
    if (!drill)
        return current;
    const arr = drill.parent[drill.last] || [];
    if (max !== undefined && arr.length >= max)
        return current;
    arr.push('');
    drill.parent[drill.last] = arr;
    fire(el, next);
    return next;
}
/** Move a list item up (delta=-1) or down (delta=+1). */
function moveListItem(el, current, path, index, delta) {
    const next = deepClone(current);
    const drill = drillPath(next, path);
    if (!drill)
        return current;
    const arr = [...(drill.parent[drill.last] || [])];
    const target = index + delta;
    if (index < 0 || index >= arr.length || target < 0 || target >= arr.length)
        return current;
    const tmp = arr[index];
    arr[index] = arr[target];
    arr[target] = tmp;
    drill.parent[drill.last] = arr;
    fire(el, next);
    return next;
}
function applySkin(el, current, skin) {
    const next = deepClone(current);
    next.resource_pack = next.resource_pack || {};
    next.resource_pack.skin = skin;
    if (SKINS.includes(skin)) {
        next.resource_pack.base_path = '__AUTO__';
    }
    fire(el, next);
    return next;
}
function buildSkinOptions(config) {
    const current = config.resource_pack?.skin || 'modern';
    const downloaded = (config.downloaded_skins || []).filter((s) => !SKINS.includes(s));
    const bundled = SKINS.map((s) => `<option value="${s}"${s === current ? ' selected' : ''}>${s}</option>`).join('');
    const extra = downloaded.map((s) => `<option value="${s}"${s === current ? ' selected' : ''}>${s}</option>`).join('');
    return bundled + extra;
}

function navItemChecked(config, key) {
    const navItems = config?.nav ?? [];
    const item = navItems.find(n => n.key === key);
    return item ? item.enabled : true;
}
function renderNavDialog(config, language, isOpen) {
    if (!isOpen)
        return '';
    return `
    <div class="nav-overlay" data-nav-overlay style="display:flex">
      <div class="nav-dialog">
        <h3>${t(language, 'editorNavigation')}</h3>
        ${DEFAULT_NAV.map(item => `
          <label class="nav-dialog-item">
            <span>${STRINGS[language][(item.key || 'home')] || item.key}</span>
            <input type="checkbox" data-nav-key="${item.key}" ${navItemChecked(config, item.key || '') ? 'checked' : ''}>
          </label>
        `).join('')}
        <div class="nav-dialog-actions">
          <button class="nav-cancel" data-nav-cancel>${t(language, 'editorCancel')}</button>
          <button class="nav-save" data-nav-save>${t(language, 'editorSave')}</button>
        </div>
      </div>
    </div>
  `;
}
function parseNavSave(root, currentConfig) {
    const checkboxes = root.querySelectorAll('[data-nav-key]');
    if (!checkboxes || checkboxes.length === 0)
        return { nav: undefined };
    const existingNav = currentConfig?.nav ?? [];
    const dialogNav = [];
    let allEnabled = true;
    checkboxes.forEach(cb => {
        const key = cb.getAttribute('data-nav-key') || '';
        const checked = cb.checked;
        if (!checked)
            allEnabled = false;
        const existingItem = existingNav.find(n => n.key === key);
        const defaultItem = DEFAULT_NAV.find(d => d.key === key);
        dialogNav.push({ key, icon: existingItem?.icon || defaultItem?.icon, enabled: checked });
    });
    const customNav = existingNav.filter(n => !DEFAULT_NAV.some(d => d.key === n.key));
    if (allEnabled && customNav.length === 0) {
        return { nav: undefined };
    }
    return { nav: [...dialogNav, ...customNav] };
}

const CDN_STORE = 'https://skins.hachina.dpdns.org';
const STATS_API = 'https://hachina.dpdns.org';
const SKIN_DEP_URL = 'https://github.com/ha-china/skins-pro-hass';
function linkifyDep(text, lang) {
    const label = lang === 'zh-CN' ? '集成' : 'integration';
    return text.replace(label, `<a href="${SKIN_DEP_URL}" target="_blank" rel="noopener noreferrer">${label}</a>`);
}
function getVoterId() {
    let id = localStorage.getItem('skins_pro_voter');
    if (!id) {
        try {
            id = crypto.randomUUID();
        }
        catch { /* fallback */ }
        if (!id)
            id = 'v' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('skins_pro_voter', id);
    }
    return id;
}
let skinStats = {};
function getLikedSkins() {
    try {
        const raw = localStorage.getItem('skins_pro_liked');
        return new Set(raw ? JSON.parse(raw) : []);
    }
    catch {
        return new Set();
    }
}
function saveLikedSkin(skin, liked) {
    const set = getLikedSkins();
    liked ? set.add(skin) : set.delete(skin);
    localStorage.setItem('skins_pro_liked', JSON.stringify([...set]));
}
function renderSkinStore(state, config, language) {
    if (!state.open)
        return '';
    let content;
    if (state.loading) {
        content = `<p style="text-align:center;padding:40px 0;color:var(--sp-text-muted,#888)">${t(language, 'loadingQuote')}</p>`;
    }
    else if (state.error) {
        content = `<p style="text-align:center;padding:40px 0;color:var(--sp-error,#e44)">${t(language, 'editorSkinStoreLoadFailed')}</p>`;
    }
    else {
        const downloaded = config.downloaded_skins || [];
        const query = (state.searchQuery || '').toLowerCase().trim();
        const filtered = query ? state.themes.filter(th => th.id.toLowerCase().includes(query) || (th.name || '').toLowerCase().includes(query) || (th.author || '').toLowerCase().includes(query)) : state.themes;
        content = `
      <input type="text" class="store-search" data-store-search placeholder="${t(language, 'editorSkinStoreSearch')}" value="${state.searchQuery || ''}" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:var(--sp-radius-pill,999px);border:1px solid var(--sp-border-muted,var(--divider-color,rgba(0,0,0,0.12)));background:var(--sp-device-bg,rgba(128,128,128,0.06));color:var(--sp-text-main,inherit);font:inherit;font-size:var(--sp-font-xs,14px);outline:none;margin-bottom:var(--sp-space-md,16px);">
      <div class="store-grid">${filtered.map(theme => {
            const installed = downloaded.includes(theme.id);
            const dlCount = theme.downloads ?? '-';
            const likeCount = theme.likes ?? 0;
            const likedClass = theme.userLiked ? ' liked' : '';
            return `
      <div class="store-card ${installed ? 'store-installed' : ''}" data-store-theme="${theme.id}">
        <img src="${CDN_STORE}/${theme.thumbnail}" alt="${theme.name}" class="store-thumb" loading="lazy">
        <div class="store-info">
          <span class="store-name">${theme.name}${theme.author ? `<a href="https://github.com/${theme.author}" target="_blank" rel="noopener noreferrer" class="store-author">${theme.author}</a>` : ''}${theme.hasUpdate ? `<span class="store-update-badge">${t(language, 'editorSkinStoreNewVersion')}</span>` : ''}</span>
          <div class="store-actions">
            <span class="store-dl-count">⬇ ${dlCount}</span>
            <button class="store-like${likedClass}" data-store-like="${theme.id}">
              ${theme.userLiked ? '❤️' : '🤍'} <span class="store-like-count">${likeCount}</span>
            </button>
          </div>
          ${installed
                ? theme.hasUpdate
                    ? `<div style="display:flex;gap:6px"><button class="store-download" data-store-download="${theme.id}">${t(language, 'editorSkinStoreRedownload')}</button><button class="store-remove" data-store-remove="${theme.id}">${t(language, 'editorSkinStoreRemove')}</button></div>`
                    : `<button class="store-remove" data-store-remove="${theme.id}">${t(language, 'editorSkinStoreRemove')}</button>`
                : `<button class="store-download" data-store-download="${theme.id}">${t(language, 'editorSkinStoreDownload')}</button>`}
        </div>
      </div>`;
        }).join('')}</div>`;
    }
    return `
    <div class="nav-overlay" data-store-overlay style="display:flex">
      <div class="nav-dialog" style="max-width:1200px;width:95vw">
        <h3>${t(language, 'editorSkinStore')} <span class="store-dependency" style="font-size:0.7em;font-weight:400;color:var(--sp-text-muted,#888)">${linkifyDep(t(language, 'editorSkinStoreDependency'), language)}</span></h3>
        ${content}
        <div class="nav-dialog-actions">
          <button class="nav-cancel" data-store-close>${t(language, 'editorSkinStoreClose')}</button>
        </div>
      </div>
    </div>
  `;
}
async function fetchSkinThemes() {
    const res = await fetch(`${CDN_STORE}/screenshots/registry.json?t=${Date.now()}`);
    if (!res.ok)
        throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const themes = Array.isArray(data) ? data : [];
    for (let i = themes.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [themes[i], themes[j]] = [themes[j], themes[i]];
    }
    return themes;
}
async function fetchLocalSkinVersions(skins) {
    const results = {};
    await Promise.all(skins.map(async (skin) => {
        try {
            const res = await fetch(`/local/skins-pro/${skin}/strings.json?v=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (typeof data.version === 'string' && data.version)
                    results[skin] = data.version;
            }
        }
        catch { /* ignore */ }
    }));
    return results;
}
async function fetchSkinStats() {
    try {
        const res = await fetch(`${STATS_API}/api/stats`);
        if (res.ok)
            skinStats = await res.json();
    }
    catch { /* ignore */ }
}
async function toggleLike(skin) {
    try {
        const res = await fetch(`${STATS_API}/api/like/${skin}`, {
            method: 'POST',
            headers: { 'X-Skin-Voter': getVoterId() },
        });
        if (!res.ok)
            return null;
        const data = await res.json();
        saveLikedSkin(skin, data.userLiked);
        return { liked: data.userLiked, total: data.liked };
    }
    catch {
        return null;
    }
}
function isSkinLiked(skin) {
    return getLikedSkins().has(skin);
}
function removeSkin(el, currentConfig, hass, skinId) {
    void hass?.callService('skins_pro', 'remove_skin', { skin_id: skinId }).catch(() => { });
    const next = deepClone(currentConfig);
    const list = next.downloaded_skins || [];
    const idx = list.indexOf(skinId);
    if (idx !== -1)
        list.splice(idx, 1);
    next.downloaded_skins = list;
    if (next.resource_pack?.skin === skinId) {
        next.resource_pack.skin = 'modern';
        next.resource_pack.base_path = '__AUTO__';
    }
    fire(el, next);
    return next;
}
async function downloadSkin(el, currentConfig, hass, skinId, language) {
    try {
        await hass?.callService('skins_pro', 'download_skin', { skin_id: skinId });
        clearSkinMetadata(skinId);
        const next = deepClone(currentConfig);
        next.resource_pack = next.resource_pack || {};
        next.resource_pack.skin = skinId;
        next.resource_pack.base_path = `/local/skins-pro/${skinId}/`;
        next.downloaded_skins = [...new Set([...(next.downloaded_skins || []), skinId])];
        fire(el, next);
        fetch(`${STATS_API}/api/download/${skinId}`, { method: 'POST' }).catch(() => { });
        return { success: true };
    }
    catch (err) {
        const raw = err?.message || t(language, 'editorSkinStoreDependency');
        return { success: false, errorMessage: t(language, 'editorDownloadFailed', { message: raw }) };
    }
}

const HOME_DEVICE_DOMAINS = CONTROLLABLE_DOMAINS$1.filter((d) => !['automation', 'group', 'input_boolean', 'siren', 'lock'].includes(d));
const EDITOR_CSS = `.bg-preview{max-width:120px;max-height:60px;border-radius:6px;display:block;flex-shrink:0}.sp-card input[type=checkbox]{width:auto;min-height:auto;margin:0}.sp-card label:has(input[type=checkbox]){display:flex;align-items:center;gap:8px}.sp-btn-configure{cursor:pointer}.nav-overlay{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center}.nav-dialog{background:var(--sp-card-bg,var(--sp-panel-bg,var(--glass-regular,var(--ha-card-background,#fff))));border-radius:var(--sp-radius-lg);padding:var(--sp-space-xl);min-width:280px;max-width:380px;box-shadow:var(--sp-shadow-card);border:var(--sp-border-width,1px) solid var(--sp-border-device,var(--sp-border-glass,var(--divider-color,rgba(0,0,0,0.12))));backdrop-filter:var(--sp-blur-lg,none);-webkit-backdrop-filter:var(--sp-blur-lg,none)}.nav-dialog h3{margin:0 0 var(--sp-space-md);font-size:var(--sp-font-md);font-weight:700;color:var(--sp-text-main,var(--sp-text-primary,inherit))}.nav-dialog-item{display:flex;align-items:center;gap:var(--sp-space-sm);padding:var(--sp-space-2xs) 0}.nav-dialog-item span{font-size:var(--sp-font-xs);color:var(--sp-text-main,var(--sp-text-primary,inherit))}.nav-dialog-item input[type=checkbox]{width:auto;min-height:auto;margin:0;margin-left:auto;accent-color:var(--sp-accent)}.nav-dialog-actions{display:flex;gap:var(--sp-space-sm);justify-content:flex-end;margin-top:var(--sp-space-lg)}.nav-dialog-actions button{min-height:38px;border:0;border-radius:var(--sp-radius-sm,8px);padding:0 var(--sp-space-lg);cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-xs);white-space:nowrap}.nav-dialog-actions .nav-cancel{background:var(--sp-device-bg,rgba(128,128,128,0.1));color:var(--sp-text-main,var(--sp-text-primary,inherit));border:var(--sp-border-width,1px) solid var(--sp-border-muted,var(--sp-border-glass,transparent))}.nav-dialog-actions .nav-cancel:hover{filter:brightness(0.96)}.nav-dialog-actions .nav-save{background:var(--sp-accent);color:var(--sp-text-on-accent,#fff)}.nav-dialog-actions .nav-save:hover{filter:brightness(1.08)}.store-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-height:70vh;overflow-y:auto}.store-card{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:8px;background:var(--sp-device-bg,rgba(128,128,128,0.06))}.store-thumb{width:100%;height:auto;border-radius:6px;display:block}.store-info{display:flex;align-items:center;justify-content:space-between;gap:8px}.store-name{font-size:var(--sp-font-xs,13px);font-weight:600;color:var(--sp-text-main,var(--sp-text-primary,inherit))}.store-author{margin-left:6px;font-weight:400;font-size:var(--sp-font-2xs,12px);color:var(--sp-accent,#8ab8cc);text-decoration:none}.store-author:hover{text-decoration:underline}.store-download{min-height:32px;border:0;border-radius:6px;padding:0 12px;cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-2xs,12px);white-space:nowrap;background:var(--sp-accent,#8ab8cc);color:#fff}.store-download:hover{filter:brightness(1.1)}.store-installed{border:1px solid var(--sp-accent,#8ab8cc)}.store-remove{min-height:32px;border:0;border-radius:6px;padding:0 12px;cursor:pointer;font:inherit;font-weight:600;font-size:var(--sp-font-2xs,12px);white-space:nowrap;background:var(--sp-error,#e44);color:#fff}.store-remove:hover{filter:brightness(1.1)}.store-actions{display:flex;gap:10px;align-items:center}.store-dl-count{font-size:var(--sp-font-2xs,11px);color:var(--sp-text-muted,#999)}.store-like{background:none;border:none;cursor:pointer;font:inherit;font-size:var(--sp-font-2xs,12px);display:inline-flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;color:var(--sp-text-muted,#999);transition:color .15s}.store-like:hover{color:var(--sp-accent,#e44)}.store-like.liked{color:var(--sp-error,#e44)}.store-like-count{font-weight:600}`;
function renderEditorTemplate(data) {
    const c = data.config || {};
    const hs = c.home_selection || {};
    const sp = c.scenes_page || {};
    const hl = c.home_limits || {};
    const loc = data.translate;
    return `
    <link rel="stylesheet" href="${data.themeCssUrl}">
    <style>${EDITOR_CSS}</style>
    <div class="sp-wrap">
      <div class="sp-card">
        <h3>${loc('editorSkin')}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">
          <label class="sp-field" style="min-width:auto">
            <span>&nbsp;</span>
            <button class="sp-btn-configure" data-skin-store style="min-height:40px;padding:0 14px">${loc('editorSkinStore')}</button>
          </label>
          <label class="sp-field" style="flex:1;min-width:140px">
            <span>${loc('editorSkin')}</span>
            <select data-text-path="resource_pack.skin">
              ${buildSkinOptions(c)}
            </select>
          </label>
          <label class="sp-field" style="min-width:120px;display:grid;justify-items:center;align-content:center">
            <span>${loc('editorUseAreaPictures')}</span>
            <input type="checkbox" data-path="use_area_pictures"${c.use_area_pictures ? ' checked' : ''} style="width:18px;height:18px;margin:0">
          </label>
          <label class="sp-field" style="min-width:80px;display:grid;justify-items:center;align-content:center">
            <span>${loc('editorFullscreen')}</span>
            <input type="checkbox" data-path="fullscreen"${c.fullscreen ? ' checked' : ''} style="width:18px;height:18px;margin:0">
          </label>
        </div>
        <div class="sp-row" style="grid-template-columns:1fr 1fr;gap:12px">
          <label class="sp-field">
            <span>${loc('editorBackground')}</span>
            <div style="display:flex;flex-wrap:nowrap;align-items:center;gap:8px">
              <input type="file" accept="image/*" data-bg-upload style="flex:1;min-width:0">
              ${c.background_image ? `<img class="bg-preview" src="${c.background_image}"><button class="sp-del" data-bg-clear>✕</button>` : ''}
            </div>
          </label>
          <div style="display:flex;gap:12px;align-items:flex-end">
            <label class="sp-field" style="flex:1">
              <span>${loc('editorNavigation')}</span>
              <button class="sp-btn-configure" data-nav-configure>${loc('editorNavigationConfigure')}</button>
            </label>
            ${skinSupportsDark(selectedSkin(c)) ? `<label class="sp-field" style="min-width:120px">
              <span>${loc('editorSkinMode')}</span>
              <select data-text-path="skin_mode">
                <option value="auto"${(c.skin_mode || 'auto') === 'auto' ? ' selected' : ''}>${loc('editorSkinModeAuto')}</option>
                <option value="light"${c.skin_mode === 'light' ? ' selected' : ''}>${loc('editorSkinModeLight')}</option>
                <option value="dark"${c.skin_mode === 'dark' ? ' selected' : ''}>${loc('editorSkinModeDark')}</option>
              </select>
            </label>` : ''}
          </div>
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">${entityPicker(loc('editorWeather'), 'weather.entity', c.weather?.entity || hs.weather_entity || '', ['weather'])}</div>
        <div class="sp-card">${entityPicker(loc('editorInfo'), 'info.entity', c.info?.entity || '', ['input_text', 'sensor', 'binary_sensor', 'lock'])}</div>
      </div>

      <div class="sp-row" style="grid-template-columns:1fr 1fr 1fr">
        <div class="sp-card">
          <h3>${loc('editorEnergy')}</h3>
          ${entityPicker(loc('editorEnergyEntity'), 'energy.entity', c.energy?.entity || hs.energy_entity || '', ['sensor'], ['energy', 'power'])}
        </div>
        <div class="sp-card">
          <h3>${loc('editorMediaPlayer')}</h3>
          ${entityPicker(loc('editorMediaPlayer'), 'media_player.entity', c.media_player?.entity || '', ['media_player'])}
        </div>
        <div class="sp-card">
          <h3>${loc('editorCamera')}</h3>
          ${entityPicker(loc('editorCamera'), 'camera.entity', c.camera?.entity || '', ['camera'])}
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">
          <h3>${loc('editorSecurityCameras')}</h3>
          <p class="muted" style="margin:0 0 8px;font-size:12px;opacity:.75">${loc('editorSecurityPageHint')}</p>
          ${listPicker(loc('editorCamera'), 'security_page.cameras', (c.security_page?.cameras || c.security_page?.selection || []), ['camera'])}
        </div>
        <div class="sp-card">
          <h3>${loc('editorSecurityDoor')}</h3>
          <p class="muted" style="margin:0 0 8px;font-size:12px;opacity:.75">${loc('editorSecurityDoorHint')}</p>
          ${entityPicker(loc('editorSecurityDoorLock'), 'security_page.door_lock', c.security_page?.door_lock || '', ['lock'])}
          ${entityPicker(loc('editorSecurityDoorCamera'), 'security_page.door_camera', c.security_page?.door_camera || '', ['camera'])}
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">
          <h3>${loc('editorScenesPage')}</h3>
          <p class="muted" style="margin:0 0 8px;font-size:12px;opacity:.75">${loc('editorScenesPageHint')}</p>
          ${listPicker(loc('scenes'), 'scenes_page.selection', sp.selection || [], ['scene', 'script'])}
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">
          <h3>${loc('editorHomeDevices')}</h3>
          ${listPicker(loc('devices'), 'home_selection.devices', hs.devices || [], HOME_DEVICE_DOMAINS, hl.devices || 5)}
        </div>
        <div class="sp-card">
          <h3>${loc('editorHomeRooms')}</h3>
          ${areaPicker(data.areas, data.areasLoaded, hs.rooms || [], hl.rooms || 4, data.language)}
        </div>
      </div>

      <div class="sp-row">
        <div class="sp-card">
          <h3>${loc('editorHomeScenes')}</h3>
          ${listPicker(loc('scenes'), 'home_selection.scenes', hs.scenes || [], ['scene', 'script'], hl.scenes || 6)}
        </div>
        <div class="sp-card">
          <h3>${loc('editorHomeEnv')}</h3>
          ${listPicker(loc('environment'), 'home_selection.environment', hs.environment || [], ['sensor'], hl.environment || 12, ENVIRONMENT_DEVICE_CLASSES)}
        </div>
      </div>

      ${renderNavDialog(c, data.language, data.navDialogOpen)}
      ${renderSkinStore(data.skinStore, c, data.language)}
    </div>
  `;
}

async function uploadBackgroundImage(file, hass) {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch('/api/image/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${hass?.auth?.data?.access_token || ''}` },
        body: formData,
    }).catch((err) => {
        throw new Error(err instanceof Error ? err.message : 'Network error');
    });
    if (!resp.ok)
        throw new Error(`HTTP ${resp.status}`);
    const item = await resp.json().catch(() => undefined);
    if (!item?.id)
        throw new Error('No image id returned');
    return `/api/image/serve/${item.id}/original`;
}

function bindEditorEvents(host) {
    bindEntityPickers(host);
    bindAreaPickers(host);
    bindTextInputs(host);
    bindCheckboxes(host);
    bindListButtons(host);
    bindBgUpload(host);
    bindNavDialog(host);
    bindSkinStore(host);
}
function bindEntityPickers(host) {
    host.root.querySelectorAll(ENTITY_PICKER_TAG).forEach((el) => {
        if (host.state.hass)
            el.hass = host.state.hass;
        // ha-entity-picker reads JS properties; HTML attributes alone are unreliable.
        const domainsAttr = el.getAttribute('include-domains');
        if (domainsAttr) {
            try {
                el.includeDomains = JSON.parse(domainsAttr);
            }
            catch { /* ignore */ }
        }
        const classesAttr = el.getAttribute('include-device-classes');
        if (classesAttr) {
            try {
                el.includeDeviceClasses = JSON.parse(classesAttr);
            }
            catch { /* ignore */ }
        }
        el.addEventListener('value-changed', (ev) => {
            const path = el.dataset.path || el.dataset.listPath;
            if (!path)
                return;
            if (el.dataset.listIndex !== undefined) {
                host.state.config = setListItem(host.el, host.state.config, path, Number(el.dataset.listIndex), ev.detail.value);
            }
            else {
                host.state.config = setField(host.el, host.state.config, path, ev.detail.value);
            }
        });
    });
}
function bindAreaPickers(host) {
    host.root.querySelectorAll('select[data-area-path]').forEach((el) => {
        el.addEventListener('change', () => {
            const path = el.dataset.areaPath;
            if (!path || el.dataset.areaIndex === undefined)
                return;
            host.state.config = setListItem(host.el, host.state.config, path, Number(el.dataset.areaIndex), el.value);
        });
    });
}
function bindTextInputs(host) {
    host.root.querySelectorAll('input[data-text-path], select[data-text-path]').forEach((el) => {
        el.addEventListener('change', () => {
            const path = el.getAttribute('data-text-path') || '';
            const value = el.value;
            if (path === 'resource_pack.skin') {
                host.state.config = applySkin(host.el, host.state.config, value);
                host.onChange({ config: host.state.config });
                host.reload();
                return;
            }
            host.state.config = setField(host.el, host.state.config, path, value);
        });
    });
}
function bindCheckboxes(host) {
    host.root.querySelectorAll('input[type="checkbox"][data-path]').forEach((el) => {
        el.addEventListener('change', () => {
            host.state.config = setField(host.el, host.state.config, el.getAttribute('data-path') || '', el.checked);
        });
    });
}
function bindListButtons(host) {
    host.root.querySelectorAll('[data-add-path]').forEach((btn) => {
        btn.addEventListener('click', () => {
            host.state.config = addListItem(host.el, host.state.config, btn.getAttribute('data-add-path') || '', Number(btn.getAttribute('data-add-max')) || undefined);
            host.onChange({ config: host.state.config });
            host.reload();
        });
    });
    host.root.querySelectorAll('[data-del-path]').forEach((btn) => {
        btn.addEventListener('click', () => {
            host.state.config = setListItem(host.el, host.state.config, btn.getAttribute('data-del-path') || '', Number(btn.getAttribute('data-del-index')), '');
            host.onChange({ config: host.state.config });
            host.reload();
        });
    });
    host.root.querySelectorAll('[data-move-path]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.disabled)
                return;
            const path = btn.getAttribute('data-move-path') || '';
            const index = Number(btn.getAttribute('data-move-index'));
            const delta = Number(btn.getAttribute('data-move-delta'));
            if (!path || Number.isNaN(index) || Number.isNaN(delta))
                return;
            host.state.config = moveListItem(host.el, host.state.config, path, index, delta);
            host.onChange({ config: host.state.config });
            host.reload();
        });
    });
    host.root.querySelectorAll('[data-add-area-path]').forEach((btn) => {
        btn.addEventListener('click', () => {
            host.state.config = addListItem(host.el, host.state.config, btn.getAttribute('data-add-area-path') || '', Number(btn.getAttribute('data-add-max')) || undefined);
            host.onChange({ config: host.state.config });
            host.reload();
        });
    });
    host.root.querySelectorAll('[data-del-area-path]').forEach((btn) => {
        btn.addEventListener('click', () => {
            host.state.config = setListItem(host.el, host.state.config, btn.getAttribute('data-del-area-path') || '', Number(btn.getAttribute('data-del-area-index')), '');
            host.onChange({ config: host.state.config });
            host.reload();
        });
    });
}
function bindBgUpload(host) {
    const uploadInput = host.root.querySelector('input[data-bg-upload]');
    if (uploadInput) {
        uploadInput.addEventListener('change', async () => {
            const file = uploadInput.files?.[0];
            if (!file)
                return;
            uploadInput.disabled = true;
            try {
                const url = await uploadBackgroundImage(file, host.state.hass);
                host.state.config = setField(host.el, host.state.config, 'background_image', url);
                host.onChange({ config: host.state.config });
                host.reload();
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                alert(t(host.state.language, 'editorUploadFailed', { message }));
            }
            finally {
                uploadInput.disabled = false;
                uploadInput.value = '';
            }
        });
    }
    const clearBtn = host.root.querySelector('[data-bg-clear]');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            host.state.config = setField(host.el, host.state.config, 'background_image', '');
            host.onChange({ config: host.state.config });
            host.reload();
        });
    }
}
function bindNavDialog(host) {
    const configureBtn = host.root.querySelector('[data-nav-configure]');
    if (configureBtn) {
        configureBtn.addEventListener('click', () => {
            host.onChange({ navDialogOpen: true });
            host.reload();
        });
    }
    const overlay = host.root.querySelector('[data-nav-overlay]');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                host.onChange({ navDialogOpen: false });
                host.reload();
            }
        });
    }
    const cancelBtn = host.root.querySelector('[data-nav-cancel]');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            host.onChange({ navDialogOpen: false });
            host.reload();
        });
    }
    const saveBtn = host.root.querySelector('[data-nav-save]');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const result = parseNavSave(host.root, host.state.config);
            host.state.config = setField(host.el, host.state.config, 'nav', result.nav);
            host.onChange({ navDialogOpen: false, config: host.state.config });
            host.reload();
        });
    }
}
function bindSkinStore(host) {
    const storeBtn = host.root.querySelector('[data-skin-store]');
    if (storeBtn) {
        storeBtn.addEventListener('click', async () => {
            host.onChange({ skinStore: { ...host.state.skinStore, open: true, loading: true, error: '', searchQuery: '' } });
            host.reload();
            try {
                const themes = await fetchSkinThemes();
                await fetchSkinStats();
                const downloaded = host.state.config.downloaded_skins || [];
                const localVersions = await fetchLocalSkinVersions(downloaded);
                const merged = themes.map(th => ({
                    ...th,
                    hasUpdate: !!(th.version && (!localVersions[th.id] || localVersions[th.id] !== th.version)),
                    downloads: skinStats[th.id]?.downloads,
                    likes: skinStats[th.id]?.liked ?? 0,
                    userLiked: isSkinLiked(th.id),
                }));
                merged.sort((a, b) => Number(!!b.hasUpdate) - Number(!!a.hasUpdate));
                host.onChange({ skinStore: { open: true, loading: false, error: '', themes: merged, searchQuery: host.state.skinStore.searchQuery || '' } });
            }
            catch (err) {
                host.onChange({ skinStore: { ...host.state.skinStore, loading: false, error: String(err) } });
            }
            host.reload();
        });
    }
    const storeOverlay = host.root.querySelector('[data-store-overlay]');
    if (storeOverlay) {
        storeOverlay.addEventListener('click', (e) => {
            if (e.target === storeOverlay) {
                host.onChange({ skinStore: { ...host.state.skinStore, open: false } });
                host.reload();
            }
        });
    }
    const storeCloseBtn = host.root.querySelector('[data-store-close]');
    if (storeCloseBtn) {
        storeCloseBtn.addEventListener('click', () => {
            host.onChange({ skinStore: { ...host.state.skinStore, open: false } });
            host.reload();
        });
    }
    host.root.querySelectorAll('[data-store-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            const skin = btn.getAttribute('data-store-remove');
            if (!skin)
                return;
            host.state.config = removeSkin(host.el, host.state.config, host.state.hass, skin);
            host.onChange({ config: host.state.config });
            host.reload();
        });
    });
    host.root.querySelectorAll('[data-store-download]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const skin = btn.getAttribute('data-store-download');
            if (!skin)
                return;
            const alreadyInstalled = (host.state.config.downloaded_skins || []).includes(skin);
            const origText = btn.textContent || '';
            btn.textContent = t(host.state.language, 'editorDownloading');
            btn.disabled = true;
            const result = await downloadSkin(host.el, host.state.config, host.state.hass, skin, host.state.language);
            if (result.success) {
                host.onChange({ skinStore: { ...host.state.skinStore, open: false } });
                host.reload();
                if (alreadyInstalled)
                    alert(t(host.state.language, 'editorStoreClearCache'));
            }
            else {
                alert(result.errorMessage || t(host.state.language, 'editorSkinStoreDependency'));
                btn.textContent = origText;
                btn.disabled = false;
            }
        });
    });
    const searchInput = host.root.querySelector('[data-store-search]');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            host.onChange({ skinStore: { ...host.state.skinStore, searchQuery: searchInput.value } });
            host.reload();
            const restored = host.root.querySelector('[data-store-search]');
            if (restored && restored !== searchInput) {
                restored.focus();
                restored.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }
        });
    }
    host.root.querySelectorAll('[data-store-like]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const skin = btn.getAttribute('data-store-like');
            if (!skin)
                return;
            const result = await toggleLike(skin);
            if (!result)
                return;
            const countSpan = btn.querySelector('.store-like-count');
            if (countSpan)
                countSpan.textContent = String(result.total);
            btn.classList.toggle('liked', result.liked);
            btn.innerHTML = `${result.liked ? '❤️' : '🤍'} <span class="store-like-count">${result.total}</span>`;
        });
    });
    host.root.querySelectorAll('.store-thumb').forEach(img => {
        img.addEventListener('click', () => {
            const skin = img.closest('[data-store-theme]')?.getAttribute('data-store-theme');
            if (!skin)
                return;
            host.root.querySelector('#sp-lightbox')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'sp-lightbox';
            overlay.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7) url("${CDN_STORE}/screenshots/${skin}.png") no-repeat center/contain;cursor:pointer`;
            overlay.addEventListener('click', () => overlay.remove());
            host.root.appendChild(overlay);
        });
    });
}

class SkinsProCardEditor extends HTMLElement {
    constructor() {
        super();
        this._state = {
            config: { type: 'custom:skins-pro-card' },
            hass: undefined,
            language: 'en',
            navDialogOpen: false,
            skinStore: { open: false, loading: false, error: '', themes: [], searchQuery: '' },
        };
        this._areas = [];
        this._areasLoaded = false;
        this.attachShadow({ mode: 'open' });
    }
    setConfig(config) {
        const next = { type: 'custom:skins-pro-card', ...config };
        if (JSON.stringify(next) === JSON.stringify(this._state.config))
            return;
        this._state.config = next;
        this.render();
    }
    set hass(hass) {
        this._state.hass = hass;
        if (this.shadowRoot) {
            this.shadowRoot.querySelectorAll('ha-entity-picker').forEach((el) => {
                if (el)
                    el.hass = hass;
            });
        }
        void this._loadAreas();
    }
    async _loadAreas() {
        if (this._areasLoaded || !this._state.hass)
            return;
        try {
            const conn = this._state.hass.connection;
            if (!conn?.sendMessagePromise)
                return;
            const areas = await conn.sendMessagePromise({ type: 'config/area_registry/list' });
            if (Array.isArray(areas)) {
                this._areas = areas;
                this._areasLoaded = true;
                this.render();
            }
        }
        catch { /* area registry not available */ }
    }
    _currentLanguage() {
        return normalizeLanguage(this._state.hass?.language);
    }
    _translate(key) {
        return getTranslate(this._currentLanguage())(key);
    }
    _themeCssUrl() {
        return assetHref(this._state.config, 'theme_css');
    }
    render() {
        if (!this.shadowRoot)
            return;
        const language = this._currentLanguage();
        this.shadowRoot.innerHTML = renderEditorTemplate({
            config: this._state.config,
            areas: this._areas,
            areasLoaded: this._areasLoaded,
            language,
            translate: (key) => this._translate(key),
            themeCssUrl: this._themeCssUrl(),
            navDialogOpen: this._state.navDialogOpen,
            skinStore: this._state.skinStore,
        });
        bindEditorEvents({
            el: this,
            root: this.shadowRoot,
            state: this._state,
            onChange: (next) => { this._state = { ...this._state, ...next }; },
            reload: () => this.render(),
        });
    }
}
if (!customElements.get('skins-pro-card-editor')) {
    customElements.define('skins-pro-card-editor', SkinsProCardEditor);
}

/**
 * Security page hide list — single clear model:
 *
 * 1. Browse: show all cameras except those in `hidden` (edit-hide only — no stream-type filters).
 * 2. Edit: show all cameras; tap toggles draft only (no HA write).
 * 3. Done: persist draft → localStorage + lovelace strategy (`security_page.hidden`), then exit.
 *
 * Never auto-exit edit mode. Never lovelace/config/save on each card tap (that remounts the card).
 * Prefer: draft (while editing) > localStorage > HA strategy. Never union lists.
 */
const LS_KEY$1 = 'skins-pro.security.hidden';
const LS_KEY_USER$1 = (userId) => `skins-pro.security.hidden.${userId}`;
/** v4: stop auto-hiding streams; clear prior camera.* entries from local hide list once. */
const LS_PREVIEW_MIGRATE = 'skins-pro.security.preview-all-v4';
function normalizeHiddenIds(ids) {
    return [...new Set((ids || []).filter((id) => typeof id === 'string' && Boolean(id)))];
}
function readSecurityHiddenLocal(userId) {
    try {
        const raw = (userId && window.localStorage.getItem(LS_KEY_USER$1(userId)))
            || window.localStorage.getItem(LS_KEY$1);
        if (raw === null)
            return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return null;
        return normalizeHiddenIds(parsed.filter((id) => typeof id === 'string'));
    }
    catch {
        return null;
    }
}
function writeSecurityHiddenLocal(hidden, userId) {
    const normalized = normalizeHiddenIds(hidden);
    try {
        window.localStorage.setItem(LS_KEY$1, JSON.stringify(normalized));
        if (userId)
            window.localStorage.setItem(LS_KEY_USER$1(userId), JSON.stringify(normalized));
    }
    catch {
        // ignore quota / private mode
    }
}
/**
 * One-time: do not auto-hide any camera stream.
 * Clears prior camera.* ids from the hide list so all cams show until user uses「编辑隐藏」.
 */
function applyPreviewSubstreamDefaults(hidden, _cameras = [], userId) {
    const base = normalizeHiddenIds(hidden);
    try {
        if (window.localStorage.getItem(LS_PREVIEW_MIGRATE) === '1') {
            return base;
        }
        const next = base.filter((id) => !id.startsWith('camera.'));
        writeSecurityHiddenLocal(next, userId);
        window.localStorage.setItem(LS_PREVIEW_MIGRATE, '1');
        return next;
    }
    catch {
        return base.filter((id) => !id.startsWith('camera.'));
    }
}
/**
 * Prefer draft > localStorage > HA. Never union.
 */
function resolveSecurityHiddenIds(opts) {
    if (opts.draft !== null)
        return normalizeHiddenIds(opts.draft);
    const local = readSecurityHiddenLocal(opts.userId);
    const base = local !== null
        ? local
        : normalizeHiddenIds(opts.configHidden);
    return applyPreviewSubstreamDefaults(base, opts.cameras || [], opts.userId);
}
function toggleHiddenId(hidden, entityId) {
    const set = new Set(normalizeHiddenIds(hidden));
    if (set.has(entityId))
        set.delete(entityId);
    else
        set.add(entityId);
    return [...set];
}
function lovelacePathFromLocation(pathname = window.location.pathname) {
    const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (parts[0] === 'lovelace' && parts[1])
        return parts[1];
    const reserved = new Set(['config', 'developer-tools', 'history', 'logbook', 'media-browser', 'profile', 'hacs', 'api']);
    if (parts[0] && !reserved.has(parts[0]))
        return parts[0];
    return 'dashboard-n-2';
}
function securityHideSavePaths(pathname = window.location.pathname) {
    const primary = lovelacePathFromLocation(pathname);
    const out = [primary];
    if (primary !== 'dashboard-n-2')
        out.push('dashboard-n-2');
    return [...new Set(out.filter((p) => p && p !== 'my-home' && p !== 'lovelace'))];
}
/**
 * Write `security_page.hidden` into the Skins Pro strategy dashboard.
 * Returns true only after read-back matches.
 */
async function saveSecurityHiddenToHa(connection, hidden, pathname = window.location.pathname) {
    const normalized = normalizeHiddenIds(hidden);
    let lastError;
    for (const urlPath of securityHideSavePaths(pathname)) {
        try {
            const current = await connection.sendMessagePromise({
                type: 'lovelace/config',
                url_path: urlPath,
            });
            if (!current?.strategy || typeof current.strategy !== 'object')
                continue;
            const strategy = current.strategy;
            if (!String(strategy.type || '').includes('skins-pro'))
                continue;
            const prevPage = typeof strategy.security_page === 'object' && strategy.security_page
                ? strategy.security_page
                : {};
            await connection.sendMessagePromise({
                type: 'lovelace/config/save',
                url_path: urlPath,
                config: {
                    ...current,
                    strategy: {
                        ...strategy,
                        security_page: {
                            ...prevPage,
                            hidden: normalized,
                        },
                    },
                },
            });
            const verify = await connection.sendMessagePromise({
                type: 'lovelace/config',
                url_path: urlPath,
            });
            const strat = (verify?.strategy && typeof verify.strategy === 'object')
                ? verify.strategy
                : {};
            const page = (strat.security_page && typeof strat.security_page === 'object')
                ? strat.security_page
                : {};
            const saved = Array.isArray(page.hidden) ? page.hidden.map(String) : [];
            const same = saved.length === normalized.length && normalized.every((id) => saved.includes(id));
            if (same)
                return true;
            lastError = new Error(`verify mismatch on ${urlPath}`);
        }
        catch (error) {
            lastError = error;
        }
    }
    console.warn('[Skins Pro] security_page.hidden save failed', lastError);
    return false;
}

/**
 * Devices page hide list:
 * 1. Browse: omit entity ids in `devices_page.hidden`.
 * 2. Edit: show all; long-press hides, click restores; draft → localStorage immediately.
 * 3. Exit (完成 / 10s idle): persist draft → Lovelace strategy `devices_page.hidden`.
 *
 * Prefer: draft (while editing) > localStorage > HA strategy. Never union lists.
 */
const LS_KEY = 'skins-pro.devices.hidden';
const LS_KEY_USER = (userId) => `skins-pro.devices.hidden.${userId}`;
const DEVICE_EDIT_IDLE_MS = 10000;
const DEVICE_HIDE_LONG_PRESS_MS = 550;
function readDevicesHiddenLocal(userId) {
    try {
        const raw = (userId && window.localStorage.getItem(LS_KEY_USER(userId)))
            || window.localStorage.getItem(LS_KEY);
        if (raw === null)
            return null;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return null;
        return normalizeHiddenIds(parsed.filter((id) => typeof id === 'string'));
    }
    catch {
        return null;
    }
}
function writeDevicesHiddenLocal(hidden, userId) {
    const normalized = normalizeHiddenIds(hidden);
    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(normalized));
        if (userId)
            window.localStorage.setItem(LS_KEY_USER(userId), JSON.stringify(normalized));
    }
    catch {
        // ignore quota / private mode
    }
}
/** Prefer draft > localStorage > HA. Never union. */
function resolveDevicesHiddenIds(opts) {
    if (opts.draft !== null)
        return normalizeHiddenIds(opts.draft);
    const local = readDevicesHiddenLocal(opts.userId);
    if (local !== null)
        return local;
    return normalizeHiddenIds(opts.configHidden);
}
function addHiddenId(hidden, entityId) {
    const set = new Set(normalizeHiddenIds(hidden));
    set.add(entityId);
    return [...set];
}
function removeHiddenId(hidden, entityId) {
    const set = new Set(normalizeHiddenIds(hidden));
    set.delete(entityId);
    return [...set];
}
/**
 * Write `devices_page.hidden` into the Skins Pro strategy dashboard.
 * Returns true only after read-back matches.
 */
async function saveDevicesHiddenToHa(connection, hidden, pathname = window.location.pathname) {
    const normalized = normalizeHiddenIds(hidden);
    let lastError;
    for (const urlPath of securityHideSavePaths(pathname)) {
        try {
            const current = await connection.sendMessagePromise({
                type: 'lovelace/config',
                url_path: urlPath,
            });
            if (!current?.strategy || typeof current.strategy !== 'object')
                continue;
            const strategy = current.strategy;
            if (!String(strategy.type || '').includes('skins-pro'))
                continue;
            const prevPage = typeof strategy.devices_page === 'object' && strategy.devices_page
                ? strategy.devices_page
                : {};
            await connection.sendMessagePromise({
                type: 'lovelace/config/save',
                url_path: urlPath,
                config: {
                    ...current,
                    strategy: {
                        ...strategy,
                        devices_page: {
                            ...prevPage,
                            hidden: normalized,
                        },
                    },
                },
            });
            const verify = await connection.sendMessagePromise({
                type: 'lovelace/config',
                url_path: urlPath,
            });
            const strat = (verify?.strategy && typeof verify.strategy === 'object')
                ? verify.strategy
                : {};
            const page = (strat.devices_page && typeof strat.devices_page === 'object')
                ? strat.devices_page
                : {};
            const saved = Array.isArray(page.hidden) ? page.hidden.map(String) : [];
            const same = saved.length === normalized.length && normalized.every((id) => saved.includes(id));
            if (same)
                return true;
            lastError = new Error(`verify mismatch on ${urlPath}`);
        }
        catch (error) {
            lastError = error;
        }
    }
    console.warn('[Skins Pro] devices_page.hidden save failed', lastError);
    return false;
}

async function loadAreas(hass) {
    const connection = hass.connection;
    if (!connection?.sendMessagePromise)
        return [];
    try {
        const areas = await connection.sendMessagePromise({ type: 'config/area_registry/list' });
        return Array.isArray(areas)
            ? [...areas].sort((left, right) => left.name.localeCompare(right.name))
            : [];
    }
    catch {
        return [];
    }
}
async function loadFloors(hass) {
    const connection = hass.connection;
    if (!connection?.sendMessagePromise)
        return [];
    try {
        const floors = await connection.sendMessagePromise({ type: 'config/floor_registry/list' });
        if (!Array.isArray(floors))
            return [];
        return [...floors].sort((a, b) => {
            const la = a.level ?? Number.MAX_SAFE_INTEGER;
            const lb = b.level ?? Number.MAX_SAFE_INTEGER;
            if (la !== lb)
                return la - lb;
            return (a.name || '').localeCompare(b.name || '');
        });
    }
    catch {
        return [];
    }
}
async function loadEntityRegistry(hass) {
    const connection = hass.connection;
    if (!connection?.sendMessagePromise)
        return [];
    try {
        const entities = await connection.sendMessagePromise({ type: 'config/entity_registry/list' });
        return Array.isArray(entities) ? entities : [];
    }
    catch {
        return [];
    }
}
async function loadDeviceRegistry(hass) {
    const connection = hass.connection;
    if (!connection?.sendMessagePromise)
        return [];
    try {
        const devices = await connection.sendMessagePromise({ type: 'config/device_registry/list' });
        return Array.isArray(devices) ? devices : [];
    }
    catch {
        return [];
    }
}

/** Pick an icon for an HA energy "individual device" from its friendly name (GoW-era baseline). */
function energyDeviceIcon(name) {
    const n = (name || '').toLowerCase();
    if (/空调|air|冷气|aircon|climate/.test(n))
        return 'mdi:air-conditioner';
    if (/插座|socket|outlet|插排|排插/.test(n))
        return 'mdi:power-socket-cn';
    if (/照明|灯|light|lamp/.test(n))
        return 'mdi:lightbulb-group';
    if (/机柜|服务器|server|rack|nas|网络|路由/.test(n))
        return 'mdi:server';
    if (/厨|kitchen|stove|oven/.test(n))
        return 'mdi:stove';
    if (/热水|water heater|地暖|采暖|heat/.test(n))
        return 'mdi:water-boiler';
    if (/充电|charger|ev\b/.test(n))
        return 'mdi:ev-station';
    if (/冰箱|fridge|refriger/.test(n))
        return 'mdi:fridge';
    if (/电表|meter|dian_biao|炬为|总能量|总表|合计/.test(n))
        return 'mdi:meter-electric';
    return 'mdi:flash';
}
/** Strip cumulative suffixes so cards read as「2楼空调」not「2楼空调总电量累计」. */
function cleanEnergyLabel(friendly) {
    let s = friendly
        .replace(/WiFi联网远控电表\([^)]*\)/gi, '电表')
        .replace(/通道电量计量模块[^\s]*/g, '电量模块')
        .replace(/\s+/g, ' ')
        .trim();
    // Whole-meter names:「2楼总电量累计」→「2楼总」； device:「2楼空调总电量累计」→「2楼空调」
    if (/(总电量累计|总电量)$/.test(s)) {
        const base = s.replace(/(总电量累计|总电量)$/, '').trim();
        if (!base)
            return '总表';
        if (!/(空调|插座|照明|机柜|灯|厨|冷气|排插)/.test(base)) {
            return /总$/.test(base) ? base : `${base}总`;
        }
        return base;
    }
    if (/^(总能量|Total Energy)$/i.test(s))
        return '';
    s = s
        .replace(/电量累计|累计电量/g, '')
        .replace(/用电量|能耗|总能量/g, '')
        .replace(/合计电量|电量$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return s;
}
function resolveEntityMeta(entityId, hass, registries) {
    const entry = registries?.entityRegistry?.find((item) => item.entity_id === entityId);
    const device = entry?.device_id
        ? registries?.deviceRegistry?.find((item) => item.id === entry.device_id)
        : undefined;
    const friendly = String(hass.states[entityId]?.attributes?.friendly_name
        || entry?.name
        || entry?.original_name
        || '');
    let label = cleanEnergyLabel(friendly);
    if (!label || label === '总能量' || /^ch[_\s]?\d/i.test(label) || /^total energy$/i.test(friendly)) {
        const deviceName = String(device?.name_by_user || device?.name || '').trim();
        if (deviceName)
            label = cleanEnergyLabel(deviceName);
    }
    if (!label)
        label = entityId.split('.').pop() || entityId;
    const location = resolveEntityLocation(entityId, registries);
    return {
        label,
        icon: energyDeviceIcon(`${friendly} ${label} ${device?.name || ''}`),
        ...location,
    };
}
function resolveEntityLocation(entityId, registries) {
    if (!registries)
        return {};
    const entry = registries.entityRegistry?.find((item) => item.entity_id === entityId);
    let areaId = entry?.area_id || undefined;
    if (!areaId && entry?.device_id) {
        const device = registries.deviceRegistry?.find((item) => item.id === entry.device_id);
        areaId = device?.area_id || undefined;
    }
    if (!areaId)
        return {};
    const area = registries.areas?.find((item) => item.area_id === areaId || item.id === areaId);
    if (!area)
        return {};
    const floor = area.floor_id
        ? registries.floors?.find((item) => item.floor_id === area.floor_id)
        : undefined;
    const floorName = floor?.name || undefined;
    const areaName = area.name || undefined;
    const locationLabel = [floorName, areaName].filter(Boolean).join(' · ') || undefined;
    return { floorName, areaName, locationLabel };
}
function pickLocation(meta) {
    return {
        floorName: meta.floorName,
        areaName: meta.areaName,
        locationLabel: meta.locationLabel,
    };
}
/** Linked utility_meter entity ids for a Riemann/energy source (HA helper naming). */
function relatedUtilityMeterIds(sourceEntityId) {
    if (!sourceEntityId.endsWith('_yong_dian_liang'))
        return {};
    const stem = sourceEntityId.slice(0, -'_yong_dian_liang'.length);
    return {
        daily: `${stem}_jin_ri`,
        weekly: `${stem}_ben_zhou`,
        monthly: `${stem}_ben_yue`,
    };
}
function readMeterState(hass, entityId) {
    if (!entityId)
        return undefined;
    const raw = hass.states[entityId]?.state;
    if (raw === undefined || raw === 'unknown' || raw === 'unavailable')
        return undefined;
    const n = parseFloat(raw);
    if (!Number.isFinite(n))
        return undefined;
    return formatNumber(String(n), 1);
}
function periodValueFromStats(entries, periodStartMs) {
    let sum = 0;
    let has = false;
    for (const entry of entries) {
        const ts = entry.start === undefined ? NaN : new Date(entry.start).getTime();
        if (!Number.isFinite(ts) || ts < periodStartMs)
            continue;
        const v = entry.change ?? entry.sum ?? entry.state;
        if (v === null || v === undefined)
            continue;
        sum += v;
        has = true;
    }
    return has ? sum : undefined;
}
/** Monday 00:00 local of the current week. */
function startOfWeek(now) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    return d;
}
async function fetchEnergySources(hass, config, registries) {
    const empty = {
        sources: [],
        history: [],
        yesterday: undefined,
        monthToDate: undefined,
        weekToDate: undefined,
        todayTotal: undefined,
    };
    const connection = hass.connection;
    if (!connection?.sendMessagePromise)
        return empty;
    const result = await tryGetEnergyPrefs(hass, config, 'energy/get_prefs', registries);
    if (result)
        return result;
    const fallback = await tryGetEnergyPrefs(hass, config, 'energy/get_preferences', registries);
    return fallback ?? empty;
}
async function tryGetEnergyPrefs(hass, config, command, registries) {
    const connection = hass.connection;
    if (!connection?.sendMessagePromise)
        return null;
    try {
        const prefs = await connection.sendMessagePromise({ type: command });
        if (!prefs?.energy_sources?.length && !prefs?.device_consumption?.length)
            return null;
        const gridEntity = config?.energy?.entity;
        const energyUnit = config?.energy?.unit || 'kWh';
        const ids = [];
        const entries = [];
        const added = new Set();
        const hasDeviceConsumption = (prefs.device_consumption?.length ?? 0) > 0;
        for (const src of prefs.energy_sources ?? []) {
            // When individual devices are configured, skip grid meters on the energy page —
            // they duplicate the top total + per-circuit cards (e.g.「2楼总」≈ 分路之和).
            if (hasDeviceConsumption && src.type === 'grid')
                continue;
            if (src.type === 'grid') {
                if (src.flow_from || src.flow_to) {
                    for (const f of src.flow_from ?? []) {
                        if (f.stat_energy_from && !added.has(f.stat_energy_from)) {
                            added.add(f.stat_energy_from);
                            ids.push(f.stat_energy_from);
                            const meta = resolveEntityMeta(f.stat_energy_from, hass, registries);
                            entries.push({
                                key: 'todayEnergy',
                                entityId: f.stat_energy_from,
                                icon: meta.icon || 'mdi:transmission-tower',
                                unit: 'kWh',
                                label: meta.label || '电网',
                                ...pickLocation(meta),
                            });
                        }
                    }
                    for (const f of src.flow_to ?? []) {
                        if (f.stat_energy_to && !added.has(f.stat_energy_to)) {
                            added.add(f.stat_energy_to);
                            ids.push(f.stat_energy_to);
                            const meta = resolveEntityMeta(f.stat_energy_to, hass, registries);
                            entries.push({
                                key: 'gridReturn',
                                entityId: f.stat_energy_to,
                                icon: 'mdi:export-variant',
                                unit: 'kWh',
                                label: meta.label,
                                ...pickLocation(meta),
                            });
                        }
                    }
                }
                else {
                    if (src.stat_energy_from && !added.has(src.stat_energy_from)) {
                        added.add(src.stat_energy_from);
                        ids.push(src.stat_energy_from);
                        const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
                        entries.push({
                            key: 'todayEnergy',
                            entityId: src.stat_energy_from,
                            icon: meta.icon || 'mdi:transmission-tower',
                            unit: 'kWh',
                            label: meta.label || '电网',
                            ...pickLocation(meta),
                        });
                    }
                    if (src.stat_energy_to && !added.has(src.stat_energy_to)) {
                        added.add(src.stat_energy_to);
                        ids.push(src.stat_energy_to);
                        const meta = resolveEntityMeta(src.stat_energy_to, hass, registries);
                        entries.push({
                            key: 'gridReturn',
                            entityId: src.stat_energy_to,
                            icon: 'mdi:export-variant',
                            unit: 'kWh',
                            label: meta.label,
                            ...pickLocation(meta),
                        });
                    }
                }
            }
            else if (src.type === 'solar' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
                added.add(src.stat_energy_from);
                ids.push(src.stat_energy_from);
                const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
                entries.push({ key: 'solar', entityId: src.stat_energy_from, icon: 'mdi:solar-power', unit: 'kWh', label: meta.label, ...pickLocation(meta) });
            }
            else if (src.type === 'battery') {
                if (src.stat_energy_from && !added.has(src.stat_energy_from)) {
                    added.add(src.stat_energy_from);
                    ids.push(src.stat_energy_from);
                    const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
                    entries.push({ key: 'battery', entityId: src.stat_energy_from, icon: 'mdi:battery', unit: 'kWh', label: meta.label, ...pickLocation(meta) });
                }
                if (src.stat_energy_to && !added.has(src.stat_energy_to)) {
                    added.add(src.stat_energy_to);
                    ids.push(src.stat_energy_to);
                    const meta = resolveEntityMeta(src.stat_energy_to, hass, registries);
                    entries.push({ key: 'battery', entityId: src.stat_energy_to, icon: 'mdi:battery-charging', unit: 'kWh', label: meta.label, ...pickLocation(meta) });
                }
            }
            else if (src.type === 'gas' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
                added.add(src.stat_energy_from);
                ids.push(src.stat_energy_from);
                const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
                entries.push({ key: 'gas', entityId: src.stat_energy_from, icon: 'mdi:fire', unit: 'm³', label: meta.label, ...pickLocation(meta) });
            }
            else if (src.type === 'water' && src.stat_energy_from && !added.has(src.stat_energy_from)) {
                added.add(src.stat_energy_from);
                ids.push(src.stat_energy_from);
                const meta = resolveEntityMeta(src.stat_energy_from, hass, registries);
                entries.push({ key: 'water', entityId: src.stat_energy_from, icon: 'mdi:water', unit: 'm³', label: meta.label, ...pickLocation(meta) });
            }
        }
        // Homepage summary entity only — do not add as energy-page card when prefs already list sources/devices
        // (avoids duplicate「今日用电」from 6_chs_sum alongside per-channel devices).
        const hasPrefsCards = entries.length > 0 || (prefs.device_consumption?.length ?? 0) > 0;
        if (gridEntity && !added.has(gridEntity) && !hasPrefsCards) {
            ids.unshift(gridEntity);
            const meta = resolveEntityMeta(gridEntity, hass, registries);
            entries.unshift({
                key: 'todayEnergy',
                entityId: gridEntity,
                icon: meta.icon || 'mdi:lightning-bolt',
                unit: energyUnit,
                label: meta.label,
                ...pickLocation(meta),
            });
        }
        // HA Energy → Individual devices (插座/空调/照明… by friendly name)
        for (const device of prefs.device_consumption ?? []) {
            const entityId = String(device.stat_consumption || '').trim();
            if (!entityId || added.has(entityId))
                continue;
            added.add(entityId);
            ids.push(entityId);
            const meta = resolveEntityMeta(entityId, hass, registries);
            entries.push({
                key: 'todayEnergy',
                entityId,
                icon: meta.icon,
                unit: 'kWh',
                label: meta.label,
                isDevice: true,
                ...pickLocation(meta),
            });
        }
        if (entries.length === 0)
            return null;
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const weekStart = startOfWeek(now);
        if (monthStart.getTime() < start.getTime())
            start.setTime(monthStart.getTime());
        if (weekStart.getTime() < start.getTime())
            start.setTime(weekStart.getTime());
        let stats = {};
        try {
            stats = await connection.sendMessagePromise({
                type: 'recorder/statistics_during_period',
                start_time: start.toISOString(),
                end_time: now.toISOString(),
                types: ['change'],
                statistic_ids: ids,
                period: 'day',
            });
        }
        catch {
            // statistics unavailable
        }
        // New meters (e.g. Juwei Riemann from today) only have 0–1 daily buckets —
        // day bars look wrong. Fall back to recent hourly, then 5‑minute change.
        const sparseIds = ids.filter((id) => (stats[id]?.length ?? 0) < 3);
        let hourStats = {};
        let fineStats = {};
        if (sparseIds.length > 0) {
            const hourStart = new Date(now);
            hourStart.setHours(hourStart.getHours() - 48);
            try {
                hourStats = await connection.sendMessagePromise({
                    type: 'recorder/statistics_during_period',
                    start_time: hourStart.toISOString(),
                    end_time: now.toISOString(),
                    types: ['change'],
                    statistic_ids: sparseIds,
                    period: 'hour',
                });
            }
            catch {
                // hourly unavailable
            }
            const stillSparse = sparseIds.filter((id) => (hourStats[id]?.length ?? 0) < 3);
            if (stillSparse.length > 0) {
                const fineStart = new Date(now);
                fineStart.setHours(fineStart.getHours() - 12);
                try {
                    fineStats = await connection.sendMessagePromise({
                        type: 'recorder/statistics_during_period',
                        start_time: fineStart.toISOString(),
                        end_time: now.toISOString(),
                        types: ['change'],
                        statistic_ids: stillSparse,
                        period: '5minute',
                    });
                }
                catch {
                    // 5minute unavailable
                }
            }
        }
        const weekStartMs = weekStart.getTime();
        const monthStartMs = monthStart.getTime();
        const mapChangeHistory = (raw) => raw.map((entry) => {
            if (entry.change !== null && entry.change !== undefined)
                return Math.round(entry.change * 1000) / 1000;
            return 0;
        });
        const sources = entries.map((e) => {
            const raw = stats[e.entityId] ?? [];
            const dayHistory = mapChangeHistory(raw);
            const hourHistory = mapChangeHistory(hourStats[e.entityId] ?? []);
            const fineHistory = mapChangeHistory(fineStats[e.entityId] ?? []);
            // Prefer ≥3 daily points; else hourly; else recent 5‑minute profile (last 30).
            const history = dayHistory.length >= 3
                ? dayHistory
                : hourHistory.length >= 3
                    ? hourHistory.slice(-24)
                    : fineHistory.length > 0
                        ? fineHistory.slice(-30)
                        : dayHistory;
            const yesterdayVal = dayHistory.length >= 2
                ? dayHistory[dayHistory.length - 2]
                : undefined;
            const latestDay = dayHistory.length > 0 ? dayHistory[dayHistory.length - 1] : undefined;
            const location = e.floorName || e.areaName
                ? { floorName: e.floorName, areaName: e.areaName, locationLabel: e.locationLabel }
                : resolveEntityLocation(e.entityId, registries);
            const meters = relatedUtilityMeterIds(e.entityId);
            const weekFromMeter = readMeterState(hass, meters.weekly);
            const monthFromMeter = readMeterState(hass, meters.monthly);
            const todayFromMeter = readMeterState(hass, meters.daily);
            const weekFromStats = periodValueFromStats(raw, weekStartMs);
            const monthFromStats = periodValueFromStats(raw, monthStartMs);
            return {
                key: e.key,
                label: e.label,
                isDevice: e.isDevice,
                entityId: e.entityId,
                icon: e.icon,
                unit: hass.states[e.entityId]?.attributes?.unit_of_measurement || e.unit,
                history,
                yesterday: yesterdayVal !== undefined ? formatNumber(String(yesterdayVal), 1) : undefined,
                today: todayFromMeter
                    ?? (latestDay !== undefined ? formatNumber(String(latestDay), 1) : '--'),
                weekToDate: weekFromMeter
                    ?? (weekFromStats !== undefined ? formatNumber(String(weekFromStats), 1) : undefined),
                monthToDate: monthFromMeter
                    ?? (monthFromStats !== undefined ? formatNumber(String(monthFromStats), 1) : undefined),
                ...location,
            };
        });
        // Prefer device_consumption for aggregates — grid/sum meters would double-count.
        const aggregateSources = sources.some((s) => s.isDevice)
            ? sources.filter((s) => s.isDevice)
            : sources;
        // Energy page cards: when individual devices exist, hide grid/solar/… peers
        // (e.g.「2楼总」≈ sum of 插座/机柜/空调/照明).
        const pageSources = sources.some((s) => s.isDevice)
            ? sources.filter((s) => s.isDevice)
            : sources;
        const combinedHistory = [];
        let yesterdaySum = 0;
        let yesterdayCount = 0;
        for (const src of aggregateSources) {
            for (let i = 0; i < src.history.length; i++) {
                combinedHistory[i] = (combinedHistory[i] || 0) + src.history[i];
            }
            if (src.history.length >= 2) {
                yesterdaySum += src.history[src.history.length - 2];
                yesterdayCount++;
            }
            else if (src.history.length === 1) {
                yesterdaySum += src.history[0];
                yesterdayCount++;
            }
        }
        let monthSum = 0;
        let monthHasData = false;
        let weekSum = 0;
        let weekHasData = false;
        for (const src of aggregateSources) {
            const m = parseFloat(src.monthToDate ?? '');
            if (Number.isFinite(m)) {
                monthSum += m;
                monthHasData = true;
            }
            const w = parseFloat(src.weekToDate ?? '');
            if (Number.isFinite(w)) {
                weekSum += w;
                weekHasData = true;
            }
        }
        let todaySum = 0;
        let todayCount = 0;
        for (const src of aggregateSources) {
            const t = parseFloat(src.today);
            if (Number.isFinite(t)) {
                todaySum += t;
                todayCount++;
            }
        }
        return {
            sources: pageSources,
            history: combinedHistory,
            yesterday: yesterdayCount > 0 ? formatNumber(String(yesterdaySum), 1) : undefined,
            monthToDate: monthHasData ? formatNumber(String(monthSum), 1) : undefined,
            weekToDate: weekHasData ? formatNumber(String(weekSum), 1) : undefined,
            todayTotal: todayCount > 0 ? formatNumber(String(todaySum), 1) : undefined,
        };
    }
    catch {
        return null;
    }
}
/** Overlay live utility_meter states onto energy cards (今日/本周/本月). */
function enrichEnergySourcesWithMeters(hass, sources) {
    return sources.map((src) => {
        const meters = relatedUtilityMeterIds(src.entityId);
        const today = readMeterState(hass, meters.daily);
        const weekToDate = readMeterState(hass, meters.weekly);
        const monthToDate = readMeterState(hass, meters.monthly);
        if (!today && !weekToDate && !monthToDate)
            return src;
        return {
            ...src,
            today: today ?? src.today,
            weekToDate: weekToDate ?? src.weekToDate,
            monthToDate: monthToDate ?? src.monthToDate,
        };
    });
}
async function fetchEnergyHistory(hass, config) {
    const entityId = config?.energy?.entity;
    if (!entityId || !hass.connection?.sendMessagePromise) {
        return { history: [], yesterday: undefined };
    }
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    try {
        const data = await hass.connection.sendMessagePromise({
            type: 'recorder/statistics_during_period',
            start_time: start.toISOString(),
            end_time: now.toISOString(),
            types: ['change'],
            statistic_ids: [entityId],
            period: 'day',
        });
        const stats = data[entityId] ?? [];
        const daily = stats.map((entry) => {
            if (entry.change !== null && entry.change !== undefined)
                return Math.round(entry.change * 100) / 100;
            if (entry.sum !== null && entry.sum !== undefined)
                return Math.round(entry.sum * 100) / 100;
            if (entry.state !== null && entry.state !== undefined)
                return Math.round(entry.state * 100) / 100;
            return 0;
        });
        const yesterdayVal = daily.length >= 2 ? daily[daily.length - 2] : (daily.length === 1 ? daily[0] : undefined);
        return {
            history: daily,
            yesterday: yesterdayVal !== undefined ? formatNumber(String(yesterdayVal), 1) : undefined,
        };
    }
    catch {
        return { history: [], yesterday: undefined };
    }
}

async function loadWeatherForecast(hass, entityId, onUpdate) {
    const weather = hass.states[entityId];
    if (!weather) {
        return { unsub: async () => { } };
    }
    const supportedFeatures = weather.attributes?.supported_features || 0;
    const supportsDaily = (supportedFeatures & 1) !== 0;
    const supportsHourly = (supportedFeatures & 2) !== 0;
    const supportsTwiceDaily = (supportedFeatures & 4) !== 0;
    if (!supportsDaily && !supportsHourly && !supportsTwiceDaily) {
        const legacy = weather.attributes?.forecast;
        if (Array.isArray(legacy)) {
            return {
                unsub: async () => { },
                initial: legacy,
            };
        }
        return { unsub: async () => { } };
    }
    if (!hass.connection?.subscribeMessage) {
        return { unsub: async () => { } };
    }
    const forecastType = supportsDaily ? 'daily' : (supportsTwiceDaily ? 'twice_daily' : 'hourly');
    const callback = (event) => {
        if (event.forecast) {
            onUpdate(event.forecast);
        }
    };
    try {
        const unsubFn = await hass.connection.subscribeMessage(callback, {
            type: 'weather/subscribe_forecast',
            entity_id: entityId,
            forecast_type: forecastType,
        }, { resubscribe: false });
        return {
            unsub: async () => {
                try {
                    await unsubFn();
                }
                catch { /* connection may be closed */ }
            },
        };
    }
    catch (e) {
        console.error('Skins Pro - Failed to subscribe to weather forecast', e);
        return { unsub: async () => { } };
    }
}
function getWeatherTemperature(hass, entityId) {
    if (!entityId || !hass)
        return '';
    const temp = hass.states[entityId]?.attributes?.temperature;
    if (temp !== undefined && temp !== null) {
        const num = Number(temp);
        return Number.isFinite(num) ? `${Math.round(num)}°` : '';
    }
    return '';
}
function getWeatherDisplayText(hass, entityId) {
    if (!entityId || !hass)
        return '--';
    const entity = hass.states[entityId];
    return String(entity?.state || '--');
}

const NON_BATTERY_UNITS = new Set([
    'v', 'mv', 'kv', 'volt', 'volts',
    '°c', 'c', '°f', 'f', 'k',
    'a', 'ma', 'w', 'kw', 'wh', 'kwh',
    'db', 'dbm', 'lux', 'lx', 'ppm', 'µg/m³',
]);
const NON_BATTERY_DEVICE_CLASSES = new Set([
    'voltage', 'temperature', 'current', 'power', 'energy', 'illuminance', 'humidity',
]);
function isValidBatteryPercent(value, unit, deviceClass) {
    if (!Number.isFinite(value) || value < 0 || value > 100)
        return false;
    if (NON_BATTERY_DEVICE_CLASSES.has(deviceClass))
        return false;
    if (NON_BATTERY_UNITS.has(unit.toLowerCase().trim()))
        return false;
    return true;
}
function getMaintenanceItems(hass) {
    if (!hass)
        return [];
    const items = [];
    const added = new Set();
    for (const entity of Object.values(hass.states)) {
        if (!entity || added.has(entity.entity_id))
            continue;
        const friendlyName = String(entity.attributes?.friendly_name || entity.entity_id);
        const deviceClass = String(entity.attributes?.device_class || '').toLowerCase();
        const unit = String(entity.attributes?.unit_of_measurement || '');
        let value = null;
        if (deviceClass === 'battery') {
            const v = Number(entity.state);
            if (isValidBatteryPercent(v, unit, deviceClass)) {
                value = v;
            }
        }
        if (value === null) {
            const attrBattery = Number(entity.attributes?.battery_level);
            if (Number.isFinite(attrBattery) && isValidBatteryPercent(attrBattery, '%', deviceClass)) {
                value = attrBattery;
            }
        }
        if (value === null && entity.entity_id.startsWith('sensor.') && /battery/i.test(entity.entity_id)) {
            if (!/voltage|_temp|temperature|_current|_power|signal|rf_link/i.test(entity.entity_id)) {
                const v = Number(entity.state);
                if (isValidBatteryPercent(v, unit, deviceClass)) {
                    value = v;
                }
            }
        }
        if (value !== null && value > 0 && value <= 20) {
            added.add(entity.entity_id);
            items.push({
                name: friendlyName,
                battery: Math.round(value),
                level: value <= 10 ? 'error' : 'warning',
            });
        }
    }
    const seen = new Set();
    return items.filter((item) => {
        const key = `${item.name}|${item.battery}`;
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}

const STYLE_ID = 'skins-pro-kiosk';
function isKioskActive() {
    return typeof document !== 'undefined' && document.body.classList.contains('skins-pro-kiosk');
}
/** SkinsPro Kiosk APK injects `window.__skinsProKioskAndroid`. */
function isAndroidKiosk() {
    return typeof window !== 'undefined' && Boolean(window.__skinsProKioskAndroid);
}
function removeStyle(root) {
    if (!root)
        return;
    for (const child of Array.from(root.children)) {
        if (child instanceof HTMLStyleElement && child.id === STYLE_ID) {
            child.remove();
        }
    }
}
function injectStyle(root, css) {
    if (!root)
        return;
    removeStyle(root);
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    root.appendChild(style);
}
function applyKioskStyles(isKiosk) {
    let applied = false;
    try {
        const ha = document.querySelector('home-assistant')?.shadowRoot
            ?.querySelector('home-assistant-main')?.shadowRoot;
        if (!ha)
            return false;
        const drawer = ha.querySelector('ha-drawer');
        const lovelace = (ha.querySelector('ha-panel-lovelace') || ha.querySelector('ha-panel-sections'));
        const huiShadow = lovelace?.shadowRoot?.querySelector('hui-root')?.shadowRoot;
        if (isKiosk) {
            injectStyle(ha, `:host {
           --ha-sidebar-width: 0px !important;
           --mdc-drawer-width: 0px !important;
         }`);
            applied = true;
            if (drawer) {
                injectStyle(drawer, `:host {
             --ha-sidebar-width: 0px !important;
             --mdc-drawer-width: 0px !important;
           }
           ha-drawer > ha-sidebar { display: none !important; }
           partial-panel-resolver { --mdc-top-app-bar-width: 100% !important; }`);
                injectStyle(drawer.shadowRoot, `.mdc-drawer, aside, wa-drawer, [part="drawer"] { display: none !important; width: 0 !important; min-width: 0 !important; }
           [part="content"], .content, main { width: 100% !important; margin: 0 !important; padding: 0 !important; }
           .sidebar-shell { display: none !important; }
           mwc-top-app-bar-fixed, mwc-top-app-bar, header { display: none !important; }`);
            }
            if (huiShadow) {
                injectStyle(huiShadow, `:host {
             --safe-area-inset-top: 0px !important;
             --app-safe-area-inset-top: 0px !important;
             --view-container-padding-top: 0px !important;
           }
           #view {
             min-height: 100vh !important;
             height: 100vh !important;
             margin: 0 !important;
             padding: 0 !important;
             box-sizing: border-box !important;
           }
           #view > hui-view,
           #view hui-panel-view,
           #view hui-card,
           #view skins-pro-card {
             margin-top: 0 !important;
             padding-top: 0 !important;
           }
           .header { display: none !important; }`);
            }
        }
        else {
            removeStyle(drawer?.shadowRoot);
            removeStyle(drawer);
            removeStyle(huiShadow);
            removeStyle(ha);
            applied = true;
        }
    }
    catch {
        applied = false;
    }
    return applied;
}
function ensureKiosk() {
    document.body.classList.add('skins-pro-kiosk');
    return applyKioskStyles(true);
}
function toggleKiosk() {
    const isKiosk = document.body.classList.toggle('skins-pro-kiosk');
    applyKioskStyles(isKiosk);
    return isKiosk;
}

const COVER_STYLE_ID = 'sp-camera-cover';
const COVER_CSS = `
video, img {
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  object-fit: cover !important;
  object-position: center center !important;
}
ha-camera-stream,
ha-hls-player,
ha-web-rtc-player {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}
`;
function injectCoverIntoShadow(host) {
    const root = host.shadowRoot;
    if (!root)
        return;
    if (!root.getElementById(COVER_STYLE_ID)) {
        const style = document.createElement('style');
        style.id = COVER_STYLE_ID;
        style.textContent = COVER_CSS;
        root.appendChild(style);
    }
    root.querySelectorAll('ha-camera-stream, ha-hls-player, ha-web-rtc-player').forEach(injectCoverIntoShadow);
}
function patchCameraCover(root) {
    root.querySelectorAll('hui-image, ha-camera-stream').forEach(injectCoverIntoShadow);
}
/**
 * Camera preview via HA `hui-image` (live or auto).
 * Injects cover CSS into nested player shadow roots — theme CSS cannot pierce those.
 */
class SpCameraPreview extends i {
    constructor() {
        super(...arguments);
        this.cameraView = 'live';
        /** HA ratio string e.g. `16:10`. Empty skips so flex panels can use height:100%. */
        this.aspectRatio = '';
        this.fitMode = 'cover';
        this._timers = [];
    }
    createRenderRoot() {
        return this;
    }
    connectedCallback() {
        super.connectedCallback();
        this._mo = new MutationObserver(() => this._applyCover());
        this._mo.observe(this, { childList: true, subtree: true });
        this._scheduleCover();
    }
    disconnectedCallback() {
        this._mo?.disconnect();
        this._mo = undefined;
        for (const id of this._timers)
            window.clearTimeout(id);
        this._timers = [];
        super.disconnectedCallback();
    }
    updated() {
        this._scheduleCover();
    }
    _scheduleCover() {
        if (this.fitMode !== 'cover')
            return;
        for (const id of this._timers)
            window.clearTimeout(id);
        this._timers = [0, 80, 320, 1000].map((ms) => window.setTimeout(() => this._applyCover(), ms));
    }
    _applyCover() {
        if (this.fitMode !== 'cover')
            return;
        patchCameraCover(this);
    }
    render() {
        if (!this.hass || !this.entity)
            return b ``;
        return b `
      <hui-image
        class="camera-stream"
        .hass=${this.hass}
        .stateObj=${this.entity}
        .cameraImage=${this.entity.entity_id}
        .cameraView=${this.cameraView}
        .fitMode=${this.fitMode}
        .aspectRatio=${this.aspectRatio || undefined}
        .show_state=${false}
        .show_name=${false}
      ></hui-image>
    `;
    }
}
__decorate([
    n({ attribute: false })
], SpCameraPreview.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], SpCameraPreview.prototype, "entity", void 0);
__decorate([
    n()
], SpCameraPreview.prototype, "cameraView", void 0);
__decorate([
    n()
], SpCameraPreview.prototype, "aspectRatio", void 0);
__decorate([
    n()
], SpCameraPreview.prototype, "fitMode", void 0);
if (!customElements.get('sp-camera-preview')) {
    customElements.define('sp-camera-preview', SpCameraPreview);
}
/** Camera card preview via HA `hui-image`. */
function renderLiveCameraPreview(hass, entity, className = 'camera-preview camera-live', cameraView = 'live', options) {
    void window.loadCardHelpers?.();
    const aspectRatio = options && 'aspectRatio' in options
        ? (options.aspectRatio || '')
        : '16:10';
    return b `
    <div class=${className}>
      <sp-camera-preview
        .hass=${hass}
        .entity=${entity}
        .cameraView=${cameraView}
        .aspectRatio=${aspectRatio}
        .fitMode=${options?.fitMode ?? 'cover'}
      ></sp-camera-preview>
    </div>
  `;
}
/** Same go2rtc base URL as dashboard-n/monitoring. */
function monitoringGo2rtcUrl() {
    const loc = typeof window !== 'undefined' ? window.location : undefined;
    const host = loc?.hostname || '192.168.1.17';
    // External hostname cannot expose :1984; prefer LAN go2rtc on the wire.
    // (HTTPS pages still need same-origin ingress — see resolveGo2rtcBaseForPreview.)
    if (/homekitzhou|nabu\.casa|ui\.nabu/i.test(host)) {
        return 'http://192.168.1.17:1984';
    }
    return `http://${host}:1984`;
}
/**
 * Prefer same-origin go2rtc ingress on HTTPS (avoids mixed-content block on :1984).
 * Falls back to monitoringGo2rtcUrl() on LAN http / if supervisor API unavailable.
 */
async function resolveGo2rtcBaseForPreview(hass) {
    const loc = typeof window !== 'undefined' ? window.location : undefined;
    if (loc?.protocol === 'https:' && hass?.connection?.sendMessagePromise) {
        try {
            const cached = sessionStorage.getItem('sp-go2rtc-ingress');
            if (cached)
                return cached;
            const info = await hass.connection.sendMessagePromise({
                type: 'supervisor/api',
                endpoint: '/addons/core_go2rtc/info',
                method: 'get',
            });
            const entry = info?.ingress_entry || info?.data?.ingress_entry;
            if (entry) {
                const base = `${loc.origin}${entry}`.replace(/\/$/, '');
                sessionStorage.setItem('sp-go2rtc-ingress', base);
                return base;
            }
        }
        catch {
            /* supervisor API may be denied for non-admin */
        }
    }
    return monitoringGo2rtcUrl();
}
let videoRtcLoad = null;
function ensureGo2rtcVideoTag(baseUrl) {
    if (customElements.get('sp-go2rtc-video'))
        return Promise.resolve();
    if (!videoRtcLoad) {
        const base = baseUrl.replace(/\/$/, '');
        videoRtcLoad = import(/* @vite-ignore */ `${base}/video-rtc.js`)
            .then((mod) => {
            const VideoRTC = mod.VideoRTC;
            if (!VideoRTC)
                throw new Error('VideoRTC export missing');
            if (!customElements.get('sp-go2rtc-video')) {
                // Dynamic base from go2rtc; strip native controls so the skin owns the chrome.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const Base = VideoRTC;
                class SpGo2rtcVideo extends Base {
                    oninit() {
                        super.oninit();
                        const video = this.video;
                        if (video) {
                            video.controls = false;
                            video.muted = true;
                            video.autoplay = true;
                            video.playsInline = true;
                            video.setAttribute('playsinline', '');
                            video.setAttribute('webkit-playsinline', '');
                            video.disablePictureInPicture = true;
                            // Hide native big-play / control chrome (Android WebView often shows a play glyph).
                            video.style.setProperty('pointer-events', 'none');
                            video.controlsList?.add?.('nodownload');
                            video.style.width = '100%';
                            video.style.height = '100%';
                            video.style.objectFit = 'cover';
                            video.style.display = 'block';
                            video.style.background = '#111';
                            void video.play().catch(() => undefined);
                        }
                    }
                }
                customElements.define('sp-go2rtc-video', SpGo2rtcVideo);
            }
        })
            .catch((err) => {
            videoRtcLoad = null;
            throw err;
        });
    }
    return videoRtcLoad;
}
/**
 * Live security preview via go2rtc VideoRTC (WebRTC → MSE → …), controls-free.
 * Contained in the themed camera-card — no stream.html iframe chrome.
 * Same three streams only; no HA webrtc-camera / advanced-camera-card.
 */
class SpGo2rtcLivePreview extends i {
    constructor() {
        super(...arguments);
        this.stream = '';
        this.baseUrl = '';
        this._fallback = 'live';
        this._bust = 0;
        this._player = null;
        this._appliedSrc = '';
        this._mountToken = 0;
        this._onImgError = () => {
            if (this._fallback === 'mjpeg')
                this._useImgFallback('jpeg');
            else if (this._fallback === 'jpeg')
                this._bust = Date.now();
        };
    }
    createRenderRoot() {
        return this;
    }
    connectedCallback() {
        super.connectedCallback();
        // Always contain the player even if a skin theme omits .camera-preview { position:relative }.
        this.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;overflow:hidden;background:#111;';
    }
    disconnectedCallback() {
        this._mountToken += 1;
        this._player = null;
        this._appliedSrc = '';
        if (this._jpegTimer)
            window.clearInterval(this._jpegTimer);
        this._jpegTimer = undefined;
        super.disconnectedCallback();
    }
    updated(changed) {
        if (changed.has('stream')
            || changed.has('baseUrl')
            || changed.has('_fallback')
            || this._fallback === 'live') {
            void this._syncPlayer();
        }
    }
    _base() {
        return (this.baseUrl || monitoringGo2rtcUrl()).replace(/\/$/, '');
    }
    _wsSrc() {
        return `${this._base()}/api/ws?src=${encodeURIComponent(this.stream)}`;
    }
    _imgSrc() {
        const src = encodeURIComponent(this.stream);
        const base = this._base();
        if (this._fallback === 'jpeg') {
            return `${base}/api/frame.jpeg?src=${src}&t=${this._bust}`;
        }
        return `${base}/api/stream.mjpeg?src=${src}`;
    }
    _useImgFallback(kind) {
        this._player = null;
        this._appliedSrc = '';
        this._fallback = kind;
        if (kind === 'jpeg') {
            this._bust = Date.now();
            if (this._jpegTimer)
                window.clearInterval(this._jpegTimer);
            this._jpegTimer = window.setInterval(() => {
                this._bust = Date.now();
            }, 1000);
        }
    }
    async _syncPlayer() {
        if (!this.stream || this._fallback !== 'live') {
            this._player = null;
            this._appliedSrc = '';
            return;
        }
        const slot = this.querySelector('.sp-go2rtc-slot');
        if (!slot)
            return;
        const token = ++this._mountToken;
        const wsSrc = this._wsSrc();
        try {
            await ensureGo2rtcVideoTag(this._base());
            if (token !== this._mountToken || !this.isConnected)
                return;
            let el = slot.querySelector('sp-go2rtc-video');
            if (!el) {
                el = document.createElement('sp-go2rtc-video');
                el.className = 'sp-go2rtc-live';
                el.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;background:#111;';
                el.mode = 'webrtc,mse,mjpeg';
                el.media = 'video'; // video-only — avoids waiting on audio / play-button UX
                el.background = true;
                el.visibilityCheck = false;
                slot.replaceChildren(el);
            }
            this._player = el;
            if (this._appliedSrc !== wsSrc) {
                el.src = wsSrc;
                this._appliedSrc = wsSrc;
            }
            const video = el.video;
            if (video) {
                video.controls = false;
                video.muted = true;
                video.autoplay = true;
                video.playsInline = true;
                video.style.objectFit = 'cover';
                video.style.pointerEvents = 'none';
                void video.play().catch(() => undefined);
            }
            el.play?.();
        }
        catch {
            if (token === this._mountToken)
                this._useImgFallback('mjpeg');
        }
    }
    render() {
        if (!this.stream)
            return b ``;
        if (this._fallback === 'live') {
            return b `<div class="sp-go2rtc-slot" style="position:absolute;inset:0;overflow:hidden;"></div>`;
        }
        return b `
      <img
        class="sp-go2rtc-mjpeg"
        src=${this._imgSrc()}
        alt=""
        decoding="async"
        @error=${this._onImgError}
        style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#111;"
      />
    `;
    }
}
__decorate([
    n()
], SpGo2rtcLivePreview.prototype, "stream", void 0);
__decorate([
    n()
], SpGo2rtcLivePreview.prototype, "baseUrl", void 0);
__decorate([
    r()
], SpGo2rtcLivePreview.prototype, "_fallback", void 0);
__decorate([
    r()
], SpGo2rtcLivePreview.prototype, "_bust", void 0);
if (!customElements.get('sp-go2rtc-live-preview')) {
    customElements.define('sp-go2rtc-live-preview', SpGo2rtcLivePreview);
}
function renderGo2rtcLivePreview(stream, className = 'camera-preview camera-live', baseUrl) {
    return b `
    <div class=${className} style="position:relative;overflow:hidden;">
      <sp-go2rtc-live-preview .stream=${stream} .baseUrl=${baseUrl || ''}></sp-go2rtc-live-preview>
    </div>
  `;
}
/**
 * Exact Lovelace card configs used by dashboard-n/monitoring (no card_mod / view_layout).
 * Do not edit that dashboard — copy its live sources here.
 */
function monitoringCardConfig(source) {
    const go2rtcUrl = source.go2rtc_url || monitoringGo2rtcUrl();
    if (source.provider === 'ha-camera') {
        // Caller should use renderLiveCameraPreview; keep a webrtc entity fallback.
        return {
            type: 'custom:webrtc-camera',
            entity: source.entity || source.stream,
            muted: true,
            ui: false,
            background: false,
            mse: false,
            intersection: 0,
        };
    }
    if (source.provider === 'webrtc-camera') {
        // Match monitoring door card; mse:false avoids black MSE on Akuvox (pcm_mulaw audio).
        return {
            type: 'custom:webrtc-camera',
            url: source.stream,
            muted: true,
            ui: false,
            background: false,
            mse: false,
            intersection: 0,
        };
    }
    return {
        type: 'custom:advanced-camera-card',
        cameras: [
            {
                live_provider: 'go2rtc',
                go2rtc: {
                    stream: source.stream,
                    url: go2rtcUrl,
                    modes: source.modes?.length ? source.modes : ['webrtc', 'mse', 'mp4'],
                },
            },
        ],
        dimensions: {
            aspect_ratio_mode: 'static',
            aspect_ratio: '16:9',
        },
    };
}
/**
 * Mount the same Lovelace cards as dashboard-n/monitoring.
 * Create once; on hass updates only refresh `.hass` (avoids remount stutter).
 */
class SpMonitoringCamPreview extends i {
    constructor() {
        super(...arguments);
        this._mountedKey = '';
        this._mounting = false;
    }
    createRenderRoot() {
        return this;
    }
    updated() {
        void this._mount();
        if (this._card && this.hass) {
            this._card.hass = this.hass;
        }
    }
    async _mount() {
        if (!this.source?.stream || !this.hass || this._mounting)
            return;
        const host = this.querySelector('.sp-monitoring-host');
        if (!host)
            return;
        const key = JSON.stringify(monitoringCardConfig(this.source));
        if (key === this._mountedKey && this._card && host.contains(this._card))
            return;
        this._mounting = true;
        const source = this.source;
        const hass = this.hass;
        const config = monitoringCardConfig(source);
        try {
            let card;
            if (source.provider === 'webrtc-camera') {
                // Proven path: setConfig + hass BEFORE append (createCardElement can race).
                await customElements.whenDefined('webrtc-camera');
                card = document.createElement('webrtc-camera');
                card.setConfig?.(config);
                if (!card.config)
                    throw new Error('webrtc-camera setConfig did not apply');
                card.hass = hass;
            }
            else {
                const Win = window;
                if (typeof Win.loadCardHelpers === 'function') {
                    const helpers = await Win.loadCardHelpers();
                    card = helpers.createCardElement(config);
                }
                else {
                    await customElements.whenDefined('advanced-camera-card');
                    card = document.createElement('advanced-camera-card');
                    card.setConfig?.(config);
                }
                card.hass = hass;
            }
            if (!this.isConnected || this.source !== source || !this.hass) {
                this._mounting = false;
                return;
            }
            const liveHost = this.querySelector('.sp-monitoring-host');
            if (!liveHost) {
                this._mounting = false;
                return;
            }
            liveHost.replaceChildren(card);
            this._card = card;
            this._mountedKey = key;
            console.info('[Skins Pro] monitoring cam mounted', source.provider, source.stream);
            if (source.provider === 'webrtc-camera') {
                const tryConnect = () => {
                    try {
                        if (this.hass)
                            card.hass = this.hass;
                        card.onconnect?.();
                        const video = (card.shadowRoot?.querySelector('video')
                            || card.querySelector?.('video'));
                        if (video) {
                            video.muted = true;
                            video.playsInline = true;
                            void video.play().catch(() => undefined);
                        }
                    }
                    catch (error) {
                        console.warn('[Skins Pro] webrtc door reconnect failed', error);
                    }
                };
                window.setTimeout(tryConnect, 50);
                window.setTimeout(tryConnect, 400);
            }
        }
        catch (error) {
            console.warn('[Skins Pro] monitoring cam mount failed', source, error);
        }
        finally {
            this._mounting = false;
        }
    }
    render() {
        return b `<div class="sp-monitoring-host" style="position:absolute;inset:0;width:100%;height:100%;"></div>`;
    }
}
__decorate([
    n({ attribute: false })
], SpMonitoringCamPreview.prototype, "hass", void 0);
__decorate([
    n({ attribute: false })
], SpMonitoringCamPreview.prototype, "source", void 0);
if (!customElements.get('sp-monitoring-cam-preview')) {
    customElements.define('sp-monitoring-cam-preview', SpMonitoringCamPreview);
}

const LOCK_DIALOG_ID = 'sp-lock-dialog';
const AUTO_CLOSE_SEC = 5;
/** Same go2rtc stream as security「门禁监控」— do not open a second Akuvox RTSP. */
const DOORBELL_PREVIEW_STREAM = 'akuvox_sub';
/** CSS vars copied from skins-pro-card :host onto body-mounted dialog. */
const HOST_TOKEN_KEYS = [
    '--sp-accent',
    '--sp-accent-hover',
    '--sp-accent-alpha',
    '--sp-accent-border',
    '--sp-text-primary',
    '--sp-text-secondary',
    '--sp-text-main',
    '--sp-text-dark',
    '--sp-text-muted',
    '--sp-text-on-accent',
    '--sp-glass-bg',
    '--sp-panel-bg',
    '--sp-border-glass',
    '--sp-radius-lg',
    '--sp-radius-pill',
    '--sp-shadow-lg',
    '--glass-regular',
    '--glass-thick',
    '--glass-thin',
    '--sp-lock-scrim',
    '--sp-lock-card-bg',
    '--sp-lock-card-border',
    '--sp-lock-text',
    '--sp-lock-sub',
    '--sp-lock-status-bg',
    '--sp-lock-count-bg',
    '--sp-lock-count-fg',
    '--sp-lock-progress-bg',
    '--sp-lock-progress-fill',
    '--sp-lock-cancel-bg',
    '--sp-lock-cancel-fg',
    '--sp-lock-unlock-bg',
    '--sp-lock-unlock-fg',
];
const LOCK_DIALOG_STYLE = `
#${LOCK_DIALOG_ID} {
  position: fixed; inset: 0; z-index: 100000;
  font-family: inherit; pointer-events: auto;
  color: var(--sp-lock-text, var(--sp-text-primary, var(--sp-text-main, var(--sp-text-dark, #3d5a40))));
}
#${LOCK_DIALOG_ID} .lock-dialog-scrim {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  background: var(--sp-lock-scrim, rgba(20, 24, 28, 0.48));
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
#${LOCK_DIALOG_ID} .lock-dialog-card {
  width: min(360px, 100%);
  display: grid; gap: 16px; padding: 22px;
  border-radius: var(--sp-radius-lg, 22px);
  background: var(--sp-lock-card-bg, var(--glass-regular, var(--sp-glass-bg, var(--sp-panel-bg, rgba(255,248,230,0.96)))));
  border: 1px solid var(--sp-lock-card-border, var(--sp-border-glass, var(--sp-accent-border, rgba(0,0,0,.12))));
  box-shadow: var(--sp-shadow-lg, 0 16px 40px rgba(0,0,0,.28));
  color: inherit;
  pointer-events: auto; touch-action: manipulation;
}
#${LOCK_DIALOG_ID}[data-has-preview="true"] .lock-dialog-card {
  width: min(440px, 100%);
}
#${LOCK_DIALOG_ID} .lock-dialog-sub {
  margin: 0 0 4px; font-size: 12px; font-weight: 600;
  color: var(--sp-lock-sub, var(--sp-accent, inherit));
  opacity: 0.9;
}
#${LOCK_DIALOG_ID} .lock-dialog-titles h2 {
  margin: 0; font-size: 22px; font-weight: 800; color: inherit;
}
#${LOCK_DIALOG_ID} .lock-dialog-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: calc(var(--sp-radius-lg, 22px) - 6px);
  overflow: hidden;
  background: #050608;
  border: 1px solid var(--sp-border-glass, rgba(0,0,0,.12));
}
#${LOCK_DIALOG_ID} .lock-dialog-preview sp-go2rtc-live-preview,
#${LOCK_DIALOG_ID} .lock-dialog-preview sp-go2rtc-video,
#${LOCK_DIALOG_ID} .lock-dialog-preview .sp-go2rtc-slot,
#${LOCK_DIALOG_ID} .lock-dialog-preview .sp-go2rtc-live,
#${LOCK_DIALOG_ID} .lock-dialog-preview .sp-go2rtc-mjpeg,
#${LOCK_DIALOG_ID} .lock-dialog-preview img,
#${LOCK_DIALOG_ID} .lock-dialog-preview video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  display: block; background: #050608;
  object-fit: cover; object-position: center;
  pointer-events: none;
}
/* Kill native big-play glyph on WebView / Chromium video elements. */
#${LOCK_DIALOG_ID} .lock-dialog-preview video::-webkit-media-controls {
  display: none !important;
}
#${LOCK_DIALOG_ID} .lock-dialog-preview video::-webkit-media-controls-start-playback-button {
  display: none !important;
  -webkit-appearance: none;
}
#${LOCK_DIALOG_ID} .lock-dialog-preview video::-webkit-media-controls-overlay-play-button {
  display: none !important;
  -webkit-appearance: none;
  opacity: 0 !important;
  pointer-events: none !important;
}
#${LOCK_DIALOG_ID} .lock-dialog-status {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 14px; border-radius: 16px;
  background: var(--sp-lock-status-bg, var(--sp-accent-alpha, rgba(255,255,255,0.45)));
  border: 1px solid var(--sp-accent-border, transparent);
}
#${LOCK_DIALOG_ID} .lock-dialog-state {
  margin: 0; font-size: 18px; font-weight: 700; color: inherit;
}
#${LOCK_DIALOG_ID} .lock-dialog-count {
  width: 44px; height: 44px; border-radius: 50%;
  display: grid; place-items: center;
  font-size: 18px; font-weight: 800; flex-shrink: 0;
  background: var(--sp-lock-count-bg, var(--sp-accent, #7ec850));
  color: var(--sp-lock-count-fg, var(--sp-text-on-accent, #fff8e6));
  box-shadow: 0 6px 14px var(--sp-accent-alpha, rgba(0,0,0,.2));
}
#${LOCK_DIALOG_ID} .lock-dialog-progress {
  height: 8px; border-radius: 999px; overflow: hidden;
  background: var(--sp-lock-progress-bg, var(--sp-accent-alpha, rgba(0,0,0,.12)));
}
#${LOCK_DIALOG_ID} .lock-dialog-progress > span {
  display: block; height: 100%; border-radius: inherit;
  background: var(--sp-lock-progress-fill, linear-gradient(90deg, var(--sp-accent-alpha, transparent), var(--sp-accent, #7ec850)));
  transition: width 0.2s linear;
}
#${LOCK_DIALOG_ID} .lock-dialog-hint {
  margin: 0; font-size: 13px; text-align: center; opacity: 0.8;
}
#${LOCK_DIALOG_ID} .lock-dialog-actions {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
#${LOCK_DIALOG_ID} .lock-dialog-actions button {
  min-height: 48px; border: 0; border-radius: var(--sp-radius-pill, 999px);
  font: inherit; font-size: 16px; font-weight: 800;
  cursor: pointer; pointer-events: auto; touch-action: manipulation;
}
#${LOCK_DIALOG_ID} .lock-dialog-cancel {
  background: var(--sp-lock-cancel-bg, rgba(255,255,255,0.55));
  color: var(--sp-lock-cancel-fg, inherit);
  border: 1px solid var(--sp-border-glass, rgba(0,0,0,.12)) !important;
}
#${LOCK_DIALOG_ID} .lock-dialog-unlock {
  background: var(--sp-lock-unlock-bg, var(--sp-accent, #7ec850));
  color: var(--sp-lock-unlock-fg, var(--sp-text-on-accent, #fff8e6));
  box-shadow: 0 6px 14px var(--sp-accent-alpha, rgba(0,0,0,.2));
}
#${LOCK_DIALOG_ID} .lock-dialog-unlock:disabled { opacity: 0.55; cursor: not-allowed; }
`;
/** Drop your file at `/config/www/doorbell.mp3` → served as this URL. */
const DEFAULT_DOORBELL_SOUND_URL = '/local/doorbell.mp3';
function entityTitle(hass, entityId) {
    const state = hass.states?.[entityId];
    return String(state?.attributes?.friendly_name || entityId);
}
function stateHeading(state, language) {
    if (state === 'locked')
        return language === 'zh-CN' ? '可开门' : 'Ready';
    if (state === 'unlocked')
        return language === 'zh-CN' ? '已释放' : 'Released';
    if (state === 'open' || state === 'opening')
        return language === 'zh-CN' ? '已打开' : 'Open';
    if (state === 'unavailable' || state === 'unknown')
        return language === 'zh-CN' ? '离线' : 'Offline';
    return state;
}
/** Shared AudioContext — resume on first user gesture so kiosk chime can play later. */
let sharedAudioCtx;
function unlockDoorbellAudio() {
    const AudioCtx = window.AudioContext
        || window.webkitAudioContext;
    if (!AudioCtx)
        return;
    try {
        if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
            sharedAudioCtx = new AudioCtx();
        }
        void sharedAudioCtx.resume();
    }
    catch {
        /* ignore */
    }
}
function previewMjpegUrl(base, stream) {
    return `${base.replace(/\/$/, '')}/api/stream.mjpeg?src=${encodeURIComponent(stream)}`;
}
/** WebAudio ding-dong fallback when custom file is missing / blocked. */
function startSynthDoorbellChime() {
    unlockDoorbellAudio();
    const AudioCtx = window.AudioContext
        || window.webkitAudioContext;
    if (!AudioCtx)
        return { stop: () => undefined };
    let stopped = false;
    let ctx = sharedAudioCtx;
    let intervalId;
    let master;
    const ding = () => {
        if (stopped || !ctx || ctx.state === 'closed' || !master)
            return;
        const now = ctx.currentTime;
        const hit = (freq, startAt, dur, peak) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startAt);
            g.gain.setValueAtTime(0.0001, startAt);
            g.gain.exponentialRampToValueAtTime(peak, startAt + 0.015);
            g.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);
            osc.connect(g);
            g.connect(master);
            osc.start(startAt);
            osc.stop(startAt + dur + 0.02);
        };
        hit(1046.5, now, 0.45, 0.95);
        hit(784.0, now + 0.22, 0.55, 0.9);
    };
    try {
        if (!ctx || ctx.state === 'closed') {
            ctx = new AudioCtx();
            sharedAudioCtx = ctx;
        }
        master = ctx.createGain();
        master.gain.value = 1;
        master.connect(ctx.destination);
        const run = () => {
            if (stopped)
                return;
            ding();
            intervalId = window.setInterval(ding, 1400);
        };
        if (ctx.state === 'suspended')
            void ctx.resume().then(run).catch(() => undefined);
        else
            run();
        try {
            navigator.vibrate?.([220, 80, 220, 80, 320]);
        }
        catch {
            /* ignore */
        }
    }
    catch (error) {
        console.warn('[Skins Pro] doorbell synth chime failed', error);
    }
    return {
        stop: () => {
            stopped = true;
            if (intervalId)
                window.clearInterval(intervalId);
            try {
                master?.disconnect();
            }
            catch {
                /* ignore */
            }
        },
    };
}
/**
 * Prefer a real audio file (looped). Falls back to synth if URL missing/fails.
 * Put file at `/config/www/doorbell.mp3` or pass any `/local/...` URL.
 */
function startDoorbellChime(soundUrl) {
    unlockDoorbellAudio();
    const url = (soundUrl || DEFAULT_DOORBELL_SOUND_URL).trim();
    if (!url)
        return startSynthDoorbellChime();
    let stopped = false;
    let fallback;
    let audio;
    let intervalId;
    const stopAll = () => {
        stopped = true;
        if (intervalId)
            window.clearInterval(intervalId);
        intervalId = undefined;
        fallback?.stop();
        fallback = undefined;
        if (audio) {
            try {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
            }
            catch {
                /* ignore */
            }
            audio = undefined;
        }
    };
    const useFallback = (reason) => {
        if (stopped || fallback)
            return;
        console.warn('[Skins Pro] doorbell sound file failed, using synth', reason, url);
        fallback = startSynthDoorbellChime();
    };
    try {
        audio = new Audio();
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = 1;
        // Cache-bust so replacing the file on HA is picked up without hard refresh gymnastics.
        const sep = url.includes('?') ? '&' : '?';
        audio.src = `${url}${sep}v=${Date.now()}`;
        const playOnce = () => {
            if (stopped || !audio)
                return;
            void audio.play().catch((err) => useFallback(String(err)));
        };
        audio.addEventListener('error', () => useFallback('load-error'), { once: true });
        audio.addEventListener('canplaythrough', () => {
            if (stopped)
                return;
            playOnce();
            // Some WebViews ignore loop — re-trigger periodically as belt-and-suspenders.
            intervalId = window.setInterval(() => {
                if (stopped || !audio || fallback)
                    return;
                if (audio.ended || audio.paused)
                    playOnce();
            }, 2500);
        }, { once: true });
        try {
            navigator.vibrate?.([220, 80, 220, 80, 320]);
        }
        catch {
            /* ignore */
        }
    }
    catch (error) {
        useFallback(String(error));
    }
    return { stop: stopAll };
}
/** Copy theme tokens from card host onto the body-mounted dialog. */
function copyHostThemeTokens(host, target) {
    if (!host)
        return;
    const cs = getComputedStyle(host);
    for (const key of HOST_TOKEN_KEYS) {
        const value = cs.getPropertyValue(key).trim();
        if (value)
            target.style.setProperty(key, value);
    }
}
function isLockDialogOpen() {
    return Boolean(document.getElementById(LOCK_DIALOG_ID));
}
function closeLockDialog() {
    const el = document.getElementById(LOCK_DIALOG_ID);
    el?.querySelectorAll('img').forEach((img) => img.removeAttribute('src'));
    el?.remove();
}
/**
 * Unlock dialog — same chrome for manual lock + doorbell.
 * Visuals follow host CSS variables (copied from active theme).
 */
function openLockDialog(host, hass, entityId, language, skin = 'modern', options = {}) {
    closeLockDialog();
    const autoCloseSec = Math.max(1, options.autoCloseSec ?? AUTO_CLOSE_SEC);
    const previewStream = options.previewStream?.trim() || '';
    /** Doorbell: continuous MJPEG (no play glyph). Manual lock: no preview. */
    const previewMode = options.previewMode || (previewStream ? 'mjpeg' : 'live');
    let remainingMs = autoCloseSec * 1000;
    let timer;
    let unlocking = false;
    let lastPaintKey = '';
    let closed = false;
    let previewBase = '';
    const started = performance.now();
    const chime = options.playSound
        ? startDoorbellChime(options.soundUrl)
        : { stop: () => undefined };
    const container = document.createElement('div');
    container.id = LOCK_DIALOG_ID;
    container.dataset.skin = skin;
    container.dataset.hasPreview = previewStream ? 'true' : 'false';
    container.dataset.lockDialogBuild = 'doorbell-file-sound-202607241600';
    copyHostThemeTokens(host, container);
    const close = () => {
        if (closed)
            return;
        closed = true;
        if (timer)
            window.clearInterval(timer);
        chime.stop();
        container.querySelectorAll('sp-go2rtc-live-preview, sp-go2rtc-video, img').forEach((el) => {
            if (el instanceof HTMLImageElement)
                el.removeAttribute('src');
            el.remove();
        });
        container.remove();
    };
    const cancel = async () => {
        try {
            await options.onCancel?.();
        }
        catch (error) {
            console.warn('[Skins Pro] lock dialog cancel failed', error);
        }
        finally {
            close();
        }
    };
    const unlock = async () => {
        if (unlocking)
            return;
        unlocking = true;
        paint(true);
        try {
            if (options.onUnlock) {
                await options.onUnlock();
            }
            else {
                await hass.callService('lock', 'unlock', { entity_id: entityId });
            }
        }
        catch (error) {
            console.warn('[Skins Pro] lock.unlock failed', error);
        }
        finally {
            unlocking = false;
            paint(true);
            if (options.onUnlock)
                close();
        }
    };
    const onScrim = () => {
        if (options.preventScrimClose)
            return;
        void cancel();
    };
    const paint = (force = false) => {
        const stateObj = hass.states?.[entityId];
        const state = stateObj?.state || 'unavailable';
        const pct = Math.max(0, Math.min(100, (remainingMs / (autoCloseSec * 1000)) * 100));
        const secs = Math.max(1, Math.ceil(remainingMs / 1000));
        const key = `${state}|${secs}|${Math.round(pct)}|${unlocking ? 1 : 0}|${previewBase ? 1 : 0}`;
        if (!force && key === lastPaintKey)
            return;
        lastPaintKey = key;
        const title = options.title || entityTitle(hass, entityId);
        const cancelLabel = options.cancelLabel || t(language, 'editorCancel');
        const phoneNotified = options.doorbellHints ? remainingMs <= 0 : false;
        const hint = options.doorbellHints
            ? (phoneNotified ? t(language, 'doorbellPhoneNotified') : t(language, 'doorbellWaitPhone', { n: secs }))
            : t(language, 'lockAutoClose', { n: secs });
        const previewNode = previewStream && previewBase
            ? (previewMode === 'mjpeg'
                ? b `<img src=${previewMjpegUrl(previewBase, previewStream)} alt="" decoding="async" />`
                : b `<sp-go2rtc-live-preview .stream=${previewStream} .baseUrl=${previewBase}></sp-go2rtc-live-preview>`)
            : '';
        D(b `
      <style>${LOCK_DIALOG_STYLE}</style>
      <div class="lock-dialog-scrim" @click=${onScrim}>
        <div class="lock-dialog-card" @click=${(e) => e.stopPropagation()}>
          <div class="lock-dialog-titles">
            <p class="lock-dialog-sub">${t(language, 'security')}</p>
            <h2>${title}</h2>
          </div>

          ${previewStream
            ? b `
              <div class="lock-dialog-preview" aria-label=${t(language, 'doorbellPreview')}>
                ${previewNode}
              </div>
            `
            : ''}

          <div class="lock-dialog-status">
            <p class="lock-dialog-state">${stateHeading(state, language)}</p>
            <div class="lock-dialog-count" aria-live="polite">${secs}</div>
          </div>

          <div class="lock-dialog-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(pct)}>
            <span style="width:${pct}%"></span>
          </div>
          <p class="lock-dialog-hint">${hint}</p>

          <div class="lock-dialog-actions">
            <button type="button" class="lock-dialog-cancel" @click=${() => { void cancel(); }}>
              ${cancelLabel}
            </button>
            <button
              type="button"
              class="lock-dialog-unlock"
              ?disabled=${unlocking || state === 'unavailable'}
              @click=${() => { void unlock(); }}
            >
              ${unlocking ? t(language, 'lockUnlocking') : t(language, 'lockUnlock')}
            </button>
          </div>
        </div>
      </div>
    `, container);
    };
    document.body.appendChild(container);
    paint(true);
    void options.onOpen?.();
    if (previewStream) {
        void resolveGo2rtcBaseForPreview(hass).then((base) => {
            if (closed)
                return;
            previewBase = base;
            paint(true);
        });
    }
    timer = window.setInterval(() => {
        remainingMs = Math.max(0, autoCloseSec * 1000 - (performance.now() - started));
        if (remainingMs <= 0) {
            void (async () => {
                try {
                    await options.onTimeout?.();
                }
                catch (error) {
                    console.warn('[Skins Pro] lock dialog timeout failed', error);
                }
                finally {
                    close();
                }
            })();
            return;
        }
        paint();
    }, 100);
}

function viewportHeight() {
    const vv = window.visualViewport?.height;
    if (typeof vv === 'number' && vv > 0)
        return Math.floor(vv);
    return Math.floor(window.innerHeight);
}
function isKioskHost(host) {
    return host.hasAttribute('data-kiosk-fullscreen')
        || host.hasAttribute('data-sp-kiosk')
        || host.getAttribute('data-android-kiosk') === 'true'
        || document.body.classList.contains('skins-pro-kiosk');
}
function applyLayoutHeight(host) {
    if (!host)
        return;
    if (window.matchMedia('(orientation: portrait)').matches) {
        host.style.setProperty('--sp-runtime-height', 'auto');
        host.style.setProperty('--sp-runtime-min-height', '100vh');
        return;
    }
    // Kiosk / Android wall panel: fill the real visual viewport (no letterbox).
    if (isKioskHost(host)) {
        applyFullscreenHeight(host);
        return;
    }
    const rect = host.getBoundingClientRect();
    const paddingBottom = 0;
    const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && window.innerHeight < 500;
    const vh = viewportHeight();
    const availableHeight = isShortLandscape
        ? Math.max(240, Math.floor(vh - rect.top - paddingBottom))
        : Math.max(560, Math.floor(vh - rect.top - paddingBottom));
    host.style.setProperty('--sp-runtime-height', `${availableHeight}px`);
    host.style.setProperty('--sp-runtime-min-height', `${availableHeight}px`);
}
function applyThemeVariables(host, config) {
    if (!host)
        return;
    const theme = config?.resource_pack?.theme;
    if (theme) {
        for (const [key, value] of Object.entries(theme)) {
            host.style.setProperty(key, value);
        }
    }
    const stageUrl = config?.background_image || assetUrl(config, 'stage');
    host.style.setProperty('--sp-stage-texture', `url("${stageUrl}")`);
    host.style.setProperty('--sp-base-texture', `url("${assetUrl(config, 'base')}")`);
}
function applyFullscreenHeight(host) {
    if (!host)
        return;
    const vh = viewportHeight();
    const isShortLandscape = window.matchMedia('(orientation: landscape)').matches && vh < 500;
    const h = isShortLandscape ? Math.max(240, vh) : Math.max(560, vh);
    host.style.setProperty('--sp-runtime-height', `${h}px`);
    host.style.setProperty('--sp-runtime-min-height', `${h}px`);
}
function applyKioskExitHeight(host) {
    if (!host)
        return;
    requestAnimationFrame(() => {
        const r = host.getBoundingClientRect();
        const h = Math.max(560, Math.floor(viewportHeight() - r.top));
        host.style.setProperty('--sp-runtime-height', `${h}px`);
        host.style.setProperty('--sp-runtime-min-height', `${h}px`);
    });
}

const GROUP_LABEL_KEY = {
    lights: 'groupLights',
    switches: 'groupSwitches',
    climate: 'groupClimate',
    covers: 'groupCovers',
    media: 'groupMedia',
    security: 'groupSecurity',
    cleaning: 'groupCleaning',
    others: 'groupOthers',
};
function domainGroupLabel(groupKey, language) {
    const key = GROUP_LABEL_KEY[groupKey];
    return key ? t(language, key) : groupKey;
}
function getAreaDeviceIds(areaId, deviceRegistry) {
    return new Set((deviceRegistry || [])
        .filter((d) => d.area_id === areaId && !d.disabled_by)
        .map((d) => d.id));
}
function getAreaEntries(areaId, entityRegistry, deviceRegistry) {
    if (!areaId)
        return [];
    const areaDeviceIds = getAreaDeviceIds(areaId, deviceRegistry);
    return (entityRegistry || [])
        .filter((entry) => {
        if (entry.hidden_by || entry.disabled_by)
            return false;
        return entry.area_id === areaId || (entry.device_id && areaDeviceIds.has(entry.device_id));
    })
        .map((e) => e.entity_id);
}
function areaSummaryById(areaId, hass, entityRegistry, deviceRegistry, language) {
    if (!areaId)
        return 'Home Assistant Area';
    const entries = getAreaEntries(areaId, entityRegistry || [], deviceRegistry || []);
    if (entries.length === 0) {
        return t(language, 'noEntities');
    }
    const byClass = (cls) => entries.find((eid) => hass?.states[eid]?.attributes?.device_class === cls);
    const parts = [];
    const presence = byClass('presence') || byClass('occupancy') || byClass('motion');
    if (presence) {
        const occupied = stateValue(hass, presence, language) === 'on';
        parts.push(t(language, occupied ? 'areaOccupied' : 'areaEmpty'));
    }
    const temp = byClass('temperature');
    if (temp) {
        parts.push(`${formatNumber(stateValue(hass, temp, language), 1)}°C`);
    }
    const hum = byClass('humidity');
    if (hum) {
        parts.push(`${formatNumber(stateValue(hass, hum, language), 0)}%`);
    }
    if (!temp) {
        const illum = byClass('illuminance');
        if (illum) {
            parts.push(`${formatNumber(stateValue(hass, illum, language), 0)}lx`);
        }
    }
    if (parts.length > 0)
        return parts.join(' · ');
    return t(language, 'entityCount', { count: entries.length });
}
function areaCounts(areaId, entityRegistry, deviceRegistry) {
    if (!areaId)
        return { devices: 0, entities: 0 };
    const areaDevices = (deviceRegistry || [])
        .filter((d) => d.area_id === areaId && !d.disabled_by);
    const deviceIds = new Set(areaDevices.map((d) => d.id));
    const areaEntities = (entityRegistry || [])
        .filter((e) => {
        if (e.hidden_by || e.disabled_by)
            return false;
        return e.area_id === areaId || (e.device_id && deviceIds.has(e.device_id));
    });
    return { devices: deviceIds.size, entities: areaEntities.length };
}
function areaNameForEntity(entityId, entityRegistry, deviceRegistry, areas) {
    const entry = entityRegistry?.find((item) => item.entity_id === entityId);
    if (!entry)
        return '';
    const areaId = entry.area_id || deviceRegistry?.find((d) => d.id === entry.device_id)?.area_id || '';
    if (!areaId)
        return '';
    return areas?.find((area) => area.area_id === areaId)?.name || '';
}

const DEVICE_COLORS = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];
const PREFERRED_DOMAINS = /^(light|switch|climate|media_player|lock|cover|fan|valve|input_boolean|humidifier|water_heater|vacuum)\./;
function getRealDevicesForRender(hass, deviceRegistry, entityRegistry, areas, filters = {}) {
    if (!deviceRegistry || !entityRegistry || !hass)
        return [];
    return deviceRegistry
        .filter((device) => !device.disabled_by)
        .map((device, index) => {
        const entities = entityRegistry
            ?.filter((entry) => entry.device_id === device.id && !entry.hidden_by && !entry.disabled_by)
            .map((entry) => entry.entity_id) || [];
        if (entities.length === 0)
            return undefined;
        const nonUpdateEntities = entities.filter((entityId) => !entityId.startsWith('update.') && !entityId.startsWith('device_tracker.'));
        if (nonUpdateEntities.length === 0)
            return undefined;
        const preferredEntity = nonUpdateEntities.find((entityId) => PREFERRED_DOMAINS.test(entityId)) || nonUpdateEntities[0];
        if (!preferredEntity || !hass)
            return undefined;
        const stateObj = hass.states[preferredEntity];
        const state = stateObj?.state || 'unknown';
        const domain = preferredEntity.split('.')[0] || 'sensor';
        const icon = String(stateObj?.attributes?.icon || iconForDomain(domain));
        const name = String(stateObj?.attributes?.friendly_name || preferredEntity);
        if (/pre-?release/i.test(name))
            return undefined;
        const subtitle = areaNameForEntity(preferredEntity, entityRegistry, deviceRegistry, areas) || '';
        const detail = domain || '--';
        return {
            entityId: preferredEntity,
            name,
            subtitle,
            detail,
            state,
            icon,
            color: DEVICE_COLORS[index % DEVICE_COLORS.length],
        };
    })
        .filter((device) => Boolean(device))
        .filter((d) => {
        if (filters.filterRoom && d.subtitle !== filters.filterRoom)
            return false;
        if (filters.filterType && deviceTypeGroupKey(d.detail) !== filters.filterType)
            return false;
        if (filters.hideUnassigned && !d.subtitle)
            return false;
        return true;
    });
}
function deviceTypeGroupKey(detail) {
    return DEVICE_DOMAIN_GROUP[detail] || 'others';
}
function getDeviceRooms(devices) {
    return [...new Set(devices.map((d) => d.subtitle).filter(Boolean))].sort();
}
function getDeviceTypes(devices) {
    return [...new Set(devices.map((d) => deviceTypeGroupKey(d.detail)))].sort();
}
const DEVICE_DOMAIN_GROUP = {
    light: 'lights',
    switch: 'switches',
    input_boolean: 'switches',
    button: 'switches',
    input_button: 'switches',
    climate: 'climate',
    fan: 'climate',
    humidifier: 'climate',
    water_heater: 'climate',
    cover: 'covers',
    valve: 'covers',
    media_player: 'media',
    lock: 'security',
    alarm_control_panel: 'security',
    vacuum: 'cleaning',
    lawn_mower: 'cleaning',
};

/** HA entity domain → UI label (device card `.state-word`). */
const ZH = {
    light: '灯光',
    switch: '开关',
    input_boolean: '开关',
    button: '按钮',
    input_button: '按钮',
    climate: '空调',
    fan: '风扇',
    humidifier: '加湿器',
    water_heater: '热水器',
    cover: '窗帘',
    valve: '阀门',
    media_player: '媒体',
    lock: '门锁',
    alarm_control_panel: '报警',
    vacuum: '扫地机',
    lawn_mower: '割草机',
    camera: '摄像头',
    remote: '遥控',
    sensor: '传感器',
    binary_sensor: '二元传感',
    event: '事件',
    number: '数值',
    select: '选择',
    input_select: '选择',
    input_number: '数值',
    input_text: '文本',
    automation: '自动化',
    script: '脚本',
    scene: '场景',
    update: '更新',
    person: '人员',
    device_tracker: '设备追踪',
    siren: '警笛',
    weather: '天气',
    time: '时间',
    date: '日期',
    datetime: '日期时间',
    text: '文本',
    todo: '待办',
    calendar: '日历',
    notify: '通知',
    conversation: '对话',
    stt: '语音识别',
    tts: '语音合成',
    assist_satellite: '语音助手',
    image: '图片',
    image_processing: '图像处理',
};
const EN = {
    light: 'Light',
    switch: 'Switch',
    input_boolean: 'Switch',
    button: 'Button',
    input_button: 'Button',
    climate: 'Climate',
    fan: 'Fan',
    humidifier: 'Humidifier',
    water_heater: 'Water heater',
    cover: 'Cover',
    valve: 'Valve',
    media_player: 'Media',
    lock: 'Lock',
    alarm_control_panel: 'Alarm',
    vacuum: 'Vacuum',
    lawn_mower: 'Mower',
    camera: 'Camera',
    remote: 'Remote',
    sensor: 'Sensor',
    binary_sensor: 'Binary sensor',
    event: 'Event',
    number: 'Number',
    select: 'Select',
    input_select: 'Select',
    input_number: 'Number',
    input_text: 'Text',
    automation: 'Automation',
    script: 'Script',
    scene: 'Scene',
    update: 'Update',
    person: 'Person',
    device_tracker: 'Tracker',
    siren: 'Siren',
    weather: 'Weather',
    time: 'Time',
    date: 'Date',
    datetime: 'Date/time',
    text: 'Text',
    todo: 'To-do',
    calendar: 'Calendar',
};
function domainLabel(domain, language) {
    const raw = String(domain || '').toLowerCase();
    const map = language === 'zh-CN' ? ZH : EN;
    return map[raw] || domain;
}

function renderImage(config, key, alt, className) {
    const url = assetUrl(config, key);
    if (!url)
        return A;
    return b `<img class=${className || A} alt=${alt} src=${url}>`;
}
function userAvatarUrl(hass) {
    const userId = hass?.user?.id;
    if (!userId || !hass)
        return '';
    const person = Object.values(hass.states).find((s) => s && s.entity_id.startsWith('person.') && s.attributes.user_id === userId);
    return person?.attributes?.entity_picture || '';
}
function renderUserAvatar(config, hass, className) {
    const url = userAvatarUrl(hass) || assetUrl(config, 'avatar');
    if (!url)
        return A;
    return b `<img class=${className} alt="Avatar" src=${url}>`;
}

/** Open menus tracked directly — HA nests skins-pro-card in shadow roots, so querySelectorAll misses them. */
const openSelects = new Set();
/** Independent body portal (never move Lit-managed DOM). */
const portals = new WeakMap();
let outsideCloseBound = false;
let globalStyleReady = false;
const THEME_VARS = [
    '--sp-panel-bg', '--sp-glass-bg', '--glass-thick', '--glass-regular',
    '--sp-text-main', '--sp-text-primary', '--sp-text-dark',
    '--sp-border-glass', '--sp-border-width', '--sp-border-chip',
    '--sp-radius-md', '--sp-radius-lg', '--sp-radius-sm', '--sp-radius-pill',
    '--sp-shadow-card', '--sp-accent', '--sp-accent-soft',
    '--sp-font-2xs', '--sp-font-3xs', '--sp-device-bg',
];
function ensureGlobalMenuStyle() {
    if (globalStyleReady)
        return;
    globalStyleReady = true;
    if (document.getElementById('sp-select-menu-global'))
        return;
    const style = document.createElement('style');
    style.id = 'sp-select-menu-global';
    style.textContent = `
.sp-select-portal {
  box-sizing: border-box !important;
  padding: 4px !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-glass, rgba(0,0,0,.18)) !important;
  border-radius: var(--sp-radius-md, var(--sp-radius-lg, 12px)) !important;
  background: var(--sp-panel-bg, var(--sp-glass-bg, var(--glass-thick, #fff))) !important;
  color: var(--sp-text-main, var(--sp-text-primary, #222)) !important;
  box-shadow: var(--sp-shadow-card, 0 8px 24px rgba(0,0,0,.22)) !important;
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  overflow-x: hidden !important;
  overflow-y: auto !important;
  margin: 0 !important;
  inset: auto !important;
}
.sp-select-portal .sp-select-option {
  display: block !important;
  width: 100% !important;
  text-align: left !important;
  border: 0 !important;
  border-radius: var(--sp-radius-sm, 8px) !important;
  padding: 8px 10px !important;
  background: transparent !important;
  color: inherit !important;
  font: inherit !important;
  font-size: var(--sp-font-2xs, 12px) !important;
  cursor: pointer !important;
}
.sp-select-portal .sp-select-option.selected,
.sp-select-portal .sp-select-option:hover {
  background: var(--sp-accent-soft, var(--sp-accent, rgba(196,165,116,.35))) !important;
  color: var(--sp-text-main, var(--sp-text-primary, inherit)) !important;
}
`;
    document.head.appendChild(style);
}
function setImp(el, prop, value) {
    el.style.setProperty(prop, value, 'important');
}
function copyThemeVars(from, to) {
    const cs = getComputedStyle(from);
    for (const name of THEME_VARS) {
        const v = cs.getPropertyValue(name).trim();
        if (v)
            to.style.setProperty(name, v);
    }
}
function destroyPortal(details) {
    const portal = portals.get(details);
    if (!portal)
        return;
    portals.delete(details);
    try {
        if (typeof portal.hidePopover === 'function'
            && portal.matches?.(':popover-open')) {
            portal.hidePopover();
        }
    }
    catch { /* ignore */ }
    portal.remove();
}
function buildPortal(details, options, value, onPick) {
    ensureGlobalMenuStyle();
    destroyPortal(details);
    const trigger = details.querySelector('.sp-select-trigger');
    const portal = document.createElement('div');
    portal.className = 'sp-select-portal';
    portal.setAttribute('role', 'listbox');
    portal.dataset.spSelectPortal = '1';
    if (typeof portal.showPopover === 'function') {
        portal.setAttribute('popover', 'manual');
    }
    if (trigger)
        copyThemeVars(trigger, portal);
    for (const o of options) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `sp-select-option${o.value === value ? ' selected' : ''}`;
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-selected', o.value === value ? 'true' : 'false');
        btn.textContent = o.label;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeSelect(details);
            if (o.value !== value)
                onPick(o.value);
        });
        portal.appendChild(btn);
    }
    document.body.appendChild(portal);
    portals.set(details, portal);
    try {
        if (typeof portal.showPopover === 'function') {
            portal.showPopover();
        }
    }
    catch { /* older WebView */ }
    positionPortal(details, portal);
    return portal;
}
function positionPortal(details, portal) {
    const trigger = details.querySelector('.sp-select-trigger');
    if (!trigger)
        return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, 96);
    setImp(portal, 'position', 'fixed');
    setImp(portal, 'z-index', '2147483000');
    setImp(portal, 'display', 'block');
    setImp(portal, 'visibility', 'hidden');
    setImp(portal, 'right', 'auto');
    setImp(portal, 'min-width', `${width}px`);
    setImp(portal, 'width', 'max-content');
    setImp(portal, 'max-width', `${Math.min(240, window.innerWidth - 16)}px`);
    // Measure after styles apply
    const mh = Math.min(Math.max(portal.scrollHeight, 40), 280);
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceAbove >= Math.min(mh, 140) || spaceAbove > spaceBelow;
    let left = rect.left;
    if (left + width > window.innerWidth - 8)
        left = Math.max(8, window.innerWidth - width - 8);
    if (left < 8)
        left = 8;
    setImp(portal, 'left', `${left}px`);
    if (openUp) {
        setImp(portal, 'top', 'auto');
        setImp(portal, 'bottom', `${Math.max(8, window.innerHeight - rect.top + 4)}px`);
        setImp(portal, 'max-height', `${Math.max(120, spaceAbove - 12)}px`);
    }
    else {
        setImp(portal, 'bottom', 'auto');
        setImp(portal, 'top', `${rect.bottom + 4}px`);
        setImp(portal, 'max-height', `${Math.max(120, spaceBelow - 12)}px`);
    }
    setImp(portal, 'visibility', 'visible');
}
function closeSelect(el) {
    destroyPortal(el);
    if (el.open)
        el.open = false;
    openSelects.delete(el);
}
function closeAllExcept(keep) {
    for (const el of [...openSelects]) {
        if (keep && el === keep)
            continue;
        closeSelect(el);
    }
}
function ensureOutsideClose() {
    if (outsideCloseBound)
        return;
    outsideCloseBound = true;
    const closeIfOutside = (e) => {
        if (openSelects.size === 0)
            return;
        const path = e.composedPath();
        for (const el of [...openSelects]) {
            const portal = portals.get(el);
            const inside = path.includes(el) || (portal ? path.includes(portal) : false);
            if (!inside)
                closeSelect(el);
        }
    };
    document.addEventListener('pointerdown', closeIfOutside, true);
    document.addEventListener('touchstart', closeIfOutside, true);
    document.addEventListener('mousedown', closeIfOutside, true);
    document.addEventListener('click', closeIfOutside, true);
    document.addEventListener('scroll', () => closeAllExcept(null), true);
    window.addEventListener('resize', () => closeAllExcept(null));
}
/**
 * Theme-token select (replaces native &lt;select&gt; popup, which ignores skin CSS on Android).
 * Menu renders in a body portal (+ popover top-layer when available) so `.device { overflow:hidden }`
 * and backdrop-filter containing blocks cannot clip it.
 */
function renderThemedSelect(opts) {
    ensureOutsideClose();
    const current = opts.options.find((o) => o.value === opts.value) || opts.options[0];
    const label = current?.label || opts.value || '—';
    return b `
    <details
      class="sp-select ${opts.className || ''}"
      @toggle=${(e) => {
        const el = e.currentTarget;
        if (el.open) {
            closeAllExcept(el);
            openSelects.add(el);
            // Next frame: trigger rect is stable after details open layout.
            requestAnimationFrame(() => {
                if (!el.open)
                    return;
                buildPortal(el, opts.options, opts.value, opts.onChange);
            });
        }
        else {
            destroyPortal(el);
            openSelects.delete(el);
        }
    }}
    >
      <summary class="sp-select-trigger">${label}</summary>
      <!-- In-shadow menu kept empty/hidden; real UI is the body portal. -->
      <div class="sp-select-menu" hidden aria-hidden="true"></div>
    </details>
  `;
}

const HVAC_LABELS = {
    auto: 'hvacAuto', cool: 'hvacCool', heat: 'hvacHeat',
    'fan_only': 'hvacFanOnly', dry: 'hvacDry', off: 'hvacOff',
};
const FAN_LABELS = {
    auto: 'fanAuto',
    low: 'fanLow',
    medium: 'fanMedium',
    med: 'fanMedium',
    middle: 'fanMedium',
    mid: 'fanMedium',
    high: 'fanHigh',
    on: 'fanOn',
    off: 'fanOff',
    silent: 'fanSilent',
    quiet: 'fanSilent',
    mute: 'fanSilent',
    full: 'fanFull',
    max: 'fanFull',
    turbo: 'fanFull',
};
const HVAC_ORDER = ['auto', 'cool', 'heat', 'fan_only', 'dry', 'off'];
function lab(mode, map, lang) {
    const raw = String(mode || '');
    const key = map[raw] || map[raw.toLowerCase()];
    return key ? t(lang, key) : raw;
}
function renderClimateCard(config, hass, device, language, _onHandleAction) {
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, 'climate');
    const stateObj = hass.states?.[device.entityId];
    if (!stateObj) {
        return b `<div class="device device-off">
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${deviceStateLabel(device.state, language, hass, 'climate')}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${hass.states?.[device.entityId]?.last_changed ? formatRelativeTime(new Date(hass.states[device.entityId].last_changed), language) : device.subtitle}</p></div>
    </div>`;
    }
    const a = stateObj.attributes || {};
    const validHvacModes = new Set(['off', 'auto', 'cool', 'heat', 'dry', 'fan_only', 'heat_cool']);
    const hvacMode = a.hvac_mode || (validHvacModes.has(stateObj.state) ? stateObj.state : 'off');
    const currentTemp = a.current_temperature;
    const targetTemp = a.temperature;
    const hvacModes = (a.hvac_modes || []).filter(m => m !== 'heat_cool')
        .sort((x, y) => HVAC_ORDER.indexOf(x) - HVAC_ORDER.indexOf(y));
    const fanMode = a.fan_mode;
    const fanModes = a.fan_modes || [];
    const minT = a.min_temp ?? 16;
    const maxT = a.max_temp ?? 30;
    const step = a.target_temp_step ?? 1;
    const showFan = fanModes.length > 1;
    const statusClass = stateObj.state === 'unavailable' ? 'device-unavailable' : `device-on-${device.color}`;
    const stateForTime = hass.states?.[device.entityId];
    const lastTime = stateForTime?.last_changed
        ? formatRelativeTime(new Date(stateForTime.last_changed), language)
        : undefined;
    const doService = (service, data) => {
        void hass.callService('climate', service, { entity_id: device.entityId, ...data });
    };
    const adjustTemp = (delta) => {
        const cur = targetTemp ?? minT;
        const next = Math.min(maxT, Math.max(minT, cur + delta));
        if (next !== cur)
            doService('set_temperature', { temperature: next });
    };
    const tempDisplay = (v) => v !== undefined ? `${Math.round(v)}°` : '--';
    return b `
    <div class="device ${statusClass}">
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status" style="font-size:var(--sp-font-4xs);font-weight:700">${currentTemp !== undefined ? tempDisplay(currentTemp) : lab(hvacMode, HVAC_LABELS, language)}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime || device.subtitle}</p>
      </div>
      <div class="control-row" style="gap:2px">
        <div class="temp-group" style="display:flex;align-items:center;gap:1px;flex-shrink:0">
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e) => { e.stopPropagation(); adjustTemp(-step); }}><ha-icon icon="mdi:minus" style="--mdc-icon-size:14px"></ha-icon></div>
          <span style="font-weight:700;font-size:var(--sp-font-2xs);min-width:20px;text-align:center">${targetTemp !== undefined ? tempDisplay(targetTemp) : '--'}</span>
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e) => { e.stopPropagation(); adjustTemp(step); }}><ha-icon icon="mdi:plus" style="--mdc-icon-size:14px"></ha-icon></div>
        </div>
        ${renderThemedSelect({
        className: 'sp-select-compact',
        value: hvacMode,
        options: hvacModes.map((m) => ({ value: m, label: lab(m, HVAC_LABELS, language) })),
        onChange: (v) => doService('set_hvac_mode', { hvac_mode: v }),
    })}
        ${showFan ? renderThemedSelect({
        className: 'sp-select-compact',
        value: fanMode || fanModes[0] || '',
        options: fanModes.map((m) => ({ value: m, label: lab(m, FAN_LABELS, language) })),
        onChange: (v) => doService('set_fan_mode', { fan_mode: v }),
    }) : ''}
      </div>
    </div>
  `;
}

/**
 * Theme-drawn pill switch (`.switch` / `.switch.on`).
 * Prefer this over `ha-control-switch` so skins (GoW / Animal Crossing) control visuals.
 */
function renderThemedSwitch(checked, onToggle, label = '') {
    return b `
    <span
      class="switch ${checked ? 'on' : ''}"
      role="switch"
      aria-checked=${checked ? 'true' : 'false'}
      aria-label=${label}
      style="flex-shrink:0;margin-left:auto"
      @click=${(e) => {
        e.stopPropagation();
        onToggle();
    }}
      @pointerdown=${(e) => e.stopPropagation()}
    ></span>
  `;
}

const BRIGHTNESS_MODES = new Set(['brightness', 'color_temp', 'hs', 'rgb', 'rgbw', 'rgbww', 'xy']);
const COLOR_TEMP_MODES = new Set(['color_temp']);
const COLOR_RGB_MODES = new Set(['hs', 'rgb', 'rgbw', 'rgbww', 'xy']);
const DEFAULT_MIN_KELVIN = 2000;
const DEFAULT_MAX_KELVIN = 6500;
function miredsToKelvin(mireds) {
    return Math.round(1000000 / Math.max(1, mireds));
}
function mergeLightCapabilityAttrs(stateAttrs, registryEntry) {
    const caps = (registryEntry?.capabilities || {});
    // State attrs win when present; registry capabilities fill gaps (Xiaomi etc.).
    const merged = { ...caps, ...stateAttrs };
    const stateModes = stateAttrs.supported_color_modes;
    const capModes = caps.supported_color_modes;
    if ((!Array.isArray(stateModes) || stateModes.length === 0)
        && Array.isArray(capModes)
        && capModes.length > 0) {
        merged.supported_color_modes = capModes;
    }
    for (const key of [
        'min_color_temp_kelvin',
        'max_color_temp_kelvin',
        'min_mireds',
        'max_mireds',
    ]) {
        if (typeof stateAttrs[key] !== 'number' && typeof caps[key] === 'number') {
            merged[key] = caps[key];
        }
    }
    return merged;
}
function resolveColorTempControl(attributes) {
    const colorModes = attributes.supported_color_modes || [];
    const hasMode = colorModes.some((mode) => COLOR_TEMP_MODES.has(mode));
    const hasKelvinRange = typeof attributes.min_color_temp_kelvin === 'number'
        || typeof attributes.max_color_temp_kelvin === 'number';
    const hasMiredRange = typeof attributes.min_mireds === 'number'
        || typeof attributes.max_mireds === 'number';
    const hasCurrent = typeof attributes.color_temp_kelvin === 'number'
        || typeof attributes.color_temp === 'number';
    const supports = hasMode || hasKelvinRange || hasMiredRange || hasCurrent;
    // mireds are inverse of kelvin: min_mireds ~= max kelvin
    const minKelvin = typeof attributes.min_color_temp_kelvin === 'number'
        ? attributes.min_color_temp_kelvin
        : (typeof attributes.max_mireds === 'number'
            ? miredsToKelvin(attributes.max_mireds)
            : DEFAULT_MIN_KELVIN);
    const maxKelvin = typeof attributes.max_color_temp_kelvin === 'number'
        ? attributes.max_color_temp_kelvin
        : (typeof attributes.min_mireds === 'number'
            ? miredsToKelvin(attributes.min_mireds)
            : DEFAULT_MAX_KELVIN);
    const safeMin = Math.min(minKelvin, maxKelvin);
    const safeMax = Math.max(minKelvin, maxKelvin);
    let currentKelvin = typeof attributes.color_temp_kelvin === 'number'
        ? attributes.color_temp_kelvin
        : (typeof attributes.color_temp === 'number'
            ? miredsToKelvin(attributes.color_temp)
            : Math.round((safeMin + safeMax) / 2));
    currentKelvin = Math.min(safeMax, Math.max(safeMin, currentKelvin));
    return { supports, minKelvin: safeMin, maxKelvin: safeMax, currentKelvin };
}
function rgbToHex(rgb) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}
function hsToRgb(hue, sat) {
    const s = sat / 100;
    const v = 1;
    const c = v * s;
    const hp = hue / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (hp >= 0 && hp < 1) {
        r = c;
        g = x;
        b = 0;
    }
    else if (hp < 2) {
        r = x;
        g = c;
        b = 0;
    }
    else if (hp < 3) {
        r = 0;
        g = c;
        b = x;
    }
    else if (hp < 4) {
        r = 0;
        g = x;
        b = c;
    }
    else if (hp < 5) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }
    const m = v - c;
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
function hexToRgb(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m)
        return [255, 255, 255];
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function renderLightCard(config, hass, device, language, onHandleAction, entityRegistry) {
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, 'light');
    const stateObj = hass.states?.[device.entityId];
    if (!stateObj) {
        return b `<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${deviceStateLabel(device.state, language, hass, 'light')}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
    }
    const registryEntry = entityRegistry?.find((entry) => entry.entity_id === device.entityId);
    const a = mergeLightCapabilityAttrs((stateObj.attributes || {}), registryEntry);
    const isOn = stateObj.state === 'on';
    const brightness = a.brightness;
    const briPct = brightness !== undefined ? Math.round(brightness / 2.55) : undefined;
    const colorModes = a.supported_color_modes || [];
    const hasBrightness = colorModes.some(m => BRIGHTNESS_MODES.has(m)) || brightness !== undefined;
    const colorTempControl = resolveColorTempControl(a);
    const hasColorTemp = colorTempControl.supports;
    const hasRgbColor = colorModes.some(m => COLOR_RGB_MODES.has(m));
    const rgbColor = a.rgb_color;
    const hsColor = a.hs_color;
    const currentHex = rgbColor
        ? rgbToHex(rgbColor)
        : (hsColor ? rgbToHex(hsToRgb(hsColor[0], hsColor[1])) : '#ffffff');
    const statusClass = isOn ? `device-on-${device.color}` : (stateObj.state === 'unavailable' ? 'device-unavailable' : 'device-off');
    const stateLabel = deviceStateLabel(stateObj.state, language, hass, 'light');
    const lastTime = stateObj.last_changed
        ? formatRelativeTime(new Date(stateObj.last_changed), language)
        : device.subtitle;
    const doService = (service, data) => {
        void hass.callService('light', service, { entity_id: device.entityId, ...data });
    };
    const stopCardClick = (e) => e.stopPropagation();
    return b `
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'toggle')}>
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${stateLabel}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" @click=${stopCardClick} @pointerdown=${stopCardClick}>
        ${hasBrightness && isOn && briPct !== undefined ? b `
        <ha-control-slider .value=${briPct} min="0" max="100" style="--control-slider-thickness:28px;--control-slider-border-radius:var(--sp-radius-pill, var(--sp-radius-infinite, 999px));flex:1;min-width:0;--control-slider-color:var(--sp-accent, var(--sp-accent-green, var(--primary-color, #7BC67E)));--control-slider-background:var(--sp-device-bg, rgba(128,128,128,.2))" @value-changed=${(e) => { e.stopPropagation(); doService('turn_on', { brightness: Math.round((e.detail.value ?? 0) * 2.55) }); }} @click=${stopCardClick} @pointerdown=${stopCardClick}></ha-control-slider>
        ` : ''}
        ${hasColorTemp && isOn ? b `
        <ha-control-slider
          .value=${colorTempControl.currentKelvin}
          min=${colorTempControl.minKelvin}
          max=${colorTempControl.maxKelvin}
          style="--control-slider-thickness:28px;--control-slider-border-radius:var(--sp-radius-pill, var(--sp-radius-infinite, 999px));flex:1;min-width:0;--control-slider-color:var(--sp-accent, var(--sp-accent-green, var(--primary-color, #7BC67E)))"
          @value-changed=${(e) => {
        e.stopPropagation();
        const kelvin = Math.round((e.detail.value ?? colorTempControl.currentKelvin));
        doService('turn_on', { color_temp_kelvin: kelvin });
    }}
          @click=${stopCardClick}
          @pointerdown=${stopCardClick}
        ></ha-control-slider>
        ` : ''}
        ${hasRgbColor && isOn ? b `
        <label class="light-color-swatch" style="width:28px;height:28px;border-radius:50%;background:${currentHex};border:2px solid rgba(255,255,255,.6);flex-shrink:0;cursor:pointer;overflow:hidden;box-shadow:var(--sp-shadow-device);display:block" title=${currentHex} @click=${stopCardClick} @pointerdown=${stopCardClick}>
          <input type="color" .value=${currentHex} style="opacity:0;width:100%;height:100%;cursor:pointer;border:0;padding:0" @input=${(e) => { e.stopPropagation(); const v = e.target.value; doService('turn_on', { rgb_color: hexToRgb(v) }); }} @click=${stopCardClick}>
        </label>
        ` : ''}
        ${renderThemedSwitch(isOn, () => doService('toggle', {}), device.name)}
      </div>
    </button>
  `;
}

function renderFanCard(config, hass, device, language, onHandleAction) {
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, 'fan');
    const stateObj = hass.states?.[device.entityId];
    if (!stateObj) {
        return b `<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${deviceStateLabel(device.state, language, hass, 'fan')}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
    }
    const a = stateObj.attributes || {};
    const isOn = stateObj.state === 'on';
    const percentage = a.percentage;
    const percentageStep = a.percentage_step ?? 1;
    const presetMode = a.preset_mode;
    const presetModes = a.preset_modes || [];
    const oscillating = a.oscillating;
    const currentDirection = a.current_direction;
    const statusClass = isOn ? `device-on-${device.color}` : (stateObj.state === 'unavailable' ? 'device-unavailable' : 'device-off');
    const stateLabel = deviceStateLabel(stateObj.state, language, hass, 'fan');
    const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;
    const doService = (service, data) => {
        void hass.callService('fan', service, { entity_id: device.entityId, ...data });
    };
    return b `
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top" @click=${(e) => { e.stopPropagation(); onHandleAction(device.entityId, 'more-info'); }}>
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${isOn && percentage !== undefined && percentage > 0 ? `${percentage}%` : stateLabel}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" style="gap:4px" @click=${(e) => e.stopPropagation()}>
        ${isOn && percentage !== undefined ? b `
        <ha-control-slider .value=${percentage} min="0" max="100" step=${percentageStep} style="--control-slider-thickness:28px;--control-slider-border-radius:var(--sp-radius-pill);flex:1;min-width:0" @value-changed=${(e) => { e.stopPropagation(); const v = (e.detail.value ?? 0); if (v === 0) {
        doService('turn_off', {});
    }
    else {
        doService('set_percentage', { percentage: v });
    } }} @click=${(e) => e.stopPropagation()}></ha-control-slider>
        ` : ''}
        ${isOn && presetModes.length > 0 ? renderThemedSelect({
        className: 'sp-select-compact',
        value: presetMode || presetModes[0] || '',
        options: presetModes.map((m) => ({ value: m, label: fanPresetLabel(m, language) })),
        onChange: (v) => doService('set_preset_mode', { preset_mode: v }),
    }) : ''}
        ${isOn && oscillating !== undefined ? b `
        <div class="media-volbtn" role="button" style="width:32px;height:32px;padding:0;flex-shrink:0" title=${t(language, 'fanOscillate')} @click=${(e) => { e.stopPropagation(); doService('oscillate', { oscillating: !oscillating }); }}><ha-icon icon=${oscillating ? 'mdi:rotate-3d-variant' : 'mdi:rotate-360'} style="--mdc-icon-size:14px"></ha-icon></div>` : ''}
        ${isOn && currentDirection !== undefined ? b `
        <div class="media-volbtn" role="button" style="width:32px;height:32px;padding:0;flex-shrink:0" title=${t(language, 'fanDirection')} @click=${(e) => { e.stopPropagation(); doService('set_direction', { direction: currentDirection === 'forward' ? 'reverse' : 'forward' }); }}><ha-icon icon=${currentDirection === 'reverse' ? 'mdi:reload' : 'mdi:swap-vertical'} style="--mdc-icon-size:14px"></ha-icon></div>` : ''}
        ${renderThemedSwitch(isOn, () => doService(isOn ? 'turn_off' : 'turn_on', {}), device.name)}
      </div>
    </button>
  `;
}
const FAN_PRESET_LABELS = {
    auto: 'fanAuto', low: 'fanLow', medium: 'fanMedium', high: 'fanHigh', on: 'fanOn', off: 'fanOff',
};
function fanPresetLabel(mode, language) {
    const key = FAN_PRESET_LABELS[mode];
    return key ? t(language, key) : mode;
}

const MODE_LABELS = {
    normal: 'hvacAuto', eco: 'presetEco', away: 'presetAway', boost: 'presetBoost',
    comfort: 'presetNone', home: 'home', sleep: 'presetSleep', auto: 'hvacAuto', baby: 'presetNone',
};
function modeLabel(mode, language) {
    const key = MODE_LABELS[mode];
    return key ? t(language, key) : mode;
}
function renderHumidifierCard(config, hass, device, language, onHandleAction) {
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, 'humidifier');
    const stateObj = hass.states?.[device.entityId];
    if (!stateObj) {
        return b `<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${deviceStateLabel(device.state, language, hass, 'humidifier')}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
    }
    const a = stateObj.attributes || {};
    const isOn = stateObj.state === 'on';
    const isDehumidifier = a.device_class === 'dehumidifier';
    const targetHumidity = a.target_humidity ?? a.humidity;
    const currentHumidity = a.current_humidity;
    const minH = a.min_humidity ?? 0;
    const maxH = a.max_humidity ?? 100;
    const step = a.target_humidity_step ?? 1;
    const mode = a.mode;
    const modes = a.available_modes || [];
    const action = a.action;
    const statusClass = isOn ? `device-on-${device.color}` : (stateObj.state === 'unavailable' ? 'device-unavailable' : 'device-off');
    const stateLabel = deviceStateLabel(stateObj.state, language, hass, 'humidifier');
    const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;
    const actionLabel = (() => {
        if (!isOn)
            return undefined;
        if (action === 'humidifying')
            return t(language, 'humidifying');
        if (action === 'drying')
            return t(language, 'drying');
        if (action === 'idle' || action === 'off' || !action)
            return isDehumidifier ? t(language, 'drying') : t(language, 'humidifying');
        return undefined;
    })();
    const statusText = isOn && currentHumidity !== undefined ? `${Math.round(currentHumidity)}%` : stateLabel;
    const mutedText = actionLabel || lastTime;
    const doService = (service, data) => {
        void hass.callService('humidifier', service, { entity_id: device.entityId, ...data });
    };
    return b `
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top" @click=${(e) => { e.stopPropagation(); onHandleAction(device.entityId, 'more-info'); }}>
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${statusText}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${mutedText}</p>
      </div>
      <div class="control-row" style="gap:4px" @click=${(e) => e.stopPropagation()}>
        ${isOn && targetHumidity !== undefined ? b `
        <div class="temp-group" style="display:flex;align-items:center;gap:1px;flex-shrink:0">
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e) => { e.stopPropagation(); const next = Math.max(minH, targetHumidity - step); doService('set_humidity', { humidity: next }); }}><ha-icon icon="mdi:minus" style="--mdc-icon-size:14px"></ha-icon></div>
          <span style="font-weight:700;font-size:var(--sp-font-2xs);min-width:24px;text-align:center">${Math.round(targetHumidity)}%</span>
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e) => { e.stopPropagation(); const next = Math.min(maxH, targetHumidity + step); doService('set_humidity', { humidity: next }); }}><ha-icon icon="mdi:plus" style="--mdc-icon-size:14px"></ha-icon></div>
        </div>` : ''}
        ${isOn && modes.length > 0 ? renderThemedSelect({
        className: 'sp-select-compact',
        value: mode || modes[0] || '',
        options: modes.map((m) => ({ value: m, label: modeLabel(m, language) })),
        onChange: (v) => doService('set_mode', { mode: v }),
    }) : ''}
        ${renderThemedSwitch(isOn, () => doService(isOn ? 'turn_off' : 'turn_on', {}), device.name)}
      </div>
    </button>
  `;
}

const VACUUM_STATE_LABELS = {
    cleaning: 'vacuumCleaning',
    docked: 'vacuumDocked',
    returning: 'vacuumReturning',
    paused: 'vacuumPaused',
    idle: 'vacuumIdle',
    error: 'vacuumError',
};
function vacuumStateLabel(state, language) {
    const key = VACUUM_STATE_LABELS[state];
    return key ? t(language, key) : state;
}
function renderVacuumCard(config, hass, device, language, onHandleAction) {
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, 'vacuum');
    const stateObj = hass.states?.[device.entityId];
    if (!stateObj) {
        return b `<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${vacuumStateLabel(device.state, language)}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
    }
    const state = stateObj.state;
    const a = stateObj.attributes || {};
    const fanSpeed = a.fan_speed;
    const fanSpeedList = a.fan_speed_list || [];
    const batteryLevel = a.battery_level;
    const isActive = state === 'cleaning' || state === 'returning';
    const isPaused = state === 'paused';
    const statusClass = isActive ? `device-on-${device.color}` : (state === 'unavailable' ? 'device-unavailable' : 'device-off');
    const statusText = batteryLevel !== undefined ? `${batteryLevel}%` : vacuumStateLabel(state, language);
    const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;
    const mutedText = batteryLevel !== undefined ? vacuumStateLabel(state, language) : (lastTime || device.subtitle);
    const doService = (service) => {
        void hass.callService('vacuum', service, { entity_id: device.entityId });
    };
    const setFanSpeed = (speed) => {
        void hass.callService('vacuum', 'set_fan_speed', { entity_id: device.entityId, fan_speed: speed });
    };
    const btnStyle = 'width:32px;height:32px;padding:0;flex-shrink:0';
    const startBtn = b `<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumStart')} @click=${(e) => { e.stopPropagation(); doService('start'); }}><ha-icon icon="mdi:play" style="--mdc-icon-size:14px"></ha-icon></div>`;
    const pauseBtn = b `<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumPause')} @click=${(e) => { e.stopPropagation(); doService('pause'); }}><ha-icon icon="mdi:pause" style="--mdc-icon-size:14px"></ha-icon></div>`;
    const dockBtn = b `<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumDock')} @click=${(e) => { e.stopPropagation(); doService('return_to_base'); }}><ha-icon icon="mdi:home" style="--mdc-icon-size:14px"></ha-icon></div>`;
    const locateBtn = b `<div class="media-volbtn" role="button" style=${btnStyle} title=${t(language, 'vacuumLocate')} @click=${(e) => { e.stopPropagation(); doService('locate'); }}><ha-icon icon="mdi:map-marker" style="--mdc-icon-size:14px"></ha-icon></div>`;
    return b `
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top" @click=${(e) => { e.stopPropagation(); onHandleAction(device.entityId, 'more-info'); }}>
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${statusText}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${mutedText}</p>
      </div>
      <div class="control-row" style="gap:4px" @click=${(e) => e.stopPropagation()}>
        ${fanSpeedList.length > 0 ? renderThemedSelect({
        className: 'sp-select-compact',
        value: fanSpeed || fanSpeedList[0] || '',
        options: fanSpeedList.map((s) => ({ value: s, label: s })),
        onChange: (v) => setFanSpeed(v),
    }) : ''}
        ${isActive ? pauseBtn : startBtn}
        ${(isActive || isPaused) ? dockBtn : ''}
        ${locateBtn}
        ${renderThemedSwitch(isActive, () => doService(isActive ? 'pause' : 'start'), device.name)}
      </div>
    </button>
  `;
}

const OP_LABELS = {
    auto: 'hvacAuto', eco: 'presetEco', electric: 'presetNone',
    performance: 'presetBoost', 'high demand': 'presetBoost',
    'heat pump': 'presetNone', gas: 'presetNone', off: 'hvacOff',
    'away': 'presetAway',
};
function opLabel(mode, language) {
    const key = OP_LABELS[mode];
    return key ? t(language, key) : mode;
}
function renderWaterHeaterCard(config, hass, device, language, onHandleAction) {
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, 'water_heater');
    const stateObj = hass.states?.[device.entityId];
    if (!stateObj) {
        return b `<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${deviceStateLabel(device.state, language, hass, 'water_heater')}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
    }
    const a = stateObj.attributes || {};
    const isOff = stateObj.state === 'off';
    const currentTemp = a.current_temperature;
    const targetTemp = a.temperature;
    const operationMode = a.operation_mode || stateObj.state;
    const operationList = a.operation_list || [];
    const minT = a.min_temp ?? 43;
    const maxT = a.max_temp ?? 65;
    const step = a.target_temp_step ?? 1;
    const statusClass = stateObj.state === 'unavailable' ? 'device-unavailable' : `device-on-${device.color}`;
    const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;
    const tempDisplay = (v) => v !== undefined ? `${Math.round(v)}°` : '--';
    const doService = (service, data) => {
        void hass.callService('water_heater', service, { entity_id: device.entityId, ...data });
    };
    const adjustTemp = (delta) => {
        const cur = targetTemp ?? minT;
        const next = Math.min(maxT, Math.max(minT, cur + delta));
        if (next !== cur)
            doService('set_temperature', { temperature: next });
    };
    return b `
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status" style="font-size:var(--sp-font-4xs);font-weight:700">${currentTemp !== undefined ? tempDisplay(currentTemp) : deviceStateLabel(stateObj.state, language, hass, 'water_heater')}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" style="gap:2px" @click=${(e) => e.stopPropagation()}>
        <div class="temp-group" style="display:flex;align-items:center;gap:1px;flex-shrink:0">
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e) => { e.stopPropagation(); adjustTemp(-step); }}><ha-icon icon="mdi:minus" style="--mdc-icon-size:14px"></ha-icon></div>
          <span style="font-weight:700;font-size:var(--sp-font-2xs);min-width:22px;text-align:center">${targetTemp !== undefined ? tempDisplay(targetTemp) : '--'}</span>
          <div class="media-volbtn" role="button" style="width:28px;height:32px;padding:0;box-shadow:none" @click=${(e) => { e.stopPropagation(); adjustTemp(step); }}><ha-icon icon="mdi:plus" style="--mdc-icon-size:14px"></ha-icon></div>
        </div>
        ${operationList.length > 1 ? renderThemedSelect({
        className: 'sp-select-compact',
        value: operationMode || operationList[0] || '',
        options: operationList.map((m) => ({ value: m, label: opLabel(m, language) })),
        onChange: (v) => doService('set_operation_mode', { operation_mode: v }),
    }) : ''}
        ${renderThemedSwitch(!isOff, () => doService(isOff ? 'turn_on' : 'turn_off', {}), device.name)}
      </div>
    </button>
  `;
}

async function setAlarmMode(element, hass, entityId, service, isDisarm) {
    const stateObj = hass.states?.[entityId];
    if (!stateObj)
        return;
    const attrs = stateObj.attributes || {};
    const codeFormat = attrs.code_format;
    const codeArmRequired = attrs.code_arm_required !== false;
    const needsCode = isDisarm ? Boolean(codeFormat) : codeArmRequired;
    let code;
    if (needsCode) {
        const helpers = await window.loadCardHelpers();
        const localize = hass.localize;
        const title = localize
            ? localize(`ui.card.alarm_control_panel.${isDisarm ? 'disarm' : 'arm'}`)
            : (isDisarm ? 'Disarm' : 'Arm');
        const response = await helpers.showEnterCodeDialog(element, {
            codeFormat,
            title,
            submitText: title,
        });
        if (response == null)
            return;
        code = response;
    }
    await hass.callService('alarm_control_panel', service, {
        entity_id: entityId,
        code,
    });
}

const ALARM_STATE_LABELS = {
    disarmed: 'alarmDisarmed',
    armed_home: 'alarmArmedHome',
    armed_away: 'alarmArmedAway',
    armed_night: 'alarmArmedNight',
    armed_vacation: 'alarmArmedVacation',
    armed_custom_bypass: 'alarmArmedCustom',
    arming: 'alarmArming',
    pending: 'alarmPending',
    triggered: 'alarmTriggered',
    disarming: 'alarmDisarming',
};
function alarmStateLabel(state, language) {
    const key = ALARM_STATE_LABELS[state];
    return key ? t(language, key) : state;
}
function renderAlarmControlPanelCard(config, hass, device, language, onHandleAction) {
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, alarmAssetDomain());
    const stateObj = hass.states?.[device.entityId];
    if (!stateObj) {
        return b `<button class="device device-off" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">${renderImage(config, assetKey, device.name, 'item-img')}<div class="tag-stack"><div class="status">${alarmStateLabel(device.state, language)}</div></div></div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${device.subtitle}</p></div>
    </button>`;
    }
    const state = stateObj.state;
    const attrs = stateObj.attributes || {};
    const isArmed = state === 'armed_home' || state === 'armed_away' || state === 'armed_night' || state === 'armed_vacation' || state === 'armed_custom_bypass';
    const isTriggered = state === 'triggered';
    const isPending = state === 'pending' || state === 'arming' || state === 'disarming';
    const statusClass = isTriggered ? `device-on-red` : (isArmed ? `device-on-${device.color}` : (isPending ? `device-on-${device.color}` : (state === 'unavailable' ? 'device-unavailable' : 'device-off')));
    const lastTime = stateObj.last_changed ? formatRelativeTime(new Date(stateObj.last_changed), language) : device.subtitle;
    const supportedFeatures = attrs.supported_features || 0;
    const FEATURE_ARM_HOME = 1;
    const FEATURE_ARM_AWAY = 2;
    const FEATURE_ARM_NIGHT = 4;
    const FEATURE_ARM_VACATION = 16;
    const armModes = [
        { feature: FEATURE_ARM_AWAY, icon: 'mdi:shield-lock', service: 'alarm_arm_away', title: t(language, 'alarmArmedAway') },
        { feature: FEATURE_ARM_HOME, icon: 'mdi:shield-home', service: 'alarm_arm_home', title: t(language, 'alarmArmedHome') },
        { feature: FEATURE_ARM_NIGHT, icon: 'mdi:shield-moon', service: 'alarm_arm_night', title: t(language, 'alarmArmedNight') },
        { feature: FEATURE_ARM_VACATION, icon: 'mdi:shield-airplane', service: 'alarm_arm_vacation', title: t(language, 'alarmArmedVacation') },
    ];
    const availableArms = armModes.filter(m => supportedFeatures & m.feature);
    const fallbackArms = availableArms.length > 0 ? availableArms : armModes.slice(0, 2);
    const iconStyle = '--mdc-icon-size:18px;color:var(--sp-text-primary);display:flex;cursor:pointer';
    const armButtons = (!isTriggered && !isPending)
        ? fallbackArms.slice(0, 3).map(m => b `
        <ha-icon icon=${m.icon} style=${iconStyle} title=${m.title} @click=${(e) => { e.stopPropagation(); void setAlarmMode(e.currentTarget, hass, device.entityId, m.service, false); }}></ha-icon>
      `)
        : '';
    const disarmButton = (isArmed || isTriggered)
        ? b `<ha-icon icon="mdi:shield-off" style=${iconStyle} title=${t(language, 'alarmDisarmed')} @click=${(e) => { e.stopPropagation(); void setAlarmMode(e.currentTarget, hass, device.entityId, 'alarm_disarm', true); }}></ha-icon>`
        : '';
    const controlIcons = isPending ? b `<ha-icon icon=${isTriggered ? 'mdi:bell-ring' : (isArmed ? 'mdi:shield-lock' : 'mdi:shield-off')} style="--mdc-icon-size:18px;color:var(--sp-text-primary)"></ha-icon>` : b `${armButtons}${disarmButton}`;
    return b `
    <button class="device ${statusClass}" @click=${() => onHandleAction(device.entityId, 'more-info')}>
      <div class="device-top">
        ${renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack">
          <div class="status">${alarmStateLabel(state, language)}</div>
        </div>
      </div>
      <div class="device-copy">
        <p class="device-name">${device.name}</p>
        <p class="muted">${lastTime}</p>
      </div>
      <div class="control-row" style="justify-content:flex-end;gap:6px" @click=${(e) => e.stopPropagation()}>
        ${controlIcons}
      </div>
    </button>
  `;
}
function alarmAssetDomain(skin) {
    return 'alarm_control_panel';
}

/** Local optimistic percent until HA state catches up. */
const OPTIMISTIC_PCT = new Map();
function displayPct(key, actual) {
    const opt = OPTIMISTIC_PCT.get(key);
    if (opt && Date.now() < opt.expires)
        return opt.value;
    if (opt)
        OPTIMISTIC_PCT.delete(key);
    return Math.max(0, Math.min(100, actual ?? 0));
}
function setOptimistic(key, value) {
    OPTIMISTIC_PCT.set(key, { value, expires: Date.now() + 3000 });
}
/**
 * Themed click-to-set percent bar (AC logic). Uses `.device-pos-track` / `.device-pos-fill`
 * so skins color the fill via `--sp-accent`. Avoids HA blue `ha-control-slider`.
 */
function renderPercentBar(key, actualPct, onSet) {
    const pct = displayPct(key, actualPct);
    const setPct = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const track = e.currentTarget;
        const rect = track.getBoundingClientRect();
        if (rect.width <= 0)
            return;
        const next = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
        setOptimistic(key, next);
        const fill = track.querySelector('.device-pos-fill');
        if (fill)
            fill.style.width = `${next}%`;
        onSet(next);
    };
    return b `
    <div
      class="device-pos-track"
      role="slider"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow=${pct}
      title="${pct}%"
      @click=${setPct}
      @pointerdown=${(e) => e.stopPropagation()}
    >
      <div class="device-pos-fill" style="width:${pct}%"></div>
    </div>
  `;
}
/** Cover/valve position. */
function renderPositionBar(hass, entityId, domain, actualPosition) {
    return renderPercentBar(entityId, actualPosition, (next) => {
        if (domain === 'valve') {
            void hass.callService('valve', 'set_valve_position', { entity_id: entityId, position: next });
        }
        else {
            void hass.callService('cover', 'set_cover_position', { entity_id: entityId, position: next });
        }
    });
}
/** Media player volume on device cards (0–100 UI → 0–1 service). */
function renderVolumeBar(hass, entityId, volumeLevel) {
    const actual = volumeLevel !== undefined ? Math.round(volumeLevel * 100) : undefined;
    return renderPercentBar(`vol:${entityId}`, actual, (next) => {
        void hass.callService('media_player', 'volume_set', {
            entity_id: entityId,
            volume_level: next / 100,
        });
    });
}

const CONTROLLABLE_DOMAINS = new Set([
    'light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock', 'climate',
    'vacuum', 'humidifier', 'water_heater', 'siren', 'automation', 'group', 'input_boolean',
]);
function deviceLastChanged(hass, device, language) {
    const domain = device.entityId.split('.')[0];
    const stateObj = hass.states?.[device.entityId];
    if (domain === 'automation') {
        return stateObj?.attributes?.last_triggered
            ? formatRelativeTime(new Date(stateObj.attributes.last_triggered), language)
            : undefined;
    }
    if (domain === 'scene' || domain === 'script') {
        return stateObj ? (formatSceneOrScriptRelativeTime(stateObj, language) || undefined) : undefined;
    }
    if (stateObj) {
        return formatRelativeTime(new Date(stateObj.last_changed), language);
    }
    return undefined;
}
function renderDeviceCard$1(config, hass, device, language, onHandleAction, showDomain = false, entityRegistry) {
    const isClimate = device.detail === 'climate';
    if (isClimate) {
        return renderClimateCard(config, hass, device, language);
    }
    const isLight = device.detail === 'light';
    if (isLight) {
        return renderLightCard(config, hass, device, language, onHandleAction, entityRegistry);
    }
    if (device.detail === 'fan') {
        return renderFanCard(config, hass, device, language, onHandleAction);
    }
    if (device.detail === 'humidifier') {
        return renderHumidifierCard(config, hass, device, language, onHandleAction);
    }
    if (device.detail === 'vacuum') {
        return renderVacuumCard(config, hass, device, language, onHandleAction);
    }
    if (device.detail === 'water_heater') {
        return renderWaterHeaterCard(config, hass, device, language, onHandleAction);
    }
    if (device.detail === 'alarm_control_panel') {
        return renderAlarmControlPanelCard(config, hass, device, language, onHandleAction);
    }
    const stateLabel = deviceStateLabel(device.state, language, hass, device.detail);
    const active = ['on', 'playing', 'paused', 'cool', 'heat', 'armed', 'locked', 'open'].includes(device.state);
    const statusClass = active ? `device-on-${device.color}` : (device.state === 'unavailable' ? 'device-unavailable' : 'device-off');
    const skin = selectedSkin(config);
    const assetKey = assetKeyForDomain(skin, device.entityId.split('.')[0] || 'sensor');
    const isMedia = device.detail === 'media_player';
    const isCover = device.detail === 'cover';
    const isValve = device.detail === 'valve';
    const stateObj = hass.states?.[device.entityId];
    const attrs = (stateObj?.attributes || {});
    // HA CoverEntityFeature.SET_POSITION / ValveEntityFeature.SET_POSITION = 4
    const rawPos = attrs.current_position;
    const posNum = typeof rawPos === 'number' ? rawPos : (typeof rawPos === 'string' ? Number(rawPos) : NaN);
    const coverPos = Number.isFinite(posNum) ? posNum : undefined;
    const canSetPos = (isCover || isValve) && (coverPos !== undefined || (Number(attrs.supported_features || 0) & 4) !== 0);
    const displayPos = coverPos !== undefined
        ? coverPos
        : (device.state === 'open' || device.state === 'opening' ? 100
            : device.state === 'closed' || device.state === 'closing' ? 0 : 50);
    const action = isMedia
        ? 'play-pause'
        : (canSetPos
            ? 'position'
            : (CONTROLLABLE_DOMAINS.has(device.detail) ? 'toggle' : 'more-info'));
    const mediaState = isMedia ? stateObj : undefined;
    const albumArt = isMedia ? mediaState?.attributes?.entity_picture : undefined;
    const vol = isMedia ? mediaState?.attributes?.volume_level : undefined;
    const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
    const lastTime = deviceLastChanged(hass, device, language);
    let control = A;
    if (action === 'play-pause') {
        control = b `
      ${volPct !== undefined ? renderVolumeBar(hass, device.entityId, vol) : ''}
      <ha-icon icon="mdi:skip-previous" style="--mdc-icon-size:16px;color:var(--sp-text-primary);display:flex;cursor:pointer;opacity:.6" @click=${(e) => { e.stopPropagation(); hass.callService('media_player', 'media_previous_track', { entity_id: device.entityId }); }}></ha-icon>
      <ha-icon icon=${device.state === 'playing' ? 'mdi:pause' : 'mdi:play'} class="media-toggle-icon"></ha-icon>
      <ha-icon icon="mdi:skip-next" style="--mdc-icon-size:16px;color:var(--sp-text-primary);display:flex;cursor:pointer;opacity:.6" @click=${(e) => { e.stopPropagation(); hass.callService('media_player', 'media_next_track', { entity_id: device.entityId }); }}></ha-icon>
    `;
    }
    else if (action === 'position') {
        control = renderPositionBar(hass, device.entityId, isValve ? 'valve' : 'cover', displayPos);
    }
    else if (action === 'toggle') {
        control = renderThemedSwitch(active, () => onHandleAction(device.entityId, action), device.name);
    }
    return b `
    <button class="device ${statusClass}" @click=${action === 'position' ? undefined : () => onHandleAction(device.entityId, action)} style=${action === 'position' ? 'cursor:default' : ''}>
      <div class="device-top">
        ${albumArt ? b `<img class="item-img" src=${albumArt} alt="">` : renderImage(config, assetKey, device.name, 'item-img')}
        <div class="tag-stack"><div class="status">${stateLabel}</div></div>
      </div>
      <div class="device-copy"><p class="device-name">${device.name}</p><p class="muted">${lastTime || device.subtitle}</p></div>
      <div class="control-row" style=${showDomain ? '' : 'justify-content:flex-end'}>
        ${showDomain ? b `<span class="state-word">${domainLabel(device.detail, language)}</span>` : ''}
        ${control}
      </div>
    </button>
  `;
}

function renderNav(nav, view, language, onNavigate) {
    // Missing `enabled` means on; only explicit false hides the item.
    return b `${(nav || []).filter(item => item.enabled !== false).map((item, index) => {
        const label = localizedText(item.label, item.label_zh, item.label_en, language, STRINGS[language][item.key || 'home'] || item.key || '');
        const target = item.target || item.key || 'home';
        const isActive = target === view || (index === 0 && view === 'home' && target === 'home');
        return b `
      <button class="nav-button${isActive ? ' active' : ''}" @click=${() => onNavigate(target)}>
        <ha-icon icon=${item.icon || 'mdi:circle'}></ha-icon><span>${label}</span>
      </button>
    `;
    })}`;
}

const PRE_MUTE_VOLUMES = new WeakMap();
const MUSIC_SOURCE_ENTITY = 'input_select.living_room_music_source';
function renderMediaPlayer(hass, entityId, translate) {
    if (!entityId)
        return A;
    const stateObj = hass.states?.[entityId];
    if (!stateObj)
        return A;
    const state = stateObj.state;
    const attrs = stateObj.attributes || {};
    const title = attrs.media_title || attrs.friendly_name || entityId;
    const artist = attrs.media_artist;
    const albumArt = attrs.entity_picture;
    const source = attrs.app_name || attrs.source || state;
    const isPlaying = state === 'playing';
    const sourceObj = hass.states?.[MUSIC_SOURCE_ENTITY];
    const selectedPlaylist = String(sourceObj?.state || '');
    const playlistOptions = sourceObj?.attributes?.options || [];
    const playPlaylist = (playlist = selectedPlaylist) => {
        if (!playlist)
            return;
        hass.callService('music_assistant', 'play_media', {
            entity_id: entityId,
            media_id: playlist,
            media_type: 'playlist',
            enqueue: 'replace',
        });
    };
    const selectPlaylist = (playlist) => {
        if (!playlist)
            return;
        hass.callService('input_select', 'select_option', {
            entity_id: MUSIC_SOURCE_ENTITY,
            option: playlist,
        });
        playPlaylist(playlist);
    };
    const playlistIndex = Math.max(0, playlistOptions.indexOf(selectedPlaylist));
    const currentPlaylist = playlistOptions[playlistIndex] || selectedPlaylist || playlistOptions[0] || '';
    const stepPlaylist = (delta) => {
        if (!playlistOptions.length)
            return;
        const nextIndex = (playlistIndex + delta + playlistOptions.length) % playlistOptions.length;
        const next = playlistOptions[nextIndex];
        if (next)
            selectPlaylist(next);
    };
    const vol = attrs.volume_level;
    const volZero = vol !== undefined && vol === 0;
    const volPct = vol !== undefined ? Math.round(vol * 100) : undefined;
    const handleVolTrack = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: pct });
    };
    const handleMute = () => {
        if (vol !== undefined) {
            if (vol > 0) {
                PRE_MUTE_VOLUMES.set(stateObj, vol);
                hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: 0 });
            }
            else {
                const restored = PRE_MUTE_VOLUMES.get(stateObj) ?? 0.3;
                hass.callService('media_player', 'volume_set', { entity_id: entityId, volume_level: restored });
            }
        }
    };
    return b `
    <section class="glass-card panel-media">
      <div class="section-title">
        <h2>${translate('mediaPlayer')}</h2>
        ${playlistOptions.length ? b `
          <div class="media-playlist" role="group" aria-label=${translate('mediaPlayer')}>
            <button
              type="button"
              class="media-playlist-nav media-playlist-prev"
              title=${translate('previous')}
              aria-label=${translate('previous')}
              @click=${(e) => { e.stopPropagation(); stepPlaylist(-1); }}
            ><ha-icon icon="mdi:skip-previous"></ha-icon></button>
            <span class="media-playlist-label" title=${currentPlaylist}>${currentPlaylist}</span>
            <button
              type="button"
              class="media-playlist-nav media-playlist-next"
              title=${translate('next')}
              aria-label=${translate('next')}
              @click=${(e) => { e.stopPropagation(); stepPlaylist(1); }}
            ><ha-icon icon="mdi:skip-next"></ha-icon></button>
          </div>
        ` : ''}
      </div>
      <div class="media-content">
        <div class="media-row">
          ${albumArt ? b `<div class="media-cover"><img alt="" src=${albumArt}></div>` : b `<div class="media-cover media-cover-null"><ha-icon icon="mdi:music"></ha-icon></div>`}
          <div class="media-body">
            <div class="media-title">${title}</div>
            ${artist ? b `<div class="media-artist">${artist}</div>` : ''}
            ${source ? b `<div class="media-source">${source}</div>` : ''}
          </div>
          <div class="media-actions">
            <button class="media-btn" @click=${() => hass.callService('media_player', 'media_previous_track', { entity_id: entityId })} title=${translate('previous')}><ha-icon icon="mdi:skip-previous"></ha-icon></button>
            <button class="media-btn media-playbtn" @click=${() => isPlaying ? hass.callService('media_player', 'media_pause', { entity_id: entityId }) : playPlaylist()} title=${isPlaying ? translate('pause') : translate('play')}><ha-icon icon=${isPlaying ? 'mdi:pause-circle' : 'mdi:play-circle'}></ha-icon></button>
            <button class="media-btn" @click=${() => hass.callService('media_player', 'media_next_track', { entity_id: entityId })} title=${translate('next')}><ha-icon icon="mdi:skip-next"></ha-icon></button>
          </div>
        </div>
        ${volPct !== undefined ? b `
        <div class="media-row media-volrow">
          <button class="media-volbtn" @click=${handleMute}><ha-icon icon=${volZero ? 'mdi:volume-off' : 'mdi:volume-high'}></ha-icon></button>
          <div class="media-voltrack" @click=${handleVolTrack}><div class="media-volfill" style="width:${volPct}%"></div></div>
        </div>` : ''}
      </div>
    </section>
  `;
}

function renderMaintenanceCard(hass, translate) {
    const items = getMaintenanceItems(hass);
    if (items.length === 0)
        return A;
    return b `
    <section class="glass-card maintenance-card">
      <div class="maintenance-block">
        <div class="section-title maintenance-title"><h2>${translate('maintenance')}</h2></div>
        <div class="maintenance-list">
          ${items.slice(0, 5).map((item) => b `
            <div class="maintenance-item">
              <span class="maintenance-dot ${item.level}"></span>
              <span class="maintenance-name">${item.name}</span>
              <span class="maintenance-value">${String(item.battery)}%</span>
            </div>
          `)}
        </div>
      </div>
    </section>
  `;
}

function renderWeather(config, hass, weatherIconName, forecast, onMoreInfo) {
    const entityId = config.weather?.entity || '';
    const condition = getWeatherDisplayText(hass, entityId);
    const temp = getWeatherTemperature(hass, entityId);
    if (!entityId)
        return b ``;
    const allForecast = forecast || [];
    const forecastSlice = allForecast.slice(0, 5);
    const today = allForecast[0];
    const locale = hass.locale?.language || hass.language || 'en';
    const weekdayFmt = { weekday: 'short' };
    const todayHigh = today?.temperature != null ? `${Math.round(Number(today.temperature))}°` : '';
    const todayLow = today?.templow != null ? `${Math.round(Number(today.templow))}°` : '';
    const todayPrecip = today?.precipitation != null ? `${Math.round(Number(today.precipitation))}mm` : '';
    return b `
    <div class="weather-block" @click=${() => onMoreInfo(entityId)}>
      <div class="weather-current">
        <div class="weather-state-icon"><ha-icon icon="${weatherIconName}"></ha-icon></div>
        <div class="weather-current-info">
          <div class="weather-current-temp">${temp || '--'}${todayHigh && todayLow ? b ` <span class="weather-current-hl">${todayHigh}/${todayLow}</span>` : ''}</div>
          <div class="weather-current-cond">${condition}${todayPrecip ? b ` · ${todayPrecip}` : ''}</div>
        </div>
      </div>
      ${forecastSlice.length > 0 ? b `
        <div class="weather-forecast">
          ${forecastSlice.map((day) => {
        const dt = day.datetime ? new Date(day.datetime) : null;
        const dayLabel = dt ? dt.toLocaleDateString(locale, weekdayFmt) : '';
        const high = day.temperature != null ? `${Math.round(Number(day.temperature))}°` : '--';
        const low = day.templow != null ? `${Math.round(Number(day.templow))}°` : '';
        return b `
              <div class="forecast-day">
                <div class="forecast-weekday">${dayLabel}</div>
                <div class="forecast-icon"><ha-icon icon="${weatherIcon(day.condition || '')}"></ha-icon></div>
                <div class="forecast-temps"><span class="forecast-high">${high}</span><span class="forecast-low">${low}</span></div>
              </div>
            `;
    })}
        </div>
      ` : A}
    </div>
  `;
}

const ORPHAN_AREA_ID$1 = '__others__';
/**
 * Home environment list — click **room/area** chips to switch.
 * Chip order + sensors within a room follow editor `home_selection.environment` ↑↓
 * (first sensor that belongs to a room decides that room's tab position).
 */
function renderEnvironment(ctx) {
    const { config, hass, areas, entityRegistry, deviceRegistry, language, selectedEnvFloor: selectedEnvArea, setSelectedEnvFloor: setSelectedEnvArea, } = ctx;
    const selectedMetrics = config.home_selection?.environment || [];
    const configuredMetrics = config.environment || [];
    const limit = config.home_limits?.environment || 12;
    const allMetrics = (selectedMetrics.length > 0
        ? selectedMetrics.map((entityId) => metricFromEntity(hass, entityId, configuredMetrics))
        : configuredMetrics);
    const grouped = groupMetricsByArea(allMetrics, areas, entityRegistry, deviceRegistry);
    if (!grouped) {
        return allMetrics.slice(0, limit).map((metric) => renderEnvRow(hass, metric, language));
    }
    const { byArea, occupiedAreas, orphanMetrics } = grouped;
    const tabs = occupiedAreas.map((a) => ({
        id: a.area_id,
        name: a.name,
    }));
    if (orphanMetrics.length > 0) {
        tabs.push({ id: ORPHAN_AREA_ID$1, name: t(language, 'groupOthers') });
    }
    if (tabs.length <= 1) {
        const only = tabs[0]
            ? (tabs[0].id === ORPHAN_AREA_ID$1 ? orphanMetrics : (byArea.get(tabs[0].id) || []))
            : allMetrics;
        return only.slice(0, limit).map((metric) => renderEnvRow(hass, metric, language));
    }
    const activeId = tabs.some((tab) => tab.id === selectedEnvArea)
        ? selectedEnvArea
        : tabs[0].id;
    const activeMetrics = activeId === ORPHAN_AREA_ID$1
        ? orphanMetrics
        : (byArea.get(activeId) || []);
    return [
        b `
      <div class="env-floor-tabs" role="tablist">
        ${tabs.map((tab) => b `
          <button
            type="button"
            class="chip${tab.id === activeId ? ' active' : ''}"
            role="tab"
            aria-selected=${tab.id === activeId ? 'true' : 'false'}
            @click=${() => setSelectedEnvArea(tab.id)}
          >${tab.name}</button>
        `)}
      </div>
    `,
        ...activeMetrics.slice(0, limit).map((metric) => renderEnvRow(hass, metric, language)),
    ];
}
function metricFromEntity(hass, entityId, configuredMetrics) {
    const configured = configuredMetrics.find((metric) => metric.entity === entityId);
    if (configured)
        return configured;
    const state = hass.states[entityId];
    const deviceClass = String(state?.attributes?.device_class || '').toLowerCase();
    const label = String(state?.attributes?.friendly_name || entityId);
    const unit = String(state?.attributes?.unit_of_measurement || '');
    const variant = deviceClass === 'temperature' ? 'temp' : (deviceClass === 'humidity' ? 'hum' : 'pm');
    const icon = variant === 'temp' ? 'mdi:thermometer' : (variant === 'hum' ? 'mdi:water-percent' : 'mdi:leaf');
    return { entity: entityId, label, unit, variant, icon };
}
function groupMetricsByArea(metrics, areas, entityRegistry, deviceRegistry) {
    if (!areas || areas.length < 1 || !entityRegistry)
        return null;
    const areaById = new Map(areas.map((a) => [a.area_id, a]));
    const entityAreaLookup = new Map();
    for (const entry of entityRegistry) {
        if (entry.hidden_by || entry.disabled_by)
            continue;
        const directAreaId = entry.area_id || undefined;
        const areaId = directAreaId || deviceRegistry?.find((d) => d.id === entry.device_id)?.area_id || undefined;
        if (areaId && areaById.has(areaId)) {
            entityAreaLookup.set(entry.entity_id, areaId);
        }
    }
    const byArea = new Map();
    const orphanMetrics = [];
    const areaOrder = [];
    for (const metric of metrics) {
        const areaId = entityAreaLookup.get(metric.entity);
        if (areaId) {
            const list = byArea.get(areaId) || [];
            if (list.length === 0)
                areaOrder.push(areaId);
            list.push(metric);
            byArea.set(areaId, list);
        }
        else {
            orphanMetrics.push(metric);
        }
    }
    // Tab order = first appearance in editor selection, not area-name alphabet.
    const occupiedAreas = areaOrder
        .map((id) => areaById.get(id))
        .filter((area) => Boolean(area));
    if (occupiedAreas.length === 0 && orphanMetrics.length === 0)
        return null;
    return { byArea, occupiedAreas, orphanMetrics };
}
function renderEnvRow(hass, metric, language) {
    return b `
    <div class="env-row">
      <div class="dot ${metric.variant || 'temp'}"><ha-icon icon=${metric.icon || 'mdi:circle'}></ha-icon></div>
      <div class="muted">${hass.states[metric.entity]?.attributes?.friendly_name || metric.label || metric.entity}</div>
      <div class="env-value">${stateValue(hass, metric.entity, language) || '--'}${metric.unit || ''}</div>
    </div>
  `;
}

/** Energy sparkline slot count — matches 30‑day cards across all skins. */
const ENERGY_BAR_SLOTS = 30;
/** Right-align values into a fixed slot count so sparse series don't stretch into thick bars. */
function padEnergyBarValues(values, slots = ENERGY_BAR_SLOTS) {
    if (values.length >= slots)
        return values.slice(-slots);
    if (values.length === 0)
        return Array.from({ length: slots }, () => 0);
    return [...Array.from({ length: slots - values.length }, () => 0), ...values];
}
function renderBars(values) {
    const series = padEnergyBarValues(values);
    const max = Math.max(...series, 0.1);
    return b `${series.map((value) => {
        const level = value <= 0 ? 0 : Math.max(1, Math.min(10, Math.round((value / max) * 10)));
        return b `<span class="energy-bar energy-bar-level-${level}" title=${String(value)}></span>`;
    })}`;
}

function renderPageShell(title, subtitle, controls, body) {
    return b `
    <div class="page-shell">
      <div class="page-header">
        <div>
          <h1>${title}</h1>
          <p class="quote">${subtitle}</p>
        </div>
        <div class="page-controls">${controls}</div>
      </div>
      <div class="page-body">${body}</div>
    </div>
  `;
}

function renderEnergyTotalCard(ctx, sources) {
    const forTotal = sources.some((s) => s.isDevice)
        ? sources.filter((s) => s.isDevice)
        : sources;
    if (forTotal.length < 1)
        return A;
    let todaySum = 0;
    let weekSum = 0;
    let weekCount = 0;
    let monthSum = 0;
    let monthCount = 0;
    for (const src of forTotal) {
        const t = parseFloat(src.today);
        if (Number.isFinite(t))
            todaySum += t;
        const w = parseFloat(src.weekToDate ?? '');
        if (Number.isFinite(w)) {
            weekSum += w;
            weekCount++;
        }
        const m = parseFloat(src.monthToDate ?? '');
        if (Number.isFinite(m)) {
            monthSum += m;
            monthCount++;
        }
    }
    const unit = forTotal[0]?.unit || 'kWh';
    const weekToDate = weekCount > 0 ? weekSum.toFixed(1) : ctx.energyWeekToDate;
    const monthToDate = monthCount > 0 ? monthSum.toFixed(1) : ctx.energyMonthToDate;
    const combined = [];
    for (const src of forTotal) {
        for (let i = 0; i < src.history.length; i++) {
            combined[i] = (combined[i] || 0) + (src.history[i] || 0);
        }
    }
    return b `
    <section class="glass-card panel-energy page-energy-card energy-total-card">
      <div class="section-title"><h2><ha-icon icon="mdi:chart-areaspline"></ha-icon> ${ctx.translate('totalEnergy')}</h2></div>
      <div class="env-list compact-energy-list">
        <div class="env-row">
          <div class="dot temp"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div>
          <div class="muted">${ctx.translate('todayEnergy')}</div>
          <div class="env-value">${todaySum.toFixed(1)} ${unit}</div>
        </div>
        ${weekToDate !== undefined ? b `
          <div class="env-row">
            <div class="dot hum"><ha-icon icon="mdi:calendar-week"></ha-icon></div>
            <div class="muted">${ctx.translate('weekToDate')}</div>
            <div class="env-value">${weekToDate} ${unit}</div>
          </div>
        ` : A}
        ${monthToDate !== undefined ? b `
          <div class="env-row">
            <div class="dot temp"><ha-icon icon="mdi:calendar-month"></ha-icon></div>
            <div class="muted">${ctx.translate('monthToDate')}</div>
            <div class="env-value">${monthToDate} ${unit}</div>
          </div>
        ` : A}
      </div>
      <div class="bars compact-energy-bars">${renderBars(combined)}</div>
    </section>
  `;
}
function renderDeviceCard(ctx, src, groupTitle) {
    const srcLabel = src.label || ctx.translate(src.key);
    // Section header already shows floor·room — don't repeat on every card.
    const fullLocation = src.locationLabel || [src.floorName, src.areaName].filter(Boolean).join(' · ');
    const location = fullLocation && fullLocation !== groupTitle ? fullLocation : '';
    return b `
    <section class="glass-card panel-energy page-energy-card compact-energy-card">
      <div class="section-title energy-card-head">
        <h2><ha-icon icon="${src.icon}"></ha-icon> ${srcLabel}</h2>
        ${location ? b `<span class="muted energy-location">${location}</span>` : A}
      </div>
      <div class="env-list compact-energy-list">
        <div class="env-row"><div class="dot temp"><ha-icon icon="mdi:lightning-bolt"></ha-icon></div><div class="muted">${ctx.translate('todayEnergy')}</div><div class="env-value">${src.today} ${src.unit}</div></div>
        <div class="env-row"><div class="dot hum"><ha-icon icon="mdi:calendar-week"></ha-icon></div><div class="muted">${ctx.translate('weekToDate')}</div><div class="env-value">${src.weekToDate ?? '--'} ${src.unit}</div></div>
        <div class="env-row"><div class="dot temp"><ha-icon icon="mdi:calendar-month"></ha-icon></div><div class="muted">${ctx.translate('monthToDate')}</div><div class="env-value">${src.monthToDate ?? '--'} ${src.unit}</div></div>
      </div>
      <div class="bars compact-energy-bars">${renderBars(src.history)}</div>
    </section>
  `;
}
/** Group by「楼层 · 房间」so headers carry location; cards stay clean. */
function groupSourcesByLocation(sources) {
    const map = new Map();
    for (const src of sources) {
        const title = [src.floorName, src.areaName].filter(Boolean).join(' · ')
            || src.floorName
            || src.areaName
            || '';
        if (!map.has(title))
            map.set(title, []);
        map.get(title).push(src);
    }
    const keys = [...map.keys()].sort((a, b) => {
        if (!a)
            return 1;
        if (!b)
            return -1;
        return a.localeCompare(b, 'zh-CN');
    });
    return keys.map((title) => {
        const items = map.get(title) || [];
        items.sort((a, b) => {
            // Devices first, then meters/grid
            if (!!a.isDevice !== !!b.isDevice)
                return a.isDevice ? -1 : 1;
            return (a.label || a.entityId).localeCompare(b.label || b.entityId, 'zh-CN');
        });
        return { title, items };
    });
}
function renderEnergyView(ctx, energyValue, _energyUnit, compareValue) {
    const sources = ctx.energySources.length > 0 ? ctx.energySources : (energyValue !== '--' ? [{
            key: 'todayEnergy',
            entityId: ctx.config.energy?.entity || '',
            icon: 'mdi:lightning-bolt',
            unit: ctx.config.energy?.unit || 'kWh',
            history: ctx.energyHistory || [],
            yesterday: compareValue || undefined,
            today: energyValue,
        }] : []);
    const groups = groupSourcesByLocation(sources);
    return renderPageShell(ctx.translate('energy'), ctx.translate('todayEnergy'), b ``, b `
      <div class="page-body single-column energy-detail-page">
        ${renderEnergyTotalCard(ctx, sources)}
        ${groups.map((group) => b `
          ${group.title ? b `<div class="section-title energy-floor-title"><h2>${group.title}</h2></div>` : A}
          ${group.items.map((src) => renderDeviceCard(ctx, src, group.title))}
        `)}
        ${renderMaintenanceCard(ctx.hass, ctx.translate)}
      </div>
    `);
}
function renderHomeEnergyCard(ctx, energyValue, energyUnit, compareValue, energyBars) {
    const energyEntity = String(ctx.config.energy?.entity || '').trim();
    if (!energyEntity)
        return A;
    if (energyValue === '--' && !ctx.hass?.states?.[energyEntity])
        return A;
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    if (isPortrait && energyValue === '--')
        return A;
    return b `
    <section class="glass-card panel-energy" style="height:auto;min-height:0;flex:0 0 auto;align-self:auto;">
      <div class="section-title"><h2>${ctx.translate('todayEnergy')}</h2></div>
      <div class="energy-value">${energyValue}<small> ${energyUnit}</small></div>
      <div class="bars" style="height:clamp(32px,7vw,72px);margin-top:clamp(4px,1.2vw,12px);">${energyBars}</div>
      <div class="energy-footer"><span class="muted">${localizedText(ctx.config.energy?.compare_text, ctx.config.energy?.compare_text_zh, ctx.config.energy?.compare_text_en, ctx.language, ctx.translate('compareYesterday'))}</span><span class="down">${compareValue ? `${compareValue} ${energyUnit}` : '--'}</span></div>
    </section>
  `;
}

function renderRoomsView(ctx) {
    const floors = ctx.floors || [];
    const showFloorTabs = floors.length > 1;
    const selectedFloorRooms = showFloorTabs && ctx.selectedFloor
        ? (ctx.areas || []).filter((a) => a.floor_id === ctx.selectedFloor)
        : (ctx.areas || []);
    const roomsMarkup = renderAreaRooms(ctx, selectedFloorRooms, true, undefined, [], false);
    const roomCount = selectedFloorRooms.length || 0;
    const roomPageClass = roomCount > 8 ? 'rooms-page rooms-page-dense' : (roomCount > 4 ? 'rooms-page rooms-page-medium' : 'rooms-page');
    const floorTabs = showFloorTabs ? b `
    <div class="filter-bar floor-tabs">
      <button class="chip${ctx.selectedFloor === '' ? ' active' : ''}" @click=${() => ctx.setSelectedFloor('')}>${ctx.translate('allFloors')}</button>
      ${floors.map((f) => b `<button class="chip${ctx.selectedFloor === f.floor_id ? ' active' : ''}" @click=${() => ctx.setSelectedFloor(f.floor_id)}>${f.name}</button>`)}
    </div>
  ` : b ``;
    return renderPageShell(ctx.translate('rooms'), ctx.translate('roomSnapshots'), floorTabs, b `
      <div class="rooms-page-wrap">
        ${roomsMarkup !== A
        ? b `<div class="rooms ${roomPageClass}">${roomsMarkup}</div>`
        : b `<div class="empty-state">${t(ctx.language, 'noAreas')}</div>`}
      </div>
    `);
}
function renderAreaRooms(ctx, areasPool, requireRealAreas, limit, selectedRooms = [], showSummary = true) {
    const allAreas = areasPool ?? ctx.areas;
    if (!allAreas || allAreas.length === 0)
        return A;
    const imageKeys = ['room_living', 'room_bedroom', 'room_kitchen', 'room_garden'];
    const filteredAreas = selectedRooms.length > 0
        ? selectedRooms
            .map((item) => {
            if (item.includes('.')) {
                const entry = ctx.entityRegistry?.find((e) => e.entity_id === item);
                if (entry?.area_id)
                    return allAreas?.find((a) => a.area_id === entry.area_id);
                return undefined;
            }
            return allAreas?.find((a) => a.area_id === item) || allAreas?.find((a) => a.name === item);
        })
            .filter((area) => Boolean(area))
        : allAreas;
    const rooms = filteredAreas.slice(0, limit || filteredAreas.length).map((area, index) => ({
        areaId: area.area_id,
        name: area.name,
        image: imageKeys[index % imageKeys.length],
        picture: area.picture,
        summary: areaSummaryById(area.area_id, ctx.hass, ctx.entityRegistry, ctx.deviceRegistry, ctx.language),
        counts: areaCounts(area.area_id, ctx.entityRegistry, ctx.deviceRegistry),
    }));
    if (requireRealAreas && rooms.length === 0)
        return A;
    const useAreaPics = ctx.config.use_area_pictures;
    const openRoom = (roomName) => {
        // Show all rooms on devices, grouped by area; scroll to the tapped room.
        ctx.setFilterRoom('');
        ctx.setDeviceGrouping('area');
        ctx.setFocusDeviceRoom(roomName);
        ctx.onNavigate('devices');
    };
    return b `${rooms.map((room) => {
        const imgSrc = useAreaPics && room.picture ? room.picture : assetUrl(ctx.config, room.image || 'room_living');
        const roomImg = imgSrc ? b `<img alt=${room.name} src=${imgSrc}>` : A;
        if (showSummary) {
            return b `
        <button type="button" class="room" @click=${() => openRoom(room.name)}>
          ${roomImg}
          <div class="room-label">
            <h3>${room.name}</h3>
            <p class="muted">${room.summary}</p>
          </div>
        </button>
      `;
        }
        const countLabel = t(ctx.language, 'deviceEntityCount', { devices: room.counts.devices, entities: room.counts.entities });
        return b `
      <button type="button" class="room" @click=${() => openRoom(room.name)}>
        ${roomImg}
        <div class="room-label">
          <h3>${room.name}</h3>
          <p class="muted">${room.summary}</p>
          <p class="room-stats">${countLabel}</p>
        </div>
      </button>
    `;
    })}`;
}

function isDefaultRooms(rooms) {
    if (rooms.length !== DEFAULT_ROOMS.length)
        return false;
    return rooms.every((room, index) => {
        const fallback = DEFAULT_ROOMS[index];
        return fallback && room.image === fallback.image && room.info_entity === fallback.info_entity;
    });
}
function getRoomsForRender(configRooms, areas) {
    const configuredRooms = configRooms || [];
    const hasCustomRooms = configuredRooms.length > 0 && !isDefaultRooms(configuredRooms);
    if (hasCustomRooms)
        return configuredRooms;
    if (areas && areas.length > 0) {
        const images = ['room_living', 'room_bedroom', 'room_kitchen', 'room_garden'];
        return areas.map((area, index) => ({
            name: area.name,
            image: images[index % images.length],
        }));
    }
    return configuredRooms;
}
function areaFallbackInfo(room, areas, hass, entityRegistry, deviceRegistry, language) {
    const area = areas?.find((entry) => entry.name === (room.name || room.name_zh || room.name_en));
    if (!area)
        return 'Home Assistant Area';
    return areaSummaryById(area.area_id, hass, entityRegistry, deviceRegistry, language);
}

function renderHomeView(ctx, weatherIconName, quote, energyValue, energyUnit, compareValue) {
    const cameraEntityId = ctx.config.camera?.entity || '';
    const cameraState = cameraEntityId ? ctx.hass.states?.[cameraEntityId] : undefined;
    const hasCamera = Boolean(cameraState);
    const alarmEntityId = Object.keys(ctx.hass.states || {}).find(e => e.startsWith('alarm_control_panel.')) || '';
    const alarmStateObj = alarmEntityId ? ctx.hass.states?.[alarmEntityId] : undefined;
    const alarmState = alarmStateObj?.state || '';
    const alarmIconMap = {
        disarmed: 'mdi:shield-off', armed_home: 'mdi:shield-home', armed_away: 'mdi:shield-lock',
        armed_night: 'mdi:shield-moon', armed_vacation: 'mdi:shield-airplane', triggered: 'mdi:bell-ring',
        pending: 'mdi:shield-sync', arming: 'mdi:shield-sync',
    };
    const alarmIcon = alarmIconMap[alarmState] || 'mdi:shield-lock';
    const cameraCard = hasCamera ? (() => {
        // Display-only: do not open snapshot / more-info on click.
        return b `
      <section class="glass-card panel-camera panel-camera-static">
        <div class="section-title"><h2>${cameraState?.attributes?.friendly_name || cameraEntityId}</h2></div>
        ${renderLiveCameraPreview(ctx.hass, cameraState, 'camera-preview camera-live', 'live', { aspectRatio: null })}
      </section>
    `;
    })() : A;
    const energyBars = renderBars(ctx.energyHistory || []);
    // Cap column width: minmax(...,1fr) stretches a single card across the whole
    // devices row and leaves a huge empty middle (seen on official skins too).
    const homeDevicesStyle = window.matchMedia('(orientation: landscape)').matches
        ? 'display:grid;grid-auto-flow:column;grid-auto-columns:minmax(140px,200px);grid-template-columns:none;justify-content:start;overflow-x:auto;overflow-y:hidden;padding:var(--sp-space-xs);'
        : 'padding:var(--sp-space-xs);';
    return b `
    <div class="stage-grid">
      <div class="welcome-group">
        <section class="welcome" data-section="home">
          <h1>${ctx.config.title || localizedText(undefined, ctx.config.title_zh || skinString(selectedSkin(ctx.config), 'title_zh'), ctx.config.title_en || skinString(selectedSkin(ctx.config), 'title_en'), ctx.language)}</h1>
          <p class="quote">${quote}</p>
        </section>
        <div class="weather-with-meta">
          ${renderWeather(ctx.config, ctx.hass, weatherIconName, ctx.weatherForecast, ctx.onMoreInfo)}
          <div class="welcome-meta" style="flex:1;min-width:0;max-width:min(320px,42%);">
            <section class="time-card" style="width:100%;box-sizing:border-box;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;min-width:0;">
                <span class="time-main">${timeText(ctx.hass, ctx.language)}</span>
                <span class="time-sub" style="font-size:var(--sp-font-sm);white-space:nowrap;">${dateText(ctx.hass, ctx.language)}</span>
                ${alarmEntityId ? b `
                <div class="time-icon" @click=${() => ctx.onHandleAction(alarmEntityId, 'more-info')} style="cursor:pointer;flex-shrink:0;">
                  <ha-icon icon=${alarmIcon}></ha-icon>
                </div>` : A}
              </div>
            </section>
            <section class="glass-card panel-environment" style="width:100%;box-sizing:border-box;margin-top:var(--sp-space-xs,6px);">
              <div class="env-list env-list-inline" style="gap:clamp(2px,0.6vw,6px) clamp(6px,1vw,12px);margin-top:0;">${renderEnvironment(ctx)}</div>
            </section>
          </div>
        </div>
      </div>
      <section class="bottom-stack">
        <section class="bottom-block bottom-devices">
          <div class="section-title"><h2>${ctx.translate('devices')}</h2><p class="muted">${ctx.translate('quickControl')}</p></div>
          <div class="devices" style=${homeDevicesStyle}>${renderShortcutDevices(ctx)}</div>
        </section>
        <section class="bottom-block">
          <div class="section-title"><h2>${ctx.translate('rooms')}</h2><p class="muted">${ctx.translate('roomSnapshots')}</p></div>
          <div class="rooms">${renderHomeRooms(ctx)}</div>
        </section>
      </section>
      <aside class="side">
        ${cameraCard}
        ${renderHomeEnergyCard(ctx, energyValue, energyUnit, compareValue, energyBars)}
        ${renderMediaPlayer(ctx.hass, ctx.config.media_player?.entity, ctx.translate)}
        ${renderMaintenanceCard(ctx.hass, ctx.translate)}
        <section class="glass-card panel-scenes" data-section="scenes">
          <div class="section-title"><h2>${ctx.translate('scenes')}</h2><p class="muted">${ctx.translate('modes')}</p></div>
          <div class="scene-grid">${renderHomeScenes(ctx)}</div>
        </section>
      </aside>
    </div>
  `;
}
function renderSidebar(ctx) {
    return b `
    <aside class="sidebar">
      <div class="profile" @click=${() => ctx.onToggleKiosk()}>
        ${renderUserAvatar(ctx.config, ctx.hass, 'profile-img')}
        <div class="meta">
          <h2>${ctx.config.profile_name || ctx.hass?.user?.name || ''}</h2>
          <p class="muted">${ctx.config.profile_subtitle || localizedText(undefined, ctx.config.profile_subtitle_zh || skinString(selectedSkin(ctx.config), 'profile_subtitle_zh'), ctx.config.profile_subtitle_en || skinString(selectedSkin(ctx.config), 'profile_subtitle_en'), ctx.language)}</p>
        </div>
      </div>
      <nav class="menu">
        ${renderNav(ctx.config.nav, ctx.view, ctx.language, ctx.onNavigate)}
      </nav>
      <div class="sidebar-art">${renderImage(ctx.config, 'decor', 'Decor', '')}</div>
    </aside>
  `;
}
function renderMobileNav(ctx) {
    return b `<nav class="mobile-nav">${renderNav(ctx.config.nav, ctx.view, ctx.language, ctx.onNavigate)}</nav>`;
}
function renderShortcutDevices(ctx) {
    const limit = ctx.config.home_limits?.devices || 5;
    const selectedEntities = ctx.config.home_selection?.devices || [];
    let realDevices;
    if (selectedEntities.length > 0) {
        const colors = ['yellow', 'green', 'blue', 'purple', 'red', 'brown'];
        realDevices = [];
        for (const entityId of selectedEntities) {
            const stateObj = ctx.hass.states[entityId];
            if (!stateObj)
                continue;
            const domain = entityId.split('.')[0] || '';
            realDevices.push({
                entityId,
                name: String(stateObj.attributes?.friendly_name || entityId),
                subtitle: '',
                detail: domain,
                state: stateObj.state,
                icon: String(stateObj.attributes?.icon || ''),
                color: colors[realDevices.length % colors.length],
            });
        }
    }
    else {
        const allRealDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas);
        realDevices = allRealDevices.slice(0, limit);
    }
    return realDevices.map((device) => renderDeviceCard$1(ctx.config, ctx.hass, device, ctx.language, ctx.onHandleAction, false, ctx.entityRegistry));
}
function renderHomeRooms(ctx) {
    const limit = ctx.config.home_limits?.rooms || 4;
    const selectedRooms = ctx.config.home_selection?.rooms || [];
    const areaRooms = renderAreaRooms(ctx, ctx.areas, false, limit, selectedRooms);
    if (areaRooms !== A)
        return areaRooms;
    const rooms = getRoomsForRender(ctx.config.rooms, ctx.areas);
    if (rooms.length === 0)
        return A;
    return b `${rooms.map((room) => {
        const imageKey = room.image || 'room_living';
        const info = room.info_entity ? stateValue(ctx.hass, room.info_entity, ctx.language) : '';
        const fallbackInfo = ctx.areas?.length ? areaFallbackInfo(room, ctx.areas, ctx.hass, ctx.entityRegistry, ctx.deviceRegistry, ctx.language) : '--';
        const displayName = room.name || '--';
        return b `
      <button class="room" @click=${() => room.target ? ctx.onNavigatePath(room.target) : undefined}>
        ${renderImage(ctx.config, imageKey, displayName, '')}
        <div class="room-label">
          <h3>${displayName}</h3>
          <p class="muted">${info || fallbackInfo || '--'}</p>
        </div>
      </button>
    `;
    })}`;
}
function renderHomeScenes(ctx) {
    const limit = ctx.config.home_limits?.scenes || 6;
    const selectedScenes = ctx.config.home_selection?.scenes || [];
    const scenes = renderRealScenes(ctx, limit, selectedScenes);
    if (scenes !== A)
        return scenes;
    return b `<div class="empty-state compact-empty">${ctx.translate('noScenes')}</div>`;
}
function renderRealScenes(ctx, limit = 12, selectedScenes = []) {
    // Empty selection means show none — do not auto-fill every scene/script.
    const selected = selectedScenes.filter(Boolean);
    if (selected.length === 0)
        return A;
    const scenes = Object.values(ctx.hass.states)
        .filter((entity) => Boolean(isRunnableSceneEntity$1(entity?.entity_id)))
        .filter((entity) => selected.includes(entity.entity_id))
        .slice(0, limit);
    if (scenes.length === 0)
        return A;
    return b `${scenes.map((scene, index) => {
        const tones = ['morning', 'night', 'movie', 'game'];
        const name = String(scene.attributes?.friendly_name || scene.entity_id);
        const lastActivated = formatSceneOrScriptRelativeTime(scene, ctx.language) || undefined;
        return b `
      <button class="scene ${tones[index % tones.length]}" @click=${() => ctx.onRunScene(scene.entity_id)}>
        <strong>${name}</strong>
        ${lastActivated ? b `<p class="muted">${lastActivated}</p>` : A}
      </button>
    `;
    })}`;
}
function isRunnableSceneEntity$1(entityId) {
    return Boolean(entityId?.startsWith('scene.') || entityId?.startsWith('script.'));
}

/** Android Kiosk WebView tile budget — page long device lists (Mac: no paging). */
const ANDROID_KIOSK_DEVICE_PAGE_SIZE = 16;
const hidePressByEntity = new Map();
function hidePressState(entityId) {
    let state = hidePressByEntity.get(entityId);
    if (!state) {
        state = { longPressed: false };
        hidePressByEntity.set(entityId, state);
    }
    return state;
}
function renderDevicesView(ctx) {
    const allDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas);
    const rooms = getDeviceRooms(allDevices);
    const types = getDeviceTypes(allDevices);
    const hiddenSet = new Set(ctx.deviceHidden);
    const filteredDevices = getRealDevicesForRender(ctx.hass, ctx.deviceRegistry, ctx.entityRegistry, ctx.areas, {
        filterRoom: ctx.filterRoom,
        filterType: ctx.filterType,
        hideUnassigned: ctx.hideUnassigned,
    }).filter((d) => ctx.deviceHideEditMode || !hiddenSet.has(d.entityId));
    const pageSize = ctx.androidKiosk ? ANDROID_KIOSK_DEVICE_PAGE_SIZE : 0;
    const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(filteredDevices.length / pageSize)) : 1;
    const pageIndex = Math.min(Math.max(0, ctx.devicePageIndex), totalPages - 1);
    const pagedDevices = pageSize > 0
        ? filteredDevices.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
        : filteredDevices;
    const pager = ctx.androidKiosk && filteredDevices.length > ANDROID_KIOSK_DEVICE_PAGE_SIZE
        ? b `
      <div class="android-device-pager">
        <span>${pageIndex + 1} / ${totalPages}</span>
        <button
          type="button"
          class="android-device-page-button"
          ?disabled=${pageIndex <= 0}
          @click=${() => ctx.setDevicePageIndex(pageIndex - 1)}
          aria-label="prev"
        ><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button
          type="button"
          class="android-device-page-button"
          ?disabled=${pageIndex >= totalPages - 1}
          @click=${() => ctx.setDevicePageIndex(pageIndex + 1)}
          aria-label="next"
        ><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
    `
        : A;
    const hideBtnLabel = ctx.deviceHideEditMode
        ? (ctx.deviceHideSaving ? ctx.translate('editHiddenSaving') : ctx.translate('editHiddenDone'))
        : ctx.translate('editHidden');
    return renderPageShell(ctx.translate('devices'), ctx.translate('quickControl'), ctx.kioskFullscreen ? b `` : b `
      <div class="filter-bar">
        <button class="chip${ctx.deviceGrouping === 'area' ? ' active' : ''}" @click=${() => ctx.setDeviceGrouping('area')}>${ctx.translate('byArea')}</button>
        <button class="chip${ctx.deviceGrouping === 'domain' ? ' active' : ''}" @click=${() => ctx.setDeviceGrouping('domain')}>${ctx.translate('byType')}</button>
        <select class="filter-select" style="min-height:32px" @change=${(e) => ctx.setFilterRoom(e.target.value)}>
          <option value="">${ctx.translate('allRooms')}</option>
          ${rooms.map((r) => b `<option value="${r}" .selected=${r === ctx.filterRoom}>${r}</option>`)}
        </select>
        <select class="filter-select" style="min-height:32px" @change=${(e) => ctx.setFilterType(e.target.value)}>
          <option value="">${ctx.translate('allTypes')}</option>
          ${types.map((t) => b `<option value="${t}" .selected=${t === ctx.filterType}>${domainGroupLabel(t, ctx.language)}</option>`)}
        </select>
        <select class="filter-select" style="min-height:32px" @change=${(e) => ctx.setHideUnassigned(e.target.value === 'true')}>
          <option value="true" .selected=${ctx.hideUnassigned}>${ctx.translate('hideUnassigned')}</option>
          <option value="false" .selected=${!ctx.hideUnassigned}>${ctx.translate('showAll')}</option>
        </select>
        <button class="action-btn" @click=${() => ctx.onBatchControl('on')}>${ctx.translate('turnOnAll')}</button>
        <button class="action-btn" @click=${() => ctx.onBatchControl('off')}>${ctx.translate('turnOffAll')}</button>
        <button
          class="action-btn${ctx.deviceHideEditMode ? ' active' : ''}"
          ?disabled=${ctx.deviceHideSaving}
          @click=${() => ctx.setDeviceHideEditMode(!ctx.deviceHideEditMode)}
        >${hideBtnLabel}</button>
      </div>
      ${ctx.deviceHideEditMode
        ? b `<p class="muted device-hide-hint">${ctx.translate('hideDevicesHint')}</p>`
        : A}
    `, b `
      <div class="page-scroll themed-scrollbar">
        ${pager}
        ${renderRealDeviceGroups(ctx, pagedDevices, hiddenSet)}
      </div>
    `);
}
function renderRealDeviceGroups(ctx, devices, hiddenSet) {
    if (devices.length === 0) {
        return b `<div class="empty-state">${ctx.translate('noDevices')}</div>`;
    }
    const groups = new Map();
    for (const device of devices) {
        const groupKey = ctx.deviceGrouping === 'domain'
            ? deviceTypeGroupKey(device.detail)
            : (device.subtitle || t(ctx.language, 'otherGroup'));
        const current = groups.get(groupKey) || [];
        current.push(device);
        groups.set(groupKey, current);
    }
    return b `${Array.from(groups.entries()).map(([group, items]) => {
        const groupLabel = ctx.deviceGrouping === 'domain'
            ? items.length > 0 ? domainGroupLabel(deviceTypeGroupKey(items[0].detail), ctx.language) : group
            : group;
        return b `
      <section class="device-group" data-device-room=${group}>
        <div class="section-title"><h2>${groupLabel}</h2><p class="muted">${String(items.length)}</p></div>
        <div class="devices devices-page-grid${ctx.deviceHideEditMode ? ' device-hide-edit' : ''}">
          ${items.map((device) => renderDeviceHideWrap(ctx, device, hiddenSet.has(device.entityId)))}
        </div>
      </section>
    `;
    })}`;
}
function renderDeviceHideWrap(ctx, device, isHidden) {
    const card = renderDeviceCard$1(ctx.config, ctx.hass, device, ctx.language, ctx.onHandleAction, true, ctx.entityRegistry);
    if (!ctx.deviceHideEditMode) {
        return card;
    }
    const press = hidePressState(device.entityId);
    const clearPress = () => {
        if (press.timer) {
            window.clearTimeout(press.timer);
            press.timer = undefined;
        }
    };
    return b `
    <div
      class="device-hide-wrap device-hide-edit-target${isHidden ? ' device-card-hidden' : ''}"
      @pointerdown=${(e) => {
        if (e.button !== 0)
            return;
        ctx.bumpDeviceHideIdle();
        press.longPressed = false;
        clearPress();
        if (isHidden)
            return;
        press.timer = window.setTimeout(() => {
            press.longPressed = true;
            ctx.onDeviceHideLongPress(device.entityId);
        }, DEVICE_HIDE_LONG_PRESS_MS);
    }}
      @pointerup=${() => clearPress()}
      @pointerleave=${() => clearPress()}
      @pointercancel=${() => clearPress()}
      @click=${(e) => {
        e.preventDefault();
        e.stopPropagation();
        ctx.bumpDeviceHideIdle();
        if (press.longPressed) {
            press.longPressed = false;
            return;
        }
        if (isHidden)
            ctx.onDeviceHideClick(device.entityId);
    }}
    >
      ${isHidden ? b `<span class="device-hide-badge">${ctx.translate('entityHidden')}</span>` : A}
      ${card}
    </div>
  `;
}

function renderScenesView(ctx) {
    const selected = (ctx.config.scenes_page?.selection || []).filter(Boolean);
    const selectedSet = new Set(selected);
    const scenes = Object.values(ctx.hass.states)
        .filter((entity) => Boolean(isRunnableSceneEntity(entity?.entity_id)))
        .filter((entity) => selectedSet.has(entity.entity_id))
        .sort((left, right) => selected.indexOf(left.entity_id) - selected.indexOf(right.entity_id));
    const grouped = groupScenesByArea(ctx, scenes);
    const visibleGroups = ctx.selectedFloor
        ? grouped.filter((group) => group.id === ORPHAN_AREA_ID || group.area?.floor_id === ctx.selectedFloor)
        : grouped;
    const floors = ctx.floors || [];
    const hasFloorTabs = floors.length > 1;
    const floorTabs = hasFloorTabs ? b `
    <div class="filter-bar floor-tabs">
      <button class="chip${ctx.selectedFloor === '' ? ' active' : ''}" @click=${() => ctx.setSelectedFloor('')}>${ctx.translate('allFloors')}</button>
      ${floors.map((floor) => b `
        <button class="chip${ctx.selectedFloor === floor.floor_id ? ' active' : ''}" @click=${() => ctx.setSelectedFloor(floor.floor_id)}>${floor.name}</button>
      `)}
    </div>
  ` : b ``;
    if (visibleGroups.length === 0) {
        return renderPageShell(ctx.translate('scenes'), ctx.translate('modes'), floorTabs, b `<div class="empty-state">${ctx.translate('noScenes')}</div>`);
    }
    const skin = selectedSkin(ctx.config);
    const renderScene = (scene, index) => {
        const name = String(scene.attributes?.friendly_name || scene.entity_id);
        const lastActivated = formatSceneOrScriptRelativeTime(scene, ctx.language) || t(ctx.language, 'notActivated');
        const assetKey = assetKeyForDomain(skin, scene.entity_id.startsWith('script.') ? 'script' : 'scene');
        const tones = ['green', 'blue', 'purple', 'yellow'];
        const statusClass = `device device-on-${tones[index % tones.length]}`;
        return b `
      <button class="${statusClass}" @click=${() => ctx.onRunScene(scene.entity_id)}>
        <div class="device-top">
          ${renderImage(ctx.config, assetKey, name, 'item-img')}
          <div class="tag-stack"><div class="status">${ctx.translate('scenes')}</div></div>
        </div>
        <div class="device-copy"><p class="device-name">${name}</p><p class="muted">${lastActivated}</p></div>
        <div class="control-row"><span class="state-word">${t(ctx.language, 'run')}</span></div>
      </button>
    `;
    };
    return renderPageShell(ctx.translate('scenes'), ctx.translate('modes'), floorTabs, b `
      <div class="page-scroll themed-scrollbar">
        ${visibleGroups.map((group) => b `
          <section class="scene-area-section">
            <div class="section-title"><h2>${group.name}</h2><p class="muted">${group.floorName || ctx.translate('modes')}</p></div>
            <div class="devices devices-page-grid automations-grid">
              ${group.scenes.map((scene, index) => renderScene(scene, index))}
            </div>
          </section>
        `)}
      </div>
    `);
}
function isRunnableSceneEntity(entityId) {
    return Boolean(entityId?.startsWith('scene.') || entityId?.startsWith('script.'));
}
const ORPHAN_AREA_ID = '__others__';
function groupScenesByArea(ctx, scenes) {
    const areasById = new Map((ctx.areas || []).map((area) => [area.area_id, area]));
    const floorNameById = new Map((ctx.floors || []).map((floor) => [floor.floor_id, floor.name]));
    const groupById = new Map();
    const order = [];
    for (const scene of scenes) {
        const area = areaForEntity(ctx, scene.entity_id, areasById);
        const id = area?.area_id || ORPHAN_AREA_ID;
        if (!groupById.has(id)) {
            order.push(id);
            groupById.set(id, {
                id,
                name: area?.name || ctx.translate('groupOthers'),
                floorName: area?.floor_id ? (floorNameById.get(area.floor_id) || '') : '',
                area,
                scenes: [],
            });
        }
        groupById.get(id).scenes.push(scene);
    }
    return order
        .map((id) => groupById.get(id))
        .filter((group) => Boolean(group));
}
function areaForEntity(ctx, entityId, areasById) {
    const entry = ctx.entityRegistry?.find((item) => item.entity_id === entityId);
    const areaId = entry?.area_id || ctx.deviceRegistry?.find((device) => device.id === entry?.device_id)?.area_id || '';
    return areaId ? areasById.get(areaId) : undefined;
}

function renderAutomationsView(ctx) {
    const automations = renderRealAutomations(ctx);
    return renderPageShell(ctx.translate('automations'), t(ctx.language, 'automationsSubtitle'), b ``, automations !== A
        ? b `<div class="page-scroll themed-scrollbar"><div class="devices devices-page-grid automations-grid">${automations}</div></div>`
        : b `<div class="empty-state">${ctx.translate('noAutomations')}</div>`);
}
function renderRealAutomations(ctx) {
    const automations = Object.values(ctx.hass.states)
        .filter((entity) => Boolean(entity?.entity_id?.startsWith('automation.')));
    if (automations.length === 0)
        return A;
    const skin = selectedSkin(ctx.config);
    const assetKey = assetKeyForDomain(skin, 'automation');
    return b `${automations.map((automation, index) => {
        const stateLabel = deviceStateLabel(automation.state, ctx.language, ctx.hass, 'automation');
        const active = automation.state === 'on';
        const tones = ['green', 'blue', 'purple', 'yellow'];
        const statusClass = active ? `device-on-${tones[index % tones.length]}` : 'device-off';
        const lastTriggered = automation.attributes?.last_triggered
            ? formatRelativeTime(new Date(automation.attributes.last_triggered), ctx.language)
            : t(ctx.language, 'notTriggered');
        const name = String(automation.attributes?.friendly_name || automation.entity_id);
        return b `
      <button class="device ${statusClass}" @click=${() => ctx.onHandleAction(automation.entity_id, 'more-info')}>
        <div class="device-top">
          ${renderImage(ctx.config, assetKey, 'Automation', 'item-img')}
          <div class="tag-stack"><div class="status">${stateLabel}</div></div>
        </div>
        <div class="device-copy"><p class="device-name">${name}</p><p class="muted">${lastTriggered}</p></div>
        <div class="control-row"><span class="state-word">${t(ctx.language, active ? 'enabled' : 'disabled')}</span>${renderThemedSwitch(active, () => ctx.onHandleAction(automation.entity_id, 'toggle'), name)}</div>
      </button>
    `;
    })}`;
}

const SECURITY_TOGGLE_DOMAINS = new Set([
    'light', 'switch', 'fan', 'cover', 'valve', 'media_player', 'lock',
    'input_boolean', 'automation', 'group', 'vacuum', 'humidifier', 'water_heater', 'siren',
]);
/**
 * Map known HA camera entities → go2rtc stream names used by this house.
 * Akuvox / R20K MUST use akuvox_sub only (never HA camera.* live on the same RTSP).
 */
const CAMERA_ENTITY_TO_GO2RTC = {
    'camera.r20k_profile_name_2': { stream: 'akuvox_sub', label: '门禁监控' },
    'camera.r20k_profile_name': { stream: 'akuvox_sub', label: '门禁监控' },
    'camera.akuvox_door_camera': { stream: 'akuvox_sub', label: '门禁监控' },
    'camera.tp_ipc_mainstream': { stream: 'tp_ipc_main', label: '监控' },
    'camera.tp_ipc_minorstream': { stream: 'tp_ipc_main', label: '监控' },
    'camera.yw_substream': { stream: 'yw_sub', label: '客厅监控' },
    'camera.yw_mainstream': { stream: 'yw_sub', label: '客厅监控' },
};
function isDoorStationCamera(entityId) {
    const id = entityId.trim().toLowerCase();
    if (!id.startsWith('camera.'))
        return false;
    if (/r20k|akuvox/.test(id))
        return true;
    return CAMERA_ENTITY_TO_GO2RTC[id]?.stream === 'akuvox_sub';
}
function normalizeMonitorSource(raw) {
    const stream = String(raw.stream || raw.entity || '').trim();
    if (!stream)
        return null;
    const provider = raw.provider
        || (raw.entity || stream.startsWith('camera.') ? 'ha-camera' : 'go2rtc-mjpeg');
    return {
        stream,
        label: raw.label,
        provider: provider,
        entity: raw.entity,
        go2rtc_url: raw.go2rtc_url,
        modes: raw.modes,
    };
}
/** Regular / door camera entity → monitor source. */
function cameraEntityToMonitorSource(entityId, hass, kind) {
    const id = entityId.trim();
    if (!id.startsWith('camera.'))
        return null;
    const friendly = String(hass.states?.[id]?.attributes?.friendly_name || '').trim();
    const mapped = CAMERA_ENTITY_TO_GO2RTC[id];
    if (kind === 'door' || isDoorStationCamera(id)) {
        return {
            stream: mapped?.stream === 'akuvox_sub' || /r20k|akuvox/i.test(id)
                ? 'akuvox_sub'
                : (mapped?.stream || 'akuvox_sub'),
            label: mapped?.label || friendly || '门禁监控',
            provider: 'go2rtc-mjpeg',
            entity: id,
        };
    }
    if (mapped) {
        return {
            stream: mapped.stream,
            label: mapped.label || friendly || mapped.stream,
            provider: 'go2rtc-mjpeg',
            entity: id,
        };
    }
    return {
        stream: id,
        label: friendly || id,
        provider: 'ha-camera',
        entity: id,
    };
}
function configuredDoorCameraId(page) {
    const direct = String(page?.door_camera || '').trim();
    if (direct)
        return direct;
    // Legacy: first door-station cam in selection
    const legacy = (page?.selection || []).find((id) => isDoorStationCamera(id));
    return legacy || '';
}
function configuredCameraIds(page) {
    const cams = (page?.cameras || []).map((id) => id.trim()).filter(Boolean);
    if (cams.length)
        return cams.filter((id) => !isDoorStationCamera(id));
    // Legacy selection without cameras[] — keep non-door only
    return (page?.selection || []).filter((id) => id && !isDoorStationCamera(id));
}
/**
 * Door preview first (if configured), then regular cameras.
 * Empty config → no video cards.
 */
function listSecurityMonitorSources(ctx) {
    const page = ctx.config.security_page;
    const advanced = page?.streams;
    if (Array.isArray(advanced) && advanced.length > 0) {
        return advanced
            .map((s) => normalizeMonitorSource(s))
            .filter((s) => Boolean(s));
    }
    const out = [];
    const seen = new Set();
    const doorCam = configuredDoorCameraId(page);
    if (doorCam) {
        const src = cameraEntityToMonitorSource(doorCam, ctx.hass, 'door');
        if (src && !seen.has(src.stream)) {
            seen.add(src.stream);
            out.push(src);
        }
    }
    for (const entityId of configuredCameraIds(page)) {
        const src = cameraEntityToMonitorSource(entityId, ctx.hass, 'camera');
        if (!src || seen.has(src.stream))
            continue;
        seen.add(src.stream);
        out.push(src);
    }
    return out;
}
function securityCamHideId(source) {
    return source.entity || `go2rtc:${source.stream}`;
}
function renderSecurityCamPreview(ctx, item) {
    if (item.provider === 'ha-camera') {
        const entityId = item.entity || item.stream;
        const state = ctx.hass.states?.[entityId];
        if (state) {
            return renderLiveCameraPreview(ctx.hass, state, 'camera-preview camera-live', 'live', {
                aspectRatio: '16:10',
                fitMode: 'cover',
            });
        }
    }
    return renderGo2rtcLivePreview(item.stream, 'camera-preview camera-live', item.go2rtc_url);
}
function isRegistryHidden(entityId, registry) {
    const entry = registry?.find((item) => item.entity_id === entityId);
    if (!entry)
        return false;
    return Boolean(entry.hidden_by || entry.disabled_by);
}
/** Tablet / voice-assistant screen locks — not door access. */
function isNonDoorLock(entity) {
    if (!entity.entity_id.startsWith('lock.'))
        return false;
    const id = entity.entity_id.toLowerCase();
    const name = String(entity.attributes?.friendly_name || '');
    return (id.includes('suo_ding_ping_mu')
        || id.includes('screen')
        || id.includes('lock_screen')
        || /锁定屏幕|锁屏|screen\s*lock/i.test(name));
}
/** Door/window contacts + doorbell only — drop camera PIR / connectivity noise. */
function isUsefulSecurityBinarySensor(entity) {
    if (!entity.entity_id.startsWith('binary_sensor.'))
        return false;
    const id = entity.entity_id.toLowerCase();
    const name = String(entity.attributes?.friendly_name || '');
    const deviceClass = String(entity.attributes?.device_class || '').toLowerCase();
    const hay = `${id} ${name}`;
    if (/cell_motion|camera_motion|connectivity|监控人体|motion_alarm|人体传感器/.test(hay)) {
        return false;
    }
    if (deviceClass === 'motion' || deviceClass === 'occupancy' || deviceClass === 'connectivity') {
        return false;
    }
    if (['door', 'garage_door', 'window', 'opening'].includes(deviceClass))
        return true;
    if (/ringing|doorbell|门铃/.test(hay))
        return true;
    return false;
}
/** Keep primary door locks / open control; drop RelayB and Lock B duplicates. */
function isUsefulSecurityLock(entity) {
    if (!entity.entity_id.startsWith('lock.'))
        return false;
    if (isNonDoorLock(entity))
        return false;
    const id = entity.entity_id.toLowerCase();
    const name = String(entity.attributes?.friendly_name || '');
    if (/relayb|_lock_b|lock_b$/.test(id))
        return false;
    // Keep Akuvox Lock A (deadbolt status); drop only Lock B.
    if (id === 'lock.akuvox_door_lock' || /akuvox_door_lock(?!_b)/.test(id))
        return true;
    if (/门禁开门/.test(name) || /relaya/.test(id) || /^lock\.r20k_/.test(id))
        return true;
    if (/akuvox|r20k|relay/.test(id))
        return false;
    return true;
}
function isSecurityDoorRelayLock(entityId) {
    return /^lock\..*(relay|relaya|relayb)(_|$)/i.test(entityId) || /^lock\.r20k_/i.test(entityId);
}
function securityDoorRelayStateLabel(state, language) {
    if (state === 'unavailable' || state === 'unknown') {
        return language === 'zh-CN' ? '离线' : 'Offline';
    }
    // R20K/Akuvox relay: locked ≈ pulse/open circuit active in many integrations
    if (state === 'locked')
        return language === 'zh-CN' ? '可开门' : 'Ready';
    if (state === 'unlocked')
        return language === 'zh-CN' ? '已释放' : 'Released';
    return state;
}
function renderSecurityView(ctx) {
    const cards = renderSecurityCards(ctx);
    const editBar = ctx.kioskFullscreen
        ? A
        : b `
      <div
        class="filter-bar security-hide-bar"
        style="justify-content:flex-start;margin-bottom:10px;position:relative;z-index:20;"
      >
        <button
          type="button"
          class="chip security-hide-chip${ctx.securityHideEditMode ? ' active' : ''}"
          ?disabled=${ctx.securityHideSaving}
          @click=${(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (ctx.securityHideSaving)
                return;
            if (ctx.securityHideEditMode)
                ctx.setSecurityHideEditMode(false);
            else
                ctx.setSecurityHideEditMode(true);
        }}
        >${ctx.securityHideEditMode
            ? (ctx.securityHideSaving ? ctx.translate('editHiddenSaving') : ctx.translate('editHiddenDone'))
            : ctx.translate('editHidden')}</button>
        ${ctx.securityHideEditMode
            ? b `<span class="muted" style="font-size:12px;opacity:0.85;">${ctx.translate('hideSecurityHint')}</span>`
            : A}
      </div>
    `;
    return renderPageShell(ctx.translate('security'), ctx.translate('securityOverview'), b ``, cards !== A
        ? b `<div class="page-scroll themed-scrollbar">${editBar}<div class="devices security-grid">${cards}</div></div>`
        : b `<div class="empty-state">${ctx.translate('offline')}</div>`);
}
let lastLockDialogAt = 0;
function onSecurityCardClick(ctx, entityId, event) {
    event?.preventDefault();
    event?.stopPropagation();
    if (ctx.securityHideEditMode) {
        ctx.onToggleSecurityHidden(entityId);
        return;
    }
    if (entityId.startsWith('lock.')) {
        const now = Date.now();
        if (now - lastLockDialogAt < 400)
            return;
        lastLockDialogAt = now;
        ctx.onHandleAction(entityId, 'lock-dialog');
        return;
    }
    ctx.onHandleAction(entityId, 'more-info');
}
function renderSecurityCards(ctx) {
    const hiddenSet = new Set(ctx.securityHidden);
    const monitorSources = listSecurityMonitorSources(ctx);
    const visibleStreams = monitorSources.filter((s) => {
        const hideId = securityCamHideId(s);
        if (ctx.securityHideEditMode)
            return true;
        return !hiddenSet.has(hideId) && !hiddenSet.has(s.stream)
            && !(s.entity && hiddenSet.has(s.entity));
    });
    const doorLockId = String(ctx.config.security_page?.door_lock || '').trim();
    const others = Object.values(ctx.hass.states)
        .filter((entity) => Boolean(entity?.entity_id && /^(lock|alarm_control_panel|binary_sensor)\./.test(entity.entity_id)))
        .filter((entity) => {
        if (isRegistryHidden(entity.entity_id, ctx.entityRegistry))
            return false;
        if (!ctx.securityHideEditMode && hiddenSet.has(entity.entity_id))
            return false;
        if (entity.entity_id.startsWith('binary_sensor.'))
            return isUsefulSecurityBinarySensor(entity);
        if (entity.entity_id.startsWith('lock.')) {
            if (isNonDoorLock(entity))
                return false;
            const id = entity.entity_id.toLowerCase();
            const name = String(entity.attributes?.friendly_name || '');
            const isDoor = isSecurityDoorRelayLock(entity.entity_id)
                || /akuvox|r20k|门禁/.test(`${id} ${name}`);
            // 门禁锁：只显示编辑器选中的 door_lock；未选则不显示。
            if (isDoor)
                return Boolean(doorLockId) && entity.entity_id === doorLockId;
            return isUsefulSecurityLock(entity);
        }
        return true;
    })
        .slice(0, ctx.securityHideEditMode ? 24 : 8);
    if (visibleStreams.length === 0 && others.length === 0)
        return A;
    const skin = selectedSkin(ctx.config);
    const cameraCards = visibleStreams.map((item) => {
        const hideId = securityCamHideId(item);
        const isHidden = hiddenSet.has(hideId) || hiddenSet.has(item.stream)
            || Boolean(item.entity && hiddenSet.has(item.entity));
        const label = item.label || item.stream;
        const onCameraClick = (event) => {
            if (!ctx.securityHideEditMode)
                return;
            event.preventDefault();
            event.stopPropagation();
            ctx.onToggleSecurityHidden(hideId);
        };
        return b `
      <div
        class="camera-card${isHidden ? ' security-card-hidden' : ''}${ctx.securityHideEditMode ? ' camera-card-edit' : ''}"
        style=${isHidden ? 'opacity:0.55;' : A}
        role=${ctx.securityHideEditMode ? 'button' : A}
        @click=${onCameraClick}
      >
        ${renderSecurityCamPreview(ctx, item)}
        <div class="camera-meta camera-meta-overlay">
          <p class="device-name">${label}</p>
          ${ctx.securityHideEditMode ? b `
            <span class="status">${isHidden ? t(ctx.language, 'entityHidden') : t(ctx.language, 'tapToHide')}</span>
          ` : A}
        </div>
      </div>
    `;
    });
    const otherCards = others.map((entity, index) => {
        const domain = entity.entity_id.split('.')[0] || 'sensor';
        const isAlarm = domain === 'alarm_control_panel';
        const isRelayLock = domain === 'lock' && isSecurityDoorRelayLock(entity.entity_id);
        const stateLabel = isAlarm
            ? alarmStateLabel(entity.state, ctx.language)
            : isRelayLock
                ? securityDoorRelayStateLabel(entity.state, ctx.language)
                : deviceStateLabel(entity.state, ctx.language, ctx.hass, domain);
        const assetKey = assetKeyForDomain(skin, domain);
        const tones = ['red', 'green', 'blue', 'purple', 'yellow', 'brown'];
        const statusClass = entity.state === 'unavailable' ? 'device-unavailable' : `device-on-${tones[index % tones.length]}`;
        const togglable = SECURITY_TOGGLE_DOMAINS.has(domain) && !isRelayLock;
        const isHidden = hiddenSet.has(entity.entity_id);
        let control;
        if (ctx.securityHideEditMode) {
            control = b `<div class="control-row" style="justify-content:flex-end"><span class="state-word">${isHidden ? t(ctx.language, 'entityHidden') : t(ctx.language, 'tapToHide')}</span></div>`;
        }
        else if (isRelayLock) {
            control = b `<div class="control-row" style="justify-content:flex-end"><span class="state-word lock-open-hint">${ctx.language === 'zh-CN' ? '点击开门' : 'Tap to open'}</span></div>`;
        }
        else if (isAlarm) {
            const attrs = entity.attributes || {};
            const supportedFeatures = attrs.supported_features || 0;
            const isArmed = /armed_/.test(entity.state);
            const isTriggered = entity.state === 'triggered';
            const isPending = entity.state === 'pending' || entity.state === 'arming' || entity.state === 'disarming';
            const iconStyle = '--mdc-icon-size:18px;color:var(--sp-text-primary);display:flex;cursor:pointer';
            const armModes = [
                { f: 2, i: 'mdi:shield-lock', s: 'alarm_arm_away', k: 'alarmArmedAway' },
                { f: 1, i: 'mdi:shield-home', s: 'alarm_arm_home', k: 'alarmArmedHome' },
                { f: 4, i: 'mdi:shield-moon', s: 'alarm_arm_night', k: 'alarmArmedNight' },
            ].filter(m => supportedFeatures & m.f);
            const fallbackArms = armModes.length > 0 ? armModes : [
                { f: 0, i: 'mdi:shield-lock', s: 'alarm_arm_away', k: 'alarmArmedAway' },
                { f: 0, i: 'mdi:shield-home', s: 'alarm_arm_home', k: 'alarmArmedHome' },
            ];
            const armBtns = isPending
                ? b `<ha-icon icon=${isTriggered ? 'mdi:bell-ring' : 'mdi:shield-lock'} style=${iconStyle}></ha-icon>`
                : b `${fallbackArms.slice(0, 3).map(m => b `<ha-icon icon=${m.i} style=${iconStyle} title=${t(ctx.language, m.k)} @click=${(e) => { e.stopPropagation(); void setAlarmMode(e.currentTarget, ctx.hass, entity.entity_id, m.s, false); }}></ha-icon>`)}`;
            const disarmBtn = (isArmed || isTriggered)
                ? b `<ha-icon icon="mdi:shield-off" style=${iconStyle} title=${t(ctx.language, 'alarmDisarmed')} @click=${(e) => { e.stopPropagation(); void setAlarmMode(e.currentTarget, ctx.hass, entity.entity_id, 'alarm_disarm', true); }}></ha-icon>`
                : '';
            control = b `<div class="control-row" style="justify-content:flex-end;gap:6px" @click=${(e) => e.stopPropagation()}>${armBtns}${disarmBtn}</div>`;
        }
        else if (togglable) {
            control = b `<div class="control-row" style="justify-content:flex-end">${renderThemedSwitch(['on', 'playing', 'open', 'locked'].includes(entity.state), () => ctx.onHandleAction(entity.entity_id, 'toggle'), String(entity.attributes?.friendly_name || entity.entity_id))}</div>`;
        }
        else {
            control = b `<div class="control-row" style="justify-content:flex-end"><span class="state-word">${stateLabel}</span></div>`;
        }
        return b `
      <button
        type="button"
        class="device ${statusClass}${isHidden ? ' security-card-hidden' : ''}${!ctx.securityHideEditMode && domain === 'lock' ? ' security-lock-card' : ''}"
        style=${isHidden ? 'opacity:0.55;' : A}
        @click=${(e) => onSecurityCardClick(ctx, entity.entity_id, e)}
      >
        <div class="device-top">
          ${renderImage(ctx.config, assetKey, String(entity.attributes?.friendly_name || entity.entity_id), 'item-img')}
          <div class="tag-stack"><div class="status">${ctx.securityHideEditMode && isHidden ? t(ctx.language, 'entityHidden') : stateLabel}</div></div>
        </div>
        <div class="device-copy"><p class="device-name">${String(entity.attributes?.friendly_name || entity.entity_id)}</p><p class="muted">${t(ctx.language, 'security')}</p></div>
        ${control}
      </button>
    `;
    });
    return b `
    ${cameraCards.length > 0 ? b `<div class="security-cameras">${cameraCards}</div>` : A}
    ${otherCards.length > 0 ? b `<div class="security-devices">${otherCards}</div>` : A}
  `;
}

/**
 * Shared chrome — LAYOUT LOCK + token-colored widgets.
 *
 * Injected AFTER skin theme.css (see skins-pro-card.ts) with !important so
 * skins cannot invent alternate size/position/fill. Skins only change visual
 * tokens (--sp-accent, --sp-glass-bg, backgrounds, icons).
 */
const SHARED_CHROME_CSS = `
/* ========== LAYOUT LOCK: kiosk / Android edge-to-edge ==========
   Tablet kiosk must fill the real viewport — no --sp-app-padding frame.
   Verified cause of the wood/blank border: .mc-app padding (16px AC default). */
:host([data-kiosk-fullscreen]),
:host([data-android-kiosk="true"]),
:host([data-sp-kiosk]) {
  --sp-app-padding: 0px !important;
  --sp-stage-radius: 0px !important;
}
:host([data-kiosk-fullscreen]) .mc-app,
:host([data-android-kiosk="true"]) .mc-app,
:host([data-sp-kiosk]) .mc-app {
  padding: 0 !important;
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}
:host([data-kiosk-fullscreen]) .sidebar,
:host([data-android-kiosk="true"]) .sidebar,
:host([data-sp-kiosk]) .sidebar,
:host([data-kiosk-fullscreen]) .stage,
:host([data-android-kiosk="true"]) .stage,
:host([data-sp-kiosk]) .stage {
  border-radius: 0 !important;
}
:host([data-kiosk-fullscreen]),
:host([data-android-kiosk="true"]),
:host([data-sp-kiosk]) {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  height: var(--sp-runtime-height, 100vh) !important;
  min-height: var(--sp-runtime-min-height, 100vh) !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}
:host([data-kiosk-fullscreen]) ha-card,
:host([data-android-kiosk="true"]) ha-card,
:host([data-sp-kiosk]) ha-card {
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: hidden !important;
  height: 100% !important;
}

/* ========== LAYOUT LOCK: media playlist ========== */
.media-playlist {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 2px !important;
  flex: 0 0 var(--media-controls-width, 136px) !important;
  width: var(--media-controls-width, 136px) !important;
  min-width: var(--media-controls-width, 136px) !important;
  max-width: var(--media-controls-width, 136px) !important;
  height: 28px !important;
  min-height: 28px !important;
  max-height: 28px !important;
  margin: 0 0 0 auto !important;
  padding: 0 2px !important;
  border: var(--sp-border-width, 0) solid var(--sp-border-chip, var(--sp-border-glass, transparent));
  border-radius: var(--sp-radius-pill, 999px) !important;
  background: var(--sp-device-bg, var(--sp-glass-bg, var(--glass-regular, rgba(255,255,255,.55))));
  box-shadow: var(--sp-shadow-sm, none);
  box-sizing: border-box !important;
  overflow: hidden !important;
}
.glass-card .media-playlist-nav,
.sp-card .media-playlist-nav,
.media-playlist-nav {
  flex: 0 0 28px !important;
  width: 28px !important;
  height: 24px !important;
  min-width: 28px !important;
  min-height: 0 !important;
  max-height: 24px !important;
  border: 0 !important;
  border-radius: 999px !important;
  margin: 0 !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
  color: var(--sp-text-primary, var(--sp-text-main, var(--sp-text-dark, inherit))) !important;
  box-shadow: none !important;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.media-playlist-nav:hover,
.media-playlist-nav:active {
  background: var(--sp-accent-alpha, rgba(0,0,0,.08)) !important;
  color: var(--sp-accent, inherit) !important;
}
.media-playlist-nav ha-icon {
  --mdc-icon-size: 20px;
  width: 20px;
  height: 20px;
  color: inherit;
  pointer-events: none;
}
.media-playlist-label {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  height: 24px !important;
  line-height: 24px !important;
  text-align: center !important;
  padding: 0 4px !important;
  color: var(--sp-text-primary, var(--sp-text-main, var(--sp-text-dark, inherit)));
  font-size: var(--sp-font-3xs, 11px);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
.media-playlist-menu,
.media-playlist-option { display: none !important; }

/* ========== LAYOUT LOCK: home sidebar camera ========== */
.panel-camera.glass-card,
.panel-camera {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  border-radius: var(--sp-radius-glass, var(--sp-radius-lg, 24px)) !important;
  background: #1a1a1a;
  cursor: default !important;
  box-sizing: border-box !important;
}
.panel-camera .section-title {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2 !important;
  margin: 0 !important;
  padding: 10px 14px !important;
  pointer-events: none !important;
  background: linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 100%) !important;
}
.panel-camera .section-title h2 {
  margin: 0 !important;
  padding: 0 !important;
  color: #fff !important;
  text-shadow: 0 1px 4px rgba(0,0,0,.55);
  font-size: var(--sp-font-sm, 13px);
  line-height: 1.2;
}
.panel-camera .camera-preview {
  flex: none !important;
  margin: 0 !important;
  width: 100% !important;
  height: 160px !important;
  min-height: 160px !important;
  max-height: 160px !important;
  aspect-ratio: 16 / 10 !important;
  overflow: hidden !important;
  position: relative !important;
  background: #111 !important;
  border-radius: 0 !important;
  contain: layout size;
}
.side > .panel-camera {
  height: auto !important;
  max-height: none !important;
  overflow: hidden !important;
  align-self: start !important;
}
.panel-camera .camera-preview,
.panel-camera .camera-preview *,
.camera-card .camera-preview,
.camera-card .camera-preview * {
  pointer-events: none !important;
}

/* ========== LAYOUT LOCK: security camera cards ========== */
.mc-app[data-view="security"] .page-shell {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: 0 !important;
  box-shadow: none !important;
}
.security-cameras {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
  gap: var(--sp-space-sm, 10px) !important;
}
.security-devices {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
  gap: var(--sp-space-sm, 10px) !important;
}
.security-grid {
  display: flex !important;
  flex-direction: column !important;
  gap: var(--sp-space-md, 12px) !important;
}
.camera-card {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 0 !important;
  overflow: hidden !important;
  isolation: isolate !important;
  width: 100% !important;
  /* AC baseline: radius on card; do not let skins use aspect-ratio on the card itself */
  aspect-ratio: auto !important;
  border: 0 !important;
  border-radius: var(--sp-radius-lg, var(--sp-radius-camera, var(--sp-stage-radius, 24px))) !important;
  background: #111;
  box-sizing: border-box !important;
  cursor: default;
  text-align: left;
  box-shadow: var(--sp-shadow-card, none);
  /* Prevent backdrop-filter from painting square over rounded corners */
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  mask-image: radial-gradient(white, black);
}
.camera-card.camera-card-edit { cursor: pointer; }
.camera-card .camera-preview {
  position: relative !important;
  flex: 1 1 auto !important;
  margin: 0 !important;
  width: 100% !important;
  min-height: 160px !important;
  max-height: none !important;
  aspect-ratio: 16 / 10 !important;
  height: auto !important;
  overflow: hidden !important;
  background: #111 !important;
  /* Same radius as card — skins must not force 0 (GoW had independent square preview) */
  border-radius: inherit !important;
}
.camera-card .camera-preview,
.camera-card .camera-preview .camera-stream,
.camera-card .camera-preview hui-image,
.camera-card .camera-preview sp-camera-preview,
.camera-card .camera-preview sp-go2rtc-live-preview,
.camera-card .camera-preview sp-go2rtc-video,
.camera-card .camera-preview .sp-go2rtc-slot {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}
.camera-card .camera-preview sp-go2rtc-live-preview,
.camera-card .camera-preview sp-go2rtc-video,
.camera-card .camera-preview .sp-go2rtc-slot,
.camera-card .camera-preview .sp-go2rtc-live,
.camera-card .camera-preview .sp-go2rtc-mjpeg,
.panel-camera .camera-preview sp-camera-preview,
.panel-camera .camera-preview .camera-stream,
.panel-camera .camera-preview hui-image {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border: 0 !important;
  object-fit: cover !important;
}
.camera-card .camera-preview sp-go2rtc-video video,
.camera-card .camera-preview video,
.panel-camera .camera-preview video,
.panel-camera .camera-preview img,
.camera-card .camera-preview img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: inherit !important;
}
.camera-meta-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2 !important;
  margin: 0 !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  pointer-events: none !important;
  background: linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 100%) !important;
}
.camera-meta-overlay .device-name {
  margin: 0 !important;
  color: #fff !important;
  text-shadow: 0 1px 4px rgba(0,0,0,.55);
  font-weight: 700;
  font-size: var(--sp-font-sm, 13px);
}
.camera-meta-overlay .status {
  flex-shrink: 0 !important;
  background: rgba(255,255,255,.22) !important;
  color: #fff !important;
}

/* Cover/valve position bar — LAYOUT LOCK (AC). Skins only color via --sp-accent. */
.device-pos-track {
  flex: 1 1 auto !important;
  min-width: 64px !important;
  height: 10px !important;
  border-radius: 999px !important;
  background: var(--sp-device-bg, var(--sp-switch-bg, rgba(0,0,0,.12))) !important;
  overflow: hidden !important;
  cursor: pointer !important;
  position: relative !important;
  touch-action: manipulation !important;
}
.device-pos-fill {
  height: 100% !important;
  border-radius: inherit !important;
  background: var(--sp-accent, var(--sp-accent-green, #7BC67E)) !important;
  pointer-events: none !important;
  transition: width 0.12s ease-out;
}

/* Light brightness / color_temp — follow skin --sp-accent (GoW gold, not HA primary blue). */
ha-control-slider {
  --control-slider-color: var(--sp-accent, var(--sp-accent-green, #7BC67E)) !important;
  --control-slider-background: var(--sp-device-bg, rgba(128,128,128,.22)) !important;
  --control-slider-background-opacity: 1 !important;
  --control-slider-border-radius: var(--sp-radius-pill, var(--sp-radius-infinite, 999px)) !important;
  border-radius: var(--sp-radius-pill, var(--sp-radius-infinite, 999px)) !important;
  overflow: hidden !important;
}

/* Security card chrome — colors from tokens; structure/radius fixed (AC) */
.mc-app[data-view="security"] .camera-card {
  background: var(--sp-glass-bg, var(--glass-regular, rgba(255,248,230,.62))) !important;
  border: 1px solid var(--sp-border-glass, rgba(255,255,255,.46)) !important;
  color: var(--sp-text-primary, var(--sp-text-stage, var(--sp-text-main, inherit))) !important;
  box-shadow: none !important;
  border-radius: var(--sp-radius-lg, var(--sp-radius-camera, var(--sp-stage-radius, 24px))) !important;
  overflow: hidden !important;
  isolation: isolate !important;
  aspect-ratio: auto !important;
  backdrop-filter: blur(14px) saturate(130%);
  -webkit-backdrop-filter: blur(14px) saturate(130%);
}
.mc-app[data-view="security"] .camera-card .camera-preview {
  border-radius: inherit !important;
}

/* Kiosk home: same side camera height as AC (do not let themes resize) */
:host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-camera .camera-preview {
  flex: none !important;
  height: 160px !important;
  min-height: 160px !important;
  max-height: 160px !important;
  aspect-ratio: 16 / 10 !important;
}

/* ========== LAYOUT LOCK: energy page (AC uses flex on .page-body; force grid) ========== */
.page-body.single-column.energy-detail-page {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: var(--sp-space-lg, 16px) !important;
  align-items: start !important;
  width: 100% !important;
  min-width: 0 !important;
}
.page-body.single-column.energy-detail-page .energy-total-card,
.page-body.single-column.energy-detail-page .energy-floor-title {
  grid-column: 1 / -1 !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  flex: none !important;
}
.energy-card-head {
  flex-wrap: wrap !important;
  gap: 4px 8px !important;
  align-items: baseline !important;
}
.energy-location {
  font-size: var(--sp-font-2xs, 11px) !important;
  opacity: 0.8 !important;
  display: inline !important;
}
.energy-floor-title {
  display: flex !important;
  justify-content: flex-start !important;
  align-items: center !important;
  margin: 8px 0 0 !important;
}
.energy-floor-title h2 {
  font-size: var(--sp-font-md, 15px) !important;
  white-space: nowrap !important;
  writing-mode: horizontal-tb !important;
  overflow: visible !important;
  width: auto !important;
  max-width: 100% !important;
}

/* Energy metric rows: keep「本月累计」on one line (AC cards are narrow in 4-col grid). */
.energy-detail-page .env-row {
  grid-template-columns: 24px max-content minmax(0, 1fr) !important;
  gap: 6px !important;
  align-items: center !important;
}
.energy-detail-page .env-row .muted {
  white-space: nowrap !important;
  width: max-content !important;
  max-width: none !important;
  overflow: visible !important;
  text-overflow: clip !important;
  flex-shrink: 0 !important;
}
.energy-detail-page .env-value {
  white-space: nowrap !important;
  overflow-wrap: normal !important;
  word-break: keep-all !important;
  justify-self: end !important;
  min-width: 0 !important;
}

/* ========== LAYOUT LOCK: home env floor tabs (all skins) ========== */
.env-floor-tabs {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 4px !important;
  width: 100% !important;
  margin: 0 0 4px !important;
}
.env-floor-tabs .chip {
  min-height: 24px !important;
  padding: 0 10px !important;
  font-size: var(--sp-font-2xs, 11px) !important;
  line-height: 1 !important;
}

@media (max-width: 1100px), (orientation: portrait) {
  .page-body.single-column.energy-detail-page {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}

/* ========== Android Kiosk: devices page tile-memory budget ==========
   Old Chromium WebView drops cards with "tile memory limits exceeded"
   when many glass cards use backdrop-filter. Mac is unaffected.
   Keep skin glass tint via CSS vars (AC cream / GoW dark) but NO blur
   (blur × 16 cards blows tile memory). Do not hardcode AC colors. */
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  transition: none !important;
  transform: none !important;
  background: var(--sp-glass-light, var(--sp-card-bg, var(--glass-regular, var(--sp-panel-bg, rgba(255,255,255,0.14))))) !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-glass, var(--sp-border-device, rgba(255,255,255,0.18))) !important;
  color: var(--sp-text-stage, var(--sp-text-main, var(--sp-text-primary, inherit))) !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .device-name,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .muted,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .status,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .state-word,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .count-tag {
  color: var(--sp-text-stage, var(--sp-text-main, var(--sp-text-primary, inherit))) !important;
  text-shadow: none !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .muted {
  color: var(--sp-text-stage-muted, var(--sp-text-muted, var(--sp-text-secondary, inherit))) !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .status,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device .count-tag {
  background: var(--sp-accent-alpha, rgba(255,255,255,0.12)) !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .section-title h2,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .section-title .muted,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .page-header h1,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .page-header .muted {
  color: var(--sp-text-stage, var(--sp-text-main, var(--sp-text-primary, inherit))) !important;
  text-shadow: none !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .page-scroll {
  /* GoW theme still ships contain:strict here — that collapses height to 0 on Android. */
  contain: none !important;
  content-visibility: visible !important;
  overscroll-behavior: contain;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .device-group {
  content-visibility: visible !important;
  contain: none !important;
}
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .item-img,
:host([data-android-kiosk="true"]) .mc-app[data-view="devices"] .item-icon {
  box-shadow: none !important;
  filter: none !important;
  transition: none !important;
}
.android-device-pager {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: var(--sp-space-sm, 8px) !important;
  margin-bottom: var(--sp-space-sm, 8px) !important;
  color: var(--sp-text-muted, var(--sp-text-secondary, inherit));
  font-size: var(--sp-font-sm, 13px);
}
.android-device-page-button {
  display: grid !important;
  place-items: center !important;
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-glass, rgba(0,0,0,.12)) !important;
  border-radius: 50% !important;
  background: var(--sp-glass-light, var(--sp-card-bg, rgba(255,255,255,.7))) !important;
  color: var(--sp-text-main, inherit) !important;
  cursor: pointer;
}
.android-device-page-button ha-icon { --mdc-icon-size: 22px; }
.android-device-page-button:disabled { opacity: 0.35; cursor: default; }

/* Devices page edit-hidden */
.device-hide-hint {
  margin: 0 0 var(--sp-space-sm, 8px) !important;
  font-size: var(--sp-font-sm, 13px);
}
.device-hide-wrap {
  position: relative !important;
  display: block !important;
  min-width: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
}
.device-hide-wrap > .device,
.device-hide-wrap > button.device {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}
.device-hide-wrap.device-hide-edit-target > * {
  pointer-events: none !important;
}
.device-hide-wrap.device-card-hidden {
  opacity: 0.48 !important;
  filter: grayscale(0.25);
}
.device-hide-badge {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  z-index: 2 !important;
  padding: 2px 8px !important;
  border-radius: 999px !important;
  font-size: var(--sp-font-3xs, 11px) !important;
  font-weight: 700 !important;
  color: #fff !important;
  background: rgba(0,0,0,.55) !important;
  pointer-events: none !important;
}
.filter-bar .action-btn.active {
  outline: 2px solid var(--sp-accent, #c4a574);
  outline-offset: 1px;
}
.scene-area-section {
  display: grid;
  gap: var(--sp-space-sm, 10px);
  margin-bottom: var(--sp-space-lg, 18px);
}
.scene-area-section .section-title {
  margin-bottom: 0;
}

/* Themed device-card selects — follow current skin tokens (not OS grey popup) */
.sp-select {
  position: relative !important;
  display: inline-block !important;
  flex-shrink: 0 !important;
  z-index: 3;
}
.sp-select-trigger {
  list-style: none !important;
  min-height: 32px !important;
  min-width: 52px !important;
  max-width: 96px !important;
  padding: 0 18px 0 6px !important;
  border: var(--sp-border-width, 1px) solid var(--sp-border-chip, var(--sp-border-glass, rgba(255,255,255,.35))) !important;
  border-radius: var(--sp-radius-pill, 999px) !important;
  background-color: var(--sp-device-bg, var(--sp-glass-light, var(--glass-regular, rgba(255,255,255,.55)))) !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") !important;
  background-repeat: no-repeat !important;
  background-position: right 6px center !important;
  background-size: 10px !important;
  color: var(--sp-text-main, var(--sp-text-primary, inherit)) !important;
  font: inherit !important;
  font-size: var(--sp-font-3xs, 11px) !important;
  line-height: 32px !important;
  cursor: pointer !important;
  box-sizing: border-box !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  user-select: none !important;
}
.sp-select-trigger::-webkit-details-marker { display: none !important; }
.sp-select-menu {
  /* Real menu is a body portal (see themed-select.ts). Keep stub hidden. */
  display: none !important;
}
.sp-select-compact .sp-select-trigger {
  min-height: 32px !important;
  font-size: var(--sp-font-3xs, 11px) !important;
}
`;

/** HA package r20k_doorbell.yaml — reuse manual lock dialog on pending. */
const DOORBELL_ACTIVE_ENTITY = 'input_boolean.r20k_doorbell_active';
const DOORBELL_LOCK_ENTITY = 'lock.r20k_2c74_relaya';
const DOORBELL_OPEN_SCRIPT = 'script.r20k_open_door';
const DOORBELL_DISMISS_SCRIPT = 'script.r20k_doorbell_dismiss';
const DOORBELL_DIALOG_SEC = 15;
/** Fork LAYOUT LOCK (playlist/camera…) — AFTER skin theme.css so skins cannot invent alternate size/radius. */
const SHARED_CHROME_STYLE = b `<style id="sp-shared-chrome">${SHARED_CHROME_CSS}</style>`;
const KIOSK_HOME_SIDE_STYLE = b `
  <style>
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .stage-grid {
      grid-template-columns: minmax(0, 1fr) clamp(240px, 23vw, 310px);
      grid-template-rows: auto minmax(0, 1fr) auto;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: grid;
      grid-template-rows: minmax(118px, 1.05fr) minmax(112px, 0.95fr) minmax(96px, 0.8fr) minmax(150px, 1.9fr);
      grid-auto-rows: 0;
      gap: var(--sp-space-sm);
      align-content: stretch;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-camera,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-energy,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-media,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .panel-scenes {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      align-self: stretch;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .side > .maintenance-card {
      display: none;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-camera {
      display: flex;
      flex-direction: column;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-camera .camera-preview {
      flex: 1;
      min-height: 0;
      max-height: none;
      aspect-ratio: auto;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-energy .energy-value {
      font-size: var(--sp-font-lg);
      margin-top: 0;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-energy .bars {
      flex: 1;
      min-height: 38px;
      height: auto;
      margin-top: var(--sp-space-xs);
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .section-title,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-scenes .section-title {
      margin-bottom: var(--sp-space-2xs);
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-content {
      flex: 1;
      justify-content: center;
      min-height: 0;
      margin-top: 0;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-cover,
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-cover-null {
      width: 40px;
      height: 40px;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-media .media-playbtn ha-icon {
      --mdc-icon-size: 30px;
    }
    :host([data-sp-kiosk]) .mc-app[data-view="home"] .panel-scenes .scene-grid {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      gap: var(--sp-space-xs);
      margin-top: var(--sp-space-xs);
    }
  </style>
`;
class SkinsProCard extends i {
    constructor() {
        super(...arguments);
        this._view = 'home';
        this._deviceGrouping = 'area';
        this._filterRoom = '';
        this._focusDeviceRoom = '';
        this._filterType = '';
        this._hideUnassigned = true;
        this._selectedFloor = '';
        this._selectedEnvFloor = '';
        this._devicePageIndex = 0;
        this._areasLoaded = false;
        this._areasLoading = false;
        this._entityRegistryLoaded = false;
        this._entityRegistryLoading = false;
        this._deviceRegistryLoaded = false;
        this._deviceRegistryLoading = false;
        this._floorsLoaded = false;
        this._floorsLoading = false;
        this._energyHistoryDone = false;
        this._energyHistoryLoading = false;
        this._energySources = [];
        this._energyPrefsDone = false;
        this._energyPrefsLoading = false;
        /** Security hide: edit mode + draft list (see utils/security-hidden.ts). */
        this._securityHideEditMode = false;
        this._securityHideSaving = false;
        /** Draft while editing; also caches last known list after Done. */
        this._securityHiddenDraft = null;
        /** Devices page hide: edit mode + draft (see utils/devices-hidden.ts). */
        this._deviceHideEditMode = false;
        this._deviceHideSaving = false;
        this._deviceHiddenDraft = null;
        this._autoFullscreenDone = false;
        this._autoFullscreenAttempts = 0;
        /** Avoid reopening the same doorbell session after user closes / timeout. */
        this._doorbellDialogHandled = false;
        /** `input_datetime.r20k_last_doorbell` value for the session we already showed. */
        this._doorbellSessionKey = '';
        this._handleWindowResize = () => this._applyLayout();
        this._unlockAudioOnce = () => {
            unlockDoorbellAudio();
            window.removeEventListener('pointerdown', this._unlockAudioOnce, true);
            window.removeEventListener('touchstart', this._unlockAudioOnce, true);
        };
    }
    _clearDoorbellWarm() {
        if (this._doorbellWarmHost) {
            this._doorbellWarmHost.querySelectorAll('sp-go2rtc-live-preview, sp-go2rtc-video, img').forEach((el) => {
                if (el instanceof HTMLImageElement)
                    el.removeAttribute('src');
                el.remove();
            });
            this._doorbellWarmHost.remove();
            this._doorbellWarmHost = undefined;
        }
    }
    get hass() {
        return this._hass;
    }
    set hass(value) {
        const old = this._hass;
        this._hass = value;
        this._syncDoorbellDialog();
        this.requestUpdate('hass', old);
    }
    /** Doorbell → same lock dialog as manual「门禁开门」(not HA notification text). */
    _syncDoorbellDialog() {
        if (!this._hass || !this._config)
            return;
        const active = this._hass.states?.[DOORBELL_ACTIVE_ENTITY]?.state === 'on';
        const lastDoorbell = String(this._hass.states?.['input_datetime.r20k_last_doorbell']?.state || '');
        const timerOn = this._hass.states?.['timer.r20k_doorbell_wait']?.state === 'active';
        const sessionKey = lastDoorbell || (active ? 'active' : '');
        if (!active) {
            this._doorbellDialogHandled = false;
            if (!timerOn)
                this._doorbellSessionKey = '';
            if (this._doorbellOpenTimer) {
                window.clearTimeout(this._doorbellOpenTimer);
                this._doorbellOpenTimer = undefined;
            }
            this._clearDoorbellWarm();
            return;
        }
        // New doorbell event (timestamp changed) → force a fresh dialog even if
        // the previous session left `_doorbellDialogHandled` stuck true.
        if (sessionKey && sessionKey !== this._doorbellSessionKey) {
            this._doorbellSessionKey = sessionKey;
            this._doorbellDialogHandled = false;
            if (this._doorbellOpenTimer) {
                window.clearTimeout(this._doorbellOpenTimer);
                this._doorbellOpenTimer = undefined;
            }
            this._clearDoorbellWarm();
            if (isLockDialogOpen())
                closeLockDialog();
        }
        if (this._doorbellDialogHandled || isLockDialogOpen() || this._doorbellOpenTimer)
            return;
        const hass = this._hass;
        this._doorbellDialogHandled = true;
        unlockDoorbellAudio();
        console.info('[Skins Pro] doorbell dialog arm (live warm 2s)', { sessionKey, timerOn });
        // Prewarm go2rtc live (WebRTC/MSE) off-screen for ~2s, then open overlay — avoids play glyph.
        void resolveGo2rtcBaseForPreview(hass).then((base) => {
            if (!this._hass || this._hass.states?.[DOORBELL_ACTIVE_ENTITY]?.state !== 'on')
                return;
            this._clearDoorbellWarm();
            const host = document.createElement('div');
            host.dataset.spDoorbellWarm = '1';
            host.style.cssText = 'position:fixed;left:-9999px;top:0;width:480px;height:300px;opacity:0;pointer-events:none;overflow:hidden;';
            const preview = document.createElement('sp-go2rtc-live-preview');
            preview.stream = DOORBELL_PREVIEW_STREAM;
            preview.baseUrl = base;
            host.appendChild(preview);
            document.body.appendChild(host);
            this._doorbellWarmHost = host;
        }).catch(() => undefined);
        this._doorbellOpenTimer = window.setTimeout(() => {
            this._doorbellOpenTimer = undefined;
            if (!this._hass || !this._config) {
                this._doorbellDialogHandled = false;
                this._clearDoorbellWarm();
                return;
            }
            if (this._hass.states?.[DOORBELL_ACTIVE_ENTITY]?.state !== 'on') {
                this._doorbellDialogHandled = false;
                this._clearDoorbellWarm();
                return;
            }
            if (isLockDialogOpen()) {
                this._clearDoorbellWarm();
                return;
            }
            const liveHass = this._hass;
            const liveLang = normalizeLanguage(this._config.language === 'auto' ? liveHass.language : this._config.language);
            console.info('[Skins Pro] doorbell dialog open (live)', { sessionKey });
            try {
                openLockDialog(this, liveHass, DOORBELL_LOCK_ENTITY, liveLang, selectedSkin(this._config), {
                    autoCloseSec: DOORBELL_DIALOG_SEC,
                    title: t(liveLang, 'doorbellTitle'),
                    cancelLabel: t(liveLang, 'doorbellDismiss'),
                    preventScrimClose: true,
                    previewStream: DOORBELL_PREVIEW_STREAM,
                    previewMode: 'live',
                    playSound: true,
                    soundUrl: (this._config.doorbell_sound || DEFAULT_DOORBELL_SOUND_URL).trim(),
                    doorbellHints: true,
                    onOpen: () => {
                        unlockDoorbellAudio();
                    },
                    onUnlock: async () => {
                        await liveHass.callService('script', 'turn_on', { entity_id: DOORBELL_OPEN_SCRIPT });
                    },
                    onCancel: async () => {
                        await liveHass.callService('script', 'turn_on', { entity_id: DOORBELL_DISMISS_SCRIPT });
                    },
                    onTimeout: () => undefined,
                });
            }
            catch (error) {
                this._doorbellDialogHandled = false;
                console.warn('[Skins Pro] doorbell lock dialog failed', error);
            }
            finally {
                // Drop warm player after dialog has its own live consumer (single Akuvox path via go2rtc).
                this._clearDoorbellWarm();
            }
        }, 2000);
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this._handleWindowResize);
        window.addEventListener('pointerdown', this._unlockAudioOnce, true);
        window.addEventListener('touchstart', this._unlockAudioOnce, true);
        if (this._hass && this._config?.weather?.entity && this._weatherForecastEntity !== this._config.weather.entity) {
            void this.loadWeatherForecast();
        }
        this._syncDoorbellDialog();
        if (this._doorbellPollTimer)
            window.clearInterval(this._doorbellPollTimer);
        this._doorbellPollTimer = window.setInterval(() => this._syncDoorbellDialog(), 1500);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this._handleWindowResize);
        window.removeEventListener('pointerdown', this._unlockAudioOnce, true);
        window.removeEventListener('touchstart', this._unlockAudioOnce, true);
        this.clearDeviceHideIdle();
        void this.unsubscribeWeatherForecast();
        if (this._doorbellPollTimer) {
            window.clearInterval(this._doorbellPollTimer);
            this._doorbellPollTimer = undefined;
        }
        if (this._doorbellOpenTimer) {
            window.clearTimeout(this._doorbellOpenTimer);
            this._doorbellOpenTimer = undefined;
        }
        this._clearDoorbellWarm();
    }
    setConfig(config) {
        if (!config || config.type !== 'custom:skins-pro-card') {
            throw new Error('Card type must be custom:skins-pro-card');
        }
        this._config = this.mergeHiddenFromSources(config);
        this._energyHistory = undefined;
        this._energyYesterday = undefined;
        this._energyMonthToDate = undefined;
        this._energyWeekToDate = undefined;
        this._energyTodayTotal = undefined;
        this._energyHistoryDone = false;
        this._energySources = [];
        this._energyPrefsDone = false;
        this._weatherForecast = undefined;
        this._weatherForecastEntity = undefined;
        this._autoFullscreenDone = false;
        this._autoFullscreenAttempts = 0;
        this._loadedSkinMetadata = undefined;
        void this.unsubscribeWeatherForecast();
        this._syncDoorbellDialog();
        this.requestUpdate();
    }
    willUpdate(changed) {
        if (!this._hass)
            return;
        if (changed.has('hass') || (this._view === 'energy' && !this._energySources.length)) {
            void this.fetchEnergyPrefs();
        }
        if (changed.has('hass')) {
            void this.loadAreas();
            void this.loadEntityRegistry();
            void this.loadDeviceRegistry();
            void this.loadFloorsRegistry();
            void this.loadEnergyHistory();
            this._syncDoorbellDialog();
        }
        const weatherEntity = this._config?.weather?.entity;
        if (weatherEntity && this._weatherForecastEntity !== weatherEntity) {
            void this.loadWeatherForecast();
        }
        const skin = this._config ? selectedSkin(this._config) : undefined;
        if (skin && skin !== this._loadedSkinMetadata) {
            this._loadedSkinMetadata = skin;
            if (!BUNDLED_SKINS.includes(skin)) {
                void loadSkinMetadata(skin).then((changed) => {
                    if (changed)
                        this.requestUpdate();
                });
            }
        }
    }
    getCardSize() {
        return 12;
    }
    static async getConfigElement() {
        return document.createElement('skins-pro-card-editor');
    }
    static getStubConfig() {
        return { type: 'custom:skins-pro-card' };
    }
    async loadAreas() {
        if (!this._hass || this._areasLoaded)
            return;
        if (this._areasPromise)
            return this._areasPromise;
        this._areasLoading = true;
        this._areasPromise = (async () => {
            try {
                this._areas = await loadAreas(this._hass);
                this._areasLoaded = true;
            }
            catch {
            }
            finally {
                this._areasLoading = false;
            }
        })();
        return this._areasPromise;
    }
    async loadEntityRegistry() {
        if (!this._hass || this._entityRegistryLoaded)
            return;
        if (this._entityRegistryPromise)
            return this._entityRegistryPromise;
        this._entityRegistryLoading = true;
        this._entityRegistryPromise = (async () => {
            try {
                this._entityRegistry = await loadEntityRegistry(this._hass);
                this._entityRegistryLoaded = true;
            }
            catch {
            }
            finally {
                this._entityRegistryLoading = false;
            }
        })();
        return this._entityRegistryPromise;
    }
    async loadDeviceRegistry() {
        if (!this._hass || this._deviceRegistryLoaded)
            return;
        if (this._deviceRegistryPromise)
            return this._deviceRegistryPromise;
        this._deviceRegistryLoading = true;
        this._deviceRegistryPromise = (async () => {
            try {
                this._deviceRegistry = await loadDeviceRegistry(this._hass);
                this._deviceRegistryLoaded = true;
            }
            catch {
            }
            finally {
                this._deviceRegistryLoading = false;
            }
        })();
        return this._deviceRegistryPromise;
    }
    async loadFloorsRegistry() {
        if (!this._hass || this._floorsLoaded)
            return;
        if (this._floorsPromise)
            return this._floorsPromise;
        this._floorsLoading = true;
        this._floorsPromise = (async () => {
            try {
                this._floors = await loadFloors(this._hass);
                this._floorsLoaded = true;
            }
            catch {
            }
            finally {
                this._floorsLoading = false;
            }
        })();
        return this._floorsPromise;
    }
    // ─── Energy ─────────────────────────────────────────────
    async fetchEnergyPrefs() {
        if (!this._hass || this._energyPrefsDone || this._energyPrefsLoading)
            return;
        this._energyPrefsLoading = true;
        try {
            await Promise.all([
                this.loadAreas(),
                this.loadEntityRegistry(),
                this.loadDeviceRegistry(),
                this.loadFloorsRegistry(),
            ]);
            const result = await fetchEnergySources(this._hass, this._config, {
                areas: this._areas,
                floors: this._floors,
                entityRegistry: this._entityRegistry,
                deviceRegistry: this._deviceRegistry,
            });
            this._energySources = result.sources;
            this._energyHistory = result.history;
            this._energyYesterday = result.yesterday;
            this._energyMonthToDate = result.monthToDate;
            this._energyWeekToDate = result.weekToDate;
            this._energyTodayTotal = result.todayTotal;
            this._energyPrefsDone = result.sources.length > 0;
        }
        catch {
        }
        finally {
            this._energyPrefsLoading = false;
        }
    }
    async loadEnergyHistory() {
        const entityId = this._config?.energy?.entity;
        if (!entityId || !this._hass || this._energyPrefsDone || this._energyHistoryDone || this._energyHistoryLoading)
            return;
        this._energyHistoryLoading = true;
        try {
            const result = await fetchEnergyHistory(this._hass, this._config);
            this._energyHistory = result.history;
            this._energyYesterday = result.yesterday;
            this._energyHistoryDone = result.history.length > 0;
        }
        catch {
        }
        finally {
            this._energyHistoryLoading = false;
        }
    }
    /** Today / yesterday from daily statistics change (midnight-based), never raw cumulative totals. */
    getConfiguredEnergyDisplay() {
        const entityId = this._config?.energy?.entity;
        if (!entityId) {
            return { today: '--', yesterday: '', history: undefined };
        }
        const fromPrefs = this._energySources.find((source) => source.entityId === entityId);
        if (fromPrefs) {
            return {
                today: fromPrefs.today && fromPrefs.today !== '--' ? fromPrefs.today : '--',
                yesterday: fromPrefs.yesterday || '',
                history: fromPrefs.history,
            };
        }
        if (this._energyHistory?.length) {
            const latest = this._energyHistory[this._energyHistory.length - 1];
            return {
                today: formatNumber(String(latest), 1),
                yesterday: this._energyYesterday || '',
                history: this._energyHistory,
            };
        }
        return { today: '--', yesterday: '', history: undefined };
    }
    // ─── Weather forecast ───────────────────────────────────
    async loadWeatherForecast() {
        const entityId = this._config?.weather?.entity;
        if (!entityId || !this._hass)
            return;
        if (this._weatherForecastEntity === entityId)
            return;
        await this.unsubscribeWeatherForecast();
        this._weatherForecastEntity = entityId;
        const result = await loadWeatherForecast(this._hass, entityId, (forecast) => {
            this._weatherForecast = forecast;
            this.requestUpdate();
        });
        this._weatherForecastUnsub = result.unsub;
        if (result.initial) {
            this._weatherForecast = result.initial;
        }
    }
    async unsubscribeWeatherForecast() {
        if (this._weatherForecastUnsub) {
            try {
                await this._weatherForecastUnsub();
            }
            catch {
            }
            finally {
                this._weatherForecastUnsub = undefined;
            }
        }
    }
    // ─── Layout ─────────────────────────────────────────────
    _host() {
        return this.shadowRoot?.host;
    }
    _applyLayout() {
        applyLayoutHeight(this._host());
    }
    // ─── Render context ─────────────────────────────────────
    _buildContext(language, translate, energyHistoryOverride) {
        const hass = this._hass;
        const resolvedTheme = this._resolveTheme();
        setDarkAssetSkin(resolvedTheme === 'dark' ? selectedSkin(this._config) : null);
        return {
            config: this._config,
            hass,
            language,
            translate,
            areas: this._areas,
            entityRegistry: this._entityRegistry,
            deviceRegistry: this._deviceRegistry,
            floors: this._floors,
            view: this._view,
            deviceGrouping: this._deviceGrouping,
            filterRoom: this._filterRoom,
            focusDeviceRoom: this._focusDeviceRoom,
            filterType: this._filterType,
            hideUnassigned: this._hideUnassigned,
            selectedFloor: this._selectedFloor,
            selectedEnvFloor: this._selectedEnvFloor,
            kioskFullscreen: isKioskActive(),
            androidKiosk: isAndroidKiosk(),
            devicePageIndex: this._devicePageIndex,
            securityHideEditMode: this._securityHideEditMode,
            securityHideSaving: this._securityHideSaving,
            securityHidden: this.getSecurityHiddenIds(),
            deviceHideEditMode: this._deviceHideEditMode,
            deviceHideSaving: this._deviceHideSaving,
            deviceHidden: this.getDeviceHiddenIds(),
            weatherForecast: this._weatherForecast,
            energyHistory: energyHistoryOverride ?? this._energyHistory,
            energyYesterday: this._energyYesterday,
            energySources: enrichEnergySourcesWithMeters(hass, this._energySources),
            energyMonthToDate: this._energyMonthToDate,
            energyWeekToDate: this._energyWeekToDate,
            energyTodayTotal: this._energyTodayTotal,
            onNavigate: (target) => this.navigateTo(target),
            onNavigatePath: (path) => navigatePath(path),
            onRunScene: (entityId) => { void runScene(this._hass, entityId); },
            onToggleEntity: (entityId) => { void toggleEntity(this._hass, entityId); },
            onHandleAction: (entityId, action) => this.handleAction(entityId, action),
            onBatchControl: (state) => { void this.batchControl(state, translate); },
            onToggleKiosk: () => this.toggleKioskFullscreen(),
            onMoreInfo: (entityId) => moreInfo(this, entityId),
            onTurnOffAreaType: (entityIds) => turnOffAreaType(this._hass, entityIds),
            setDeviceGrouping: (g) => { this._deviceGrouping = g; this._devicePageIndex = 0; },
            setFilterRoom: (r) => { this._filterRoom = r; this._devicePageIndex = 0; },
            setFocusDeviceRoom: (room) => { this._focusDeviceRoom = room; },
            setFilterType: (t) => { this._filterType = t; this._devicePageIndex = 0; },
            setHideUnassigned: (h) => { this._hideUnassigned = h; this._devicePageIndex = 0; },
            setSelectedFloor: (f) => { this._selectedFloor = f; },
            setSelectedEnvFloor: (f) => { this._selectedEnvFloor = f; },
            setDevicePageIndex: (page) => { this._devicePageIndex = Math.max(0, page); },
            setSecurityHideEditMode: (on) => this.setSecurityHideEditMode(on),
            onToggleSecurityHidden: (entityId) => this.toggleSecurityHidden(entityId),
            setDeviceHideEditMode: (on) => this.setDeviceHideEditMode(on),
            onDeviceHideLongPress: (entityId) => this.hideDeviceEntity(entityId),
            onDeviceHideClick: (entityId) => this.unhideDeviceEntity(entityId),
            bumpDeviceHideIdle: () => this.bumpDeviceHideIdle(),
            resolvedTheme: this._resolveTheme(),
        };
    }
    userIdForStorage() {
        return this._hass?.user?.id || 'default';
    }
    collectSecurityCameraMeta() {
        const byId = new Map();
        for (const entry of this._entityRegistry || []) {
            if (!entry.entity_id.startsWith('camera.'))
                continue;
            byId.set(entry.entity_id, {
                entityId: entry.entity_id,
                name: entry.name || entry.original_name || undefined,
            });
        }
        for (const entity of Object.values(this._hass?.states || {})) {
            if (!entity?.entity_id?.startsWith('camera.'))
                continue;
            const prev = byId.get(entity.entity_id);
            byId.set(entity.entity_id, {
                entityId: entity.entity_id,
                name: String(entity.attributes?.friendly_name || prev?.name || ''),
            });
        }
        return [...byId.values()];
    }
    getSecurityHiddenIds() {
        return resolveSecurityHiddenIds({
            draft: this._securityHiddenDraft,
            configHidden: this._config?.security_page?.hidden,
            userId: this.userIdForStorage(),
            cameras: this.collectSecurityCameraMeta(),
        });
    }
    mergeSecurityHiddenFromSources(config) {
        const merged = mergeConfig(config);
        const hidden = resolveSecurityHiddenIds({
            draft: this._securityHiddenDraft,
            configHidden: merged.security_page?.hidden,
            userId: this.userIdForStorage(),
            cameras: this.collectSecurityCameraMeta(),
        });
        merged.security_page = { ...merged.security_page, hidden };
        if (this._securityHiddenDraft === null && readSecurityHiddenLocal(this.userIdForStorage()) === null) {
            writeSecurityHiddenLocal(hidden, this.userIdForStorage());
        }
        return merged;
    }
    mergeDevicesHiddenFromSources(config) {
        const merged = mergeConfig(config);
        const hidden = resolveDevicesHiddenIds({
            draft: this._deviceHiddenDraft,
            configHidden: merged.devices_page?.hidden,
            userId: this.userIdForStorage(),
        });
        merged.devices_page = { ...merged.devices_page, hidden };
        if (this._deviceHiddenDraft === null && readDevicesHiddenLocal(this.userIdForStorage()) === null) {
            writeDevicesHiddenLocal(hidden, this.userIdForStorage());
        }
        return merged;
    }
    mergeHiddenFromSources(config) {
        return this.mergeDevicesHiddenFromSources(this.mergeSecurityHiddenFromSources(config));
    }
    getDeviceHiddenIds() {
        return resolveDevicesHiddenIds({
            draft: this._deviceHiddenDraft,
            configHidden: this._config?.devices_page?.hidden,
            userId: this.userIdForStorage(),
        });
    }
    clearDeviceHideIdle() {
        if (this._deviceHideIdleTimer) {
            window.clearTimeout(this._deviceHideIdleTimer);
            this._deviceHideIdleTimer = undefined;
        }
    }
    bumpDeviceHideIdle() {
        if (!this._deviceHideEditMode || this._deviceHideSaving)
            return;
        this.clearDeviceHideIdle();
        this._deviceHideIdleTimer = window.setTimeout(() => {
            this.setDeviceHideEditMode(false);
        }, DEVICE_EDIT_IDLE_MS);
    }
    applyDeviceHiddenDraft(next) {
        this._deviceHiddenDraft = next;
        writeDevicesHiddenLocal(next, this.userIdForStorage());
        this._config = mergeConfig({
            ...this._config,
            devices_page: { ...this._config?.devices_page, hidden: next },
        });
        this.bumpDeviceHideIdle();
        this.requestUpdate();
    }
    /** Edit-mode long-press — hide entity. */
    hideDeviceEntity(entityId) {
        if (!this._deviceHideEditMode || this._deviceHideSaving)
            return;
        this.applyDeviceHiddenDraft(addHiddenId(this.getDeviceHiddenIds(), entityId));
    }
    /** Edit-mode click on already-hidden card — restore. */
    unhideDeviceEntity(entityId) {
        if (!this._deviceHideEditMode || this._deviceHideSaving)
            return;
        this.applyDeviceHiddenDraft(removeHiddenId(this.getDeviceHiddenIds(), entityId));
    }
    setDeviceHideEditMode(on) {
        if (on) {
            this._deviceHiddenDraft = this.getDeviceHiddenIds();
            this._deviceHideEditMode = true;
            this._deviceHideSaving = false;
            this.bumpDeviceHideIdle();
            this.requestUpdate();
            return;
        }
        if (!this._deviceHideEditMode)
            return;
        if (this._deviceHideSaving)
            return;
        this.clearDeviceHideIdle();
        const hidden = normalizeHiddenIds(this._deviceHiddenDraft ?? this.getDeviceHiddenIds());
        this._deviceHiddenDraft = hidden;
        writeDevicesHiddenLocal(hidden, this.userIdForStorage());
        this._config = mergeConfig({
            ...this._config,
            devices_page: { ...this._config?.devices_page, hidden },
        });
        const connection = this._hass?.connection;
        if (!connection?.sendMessagePromise) {
            this._deviceHideEditMode = false;
            this.requestUpdate();
            return;
        }
        this._deviceHideSaving = true;
        this.requestUpdate();
        void saveDevicesHiddenToHa(connection, hidden)
            .then((ok) => {
            if (!ok)
                console.warn('[Skins Pro] devices hide saved locally; HA strategy sync failed');
        })
            .finally(() => {
            this._deviceHideSaving = false;
            this._deviceHideEditMode = false;
            this.requestUpdate();
        });
    }
    /** Edit-mode tap only — updates draft + localStorage, never HA. */
    toggleSecurityHidden(entityId) {
        if (!this._securityHideEditMode || this._securityHideSaving)
            return;
        const next = toggleHiddenId(this.getSecurityHiddenIds(), entityId);
        this._securityHiddenDraft = next;
        writeSecurityHiddenLocal(next, this.userIdForStorage());
        this._config = mergeConfig({
            ...this._config,
            security_page: { ...this._config?.security_page, hidden: next },
        });
        this.requestUpdate();
    }
    /**
     * Enter edit: copy current list into draft.
     * Exit (Done): save draft to HA strategy, then leave edit mode.
     */
    setSecurityHideEditMode(on) {
        if (on) {
            this._securityHiddenDraft = this.getSecurityHiddenIds();
            this._securityHideEditMode = true;
            this._securityHideSaving = false;
            this.requestUpdate();
            return;
        }
        if (!this._securityHideEditMode)
            return;
        if (this._securityHideSaving)
            return;
        const hidden = normalizeHiddenIds(this._securityHiddenDraft ?? this.getSecurityHiddenIds());
        this._securityHiddenDraft = hidden;
        writeSecurityHiddenLocal(hidden, this.userIdForStorage());
        this._config = mergeConfig({
            ...this._config,
            security_page: { ...this._config?.security_page, hidden },
        });
        const connection = this._hass?.connection;
        if (!connection?.sendMessagePromise) {
            this._securityHideEditMode = false;
            this.requestUpdate();
            return;
        }
        this._securityHideSaving = true;
        this.requestUpdate();
        void saveSecurityHiddenToHa(connection, hidden)
            .then((ok) => {
            if (!ok)
                console.warn('[Skins Pro] security hide saved locally; HA strategy sync failed');
        })
            .finally(() => {
            this._securityHideSaving = false;
            this._securityHideEditMode = false;
            this.requestUpdate();
        });
    }
    // ─── Main render ────────────────────────────────────────
    render() {
        if (!this._config) {
            return b ``;
        }
        if (!this._hass) {
            return b `
        <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
        ${SHARED_CHROME_STYLE}
        ${KIOSK_HOME_SIDE_STYLE}
        <ha-card><div class="loading-state">Loading...</div></ha-card>
      `;
        }
        const language = normalizeLanguage(this._config.language === 'auto' ? this._hass.language : this._config.language);
        const translate = getTranslate(language);
        const energyDisplay = this.getConfiguredEnergyDisplay();
        const ctx = this._buildContext(language, translate, energyDisplay.history);
        const weatherIconName = weatherIcon(stateValue(this._hass, this._config.weather?.entity, language));
        const quote = infoDisplayValue(this._hass, this._config.info?.entity, language) || translate('loadingQuote');
        const energyEntityId = this._config.energy?.entity || '';
        const energyValue = energyDisplay.today;
        const energyUnit = this._hass?.states[energyEntityId]?.attributes?.unit_of_measurement || this._config.energy?.unit || 'kWh';
        const compareValue = energyDisplay.yesterday;
        const registriesLoading = this.renderRegistryLoading(language);
        let stage;
        switch (this._view) {
            case 'devices':
                stage = renderDevicesView(ctx);
                break;
            case 'rooms':
                stage = renderRoomsView(ctx);
                break;
            case 'scenes':
                stage = renderScenesView(ctx);
                break;
            case 'automations':
                stage = renderAutomationsView(ctx);
                break;
            case 'security':
                stage = renderSecurityView(ctx);
                break;
            case 'energy':
                stage = renderEnergyView(ctx, energyValue, energyUnit, compareValue);
                break;
            default: stage = renderHomeView(ctx, weatherIconName, quote, energyValue, energyUnit, compareValue);
        }
        return b `
      <link rel="stylesheet" href="${assetHref(this._config, 'theme_css')}">
      ${SHARED_CHROME_STYLE}
      ${KIOSK_HOME_SIDE_STYLE}
      <ha-card>
        ${registriesLoading}
        <div class="mc-app" data-view=${this._view}>
          ${renderSidebar(ctx)}
          <main class="stage">${stage}</main>
          ${renderMobileNav(ctx)}
        </div>
      </ha-card>
    `;
    }
    renderRegistryLoading(language) {
        if (!this._hass)
            return A;
        const allLoaded = this._areasLoaded && this._entityRegistryLoaded && this._deviceRegistryLoaded;
        if (allLoaded)
            return A;
        return b `<div class="loading-state loading-registry">${t(language, 'loadingRegistry')}</div>`;
    }
    // ─── Lifecycle ──────────────────────────────────────────
    updated() {
        applyThemeVariables(this._host(), this._config);
        this._applyLayout();
        this._applyThemeAttribute();
        // Re-check after paint — covers first load when doorbell already pending.
        this._syncDoorbellDialog();
        if (this._shouldAutoFullscreen() && !this._autoFullscreenDone) {
            applyFullscreenHeight(this._host());
            const applied = ensureKiosk();
            this._autoFullscreenDone = applied || this._autoFullscreenAttempts >= 12;
            if (!this._autoFullscreenDone) {
                this._autoFullscreenAttempts += 1;
                window.setTimeout(() => this.requestUpdate(), 250);
            }
            else {
                this.requestUpdate();
            }
        }
        this._scrollToFocusedDeviceRoom();
    }
    /** Room card → devices: keep all areas visible, scroll to the tapped room section. */
    _scrollToFocusedDeviceRoom() {
        if (this._view !== 'devices' || !this._focusDeviceRoom)
            return;
        const room = this._focusDeviceRoom;
        this._focusDeviceRoom = '';
        window.requestAnimationFrame(() => {
            const root = this.renderRoot;
            const section = root?.querySelector(`[data-device-room="${CSS.escape(room)}"]`);
            section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    _shouldAutoFullscreen() {
        if (this._config?.fullscreen)
            return true;
        const users = this._config?.fullscreen_users || [];
        if (!users.length)
            return false;
        const current = [this._hass?.user?.id, this._hass?.user?.name]
            .filter((value) => Boolean(value))
            .map((value) => value.toLowerCase());
        return users.some((user) => current.includes(String(user).toLowerCase()));
    }
    _resolveTheme() {
        if (!skinSupportsDark(selectedSkin(this._config)))
            return 'light';
        const mode = this._config?.skin_mode || 'auto';
        if (mode === 'light')
            return 'light';
        if (mode === 'dark')
            return 'dark';
        // auto: use sun entity, fallback to hour-based
        const sun = this._hass?.states?.['sun.sun'];
        if (sun?.state === 'above_horizon')
            return 'light';
        if (sun?.state === 'below_horizon')
            return 'dark';
        // no sun data: 6:00-17:59 = light, 18:00-5:59 = dark
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18 ? 'light' : 'dark';
    }
    _applyThemeAttribute() {
        this.setAttribute('data-sp-theme', this._resolveTheme());
        const kiosk = this._shouldAutoFullscreen() || isKioskActive();
        this.toggleAttribute('data-sp-kiosk', kiosk);
        // Legacy GoW selector + Android Kiosk APK identity (tile-memory CSS / paging).
        this.toggleAttribute('data-kiosk-fullscreen', kiosk);
        if (isAndroidKiosk())
            this.setAttribute('data-android-kiosk', 'true');
        else
            this.removeAttribute('data-android-kiosk');
    }
    handleAction(entityId, action) {
        if (action === 'toggle') {
            void toggleEntity(this._hass, entityId);
        }
        else if (action === 'play-pause') {
            void this._hass?.callService('media_player', 'media_play_pause', { entity_id: entityId });
        }
        else if (action === 'lock-dialog') {
            if (!this._hass)
                return;
            const language = normalizeLanguage(this._config?.language === 'auto' ? this._hass.language : this._config?.language);
            // Manual「门禁开门」：同门铃弹层，展示门口 live（go2rtc akuvox_sub，不另拉 RTSP）。
            const configuredDoorLock = String(this._config?.security_page?.door_lock || '').trim();
            const isDoorAccess = (configuredDoorLock && entityId === configuredDoorLock)
                || entityId === DOORBELL_LOCK_ENTITY
                || /^lock\.r20k_/.test(entityId)
                || /门禁|开门|relay/.test(String(this._hass.states?.[entityId]?.attributes?.friendly_name || entityId));
            const doorPreview = Boolean(this._config?.security_page?.door_camera
                || configuredDoorLock
                || isDoorAccess);
            openLockDialog(this, this._hass, entityId, language, selectedSkin(this._config), doorPreview
                ? {
                    previewStream: DOORBELL_PREVIEW_STREAM,
                    previewMode: 'live',
                }
                : undefined);
        }
        else {
            moreInfo(this, entityId);
        }
    }
    navigateTo(target) {
        const valid = ['home', 'devices', 'rooms', 'scenes', 'automations', 'security', 'energy'];
        if (valid.includes(target)) {
            if (target !== 'devices' && this._deviceHideEditMode)
                this.setDeviceHideEditMode(false);
            if (target !== 'security' && this._securityHideEditMode)
                this.setSecurityHideEditMode(false);
            this._view = target;
        }
    }
    toggleKioskFullscreen() {
        // Edit-hidden UI is hidden in kiosk; clear so hidden items don't get stuck.
        if (this._securityHideEditMode)
            this.setSecurityHideEditMode(false);
        if (this._deviceHideEditMode)
            this.setDeviceHideEditMode(false);
        const host = this._host();
        if (document.body.classList.contains('skins-pro-kiosk')) {
            toggleKiosk();
            if (host)
                applyKioskExitHeight(host);
        }
        else {
            if (host)
                applyFullscreenHeight(host);
            toggleKiosk();
        }
        this.requestUpdate();
    }
    async batchControl(state, translate) {
        const hidden = new Set(this.getDeviceHiddenIds());
        const devices = getRealDevicesForRender(this._hass, this._deviceRegistry, this._entityRegistry, this._areas, {
            filterRoom: this._filterRoom,
            filterType: this._filterType,
            hideUnassigned: this._hideUnassigned,
        }).filter((d) => !hidden.has(d.entityId));
        const controllable = devices.filter((d) => CONTROLLABLE_DOMAINS.has(d.detail));
        if (controllable.length === 0)
            return;
        if (!confirm(translate('confirmAction')))
            return;
        const service = state === 'on' ? 'turn_on' : 'turn_off';
        await Promise.all(controllable.map((d) => this._hass?.callService(d.detail, service, { entity_id: d.entityId })));
    }
}
__decorate([
    r()
], SkinsProCard.prototype, "_view", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_deviceGrouping", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_filterRoom", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_focusDeviceRoom", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_filterType", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_hideUnassigned", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_areas", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_entityRegistry", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_deviceRegistry", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_floors", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_selectedFloor", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_selectedEnvFloor", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_devicePageIndex", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_energyHistory", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_energyYesterday", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_energySources", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_energyMonthToDate", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_energyWeekToDate", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_energyTodayTotal", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_weatherForecast", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_securityHideEditMode", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_securityHideSaving", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_deviceHideEditMode", void 0);
__decorate([
    r()
], SkinsProCard.prototype, "_deviceHideSaving", void 0);

// Skins Pro — standalone rewrite inspired by dwains-dashboard-next concepts
// Architecture reference: https://github.com/dwainscheeren/dwains-dashboard-next
const CARD_TYPE = 'skins-pro-card';
const DASHBOARD_STRATEGY_TYPE = 'skins-pro';
const DASHBOARD_STRATEGY_TAG = `ll-strategy-dashboard-${DASHBOARD_STRATEGY_TYPE}`;
const registered = new Set();
function defineElement(name, constructor) {
    if (registered.has(name))
        return;
    try {
        customElements.define(name, constructor);
        registered.add(name);
    }
    catch {
        // already defined, skip
    }
}
class SkinsProStrategy {
    static async generate(_config, hass) {
        const savedConfig = (_config && typeof _config === 'object' ? _config : {});
        const { type: _ignoredStrategyType, ...userConfig } = savedConfig;
        let cardConfig;
        if (hass && typeof hass === 'object') {
            try {
                const autoConfig = buildAutoConfig(hass);
                const sc = (key) => savedConfig[key] || {};
                cardConfig = {
                    ...autoConfig,
                    ...userConfig,
                    type: `custom:${CARD_TYPE}`,
                    weather: { ...autoConfig.weather, ...sc('weather') },
                    // If strategy saved energy (even `{}`), respect empty entity — do not keep auto default.
                    energy: {
                        ...autoConfig.energy,
                        ...sc('energy'),
                        ...('energy' in savedConfig ? { entity: String(sc('energy').entity || '') } : {}),
                    },
                    info: { ...autoConfig.info, ...sc('info') },
                    resource_pack: { ...autoConfig.resource_pack, ...sc('resource_pack') },
                    home_selection: { ...autoConfig.home_selection, ...sc('home_selection') },
                    security_page: {
                        ...autoConfig.security_page,
                        ...sc('security_page'),
                        // Saved strategy list is authoritative — never union with defaults/auto
                        // or unhide can never stick after lovelace reload.
                        hidden: [...new Set(((sc('security_page').hidden || [])).filter(Boolean))],
                        cameras: [...(sc('security_page').cameras || [])].filter(Boolean),
                        door_camera: String(sc('security_page').door_camera || ''),
                        door_lock: String(sc('security_page').door_lock || ''),
                    },
                    devices_page: {
                        ...autoConfig.devices_page,
                        ...sc('devices_page'),
                        hidden: [...new Set(((sc('devices_page').hidden || [])).filter(Boolean))],
                    },
                };
            }
            catch (err) {
                console.error('[SkinsPro] generate error', err);
                cardConfig = { ...userConfig, type: `custom:${CARD_TYPE}` };
            }
        }
        else {
            cardConfig = { ...userConfig, type: `custom:${CARD_TYPE}` };
        }
        return {
            title: 'Skins Pro',
            views: [
                {
                    title: 'Home',
                    path: 'home',
                    panel: true,
                    cards: [cardConfig],
                },
            ],
        };
    }
    static async getConfigElement() {
        return document.createElement('skins-pro-card-editor');
    }
}
class SkinsProStrategyDashboard extends HTMLElement {
    static async generate(config, hass) {
        return SkinsProStrategy.generate(config, hass);
    }
    static async getConfigElement() {
        return SkinsProStrategy.getConfigElement();
    }
}
defineElement(CARD_TYPE, SkinsProCard);
defineElement(DASHBOARD_STRATEGY_TAG, SkinsProStrategyDashboard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card?.type === CARD_TYPE)) {
    window.customCards.push({
        type: CARD_TYPE,
        name: 'Skins Pro Card',
        preview: true,
        description: 'Skin-switchable Home Assistant dashboard card with bilingual copy and replaceable resource packs.',
        documentationURL: 'https://github.com/ha-china/html-card-pro/discussions/11',
    });
}
window.customStrategies = window.customStrategies || [];
if (!window.customStrategies.some((item) => item?.type === DASHBOARD_STRATEGY_TYPE && item?.strategyType === 'dashboard')) {
    window.customStrategies.push({
        type: DASHBOARD_STRATEGY_TYPE,
        strategyType: 'dashboard',
        name: 'Skins Pro',
        description: 'A simplified multi-skin dashboard that can be added directly from Community dashboards.',
        documentationURL: 'https://github.com/ha-china/html-card-pro/discussions/11',
    });
}
console.log('Skins Pro Card loaded');

export { SkinsProCard };
//# sourceMappingURL=skins-pro.js.map
