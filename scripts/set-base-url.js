#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const baseUrl = args[0] || '';

const configPath = path.join(process.cwd(), 'svelte.config.js');

// 读取当前配置
let configContent = fs.readFileSync(configPath, 'utf8');

// 更新base路径
if (baseUrl === '') {
  // 开发环境
  configContent = configContent.replace(
    /base:\s*['"][^'"]*['"]/,
    `base: ''`
  );
  console.log('✅ 设置为开发环境（base: ""）');
} else {
  // 生产环境
  const cleanBaseUrl = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  configContent = configContent.replace(
    /base:\s*['"][^'"]*['"]/,
    `base: '${cleanBaseUrl}'`
  );
  console.log(`✅ 设置BASE_URL为: ${cleanBaseUrl}`);
}

// 写回文件
fs.writeFileSync(configPath, configContent);

// 更新app.html中的static路径
const appHtmlPath = path.join(process.cwd(), 'src', 'app.html');
if (fs.existsSync(appHtmlPath)) {
  let appHtmlContent = fs.readFileSync(appHtmlPath, 'utf8');
  
  if (baseUrl === '') {
    // 开发环境
    appHtmlContent = appHtmlContent.replace(
      /src="[^"]*\/static\/loader\.js"/g,
      'src="/static/loader.js"'
    );
  } else {
    // 生产环境
    const cleanBaseUrl = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
    appHtmlContent = appHtmlContent.replace(
      /src="[^"]*\/static\/loader\.js"/g,
      `src="${cleanBaseUrl}/static/loader.js"`
    );
  }
  
  fs.writeFileSync(appHtmlPath, appHtmlContent);
  console.log('✅ 更新了app.html中的静态资源路径');
}

console.log('\n🔄 请重新启动开发服务器以使更改生效');
console.log('📝 配置已更新完成！');
