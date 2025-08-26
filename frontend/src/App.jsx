import React, { useEffect, useState } from 'react'
import axios from 'axios'
//Snippets Importing from different file instead of maintaining it as hard-coded
import SNIPPETS from './Snippets'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function App(){
  const [language,setLanguage]=useState('python');
  const [code,setCode]=useState(SNIPPETS.python);
  const [stdin,setStdin]=useState('hello from stdin');
  const [args,setArgs]=useState('foo bar 123');
  const [running,setRunning]=useState(false);
  const [result,setResult]=useState(null);
  const [history,setHistory]=useState([]);

  async function refreshHistory(){
    const r = await axios.get(API + '/executions');
    setHistory(r.data || []);
  }

  useEffect(()=>{ refreshHistory(); },[]);

  async function run(){
    setRunning(true); setResult(null);
    try{
      const r = await axios.post(API + '/execute', { 
        language, 
        code, 
        stdin, 
        args: args.trim()? args.split(/\s+/): [] 
      });
      const id = r.data.id;
      for(let i=0;i<20;i++){
        const g = await axios.get(API + '/executions/' + id);
        if(g.data.status === 'completed' || g.data.status === 'failed'){
          setResult(g.data); break;
        }
        await new Promise(res=> setTimeout(res, 500));
      }
      await refreshHistory();
    }catch(e){
      setResult({ error: e.message });
    }finally{
      setRunning(false);
    }
  }

  useEffect(()=>{ setCode(SNIPPETS[language]); },[language]);

  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr 420px', height:'100vh'}}>
      <aside style={{borderRight:'1px solid #1c2742', padding:'16px'}}>
        <h2 style={{margin:'0 0 12px'}}>CodeDock</h2>
        <div>
          <label>Language</label><br/>
          <select value={language} onChange={e=>setLanguage(e.target.value)} style={{width:'100%', padding:'8px', background:'#111a2e', color:'#e6e6e6', border:'1px solid #293251', borderRadius:8}}>
            <option value="python">Python 3.11</option>
            <option value="node">Node.js 18</option>
            <option value="cpp">C++17</option>
          </select>
        </div>
        <div style={{marginTop:12}}>
          <button onClick={()=>setCode(SNIPPETS[language])} style={{width:'100%', padding:'8px', background:'#1b8aee', border:'none', color:'#fff', borderRadius:8}}>Load Sample</button>
        </div>
        <div style={{marginTop:16}}>
          <label>Args (space-separated)</label>
          <input value={args} onChange={e=>setArgs(e.target.value)} style={{width:'100%', padding:'8px', background:'#111a2e', color:'#e6e6e6', border:'1px solid #293251', borderRadius:8}}/>
        </div>
        <div style={{marginTop:16}}>
          <label>STDIN</label>
          <textarea value={stdin} onChange={e=>setStdin(e.target.value)} rows={6} style={{width:'100%', padding:'8px', background:'#111a2e', color:'#e6e6e6', border:'1px solid #293251', borderRadius:8}}/>
        </div>
        <div style={{marginTop:16}}>
          <button onClick={run} disabled={running} style={{width:'100%', padding:'10px', background: running? '#3a4b6e':'#22c55e', border:'none', color:'#001224', fontWeight:700, borderRadius:8}}>
            {running? 'Running…':'Run ▶'}
          </button>
        </div>
      </aside>

      <main style={{padding:'16px', borderRight:'1px solid #1c2742'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:8}}>
          <h3 style={{margin:0}}>Editor</h3>
        </div>
        <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false}
          style={{width:'100%', height:'calc(100vh - 140px)', background:'#0e172a', color:'#e6e6e6', border:'1px solid #293251', borderRadius:10, padding:12, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, liberation mono, monospace', fontSize:14}}/>
      </main>

      <section style={{padding:'16px'}}>
        <h3 style={{marginTop:0}}>Result</h3>
        {!result? <div style={{opacity:0.7}}>Run code to see output…</div>:
          <div style={{display:'grid', gap:8}}>
            <div><b>Status:</b> {result.status} {typeof result.exit_code==='number'? `(exit ${result.exit_code})`: ''}</div>
            {result.stdout? <pre style={{whiteSpace:'pre-wrap', background:'#0e172a', padding:10, borderRadius:8}}>{result.stdout}</pre>: null}
            {result.stderr? <pre style={{whiteSpace:'pre-wrap', background:'#1b243e', padding:10, borderRadius:8}}>{result.stderr}</pre>: null}
            {result.error? <pre style={{whiteSpace:'pre-wrap', background:'#3b1d1d', color:'#ffdada', padding:10, borderRadius:8}}>{result.error}</pre>: null}
          </div>
        }
        <h3>Recent</h3>
        <div style={{maxHeight:'50vh', overflow:'auto', border:'1px solid #1c2742', borderRadius:8}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead><tr><th style={{textAlign:'left', padding:8}}>ID</th><th>Lang</th><th>Status</th><th>Exit</th></tr></thead>
            <tbody>
              {history.map(x=>(
                <tr key={x.id} style={{borderTop:'1px solid #1c2742'}}>
                  <td style={{padding:8, fontFamily:'monospace'}}>{x.id.slice(0,8)}…</td>
                  <td style={{textAlign:'center'}}>{x.language}</td>
                  <td style={{textAlign:'center'}}>{x.status}</td>
                  <td style={{textAlign:'center'}}>{x.exit_code??''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
