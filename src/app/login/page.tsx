import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

function LoginFormFallback() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100 p-6">
      <div className="h-10 rounded-lg bg-slate-200" />
      <div className="mt-4 h-10 rounded-lg bg-slate-200" />
      <div className="mt-4 h-10 rounded-lg bg-teal-200" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl gap-10 rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] md:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-[1.75rem] bg-slate-950 p-8 text-white">
          <p className="text-sm font-medium text-teal-300">活来了后台</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">劳务招聘业务后台</h1>
          <p className="mt-6 text-sm leading-7 text-slate-300">
            管理岗位发布、审核、报名流转、顾问消息和佣金结算。当前已预置管理员账号，登录后即可体验全流程。
          </p>
          <div className="mt-10 space-y-4 text-sm text-slate-300">
            <p>1. 招聘顾问发布岗位并提交审核</p>
            <p>2. 超级管理员审核岗位后，小程序即可展示</p>
            <p>3. 求职者报名后，系统短信提醒顾问，状态变化走微信通知</p>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-900">登录后台</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            默认账号已填充，可直接进入体验。后续上线时请改为正式管理员账号。
          </p>
          <div className="mt-8">
            <Suspense fallback={<LoginFormFallback />}>
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
