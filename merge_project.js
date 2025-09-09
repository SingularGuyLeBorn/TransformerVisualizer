const fs = require('fs');
const path = require('path');
const readline = require('readline');

// --- 配置 ---

// 1. 设置项目根目录 (通常是脚本所在的目录)
const PROJECT_ROOT = __dirname;

// 2. 设置要扫描的源代码目录列表 (相对于项目根目录)
const SOURCE_DIRECTORIES = ['src', 'public'];

// 3. 需要处理的文件扩展名
const TARGET_EXTENSIONS = new Set(['.tsx', '.ts', '.css', '.html', '.js']);

// 4. 输出合并后的文件名
const OUTPUT_FILENAME = 'merged_code.txt';

// 5. 需要排除的目录 (使用 Set 数据结构以获得更快的查找速度)
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'build', 'dist']);


// --- 脚本主逻辑 ---

/**
 * 递归扫描目录, 收集所有符合条件的文件内容
 * @param {string} directory - 当前要扫描的目录路径
 * @param {string[]} collectedContent - 用于收集文件内容的数组 (通过引用传递)
 */
function walkDirectory(directory, collectedContent) {
    try {
        const items = fs.readdirSync(directory, { withFileTypes: true });

        // 对文件名进行排序, 保证每次合并的顺序一致
        items.sort((a, b) => a.name.localeCompare(b.name));

        for (const item of items) {
            const fullPath = path.join(directory, item.name);

            if (item.isDirectory()) {
                // 如果是目录, 并且不在排除列表中, 则递归进入
                if (!EXCLUDE_DIRS.has(item.name)) {
                    walkDirectory(fullPath, collectedContent);
                }
            } else if (item.isFile()) {
                // 如果是文件, 检查其扩展名
                const extension = path.extname(item.name);
                if (TARGET_EXTENSIONS.has(extension)) {
                    
                    // 获取相对于项目根目录的相对路径, 用于显示
                    const relativePath = path.relative(PROJECT_ROOT, fullPath);
                    // 将 Windows 的反斜杠 \ 替换为斜杠 /, 保持路径风格统一
                    const displayPath = relativePath.replace(/\\/g, '/');

                    console.log(`  -> 正在合并: ${displayPath}`);

                    try {
                        // 读取源文件内容
                        const content = fs.readFileSync(fullPath, 'utf-8');

                        // 格式化输出块
                        const fileBlock = [
                            "=".repeat(80),
                            `### 文件路径: ${displayPath}`,
                            "=".repeat(80),
                            "", // 空行
                            content,
                            "\n\n" // 文件末尾的空行
                        ].join("\n");

                        collectedContent.push(fileBlock);

                    } catch (readError) {
                        const errorMessage = `  -> !!! 处理文件时出错: ${displayPath} | 错误: ${readError.message} !!!`;
                        console.error(errorMessage);
                        // 将错误信息也记录到合并文件中
                        collectedContent.push(`\n${errorMessage}\n`);
                    }
                }
            }
        }
    } catch (dirError) {
        console.error(`  -> !!! 读取目录时出错: ${directory} | 错误: ${dirError.message} !!!`);
    }
}


/**
 * 扫描指定的多个源代码目录, 并将所有目标文件的内容合并到一个TXT文件中.
 * 此版本【不会】修改任何源文件, 更加安全.
 */
function mergeCodeFromSources() {
    const outputPath = path.join(PROJECT_ROOT, OUTPUT_FILENAME);
    const allContent = [];

    console.log(`项目根目录: ${PROJECT_ROOT}`);
    console.log(`将要扫描的目录: ${SOURCE_DIRECTORIES.join(', ')}`);
    console.log("-".repeat(50));

    // 遍历我们定义的所有源目录
    for (const sourceDir of SOURCE_DIRECTORIES) {
        const sourcePath = path.join(PROJECT_ROOT, sourceDir);

        // 检查目录是否存在, 如果不存在则跳过
        if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isDirectory()) {
            console.log(`  -> 警告: 目录不存在, 已跳过: ${sourcePath}`);
            continue;
        }

        console.log(`\n--- 正在扫描 ${sourceDir} 目录 ---`);
        walkDirectory(sourcePath, allContent);
    }

    try {
        // 将收集到的所有内容块连接成一个大字符串并写入文件
        // 每次运行时都会覆盖旧文件
        fs.writeFileSync(outputPath, allContent.join("\n"), 'utf-8');
        
        console.log("-".repeat(50));
        console.log(`✅ 操作成功！代码已全部合并到: ${outputPath}`);

    } catch (writeError) {
        console.error(`\n❌ 操作失败！无法写入文件: ${writeError.message}`);
    }
}

/**
 * 主函数, 用于启动脚本并与用户交互
 */
function main() {
    console.log("此脚本将扫描 'src' 和 'public' 目录下的所有代码文件, 并将它们合并成一个TXT文件.");
    console.log("注意: 此操作是只读的, 不会修改您的任何源文件.");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("确定要继续吗？(y/n): ", (answer) => {
        if (answer.toLowerCase() === 'y') {
            mergeCodeFromSources();
        } else {
            console.log("操作已取消.");
        }
        rl.close();
    });
}

// 运行主函数
main();