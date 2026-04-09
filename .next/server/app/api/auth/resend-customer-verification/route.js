"use strict";(()=>{var e={};e.id=1257,e.ids=[1257],e.modules={96330:e=>{e.exports=require("@prisma/client")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79646:e=>{e.exports=require("child_process")},55511:e=>{e.exports=require("crypto")},14985:e=>{e.exports=require("dns")},94735:e=>{e.exports=require("events")},29021:e=>{e.exports=require("fs")},81630:e=>{e.exports=require("http")},55591:e=>{e.exports=require("https")},91645:e=>{e.exports=require("net")},21820:e=>{e.exports=require("os")},33873:e=>{e.exports=require("path")},27910:e=>{e.exports=require("stream")},34631:e=>{e.exports=require("tls")},79551:e=>{e.exports=require("url")},28354:e=>{e.exports=require("util")},74075:e=>{e.exports=require("zlib")},73024:e=>{e.exports=require("node:fs")},76760:e=>{e.exports=require("node:path")},65012:(e,t,r)=>{r.r(t),r.d(t,{patchFetch:()=>g,routeModule:()=>c,serverHooks:()=>y,workAsyncStorage:()=>f,workUnitAsyncStorage:()=>h});var o={};r.r(o),r.d(o,{POST:()=>u});var n=r(42706),i=r(28203),a=r(45994),s=r(55511),p=r(85340),l=r(84908),d=r(57335);let u=(0,p.NK)(async e=>{let t;try{t=await e.json()}catch{return(0,p.DS)("Invalid JSON body")}let r="object"==typeof t&&null!==t&&"string"==typeof t.email?t.email.trim().toLowerCase():"";if(!r||!/\S+@\S+\.\S+/.test(r))return(0,p.DS)("Enter a valid email address.");let o=await l.z.user.findFirst({where:{email:r,deletedAt:null},select:{id:!0,emailVerified:!0}});if(o&&!o.emailVerified){let e=(0,s.randomBytes)(32).toString("hex"),t=new Date(Date.now()+2592e5);await l.z.user.update({where:{id:o.id},data:{verificationToken:e,verificationTokenExpires:t}}),await (0,d.O6)(r,e)}return(0,p.kU)({message:"If this email has a pending account, we sent a new confirmation link. Check your inbox."})}),c=new n.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/auth/resend-customer-verification/route",pathname:"/api/auth/resend-customer-verification",filename:"route",bundlePath:"app/api/auth/resend-customer-verification/route"},resolvedPagePath:"C:\\Users\\laksh\\OneDrive\\Documents\\ecomm-multi-vendor\\app\\api\\auth\\resend-customer-verification\\route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:f,workUnitAsyncStorage:h,serverHooks:y}=c;function g(){return(0,a.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:h})}},60679:(e,t,r)=>{function o(e,t=!1){let r=(process.env[e]??"").trim();if(t&&!r)throw Error(`Missing required env: ${e}`);return r}function n(){return(o("SMTP_HOST")||o("SWMTP_HOST")).trim()}r.d(t,{$:()=>i});let i={get host(){return n()},port:parseInt(o("SMTP_PORT")||"587",10)||587,user:o("SMTP_USER"),pass:o("SMTP_PASS"),get from(){return o("SMTP_FROM")||o("SMTP_USER")||"noreply@localhost"},get appUrl(){let e=o("EMAIL_APP_URL");if(e)return e.replace(/\/+$/,"");let t=o("NEXT_PUBLIC_APP_URL");if(t)return t.replace(/\/+$/,"");let r=o("APP_URL");if(r)return r.replace(/\/+$/,"");let n=o("VERCEL_URL");if(n)return`https://${n.replace(/\/+$/,"")}`;let i=o("PORT");return i?`http://localhost:${i.replace(/\/+$/,"")}`:""},get enabled(){let e=n(),t=o("SMTP_PASS"),r=o("SMTP_USER");return!!(e&&(t||!r))}}},57335:(e,t,r)=>{r.d(t,{$N:()=>o.$,Zh:()=>d,O6:()=>a,hm:()=>p,y5:()=>i});var o=r(60679),n=r(42783);async function i(e,t){let r=`${o.$.appUrl}/vendor/verify?token=${encodeURIComponent(t)}`,i=["Verify your vendor account","","Click the link below to verify your email:",r,"","This link expires in 24 hours.","If you did not create an account, you can ignore this email."].join("\n");return(0,n.s)({to:e,subject:"Verify your vendor account",text:i,html:`<p>Verify your vendor account</p><p>Click the link below to verify your email:</p><p><a href="${r}">${r}</a></p><p>This link expires in 24 hours.</p><p>If you did not create an account, you can ignore this email.</p>`})}async function a(e,t){let r=`${o.$.appUrl.replace(/\/$/,"")}/verify-email?token=${encodeURIComponent(t)}`,i=["You're signing up for Indovyapar","","If you want to complete your registration, confirm your email by opening this link:",r,"","This link expires in 3 days.","If you did not try to create an account, you can ignore this email."].join("\n");return(0,n.s)({to:e,subject:"Confirm your Indovyapar account",text:i,html:`<p><strong>You're signing up for Indovyapar</strong></p><p>If you want to complete your registration, confirm your email using the button or link below.</p><p><a href="${r}" style="display:inline-block;padding:12px 20px;background:#2563EB;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">Confirm and finish sign-up</a></p><p style="word-break:break-all;font-size:13px;color:#64748B;">${r}</p><p>This link expires in 3 days.</p><p>If you did not try to create an account, you can ignore this email.</p>`})}let s="Reset your Vendor Center password";async function p(e,t){let r=o.$.appUrl.replace(/\/+$/,""),i=`${r}/vendor/reset-password?token=${encodeURIComponent(t)}`,a=["Reset your Vendor Center password","","We received a request to set a new password for your Indovyapar vendor account.","","Open this link in your browser (valid for 1 hour):",i,"","If you did not request this, you can ignore this email."].join("\n"),p=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${s}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">Reset your Vendor Center password</p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#4b5563;">We received a request to set a new password for your <strong>Indovyapar</strong> vendor account. Use the button below to choose a new password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 24px;text-align:center;">
              <a href="${i}" style="display:inline-block;background:#FF6A00;color:#ffffff !important;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">Reset password</a>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">This secure link expires in <strong style="color:#374151;">1 hour</strong>.</p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">If you did not request a password reset, you can ignore this email—your password will stay the same.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Indovyapar Vendor Center</p>
      </td>
    </tr>
  </table>
</body>
</html>`;return(0,n.s)({to:e,subject:s,text:a,html:p})}let l="Reset your Indovyapar password";async function d(e,t){let r=o.$.appUrl.replace(/\/+$/,""),i=`${r}/reset-password?token=${encodeURIComponent(t)}`,a=["Reset your Indovyapar password","","We received a request to reset your customer account password.","","Open this link in your browser (valid for 1 hour):",i,"","If you did not request this, you can ignore this email."].join("\n");return(0,n.s)({to:e,subject:l,text:a,html:`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${l}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:28px 24px 8px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">Reset your password</p>
              <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#4b5563;">We received a request to reset the password for your <strong>Indovyapar</strong> customer account. Use the button below to choose a new password.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 24px;text-align:center;">
              <a href="${i}" style="display:inline-block;background:#FF6A00;color:#ffffff !important;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;">Reset password</a>
              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">This link expires in <strong style="color:#374151;">1 hour</strong>.</p>
              <p style="margin:12px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">If you did not request this, ignore this email—your password will not change.</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">Indovyapar</p>
      </td>
    </tr>
  </table>
</body>
</html>`})}},42783:(e,t,r)=>{r.d(t,{s:()=>a});var o=r(98721),n=r(60679);let i=null;async function a(e){let{to:t,subject:r,text:a,html:s}=e,p=function(){if(i)return i;if(!n.$.enabled)return null;try{return i=o.createTransport({host:n.$.host,port:n.$.port,secure:465===n.$.port,auth:n.$.user&&n.$.pass?{user:n.$.user,pass:n.$.pass}:void 0,connectionTimeout:12e3,greetingTimeout:12e3,socketTimeout:12e3})}catch(e){return console.error("[email] Failed to create transporter:",e),null}}();if(!p)return{sent:!1};try{return await p.sendMail({from:n.$.from,to:t,subject:r,text:a,html:s??a.replace(/\n/g,"<br>")}),{sent:!0}}catch(t){let e=t instanceof Error?t.message:String(t);return console.error("[email] Send failed:",e),{sent:!1,error:e}}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[1989,5452,8721,3216],()=>r(65012));module.exports=o})();