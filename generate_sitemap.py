import os
from datetime import datetime
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

# CNAMEファイルが存在すればそこからドメインを取得し、なければハードコードしたURLを使う
try:
    with open('CNAME', 'r') as f:
        domain = f.read().strip()
        BASE_URL = f"https://{domain}"
except FileNotFoundError:
    BASE_URL = "https://www.studio-works.jp"
    print(f"Warning: CNAME file not found. Using default BASE_URL: {BASE_URL}")


def generate_sitemap():
    """
    プロジェクト内のファイルとurls.txtを元にsitemap.xmlを生成する
    """
    # XMLのルート要素を作成 (xmlns属性付き)
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # 最終更新日として今日の日付を使用 (YYYY-MM-DD形式)
    lastmod_date = datetime.now().strftime('%Y-%m-%d')

    # --- 1. 静的なHTMLファイルからURLを追加 ---
    print("Scanning for HTML files...")
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]

    # トップページ (index.html) を最優先で追加
    if 'index.html' in html_files:
        add_url_to_set(urlset, '/', lastmod_date, 'weekly', '1.0')
        html_files.remove('index.html') # 処理済みリストから削除
        print("  - Added: / (from index.html)")

    # その他のHTMLページを追加
    for html_file in html_files:
        # 'en.html' -> '/en' のようにパスを生成
        path = '/' + os.path.splitext(html_file)[0]
        add_url_to_set(urlset, path, lastmod_date, 'monthly', '0.8')
        print(f"  - Added: {path} (from {html_file})")

    # --- 2. urls.txt からURLを追加 ---
    print("\nScanning for URLs in urls.txt...")
    try:
        with open('urls.txt', 'r', encoding='utf-8') as f:
            # 空行や前後の空白を除外してURLを読み込む
            urls_from_file = [line.strip() for line in f if line.strip()]
        
        for url in urls_from_file:
            # 自サイトのURLのみを対象とする
            if url.startswith(BASE_URL):
                # BASE_URLを除いたパス部分を取得
                path = url[len(BASE_URL):]
                add_url_to_set(urlset, path, lastmod_date, 'monthly', '0.7')
                print(f"  - Added: {path} (from urls.txt)")
            else:
                print(f"  - Info: Skipping external or malformed URL: {url}")

    except FileNotFoundError:
        print("Warning: urls.txt not found. Skipping works URLs.")

    # --- 3. XMLをファイルに書き出し ---
    # XMLツリーを整形
    tree = ET.ElementTree(urlset)
    ET.indent(tree, space="  ") 

    # sitemap.xml に書き込む (UTF-8でBOMなし)
    with open('sitemap.xml', 'wb') as f:
        tree.write(f, encoding='utf-8', xml_declaration=True)

    print("\nsitemap.xml has been generated successfully.")

def add_url_to_set(urlset, path, lastmod, changefreq, priority):
    """
    整形したURL要素をurlsetに追加するヘルパー関数
    """
    # BASE_URLとパスを結合して完全なURLを作成
    full_loc = urljoin(BASE_URL + '/', path.lstrip('/'))

    url_element = ET.SubElement(urlset, "url")
    
    loc_element = ET.SubElement(url_element, "loc")
    loc_element.text = full_loc
    
    lastmod_element = ET.SubElement(url_element, "lastmod")
    lastmod_element.text = lastmod
    
    changefreq_element = ET.SubElement(url_element, "changefreq")
    changefreq_element.text = changefreq
    
    priority_element = ET.SubElement(url_element, "priority")
    priority_element.text = priority

if __name__ == '__main__':
    generate_sitemap()
