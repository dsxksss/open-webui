#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// 需要修复的文件列表和对应的goto调用
const filesToFix = [
	{
		file: 'src/lib/components/admin/Settings.svelte',
		imports: "import { WEBUI_BASE_URL } from '$lib/constants';",
		replacements: [
			{ from: "goto('/admin/settings/general')", to: "goto(WEBUI_BASE_URL + '/admin/settings/general')" },
			{ from: "goto('/admin/settings/connections')", to: "goto(WEBUI_BASE_URL + '/admin/settings/connections')" },
			{ from: "goto('/admin/settings/models')", to: "goto(WEBUI_BASE_URL + '/admin/settings/models')" },
			{ from: "goto('/admin/settings/evaluations')", to: "goto(WEBUI_BASE_URL + '/admin/settings/evaluations')" },
			{ from: "goto('/admin/settings/tools')", to: "goto(WEBUI_BASE_URL + '/admin/settings/tools')" },
			{ from: "goto('/admin/settings/documents')", to: "goto(WEBUI_BASE_URL + '/admin/settings/documents')" },
			{ from: "goto('/admin/settings/web')", to: "goto(WEBUI_BASE_URL + '/admin/settings/web')" },
			{ from: "goto('/admin/settings/code-execution')", to: "goto(WEBUI_BASE_URL + '/admin/settings/code-execution')" },
			{ from: "goto('/admin/settings/interface')", to: "goto(WEBUI_BASE_URL + '/admin/settings/interface')" },
			{ from: "goto('/admin/settings/audio')", to: "goto(WEBUI_BASE_URL + '/admin/settings/audio')" },
			{ from: "goto('/admin/settings/images')", to: "goto(WEBUI_BASE_URL + '/admin/settings/images')" },
			{ from: "goto('/admin/settings/pipelines')", to: "goto(WEBUI_BASE_URL + '/admin/settings/pipelines')" },
			{ from: "goto('/admin/settings/db')", to: "goto(WEBUI_BASE_URL + '/admin/settings/db')" }
		]
	},
	{
		file: 'src/lib/components/admin/Evaluations.svelte',
		imports: "import { WEBUI_BASE_URL } from '$lib/constants';",
		replacements: [
			{ from: "goto('/admin/evaluations/leaderboard')", to: "goto(WEBUI_BASE_URL + '/admin/evaluations/leaderboard')" },
			{ from: "goto('/admin/evaluations/feedbacks')", to: "goto(WEBUI_BASE_URL + '/admin/evaluations/feedbacks')" }
		]
	},
	{
		file: 'src/routes/(app)/admin/evaluations/+page.svelte',
		imports: "import { WEBUI_BASE_URL } from '$lib/constants';",
		replacements: [
			{ from: "goto('/admin/evaluations/leaderboard')", to: "goto(WEBUI_BASE_URL + '/admin/evaluations/leaderboard')" }
		]
	},
	{
		file: 'src/lib/components/workspace/Tools.svelte',
		imports: "import { WEBUI_BASE_URL } from '$lib/constants';",
		replacements: [
			{ from: "goto('/workspace/tools/create')", to: "goto(WEBUI_BASE_URL + '/workspace/tools/create')" }
		]
	},
	{
		file: 'src/lib/components/admin/Functions.svelte',
		imports: "import { WEBUI_BASE_URL } from '$lib/constants';",
		replacements: [
			{ from: "goto('/admin/functions/create')", to: "goto(WEBUI_BASE_URL + '/admin/functions/create')" }
		]
	},
	{
		file: 'src/lib/components/notes/NoteEditor.svelte',
		imports: "import { WEBUI_BASE_URL } from '$lib/constants';",
		replacements: [
			{ from: "goto('/')", to: "goto(WEBUI_BASE_URL + '/')" },
			{ from: "goto('/notes')", to: "goto(WEBUI_BASE_URL + '/notes')" }
		]
	},
	{
		file: 'src/routes/(app)/notes/+layout.svelte',
		imports: "import { WEBUI_BASE_URL } from '$lib/constants';",
		replacements: [
			{ from: "goto('/')", to: "goto(WEBUI_BASE_URL + '/')" }
		]
	}
];

function fixFile(fileInfo) {
	const filePath = path.join(projectRoot, fileInfo.file);
	
	if (!fs.existsSync(filePath)) {
		console.log(`⚠️  文件不存在: ${fileInfo.file}`);
		return;
	}
	
	let content = fs.readFileSync(filePath, 'utf8');
	let modified = false;
	
	// 检查是否需要添加imports
	if (fileInfo.imports && !content.includes("WEBUI_BASE_URL")) {
		// 查找import语句的位置
		const importLines = content.split('\n');
		let insertIndex = -1;
		
		for (let i = 0; i < importLines.length; i++) {
			if (importLines[i].includes("import") && importLines[i].includes("$lib")) {
				insertIndex = i + 1;
			}
		}
		
		if (insertIndex > -1) {
			importLines.splice(insertIndex, 0, `\t${fileInfo.imports}`);
			content = importLines.join('\n');
			modified = true;
		}
	}
	
	// 执行替换
	fileInfo.replacements.forEach(replacement => {
		if (content.includes(replacement.from)) {
			content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
			modified = true;
		}
	});
	
	if (modified) {
		fs.writeFileSync(filePath, content);
		console.log(`✅ 修复完成: ${fileInfo.file}`);
	} else {
		console.log(`📋 无需修改: ${fileInfo.file}`);
	}
}

console.log('🔧 开始修复导航问题...\n');

filesToFix.forEach(fixFile);

console.log('\n🎉 导航修复完成！');
console.log('📝 请重启开发服务器以使更改生效');
