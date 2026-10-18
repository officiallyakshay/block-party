export interface Theme {id:string;name:string;subtitle:string;icon:string;background:string;accent:string;colors:string[];available:boolean}
export const THEMES:Theme[]=[
{id:'classic',name:'Original Party',subtitle:'A little everyday happy',icon:'✦',background:'#14263e',accent:'#b7f36a',colors:['#aaeb67','#9d80ed','#ffbd63','#6ed5dd','#f58ca8','#65a8ee'],available:true},
{id:'halloween',name:'Haunted Party',subtitle:'A frightfully good time',icon:'🎃',background:'#251b3c',accent:'#ffb164',colors:['#ffa34f','#b18af5','#8cdd99','#f8c766','#ee85bf','#819bea'],available:true},
{id:'harvest',name:'Harvest Party',subtitle:'Gather some good moments',icon:'🍂',background:'#34271e',accent:'#edc886',colors:['#f4b35c','#bbcf79','#d98661','#eacb91','#af8a74','#d9a9a0'],available:true},
{id:'winter',name:'Winter Party',subtitle:'A little sparkle in the snow',icon:'❄',background:'#183341',accent:'#a9e5fa',colors:['#a9dfff','#93e3d2','#d9b5f0','#eaa8bb','#b6ccef','#f4deae'],available:true},
{id:'valentine',name:'Sweetheart Party',subtitle:'Love, one block at a time',icon:'♡',background:'#3a2035',accent:'#ffa2c7',colors:['#f4a0bd','#eb7187','#cc9bef','#ffc0a3','#b9b5f0','#f5d4a6'],available:true},
{id:'spring',name:'Bloom Party',subtitle:'Make a little room to grow',icon:'✿',background:'#1e3431',accent:'#bde89f',colors:['#bbdf95','#f7c1da','#c4acf0','#f3d184','#9cdbd6','#ecab90'],available:true},
{id:'summer',name:'Poolside Party',subtitle:'Good vibes, clear lines',icon:'☀',background:'#123342',accent:'#ffdc72',colors:['#ffe08a','#75d6e5','#ffae8e','#a6e9b6','#d5b8f1','#f8a5ce'],available:true},
];
export const getTheme=(id:string)=>THEMES.find(t=>t.id===id)??THEMES[0];
export const halloweenEvent={id:'haunted-party-v1',title:'Haunted Party',goal:100,reward:'Jack-o’-Glow',theme:'halloween'};
// Availability is explicit: calendar rotation must never remove an unlocked theme or interrupt a run.
export const currentEvent=()=>halloweenEvent;
export interface EntitlementProvider {hasPro():boolean;ownedCosmetics():string[]}
export const localEntitlements:EntitlementProvider={hasPro:()=>false,ownedCosmetics:()=>[]};
