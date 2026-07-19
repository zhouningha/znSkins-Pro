# 分支基准说明（给后续 AI / 协作者）

> 读本文件再动 `master`、合并官方、发版或给用户装 fork。  
> 配套必读：`CUSTOM_FEATURES.md`、`UPGRADE_CHECKLIST.md`。

---

## 1. 一句话结论

**交付与更新的唯一基准是：已用 `codex/rebuild-on-official-20260718` 覆盖后的 `master`。**

旧 `master`（2026-07-19 覆盖前）**已废除**，不要再合并回主线。  
只保留 **一份** 历史备份分支，供紧急对照，不作日常开发底。

---

## 2. 这件事怎么来的（时间线）

1. Fork `zhouningha/znSkins-Pro` 上曾长期叠官方合并、定制补丁、半截同步，**旧 `master` 历史乱、难维护**。
2. 2026-07 起在官方干净底上重建工作线：`codex/rebuild-on-official-20260718`  
   - 先同步官方 master 作 rebuild baseline  
   - 再叠必须保留的定制（见 `CUSTOM_FEATURES.md`）  
   - 再叠本轮首页 / 场景 / 媒体播放器歌单步进 / RelativeTime 崩溃修复等
3. 2026-07-19 用户决定：**以 rebuild 为准覆盖 `master`，旧线废除，只留一份备份。**
4. 此后 HACS / 别人安装本 fork、以及本地「更新 / 发 release」，**都以新 `master` 为准**，不再问「选哪个分支」。

---

## 3. 远程分支怎么用

| 分支 | 角色 | AI 可否往上堆日常提交 |
|------|------|------------------------|
| `master` | **当前唯一交付线**（= 覆盖后的 rebuild） | 可以（默认） |
| `backup/old-master-before-rebuild-20260719` | **唯一保留的旧 master 备份** | 否；只读对照 |
| `codex/rebuild-on-official-20260718` | 切线时的工作名；内容已并入 `master` 后可视为历史标签 | 不要再当分叉主线长期双写 |
| 其他旧 `codex/*` 试验分支 | 已清理 / 勿复活 | 否 |

**禁止：**

- 把 `backup/old-master-before-rebuild-20260719` merge 进 `master`
- 把「乱套时期」的旧 commit 挑回主线「图省事」
- 在未读 `CUSTOM_FEATURES.md` 的情况下用官方仓库直接 force 覆盖本 fork

**允许：**

- 从官方 Skins Pro **按功能 cherry-pick / 有控制地 merge**，并跑 `UPGRADE_CHECKLIST.md`
- 从备份分支 **只读** 找回某段丢失的定制，再手工移植到当前 `master`

---

## 4. 给用户安装 / 更新时

- HACS 自定义仓库默认装 **默认分支 `master`** → 即本基准，**用户不用选分支**。
- 不要让用户去装已废除的旧 tip，也不要让用户日常依赖 `backup/*`。
- 发 release：从当前 `master`（或由其打的 tag）发布；release notes 写清相对上一版的定制与官方同步点。

---

## 5. 本地切到基准（开发机）

```bash
cd "/Users/mac/Desktop/Skins Pro/znSkins-Pro"
git fetch origin
git checkout master
git reset --hard origin/master
```

确认 tip 与期望一致：

```bash
git log -3 --oneline
# 应能看到 rebuild 切线后的 checkpoint（如 home layout / AC playlist 等），而不是旧乱历史独有的无关联堆叠
```

---

## 6. 若必须对照旧代码

```bash
git fetch origin
git log -1 --oneline origin/backup/old-master-before-rebuild-20260719
# 只读查看某个文件：
git show origin/backup/old-master-before-rebuild-20260719:path/to/file
```

移植时：**逐文件/逐功能** 拷到当前 `master`，并更新 `CUSTOM_FEATURES.md`，禁止整分支 merge。

---

## 7. 与 HA 生产环境的关系

- HA 上已部署的 `skins-pro.js` / 主题 CSS **不等于** Git 已保存；以 GitHub `master` 为长期真源。
- 部署后必须 bump Lovelace resources 的 `build=` / `v=`，必要时 `ha core restart`（见 `CUSTOM_FEATURES.md` / `AI_HANDOFF_HOME_LAYOUT.md`）。
- Animal Crossing 等皮肤大包可能在 `skin-assets` worktree；关键 CSS 曾备份在 `theme-checkpoints/animal-crossing/theme.css`。

---

## 8. AI 开工检查清单

1. 当前是否在 `master`，且与 `origin/master` 一致？  
2. 是否已读 `CUSTOM_FEATURES.md` + `UPGRADE_CHECKLIST.md`？  
3. 本次改动是否会误从 `backup/old-master-*` 或官方裸仓整线覆盖？  
4. 提交后是否需要 `git push origin master`（规则：不能只停在本地或 HA）？

---

## 9. 覆盖操作记录（执行时填写）

| 项 | 值 |
|----|-----|
| 执行日 | 2026-07-19 |
| 新基准 tip | `codex/rebuild-on-official-20260718` → 推入 `master` |
| 旧 master 备份 | `backup/old-master-before-rebuild-20260719` |
| 操作人意图 | 废除乱历史；以后更新/安装只认新 `master` |
