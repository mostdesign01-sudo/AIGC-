#!/usr/bin/env python3
"""把整站打包成单个 HTML 文件（双击即可离线打开，无需服务器）。

原理：
- CSS 内联为 <style>；
- 所有 ES Module（含 three.js）转为 data: URI，经 import map 以裸标识符互相引用；
- LOGO 图片与演示视频转为 data: URI。

运行：python3 tools/build_singlefile.py
输出：dist/T7-course-standalone.html
"""
import base64
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

MODULES = [
    'config', 'textures', 'building', 'environment', 'train', 'interiors',
    'cameraPath', 'lab', 'slides', 'content', 'hud', 'audio', 'main',
]


def read(p):
    with open(os.path.join(ROOT, p), 'r', encoding='utf-8') as f:
        return f.read()


def b64(p):
    with open(os.path.join(ROOT, p), 'rb') as f:
        return base64.b64encode(f.read()).decode()


def data_uri(p, mime):
    return f'data:{mime};base64,{b64(p)}'


def js_data_uri(src):
    return 'data:text/javascript;base64,' + base64.b64encode(src.encode()).decode()


def main():
    logo_white = data_uri('assets/brand/dewu-logo-white.png', 'image/png')
    logo_app = data_uri('assets/brand/dewu-logo-app.png', 'image/png')
    video = data_uri('assets/video/hyperframes-demo.mp4', 'video/mp4')

    # --- 处理各模块 ---
    module_uris = {}
    module_uris['three'] = 'data:text/javascript;base64,' + b64('assets/vendor/three.module.js')
    module_uris['gltfloader'] = 'data:text/javascript;base64,' + b64('assets/vendor/GLTFLoader.js')
    for name in MODULES:
        src = read(f'js/{name}.js')
        # 相对导入 → 裸标识符（由 import map 解析）
        src = re.sub(r"from\s+'\./([\w-]+)\.js'", lambda m: f"from '{m.group(1)}'", src)
        # 资源路径 → data URI
        src = src.replace('assets/brand/dewu-logo-white.png', logo_white)
        src = src.replace('assets/brand/dewu-logo-app.png', logo_app)
        module_uris[name] = js_data_uri(src)

    importmap = '{ "imports": {' + ','.join(
        f'\n    "{k}": "{v}"' for k, v in module_uris.items()
    ) + '\n} }'

    # --- 组装 HTML ---
    html = read('index.html')
    html = html.replace(
        '<link rel="stylesheet" href="css/main.css">',
        '<style>\n' + read('css/main.css') + '\n</style>'
    )
    html = html.replace('<link rel="icon" href="assets/brand/dewu-logo-app.png">',
                        f'<link rel="icon" href="{logo_app}">')
    html = html.replace('src="assets/brand/dewu-logo-app.png"', f'src="{logo_app}"')
    html = html.replace('src="assets/video/hyperframes-demo.mp4"', f'src="{video}"')
    html = re.sub(
        r'<script type="importmap">.*?</script>',
        '<script type="importmap">\n' + importmap + '\n</script>',
        html, flags=re.S
    )
    html = html.replace('<script type="module" src="js/main.js"></script>',
                        "<script type=\"module\">import 'main';</script>")

    out_dir = os.path.join(ROOT, 'dist')
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, 'T7-course-standalone.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('saved', out, f'{os.path.getsize(out) / 1024 / 1024:.1f} MB')


if __name__ == '__main__':
    main()
