(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{376:function(t,e,n){var content=n(406);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(17).default)("1b7833da",content,!0,{sourceMap:!1})},401:function(t,e,n){"use strict";n(5),n(8),n(13),n(14);var r=n(2),o=(n(45),n(59),n(26),n(9),n(29),n(52),n(237),n(23),n(44),n(238),n(239),n(240),n(241),n(242),n(243),n(244),n(245),n(246),n(247),n(248),n(249),n(250),n(48),n(7),n(178),n(0)),c=n(64),l=n(1);function f(object,t){var e=Object.keys(object);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(object);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),e.push.apply(e,n)}return e}function d(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?f(Object(source),!0).forEach((function(e){Object(r.a)(t,e,source[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):f(Object(source)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(source,e))}))}return t}var v=["sm","md","lg","xl"],h=["start","end","center"];function y(t,e){return v.reduce((function(n,r){return n[t+Object(l.r)(r)]=e(),n}),{})}var j=function(t){return[].concat(h,["baseline","stretch"]).includes(t)},m=y("align",(function(){return{type:String,default:null,validator:j}})),O=function(t){return[].concat(h,["space-between","space-around"]).includes(t)},w=y("justify",(function(){return{type:String,default:null,validator:O}})),S=function(t){return[].concat(h,["space-between","space-around","stretch"]).includes(t)},x=y("alignContent",(function(){return{type:String,default:null,validator:S}})),C={align:Object.keys(m),justify:Object.keys(w),alignContent:Object.keys(x)},D={align:"align",justify:"justify",alignContent:"align-content"};function _(t,e,n){var r=D[t];if(null!=n){if(e){var o=e.replace(t,"");r+="-".concat(o)}return(r+="-".concat(n)).toLowerCase()}}var T=new Map;e.a=o.a.extend({name:"v-row",functional:!0,props:d(d(d({tag:{type:String,default:"div"},dense:Boolean,noGutters:Boolean,align:{type:String,default:null,validator:j}},m),{},{justify:{type:String,default:null,validator:O}},w),{},{alignContent:{type:String,default:null,validator:S}},x),render:function(t,e){var n=e.props,data=e.data,o=e.children,l="";for(var f in n)l+=String(n[f]);var d=T.get(l);return d||function(){var t,e;for(e in d=[],C)C[e].forEach((function(t){var r=n[t],o=_(e,t,r);o&&d.push(o)}));d.push((t={"no-gutters":n.noGutters,"row--dense":n.dense},Object(r.a)(t,"align-".concat(n.align),n.align),Object(r.a)(t,"justify-".concat(n.justify),n.justify),Object(r.a)(t,"align-content-".concat(n.alignContent),n.alignContent),t)),T.set(l,d)}(),t(n.tag,Object(c.a)(data,{staticClass:"row",class:d}),o)}})},404:function(t,e,n){t.exports=n.p+"img/profile.a17ee62.jpg"},405:function(t,e,n){"use strict";n(376)},406:function(t,e,n){var r=n(16)(!1);r.push([t.i,".fixed-height{min-height:270px;line-height:270px}a{text-decoration:none}",""]),t.exports=r},412:function(t,e,n){"use strict";n.r(e);n(32);var r={data:function(){return{width:null}},computed:{hoverBool:function(){switch(this.$vuetify.breakpoint.name){case"xs":case"sm":case"md":return!0;case"lg":case"xl":return!1;default:return!0}}}},o=(n(405),n(81)),c=n(111),l=n.n(c),f=n(172),d=n(362),v=(n(22),n(58),n(0).a.extend().extend({name:"delayable",props:{openDelay:{type:[Number,String],default:0},closeDelay:{type:[Number,String],default:0}},data:function(){return{openTimeout:void 0,closeTimeout:void 0}},methods:{clearDelay:function(){clearTimeout(this.openTimeout),clearTimeout(this.closeTimeout)},runDelay:function(t,e){var n=this;this.clearDelay();var r=parseInt(this["".concat(t,"Delay")],10);this["".concat(t,"Timeout")]=setTimeout(e||function(){n.isActive={open:!0,close:!1}[t]},r)}}})),h=n(57),y=n(11),j=n(6),m=Object(y.a)(v,h.a).extend({name:"v-hover",props:{disabled:{type:Boolean,default:!1},value:{type:Boolean,default:void 0}},methods:{onMouseEnter:function(){this.runDelay("open")},onMouseLeave:function(){this.runDelay("close")}},render:function(){return this.$scopedSlots.default||void 0!==this.value?(this.$scopedSlots.default&&(element=this.$scopedSlots.default({hover:this.isActive})),Array.isArray(element)&&1===element.length&&(element=element[0]),element&&!Array.isArray(element)&&element.tag?(this.disabled||(element.data=element.data||{},this._g(element.data,{mouseenter:this.onMouseEnter,mouseleave:this.onMouseLeave})),element):(Object(j.c)("v-hover should only contain a single element",this),element)):(Object(j.c)("v-hover is missing a default scopedSlot or bound value",this),null);var element}}),O=n(140),w=n(401),S=n(180),component=Object(o.a)(r,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("v-col",[r("v-row",{staticClass:"fixed-height",attrs:{align:"center",justify:"center"}},[r("v-col",{attrs:{align:"left",justify:"auto"}},[r("v-row",[r("v-text",{staticClass:"display-3"},[t._v("Hi! I'm Matt")])],1),t._v(" "),r("v-row",[r("span",{staticClass:"subtitle-1"},[t._v("Data Scientist, Applied Statistician, Web Developer")])])],1),t._v(" "),r("v-col",{staticClass:"fixed-height",attrs:{align:"center",justify:"center"}},[r("v-hover",{attrs:{disabled:t.hoverBool},scopedSlots:t._u([{key:"default",fn:function(t){var e=t.hover;return[r("v-scale-transition",[r("v-avatar",{staticClass:"transition-fast-in-fast-out",attrs:{size:e?230:190}},[r("v-img",{attrs:{src:n(404),height:"290px","aspect-ratio":13/16,contain:"",eager:""}})],1)],1)]}}])})],1)],1)],1)}),[],!1,null,null,null);e.default=component.exports;l()(component,{VAvatar:f.a,VCol:d.a,VHover:m,VImg:O.a,VRow:w.a,VScaleTransition:S.c})}}]);