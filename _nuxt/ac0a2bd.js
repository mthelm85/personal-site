(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{220:function(t,e,n){var content=n(282);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(17).default)("7388ab72",content,!0,{sourceMap:!1})},222:function(t,e,n){var content=n(290);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(17).default)("56b15182",content,!0,{sourceMap:!1})},236:function(t,e,n){"use strict";var o={data:function(){return{drawer:!1,group:null,links:[{name:"Home",to:"/",icon:"mdi-home-account"},{name:"About",to:"/about",icon:"mdi-information-variant"},{name:"Timeline",to:"/timeline",icon:"mdi-timeline-text-outline"},{name:"Showcase",to:"/showcase",icon:"mdi-star-face"}],title:"Matt Helm"}},watch:{group:function(){this.drawer=!1}}},r=(n(289),n(82)),c=n(111),l=n.n(c),v=n(360),f=n(366),d=n(361),m=n(362),_=n(367),h=n(363),x=n(170),w=n(171),V=n(108),y=n(91),k=n(107),N=n(364),C=n(365),component=Object(r.a)(o,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-app",[n("v-app-bar",{attrs:{elevation:"24",app:""}},[n("v-app-bar-nav-icon",{attrs:{color:"accent"},on:{click:function(e){e.stopPropagation(),t.drawer=!t.drawer}}})],1),t._v(" "),n("v-navigation-drawer",{attrs:{fixed:"",temporary:"",bottom:"",app:""},model:{value:t.drawer,callback:function(e){t.drawer=e},expression:"drawer"}},t._l(t.links,(function(link,i){return n("v-list",{key:i,attrs:{nav:"",dense:""}},[n("NuxtLink",{attrs:{to:link.to}},[n("v-list-item",{staticClass:"mx-0 px-0",attrs:{ripple:""}},[n("v-list-item-icon",[n("v-icon",{attrs:{color:"accent"}},[t._v(t._s(link.icon))])],1),t._v(" "),n("v-list-item-title",{staticClass:"accent--text"},[t._v("\n            "+t._s(link.name)+"\n          ")])],1)],1)],1)})),1),t._v(" "),n("v-main",[n("v-container",{attrs:{align:"center",justify:"center","fill-height":""}},[n("Nuxt")],1)],1),t._v(" "),n("v-footer",{staticClass:"justify-center pl-0",attrs:{inset:"",app:""}},[n("v-col",{staticClass:"text-center accent--text",attrs:{cols:"12"}},[t._v("© "+t._s((new Date).getFullYear()))])],1)],1)}),[],!1,null,null,null);e.a=component.exports;l()(component,{VApp:v.a,VAppBar:f.a,VAppBarNavIcon:d.a,VCol:m.a,VContainer:_.a,VFooter:h.a,VIcon:x.a,VList:w.a,VListItem:V.a,VListItemIcon:y.a,VListItemTitle:k.a,VMain:N.a,VNavigationDrawer:C.a})},254:function(t,e,n){n(255),t.exports=n(256)},281:function(t,e,n){"use strict";n(220)},282:function(t,e,n){var o=n(16)(!1);o.push([t.i,"h1[data-v-bfedb7fe]{font-size:20px}",""]),t.exports=o},287:function(t,e,n){var content=n(288);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(17).default)("2998b330",content,!0,{sourceMap:!1})},288:function(t,e,n){var o=n(16)(!1);o.push([t.i,".page-enter-active,.page-leave-active{transition:opacity .5s}.page-enter,.page-leave-to{opacity:0}",""]),t.exports=o},289:function(t,e,n){"use strict";n(222)},290:function(t,e,n){var o=n(16)(!1);o.push([t.i,"",""]),t.exports=o},74:function(t,e,n){"use strict";var o={layout:"empty",props:{error:{type:Object,default:null}},data:function(){return{pageNotFound:"404 Not Found",otherError:"An error occurred"}},head:function(){return{title:404===this.error.statusCode?this.pageNotFound:this.otherError}}},r=(n(281),n(82)),c=n(111),l=n.n(c),v=n(360),component=Object(r.a)(o,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-app",{attrs:{dark:""}},[404===t.error.statusCode?n("h1",[t._v("\n    "+t._s(t.pageNotFound)+"\n  ")]):n("h1",[t._v("\n    "+t._s(t.otherError)+"\n  ")]),t._v(" "),n("NuxtLink",{attrs:{to:"/"}},[t._v("\n    Home page\n  ")])],1)}),[],!1,null,"bfedb7fe",null);e.a=component.exports;l()(component,{VApp:v.a})}},[[254,7,2,8]]]);