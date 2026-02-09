// 静态文件上传到ali oss
require('dotenv').config()
var OSS = require('ali-oss')
var fs = require('fs').promises
var path = require('path')
var crypto = require('crypto')

var client = new OSS({
	// yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
	region: process.env.OSS_REGION,
	// 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
	accessKeyId: process.env.OSS_ACCESS_KEY_ID,
	accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
	bucket: process.env.OSS_BUCKET,
})
// 拷贝 dist/*.html 到  blog_serve/下
fs.copyFile('dist/index.html', '../blog_serve/public/index.html')

// 修改 chunk-vendors 文件内容
async function modifyChunkVendors(filePath) {
	try {
		if (filePath.includes('chunk-vendors') && filePath.endsWith('.js')) {
			let content = await fs.readFile(filePath, 'utf8')
			// 替换 Worker 初始化代码，移除 __webpack_require__.p+
			content = content.replace(
				/return new Worker\(__webpack_require__\.p \+ "([a-f0-9]+\.worker\.js)"\)/g,
				'return new Worker("$1")'
			)
			console.log('脚本替换完成')
			await fs.writeFile(filePath, content, 'utf8')
			console.log('Modified chunk-vendors file:', filePath)
		}
	} catch (err) {
		console.error('Error modifying chunk-vendors:', err)
	}
}

// 递归获取所有文件
async function getAllFiles(dirPath, arrayOfFiles) {
	var files = await fs.readdir(dirPath)
	arrayOfFiles = arrayOfFiles || []

	for (var file of files) {
		var fullPath = path.join(dirPath, file)
		if ((await fs.stat(fullPath)).isDirectory()) {
			arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles)
		} else {
			// 排除 index.html
			if (file !== 'index.html') {
				// 如果是 chunk-vendors 文件，先修改内容
				await modifyChunkVendors(fullPath)
				arrayOfFiles.push(fullPath)
			}
		}
	}

	return arrayOfFiles
}

// 上传文件到 OSS
async function uploadToOSS(localFile, baseDir) {
	try {
		// 计算相对路径作为 OSS 的文件路径
		var relativePath = path.relative(baseDir, localFile)
		// 使用正斜杠，确保 OSS 路径格式正确
		var ossPath = relativePath.split(path.sep).join('/')

		console.log(`Uploading: ${ossPath}`)
		var result = await client.put(ossPath, localFile)
		console.log(`Uploaded successfully: ${ossPath}`)
		return result
	} catch (err) {
		console.error(`Failed to upload ${localFile}: ${err.message}`)
		throw err
	}
}

// 主函数
async function uploadDirectory() {
	try {
		var baseDir = path.resolve('dist')
		var files = await getAllFiles(baseDir)

		console.log(`Found ${files.length} files to upload`)

		// 并发上传所有文件
		var results = await Promise.all(
			files.map((file) => uploadToOSS(file, baseDir))
		)

		console.log('All files uploaded successfully!')
		return results
	} catch (err) {
		console.error('Upload failed:', err)
		throw err
	}
}

// 执行上传
uploadDirectory().catch(console.error)
