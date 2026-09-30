# SnapWord - 极速课本生词提取与卡片浏览 Web App

一个基于**移动端优先（Mobile-First）**策略与**现代极简主义（Modern Minimalist）**风格的语言学习卡片 Web MVP。

专为语言学校日常学习场景打造（如韩国语语学堂等）。

---

## 🌟 核心特性

1. **极速拍照与识图提取 (Uploader)**
   - 手机端支持调用相机拍照或相册选择课本图片。
   - 对接多模态大模型视觉接口（默认支持 **Kimi / Moonshot** 视觉模型，自动检测课本语言）。
   - **模式 A 追加策略**：每次拍摄新课本页面，提取出的重点生词自动追加到当前卡包中，无需保存或上传大体积原始图片。

2. **双视图无缝切换 (Toggle Navigation)**
   - **🎴 卡片滑动视图 (Swipe View)**：
     - 基于 Framer Motion 实现的 Tinder 式手势交互。
     - 支持**左右拖拽滑动**与飞出动画，自动切入下一个单词。
     - 底部提供进度计数器、发音试听、上一张/下一张辅助控制器。
   - **📋 列表折叠视图 (List View)**：
     - 竖向整洁展示核心原形词、词性徽标（如动词、名词）、中文精准释义。
     - 点击卡片条目平滑展开课本例句与详细信息，支持单卡删除。

3. **双保险发音朗读 (TTS)**
   - 优先调用浏览器原生 `Web Speech API`。
   - 自动检测韩语/日语/英语等语种，支持自动降级到在线词典高品质纯正真人发音源，零配置、零网络阻碍。

4. **一键导出到 Excel (CSV)**
   - 顶部提供一键导出按钮，自动生成带 **UTF-8 BOM** 的 CSV 文件。
   - 完美适配 Windows / Mac 上的 Microsoft Excel，直接双击打开不乱码，方便课后系统复习或导入 Anki。

5. **无后端零门槛部署与前端密钥设置**
   - 纯前端 / Next.js Serverless 架构，数据持久化存储于浏览器的 `LocalStorage`。
   - 用户在右上角【设置】中即可直接填入自己的 Kimi API Key；也支持免 Key 一键载入模拟测试数据。

---

## 🚀 快速启动

### 1. 安装依赖
```bash
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)。推荐在浏览器开发者工具中开启“移动端模拟模式”（如 iPhone 14/15 尺寸）以获得最佳体验。

### 3. 可选：配置服务端环境变量
您也可以在根目录下创建 `.env.local` 文件预置密钥：
```env
KIMI_API_KEY=sk-your-kimi-moonshot-api-key
```
*(注：前端右上角【设置】弹窗中输入的 API Key 会优先使用)*

---

## 🛠️ 技术栈
- **核心框架**: Next.js 14 (App Router) + TypeScript
- **样式与设计**: Tailwind CSS (极简黑白灰冷调与自然圆角)
- **手势动效**: Framer Motion
- **图标系统**: Lucide Icons
- **数据流**: LocalStorage 响应式状态管理
