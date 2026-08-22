#!/usr/bin/env python3
"""打包电影级单文件版：静帧 / CSS / JS / 视频 / LOGO 全部内联。"""
import base64, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODULES = ['config', 'textures', 'lab', 'slides', 'content', 'hud', 'audio', 'main']


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
    logo_app = data_uri('assets/brand/dewu-logo-app.png', 'image/png')
    video = data_uri('assets/video/hyperframes-demo.mp4', 'video/mp4')

    still_map = {}
    stills_dir = os.path.join(ROOT, 'assets', 'stills')
    for name in os.listdir(stills_dir):
        if name.endswith('.jpg'):
            still_map[f'assets/stills/{name}'] = data_uri(f'assets/stills/{name}', 'image/jpeg')

    module_uris = {
        'three': 'data:text/javascript;base64,' + b64('assets/vendor/three.module.js'),
        'gltfloader': 'data:text/javascript;base64,' + b64('assets/vendor/GLTFLoader.js'),
    }
    for name in MODULES:
        src = read(f'js/{name}.js')
        src = re.sub(r"from\s+'\./([\w-]+)\.js'", lambda m: f"from '{m.group(1)}'", src)
        for k, v in still_map.items():
            src = src.replace(k, v)
        module_uris[name] = js_data_uri(src)

    importmap = '{ "imports": {' + ','.join(f'\n    "{k}": "{v}"' for k, v in module_uris.items()) + '\n} }'
    html = read('index.html')
    html = html.replace('<link rel="stylesheet" href="css/main.css">', '<style>\n' + read('css/main.css') + '\n</style>')
    html = html.replace('<link rel="icon" href="assets/brand/dewu-logo-app.png">', f'<link rel="icon" href="{logo_app}">')
    html = html.replace('src="assets/brand/dewu-logo-app.png"', f'src="{logo_app}"')
    html = html.replace('src="assets/video/hyperframes-demo.mp4"', f'src="{video}"')
    html = re.sub(r'<script type="importmap">.*?</script>', '<script type="importmap">\n' + importmap + '\n</script>', html, flags=re.S)
    html = html.replace('<script type="module" src="js/main.js"></script>', "<script type=\"module\">import 'main';</script>")

    out_dir = os.path.join(ROOT, 'dist')
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, 'T7-course-standalone.html')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    print('saved', out, f'{os.path.getsize(out) / 1024 / 1024:.1f} MB')


if __name__ == '__main__':
    main()
