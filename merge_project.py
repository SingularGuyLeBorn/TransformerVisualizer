import os
import sys

# --- 配置 ---

# 1. 设置项目根目录 (通常是脚本所在的目录)
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# 2. 设置要扫描的源代码目录列表 (相对于项目根目录)
#    现在可以指定多个目录
SOURCE_DIRECTORIES = ['src', 'public']

# 3. 需要处理的文件扩展名
TARGET_EXTENSIONS = ('.tsx', '.ts', '.css', '.html', '.js')  # .html 已包含

# 4. 输出合并后的文件名
OUTPUT_FILENAME = 'merged_code.txt'

# 5. 定义不同文件类型的注释风格
#    用于在合并文件中标记每个文件的开始和结束
COMMENT_MAP = {
    '.tsx': ('/*', '*/'),
    '.ts': ('/*', '*/'),
    '.js': ('/*', '*/'),
    '.css': ('/*', '*/'),
    '.html': ('<!--', '-->')
}

# 6. 需要排除的目录 (确保 'public' 不在这里)
EXCLUDE_DIRS = {'node_modules', '.git', 'build', 'dist'}


# --- 脚本主逻辑 ---

def merge_code_from_sources():
    """
    扫描指定的多个源代码目录,并将所有目标文件的内容合并到一个TXT文件中. 
    此版本【不会】修改任何源文件,更加安全. 
    """

    output_path = os.path.join(PROJECT_ROOT, OUTPUT_FILENAME)

    print(f"项目根目录: {PROJECT_ROOT}")
    print(f"将要扫描的目录: {', '.join(SOURCE_DIRECTORIES)}")
    print("-" * 50)

    try:
        # 使用写入模式 'w' 打开文件,每次运行时都会创建一个全新的合并文件
        with open(output_path, 'w', encoding='utf-8') as outfile:

            # 遍历我们定义的所有源目录
            for source_dir in SOURCE_DIRECTORIES:
                source_path = os.path.join(PROJECT_ROOT, source_dir)

                # 检查目录是否存在,如果不存在则跳过
                if not os.path.isdir(source_path):
                    print(f"  -> 警告: 目录不存在,已跳过: {source_path}")
                    continue

                print(f"\n--- 正在扫描 {source_dir} 目录 ---")

                # os.walk 会递归地遍历目录
                for dirpath, dirnames, filenames in os.walk(source_path):

                    # 修改 dirnames 列表可以阻止 os.walk 进入这些目录,效率更高
                    dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]

                    # 对文件名进行排序,保证每次合并的顺序一致
                    for filename in sorted(filenames):
                        # 检查文件扩展名是否是我们想要的
                        if filename.endswith(TARGET_EXTENSIONS):
                            full_path = os.path.join(dirpath, filename)

                            # 获取相对于项目根目录的相对路径,用于显示
                            relative_path = os.path.relpath(full_path, PROJECT_ROOT)
                            # 将 Windows 的反斜杠 \ 替换为斜杠 /,保持路径风格统一
                            display_path = relative_path.replace('\\', '/')

                            print(f"  -> 正在合并: {display_path}")

                            try:
                                # 读取源文件内容
                                with open(full_path, 'r', encoding='utf-8') as infile:
                                    content = infile.read()

                                # 将文件路径和内容写入合并文件
                                outfile.write("=" * 80 + "\n")
                                outfile.write(f"### 文件路径: {display_path}\n")
                                outfile.write("=" * 80 + "\n\n")
                                outfile.write(content)
                                outfile.write("\n\n\n")

                            except Exception as e:
                                error_message = f"  -> !!! 处理文件时出错: {display_path} | 错误: {e} !!!"
                                print(error_message, file=sys.stderr)
                                # 将错误信息也记录到合并文件中
                                outfile.write(f"\n{error_message}\n")

        print("-" * 50)
        print(f"✅ 操作成功！代码已全部合并到: {output_path}")

    except IOError as e:
        print(f"\n❌ 操作失败！无法写入文件: {e}", file=sys.stderr)


if __name__ == "__main__":
    print("此脚本将扫描 'src' 和 'public' 目录下的所有代码文件,并将它们合并成一个TXT文件. ")
    print("注意:此操作是只读的,不会修改您的任何源文件. ")
    user_input = input("确定要继续吗？(y/n): ")
    if user_input.lower() == 'y':
        merge_code_from_sources()
    else:
        print("操作已取消. ")