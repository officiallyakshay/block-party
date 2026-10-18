export type Point = readonly [number,number];
export interface Shape {id:string; cells:Point[]; color:number; weight:number}
export const SHAPES:Shape[]=[
 {id:'single',cells:[[0,0]],color:1,weight:2},
 {id:'pair-h',cells:[[0,0],[0,1]],color:2,weight:3},
 {id:'pair-v',cells:[[0,0],[1,0]],color:3,weight:3},
 {id:'triple-h',cells:[[0,0],[0,1],[0,2]],color:4,weight:4},
 {id:'triple-v',cells:[[0,0],[1,0],[2,0]],color:1,weight:4},
 {id:'four-h',cells:[[0,0],[0,1],[0,2],[0,3]],color:5,weight:3},
 {id:'four-v',cells:[[0,0],[1,0],[2,0],[3,0]],color:6,weight:3},
 {id:'five-h',cells:[[0,0],[0,1],[0,2],[0,3],[0,4]],color:2,weight:1},
 {id:'five-v',cells:[[0,0],[1,0],[2,0],[3,0],[4,0]],color:3,weight:1},
 {id:'square',cells:[[0,0],[0,1],[1,0],[1,1]],color:1,weight:4},
 {id:'corner-a',cells:[[0,0],[1,0],[1,1]],color:6,weight:3},
 {id:'corner-b',cells:[[0,0],[0,1],[1,0]],color:5,weight:3},
 {id:'corner-c',cells:[[0,0],[0,1],[1,1]],color:4,weight:3},
 {id:'corner-d',cells:[[0,1],[1,0],[1,1]],color:2,weight:3},
 {id:'el-a',cells:[[0,0],[1,0],[2,0],[2,1]],color:5,weight:2},
 {id:'el-b',cells:[[0,1],[1,1],[2,1],[2,0]],color:3,weight:2},
 {id:'tee',cells:[[0,0],[0,1],[0,2],[1,1]],color:4,weight:2},
 {id:'zig',cells:[[0,0],[0,1],[1,1],[1,2]],color:6,weight:2},
 {id:'zag',cells:[[0,1],[0,2],[1,0],[1,1]],color:2,weight:2},
 {id:'rectangle-h',cells:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],color:1,weight:1},
 {id:'rectangle-v',cells:[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],color:5,weight:1},
 {id:'big-square',cells:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],color:3,weight:1},
];
export const shapeById=(id:string)=>SHAPES.find(s=>s.id===id)!;
export const shapeSize=(s:Shape)=>({rows:Math.max(...s.cells.map(p=>p[0]))+1,cols:Math.max(...s.cells.map(p=>p[1]))+1});
