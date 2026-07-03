import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12">
        <div className="mb-16 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-teal-300">活来了</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              劳务招聘后台、API 与小程序服务</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
              这套项目包含微信小程序接口、招聘后台、岗位审核、报名流转、佣金记录、短信提醒和微信订阅消息接入能力"            </p>
          </div>
          <Link
            className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            href="/login"
          >
            进入后台
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["岗位管理", "招聘顾问发布岗位，超级管理员审核，审核通过后进入前台展示"],
            ["报名闭环", "求职者微信登录、完善资料、报名投递、消息沟通、状态流转"],
            ["通知与佣", "报名触发短信，状态变更触发微信通知，入职自动生成佣金记录"],
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] border border-teal-500/20 bg-teal-500/10 p-8">
          <p className="text-sm text-teal-200">默认管理员账号</p>
          <p className="mt-2 text-lg font-medium">admin@huolaila.local / ChangeMe123!</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            本地开发请先启动 PostgreSQL，再运行 Prisma 迁移和 seed。后台默认地址 <span className="px-1 text-white">http://localhost:3000</span></p>
        </div>
      </div>
    </main>
  );
}
