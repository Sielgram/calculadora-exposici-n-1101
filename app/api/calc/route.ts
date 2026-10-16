import {NextResponse} from "next/server"; import {derivative,evaluate,parse} from "mathjs";
function f(expr:string,x:number){return Number(evaluate(expr,{x}))}
function simpson(expr:string,a:number,b:number,n=1000){if(n%2)n++;let h=(b-a)/n,s=f(expr,a)+f(expr,b);for(let i=1;i<n;i++)s+=(i%2?4:2)*f(expr,a+i*h);return s*h/3}
function root(expr:string,g:number){let x=g;for(let i=0;i<80;i++){let y=f(expr,x),h=1e-6,d=(f(expr,x+h)-f(expr,x-h))/(2*h);if(!isFinite(d)||Math.abs(d)<1e-12)break;let nx=x-y/d;if(Math.abs(nx-x)<1e-12)return nx;x=nx}return x}
function limit(expr:string,a:number){let vals=[];for(let k=3;k<=9;k++){let h=10**(-k);vals.push((f(expr,a-h)+f(expr,a+h))/2)}return vals[vals.length-1]}
function fact(n:number){let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function taylor(expr:string,a:number,n:number){let node=parse(expr),parts:string[]=[];for(let k=0;k<=n;k++){let val=Number(node.evaluate({x:a}));if(Math.abs(val)>1e-12){let c=val/fact(k);parts.push(k===0?`${c}`:`(${c})*(x-(${a}))^${k}`)}node=derivative(node,"x")}return parts.join(" + ")||"0"}
export async function POST(req:Request){try{let {q}=await req.json();q=String(q||"").trim();let result:any,steps:string[]=[];
if(/^diff2\s+/i.test(q)){let e=q.replace(/^diff2\s+/i,"");result=derivative(derivative(e,"x"),"x").toString();steps=["Differentiate the expression once.","Differentiate the resulting expression again.","Simplify the symbolic result."]}
else if(/^diff\s+/i.test(q)){let e=q.replace(/^diff\s+/i,"");result=derivative(e,"x").toString();steps=["Parse the function of x.","Apply symbolic differentiation rules.","Simplify the derivative."]}
else if(/^integrate\s+/i.test(q)){let m=q.match(/^integrate\s+(.+)\s+from\s+([-\d.]+)\s+to\s+([-\d.]+)$/i);if(!m)throw Error("Use: integrate expression from a to b");let a=+m[2],b=+m[3];result=simpson(m[1],a,b);steps=[`Interpret the definite integral on [${a}, ${b}].`,"Apply composite Simpson numerical quadrature with 1000 subintervals.","Return the numerical approximation."]}
else if(/^limit\s+/i.test(q)){let m=q.match(/^limit\s+(.+)\s+at\s+([-\d.]+)$/i);if(!m)throw Error("Use: limit expression at a");result=limit(m[1],+m[2]);steps=["Approach the point from both sides.","Evaluate progressively smaller offsets.","Compare and average convergent left/right values."]}
else if(/^root\s+/i.test(q)){let m=q.match(/^root\s+(.+)\s+guess\s+([-\d.]+)$/i);if(!m)throw Error("Use: root expression guess a");result=root(m[1],+m[2]);steps=["Start from the supplied initial guess.","Approximate the derivative numerically.","Iterate Newton's method until stable."]}
else if(/^taylor\s+/i.test(q)){let m=q.match(/^taylor\s+(.+)\s+at\s+([-\d.]+)\s+order\s+(\d+)$/i);if(!m)throw Error("Use: taylor expression at a order n");result=taylor(m[1],+m[2],+m[3]);steps=["Evaluate successive symbolic derivatives at the center.","Divide each coefficient by k!.","Assemble the Taylor polynomial."]}
else {let e=q.replace(/^eval\s+/i,"");result=evaluate(e);steps=["Parse the mathematical expression.","Evaluate using the math engine."]}
return NextResponse.json({result:String(result),steps})}catch(e:any){return NextResponse.json({error:e.message||"Calculation failed"},{status:400})}}
