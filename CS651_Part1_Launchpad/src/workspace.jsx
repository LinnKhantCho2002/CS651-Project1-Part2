import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {Navigation,Footer} from './components.jsx';

const initialRoom={width:4.8,depth:4};
const initialItems=[
 {id:'sofa',name:'Sofa',x:.25,y:.6,width:2,depth:.85,angle:90,color:'#7b9277'},
 {id:'chair',name:'Armchair',x:3.5,y:.6,width:.75,depth:.75,angle:0,color:'#cfac89'},
 {id:'coffee',name:'Coffee table',x:2,y:1.5,width:1,depth:.6,angle:0,color:'#b3835c'},
 {id:'side',name:'Side table',x:1.2,y:3.1,width:.45,depth:.45,angle:0,color:'#c49b6c'},
 {id:'desk',name:'Desk',x:3.45,y:2.45,width:1.1,depth:.55,angle:0,color:'#b3835c'},
 {id:'deskchair',name:'Desk chair',x:3.8,y:3.1,width:.45,depth:.45,angle:0,color:'#a5af98'},
 {id:'shelf',name:'Shelf',x:4.35,y:1.25,width:1.2,depth:.3,angle:90,color:'#c5ac8b'}
];
const clone=items=>items.map(i=>({...i}));
const size=i=>i.angle%180?[i.depth,i.width]:[i.width,i.depth];
const round=n=>Math.round(n*100)/100;
const clamp=(item,room)=>{const[w,d]=size(item);return {...item,x:round(Math.max(0,Math.min(room.width-w,item.x))),y:round(Math.max(0,Math.min(room.depth-d,item.y)))};};
const intersects=(a,b)=>a.x<b.x+b.width-.005&&a.x+a.width>b.x+.005&&a.y<b.y+b.depth-.005&&a.y+a.depth>b.y+.005;
function checkLayout(items,room){
 const boxes=items.map(i=>{const[w,d]=size(i);return{...i,width:w,depth:d}});const warnings=[];
 for(let a=0;a<boxes.length;a++)for(let b=a+1;b<boxes.length;b++)if(intersects(boxes[a],boxes[b]))warnings.push(`${boxes[a].name} overlaps ${boxes[b].name.toLowerCase()}.`);
 for(const i of boxes){if(intersects(i,{x:.4,y:room.depth-.9,width:.9,depth:.9}))warnings.push(`${i.name} is in the door swing area.`);if(i.width>room.width||i.depth>room.depth)warnings.push(`${i.name} is larger than the room.`)}
 return warnings;
}
function NumericField({label,value,onChange,min=.2,max=8,disabled=false}){
 const[draft,setDraft]=useState(String(value));useEffect(()=>setDraft(String(value)),[value]);
 return <label className="dimension-field"><span>{label}</span><input className="form-control" type="number" step="0.05" min={min} max={max} value={draft} disabled={disabled} onBlur={()=>{const n=Number(draft);if(!draft||!Number.isFinite(n)||n<min||n>max)setDraft(String(value))}} onChange={e=>{setDraft(e.target.value);const n=e.target.valueAsNumber;if(Number.isFinite(n)&&n>=min&&n<=max)onChange(round(n))}}/></label>;
}
function FurnitureItem({item,selected,editable,onSelect,onMove,room,svgRef}){
 const drag=useRef(null);const[w,d]=size(item);const scale=100;
 function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svgRef.current.getScreenCTM().inverse())}
 function start(e){onSelect(item.id);if(!editable)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current={point:point(e),x:item.x,y:item.y};}
 function move(e){if(!drag.current)return;const p=point(e),s=drag.current;onMove(item.id,{x:s.x+(p.x-s.point.x)/scale,y:s.y+(p.y-s.point.y)/scale})}
 return <g transform={`translate(${40+item.x*scale} ${40+item.y*scale})`} className={'furniture '+(selected?'chosen':'')} role="button" tabIndex="0" aria-label={'Select '+item.name.toLowerCase()} aria-pressed={selected} data-item={item.id} data-x={item.x} data-y={item.y} onPointerDown={start} onPointerMove={move} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null} onLostPointerCapture={()=>drag.current=null} onClick={()=>onSelect(item.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(item.id)}if(editable&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();onMove(item.id,{x:item.x+(e.key==='ArrowRight'?.1:e.key==='ArrowLeft'?-.1:0),y:item.y+(e.key==='ArrowDown'?.1:e.key==='ArrowUp'?-.1:0)})}}}>
 <rect width={w*scale} height={d*scale} rx={item.id==='coffee'?10:5} fill={item.color} stroke={selected?'#233c32':'#ffffff'} strokeWidth={selected?3:1}/>
 {item.id==='sofa'&&<><rect x="7" y="8" width={w*scale-14} height={d*scale/2-12} rx="4" fill="#a4b39c"/><rect x="7" y={d*scale/2+3} width={w*scale-14} height={d*scale/2-11} rx="4" fill="#a4b39c"/></>}
 {item.id==='desk'&&<rect x={w*scale*.25} y={d*scale*.23} width={w*scale*.48} height={d*scale*.4} rx="2" fill="#365b49"/>}
 {item.id==='shelf'&&[.25,.5,.75].map(p=><path key={p} d={item.angle%180?`M2 ${d*scale*p}H${w*scale-2}`:`M${w*scale*p} 2V${d*scale-2}`} stroke="#8f7756" strokeWidth="2"/>)}
 <text x={w*scale/2} y={d*scale/2+4} textAnchor="middle" className="furniture-label">{item.id==='deskchair'?'Chair':item.name}</text>
 </g>;
}
function RoomCanvas({items,room,selected,onSelect=()=>{},onMove=()=>{},editable=true,label}){
 const svgRef=useRef(null),W=room.width*100,D=room.depth*100;
 return <svg ref={svgRef} className={'editor-canvas '+(!editable?'readonly':'')} viewBox={`0 0 ${W+80} ${D+90}`} role="group" aria-label={label||(editable?'Editable top-down room plan':'Original top-down room plan')}>
 <defs><pattern id="room-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#e9e8de" strokeWidth=".5"/></pattern></defs>
 <rect width={W+80} height={D+90} rx="12" fill="#f2f3eb"/><rect x="40" y="40" width={W} height={D} fill="#fcfbf5"/><rect x="40" y="40" width={W} height={D} fill="url(#room-grid)"/>
 <rect x={40+W*.32} y={40+D*.27} width={W*.4} height={D*.42} rx="8" fill="#e6d8c1" opacity=".8"/>
 <rect x="40" y="40" width={W} height={D} fill="none" stroke="#65765e" strokeWidth="5"/>
 <path d={`M${40+W*.35} 40H${40+W*.65}`} stroke="#a8c6c0" strokeWidth="9"/><text x={40+W/2} y="25" textAnchor="middle" className="editor-ruler">Window · fixed</text>
 <rect x="80" y={D+36} width="90" height="9" fill="#f2f3eb"/><path d={`M80 ${D+40}V${D-50}A90 90 0 0 1 170 ${D+40}`} fill="#f6dbc3" fillOpacity=".3" stroke="#b98c6b" strokeDasharray="4 4" strokeWidth="1.5"/>
 <text x="125" y={D+68} textAnchor="middle" className="editor-ruler">Door · fixed</text>
 <circle cx={W+10} cy="76" r="14" fill="#80946f"/><circle cx={W+2} cy="70" r="10" fill="#9cac84"/>
 <text transform={`translate(20 ${40+D/2}) rotate(-90)`} textAnchor="middle" className="editor-ruler">{room.depth.toFixed(2)} m · approximate</text>
 <text x={40+W*.74} y={D+70} textAnchor="middle" className="editor-ruler">{room.width.toFixed(2)} m wide</text>
 {items.map(i=><FurnitureItem key={i.id} item={i} selected={selected===i.id} editable={editable} room={room} svgRef={svgRef} onSelect={onSelect} onMove={onMove}/>)}
 </svg>;
}
function MeasurementPanel({item,room,onUpdate,onRoom,onCalibrate,sofaWidth,editable}){
 return <aside className="panel measurement-panel"><div className="eyebrow">SELECTED FURNITURE</div><h2>{item.name}</h2><p className="small muted">{editable?'Drag it in the plan, use arrow keys, or adjust it here.':'Switch to Your layout to make changes.'}</p><div className="dimension-grid"><NumericField label="Width (m)" value={item.width} max={5} disabled={!editable} onChange={width=>onUpdate({width})}/><NumericField label="Depth (m)" value={item.depth} max={5} disabled={!editable} onChange={depth=>onUpdate({depth})}/></div><p className="position-readout">Position: X {item.x.toFixed(2)} m · Y {item.y.toFixed(2)} m</p><div className="nudge-controls" aria-label="Move selected furniture"><button aria-label="Move left" disabled={!editable} onClick={()=>onUpdate({x:item.x-.1})}>←</button><button aria-label="Move up" disabled={!editable} onClick={()=>onUpdate({y:item.y-.1})}>↑</button><button aria-label="Move down" disabled={!editable} onClick={()=>onUpdate({y:item.y+.1})}>↓</button><button aria-label="Move right" disabled={!editable} onClick={()=>onUpdate({x:item.x+.1})}>→</button></div><button className="btn btn-outline-primary w-100 mt-3" disabled={!editable} onClick={()=>onUpdate({angle:(item.angle+90)%180})}>Rotate 90°</button>
 <hr/><div className="eyebrow">CONFIRM THE SCALE</div><p className="small muted mt-2">Start with estimated dimensions. Enter a sofa measurement you know to set the scale.</p><NumericField label="Known sofa width (m)" value={sofaWidth} min={1.2} max={3} disabled={!editable} onChange={onCalibrate}/><div className="dimension-grid mt-3"><NumericField label="Room width (m)" value={room.width} min={2} max={8} disabled={!editable} onChange={width=>onRoom({width})}/><NumericField label="Room depth (m)" value={room.depth} min={2} max={8} disabled={!editable} onChange={depth=>onRoom({depth})}/></div><p className="small muted mt-2 mb-0">Confirm actual sizes and clearances before moving furniture.</p></aside>;
}
function SavedLayout({saved,onLoad}){
 if(!saved)return <section className="panel"><h2>Your next layout belongs here.</h2><p>Make a change in the editor, then save your layout.</p><a className="btn btn-primary" href="#editor">Open the editor →</a></section>;
 return <section className="panel saved-layout"><div><div className="eyebrow">SAVED IN THIS TAB</div><h2>Your room, arranged your way.</h2><p className="muted">{saved.room.width.toFixed(2)} × {saved.room.depth.toFixed(2)} m · approximate dimensions</p><button className="btn btn-primary" onClick={onLoad}>Continue editing</button><ul className="saved-dimensions">{saved.items.map(i=><li key={i.id}><strong>{i.name}</strong><span>{i.width.toFixed(2)} × {i.depth.toFixed(2)} m · {i.angle}°</span></li>)}</ul></div><RoomCanvas items={saved.items} room={saved.room} editable={false} label="Saved top-down room plan"/></section>;
}
function App(){
 const[room,setRoom]=useState({...initialRoom}),[originalRoom,setOriginalRoom]=useState({...initialRoom}),[items,setItems]=useState(clone(initialItems)),[original,setOriginal]=useState(clone(initialItems)),[selected,setSelected]=useState('side'),[mode,setMode]=useState('edit'),[saved,setSaved]=useState(null),[notice,setNotice]=useState(''),[view,setView]=useState(location.hash==='#saved'?'saved':'editor');
 useEffect(()=>{const change=()=>setView(location.hash==='#saved'?'saved':'editor');window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change)},[]);
 const editable=mode==='edit',shown=editable?items:original,shownRoom=editable?room:originalRoom,item=shown.find(i=>i.id===selected),warnings=checkLayout(shown,shownRoom),changed=items.filter((i,n)=>JSON.stringify(i)!==JSON.stringify(original[n])).length;
 function update(id,patch){setItems(old=>old.map(i=>i.id===id?clamp({...i,...patch},room):i));setNotice('')}
 function resize(patch){const next={...room,...patch};setRoom(next);setOriginalRoom(next);setItems(old=>old.map(i=>clamp(i,next)));setOriginal(old=>old.map(i=>clamp(i,next)));setNotice('Room dimensions updated.')}
 function calibrate(width){const ratio=width/items.find(i=>i.id==='sofa').width;const scale=list=>list.map(i=>({...i,x:round(i.x*ratio),y:round(i.y*ratio),width:round(i.width*ratio),depth:round(i.depth*ratio)}));setRoom(r=>({width:round(r.width*ratio),depth:round(r.depth*ratio)}));setOriginalRoom(r=>({width:round(r.width*ratio),depth:round(r.depth*ratio)}));setItems(scale);setOriginal(scale);setNotice('Floor plan rescaled using your sofa measurement.')}
 function reset(){setRoom({...originalRoom});setItems(clone(original));setMode('edit');setNotice('Restored the starting layout.')}
 function suggest(){setMode('edit');setItems(old=>old.map(i=>i.id==='side'?clamp({...i,x:1.12*room.width/4.8,y:.62*room.depth/4},room):i));setSelected('side');setNotice('Moved the side table out of the door area. Keep adjusting the layout to suit you.')}
 return <><Navigation active="App"/><main className="container editor-app"><header className="editor-heading"><div><div className="eyebrow">ROOMWISE / ROOM PLANNER</div><h1>See your room from a new angle.</h1><p>Explore a room, move things around, and find an arrangement that feels right.</p></div><span className="demo-label">Example room</span></header><nav className="workspace-tabs" aria-label="Room planner views"><a href="#editor" className={view==='editor'?'active':''}>Room editor</a><a href="#saved" className={view==='saved'?'active':''}>My saved layout {saved?'(1)':'(0)'}</a></nav>
 {view==='saved'?<SavedLayout saved={saved} onLoad={()=>{setRoom({...saved.room});setItems(clone(saved.items));setMode('edit');location.hash='editor';setNotice('Loaded your saved layout.')}}/>:<>
 <section className="sample-source"><img src="images/sample-room.png" alt="Sample living room with a green sofa, cream armchair, wooden coffee table, desk, and shelf"/><div><div className="eyebrow">01 / START WITH A ROOM</div><h2>The everyday living room.</h2><p>Keep the sofa, desk, and favorite chair. Make the space easier to move through.</p><div className="source-tags"><span>7 furniture pieces</span><span>Door & window stay fixed</span><span>Approximate scale</span></div><p className="source-disclosure">An illustrative room photo and matching floor plan to help you explore the possibilities.</p></div></section>
 <div className="editor-workspace"><section className="panel canvas-panel"><div className="canvas-toolbar"><div><div className="eyebrow">02 / REARRANGE WHAT YOU OWN</div><h2>{editable?'Your layout':'Original layout'}</h2></div><div className="comparison-switch"><button aria-pressed={!editable} onClick={()=>setMode('original')}>Original</button><button aria-pressed={editable} onClick={()=>setMode('edit')}>Your layout</button></div></div><RoomCanvas items={shown} room={shownRoom} selected={selected} onSelect={setSelected} onMove={update} editable={editable}/><p className="diagram-caption">Drag furniture to move it · tap to select · arrow keys move 10 cm · dimensions are approximate</p><div className="furniture-picker" aria-label="Choose furniture">{shown.map(i=><button key={i.id} aria-pressed={selected===i.id} onClick={()=>setSelected(i.id)}>{i.name}</button>)}</div><div className="layout-check" role="status"><strong>{warnings.length?`${warnings.length} layout check${warnings.length===1?'':'s'} to review`:'No furniture overlaps or door-area conflicts detected'}</strong>{warnings.length?<ul>{warnings.map(w=><li key={w}>{w}</li>)}</ul>:<p>These checks use simple rectangular footprints. Check walking space and fit in the real room.</p>}</div></section><MeasurementPanel item={item} room={shownRoom} editable={editable} sofaWidth={shown.find(i=>i.id==='sofa').width} onUpdate={patch=>update(selected,patch)} onRoom={resize} onCalibrate={calibrate}/></div>
 <section className="editor-actions"><div><div className="eyebrow">03 / KEEP THE PLAN THAT WORKS</div><p>{changed} furniture piece{changed===1?'':'s'} changed · existing furniture retained</p></div><div className="action-buttons"><button className="btn btn-outline-primary" onClick={suggest}>Try a clearer doorway</button><button className="btn btn-light" onClick={reset}>Reset layout</button><button className="btn btn-primary" disabled={!editable} onClick={()=>{setSaved({room:{...room},items:clone(items)});setNotice('Layout saved. Open My saved layout to review it.')}}>Save layout</button></div></section><p className="editor-notice" role="status">{notice}</p>
 </>}
 <p className="app-note">You’re exploring an example room. Photo import is coming soon. Confirm dimensions before moving furniture. Your saved layout stays in this tab until refresh.</p></main><Footer/></>;
}
createRoot(document.getElementById('root')).render(<App/>);
