"use strict";(()=>{var e={};e.id=7833,e.ids=[7833],e.modules={96330:e=>{e.exports=require("@prisma/client")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},79646:e=>{e.exports=require("child_process")},55511:e=>{e.exports=require("crypto")},14985:e=>{e.exports=require("dns")},94735:e=>{e.exports=require("events")},29021:e=>{e.exports=require("fs")},81630:e=>{e.exports=require("http")},55591:e=>{e.exports=require("https")},91645:e=>{e.exports=require("net")},21820:e=>{e.exports=require("os")},33873:e=>{e.exports=require("path")},27910:e=>{e.exports=require("stream")},34631:e=>{e.exports=require("tls")},79551:e=>{e.exports=require("url")},28354:e=>{e.exports=require("util")},74075:e=>{e.exports=require("zlib")},4573:e=>{e.exports=require("node:buffer")},77598:e=>{e.exports=require("node:crypto")},73024:e=>{e.exports=require("node:fs")},76760:e=>{e.exports=require("node:path")},57975:e=>{e.exports=require("node:util")},22775:(e,r,t)=>{t.r(r),t.d(r,{patchFetch:()=>x,routeModule:()=>h,serverHooks:()=>m,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>g});var o={};t.r(o),t.d(o,{POST:()=>f});var n=t(42706),i=t(28203),s=t(45994),a=t(55511),p=t(85340),l=t(84908),d=t(96330),u=t(2146),c=t(57335);let f=(0,p.NK)(async e=>{let r;try{r=await e.json()}catch{return(0,p.DS)("Invalid JSON body")}let t=(0,u.mO)(r);if(!t.success)return(0,p.M2)("Validation failed",(0,u.p6)(t.errors));let{email:o,password:n,businessName:i,ownerName:s,phone:f}=t.data;if(await l.z.seller.findFirst({where:{email:o,deletedAt:null},select:{id:!0}}))return(0,p.N8)("A vendor account with this email already exists");let h=await (0,u.Er)(n),y=(0,a.randomBytes)(32).toString("hex"),g=new Date(Date.now()+2592e5),m=await l.z.seller.create({data:{email:o,passwordHash:h,businessName:i,ownerName:s,phone:f??null,status:d.SellerStatus.PENDING_VERIFICATION,emailVerified:!1,verificationToken:y,verificationTokenExpires:g},select:{id:!0,email:!0,businessName:!0,ownerName:!0,status:!0}}),x=await (0,c.y5)(o,y);c.$N.appUrl.replace(/\/$/,""),encodeURIComponent(y);let w={message:x.sent?"Registration successful. Please check your email to verify your account.":"Registration successful. Verify your email using the link below (no email was sent — SMTP not configured).",vendor:{id:m.id,email:m.email,businessName:m.businessName,ownerName:m.ownerName,status:m.status,emailVerified:!1},emailSent:x.sent};return x.sent,(0,p.kU)(w)}),h=new n.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/auth/vendor-register/route",pathname:"/api/auth/vendor-register",filename:"route",bundlePath:"app/api/auth/vendor-register/route"},resolvedPagePath:"C:\\Users\\laksh\\OneDrive\\Documents\\ecomm-multi-vendor\\app\\api\\auth\\vendor-register\\route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:y,workUnitAsyncStorage:g,serverHooks:m}=h;function x(){return(0,s.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:g})}},60679:(e,r,t)=>{function o(e,r=!1){let t=(process.env[e]??"").trim();if(r&&!t)throw Error(`Missing required env: ${e}`);return t}function n(){return(o("SMTP_HOST")||o("SWMTP_HOST")).trim()}t.d(r,{$:()=>i});let i={get host(){return n()},port:parseInt(o("SMTP_PORT")||"587",10)||587,user:o("SMTP_USER"),pass:o("SMTP_PASS"),get from(){return o("SMTP_FROM")||o("SMTP_USER")||"noreply@localhost"},get appUrl(){let e=o("EMAIL_APP_URL");if(e)return e.replace(/\/+$/,"");let r=o("NEXT_PUBLIC_APP_URL");if(r)return r.replace(/\/+$/,"");let t=o("APP_URL");if(t)return t.replace(/\/+$/,"");let n=o("VERCEL_URL");if(n)return`https://${n.replace(/\/+$/,"")}`;let i=o("PORT");return i?`http://localhost:${i.replace(/\/+$/,"")}`:""},get enabled(){let e=n(),r=o("SMTP_PASS"),t=o("SMTP_USER");return!!(e&&(r||!t))}}},57335:(e,r,t)=>{t.d(r,{$N:()=>o.$,Zh:()=>d,O6:()=>s,hm:()=>p,y5:()=>i});var o=t(60679),n=t(42783);async function i(e,r){let t=`${o.$.appUrl}/vendor/verify?token=${encodeURIComponent(r)}`,i=["Verify your vendor account","","Click the link below to verify your email:",t,"","This link expires in 24 hours.","If you did not create an account, you can ignore this email."].join("\n");return(0,n.s)({to:e,subject:"Verify your vendor account",text:i,html:`<p>Verify your vendor account</p><p>Click the link below to verify your email:</p><p><a href="${t}">${t}</a></p><p>This link expires in 24 hours.</p><p>If you did not create an account, you can ignore this email.</p>`})}async function s(e,r){let t=`${o.$.appUrl.replace(/\/$/,"")}/verify-email?token=${encodeURIComponent(r)}`,i=["You're signing up for Indovyapar","","If you want to complete your registration, confirm your email by opening this link:",t,"","This link expires in 3 days.","If you did not try to create an account, you can ignore this email."].join("\n");return(0,n.s)({to:e,subject:"Confirm your Indovyapar account",text:i,html:`<p><strong>You're signing up for Indovyapar</strong></p><p>If you want to complete your registration, confirm your email using the button or link below.</p><p><a href="${t}" style="display:inline-block;padding:12px 20px;background:#2563EB;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;">Confirm and finish sign-up</a></p><p style="word-break:break-all;font-size:13px;color:#64748B;">${t}</p><p>This link expires in 3 days.</p><p>If you did not try to create an account, you can ignore this email.</p>`})}let a="Reset your Vendor Center password";async function p(e,r){let t=o.$.appUrl.replace(/\/+$/,""),i=`${t}/vendor/reset-password?token=${encodeURIComponent(r)}`,s=["Reset your Vendor Center password","","We received a request to set a new password for your Indovyapar vendor account.","","Open this link in your browser (valid for 1 hour):",i,"","If you did not request this, you can ignore this email."].join("\n"),p=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${a}</title>
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
</html>`;return(0,n.s)({to:e,subject:a,text:s,html:p})}let l="Reset your Indovyapar password";async function d(e,r){let t=o.$.appUrl.replace(/\/+$/,""),i=`${t}/reset-password?token=${encodeURIComponent(r)}`,s=["Reset your Indovyapar password","","We received a request to reset your customer account password.","","Open this link in your browser (valid for 1 hour):",i,"","If you did not request this, you can ignore this email."].join("\n");return(0,n.s)({to:e,subject:l,text:s,html:`<!DOCTYPE html>
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
</html>`})}},42783:(e,r,t)=>{t.d(r,{s:()=>s});var o=t(98721),n=t(60679);let i=null;async function s(e){let{to:r,subject:t,text:s,html:a}=e,p=function(){if(i)return i;if(!n.$.enabled)return null;try{return i=o.createTransport({host:n.$.host,port:n.$.port,secure:465===n.$.port,auth:n.$.user&&n.$.pass?{user:n.$.user,pass:n.$.pass}:void 0,connectionTimeout:12e3,greetingTimeout:12e3,socketTimeout:12e3})}catch(e){return console.error("[email] Failed to create transporter:",e),null}}();if(!p)return{sent:!1};try{return await p.sendMail({from:n.$.from,to:r,subject:t,text:s,html:a??s.replace(/\n/g,"<br>")}),{sent:!0}}catch(r){let e=r instanceof Error?r.message:String(r);return console.error("[email] Send failed:",e),{sent:!1,error:e}}}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[1989,5452,7727,8151,8721,3216,2146],()=>t(22775));module.exports=o})();