import React,{useState,useEffect}from'react';
import{createRoot}from'react-dom/client';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import{Navigation,Footer,FormField}from'./components.jsx';

function LoginPage(){
 const[login,setLogin]=useState('');
 const[password,setPassword]=useState('');
 const[creating,setCreating]=useState(false);
 const[account,setAccount]=useState({name:'',email:'',login:'',password:''});
 const[message,setMessage]=useState('');
 useEffect(()=>{if(creating)document.getElementById('new-name')?.focus()},[creating]);
 function create(e){
  e.preventDefault();
  setLogin(account.login);setPassword(account.password);setCreating(false);
  setAccount({name:'',email:'',login:'',password:''});
  setMessage('Your guest details are ready. Sign in to continue exploring Roomwise.');
  requestAnimationFrame(()=>document.getElementById('login')?.focus());
 }
 return <><Navigation active="Login"/><main className="container auth-section"><div className={'auth-layout '+(creating?'expanded':'')}><aside className="auth-aside"><div className="eyebrow">MAKE ROOM FOR BETTER</div><h1 className="mt-3">A little more room.<br/>A little more you.</h1><p className="lead mt-3">A practical plan for the space you already call home.</p><img className="auth-graphic" src="images/workspace.svg" alt="Illustrated living room with practical furniture placement"/></aside><div className="auth-forms"><section className="panel" aria-labelledby="auth-title"><div className="eyebrow mb-2">Roomwise</div><h2 id="auth-title">Sign in</h2><p className="muted">Welcome back. Make room for your next idea.</p><form onSubmit={e=>{e.preventDefault();setMessage('Guest access is ready. Open the room planner to get started.')}}><FormField id="login" label="Login" value={login} onChange={setLogin} autoComplete="username"/><FormField id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password"/><button className="btn btn-primary w-100" type="submit">Sign in</button></form><hr className="my-4"/><p className="muted small">New here?</p><button className="btn btn-outline-primary w-100" type="button" onClick={()=>{setCreating(true);setMessage('')}} aria-expanded={creating} aria-controls="create-account">Create account</button><p className="app-note mt-4 mb-0">Guest access: use sample details. Your profile stays in this session.</p>{message&&<div className="alert alert-primary mt-3 mb-0" role="status">{message}</div>}{creating&&<img src="images/workspace.svg" className="mini-graphic mt-4" alt="Sample room plan with an open walkway"/>}</section>{creating&&<section className="panel" id="create-account" aria-labelledby="create-title"><div className="eyebrow mb-2">YOUR NEXT SMALL CHANGE</div><h2 id="create-title">Create account</h2><p className="muted">Make room for your next idea.</p><form onSubmit={create}>{[['name','Name','text'],['email','Email','email'],['login','Login','text'],['password','Password','password']].map(([key,label,type])=><FormField key={key} id={'new-'+key} label={label} type={type} value={account[key]} onChange={value=>setAccount(prev=>({...prev,[key]:value}))} autoComplete={key==='password'?'new-password':key==='login'?'username':key}/>)}<button className="btn btn-primary w-100" type="submit">Enter</button><button className="btn btn-link w-100 mt-2" type="button" onClick={()=>{setCreating(false);setAccount({name:'',email:'',login:'',password:''})}}>Cancel</button></form></section>}</div></div></main><Footer/></>;
}
createRoot(document.getElementById('root')).render(<LoginPage/>);
