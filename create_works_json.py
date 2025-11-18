
import requests
from bs4 import BeautifulSoup
import json
import os

def get_meta_data(url):
    """
    URLからOGPなどのメタデータを取得する
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        response.encoding = response.apparent_encoding
        soup = BeautifulSoup(response.text, 'html.parser')

        # OGPタイトル > 通常のタイトル
        title = soup.find('meta', property='og:title')
        if title:
            title = title.get('content')
        else:
            title = soup.find('title').text if soup.find('title') else ''

        # OGPディスクリプション > 通常のディスクリプション
        description = soup.find('meta', property='og:description')
        if description:
            description = description.get('content')
        else:
            description_tag = soup.find('meta', attrs={'name': 'description'})
            description = description_tag.get('content') if description_tag else ''

        # OGPイメージ
        image = soup.find('meta', property='og:image')
        if image:
            image = image.get('content')
        else:
            image = ''
        
        # URLを絶対パスに変換
        if image and not image.startswith('http'):
            from urllib.parse import urljoin
            image = urljoin(url, image)

        return {
            "url": url,
            "title": title.strip() if title else 'No Title Found',
            "description": description.strip() if description else 'No Description Found',
            "image": image,
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    """
    urls.txtからURLを読み込み、メタデータを取得してworks.jsonに保存する
    """
    # スクリプトの場所を基準にパスを解決
    script_dir = os.path.dirname(os.path.abspath(__file__))
    urls_file_path = os.path.join(script_dir, 'urls.txt')
    works_json_path = os.path.join(script_dir, 'works.json')

    if not os.path.exists(urls_file_path):
        print(f"Error: '{urls_file_path}' not found.")
        return

    with open(urls_file_path, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]

    works_data = []
    for url in urls:
        print(f"Fetching data from: {url}")
        data = get_meta_data(url)
        if data:
            works_data.append(data)
    
    # 取得したデータに加えて、手動で追加したい項目も考慮した構造にする
    final_data = []
    for item in works_data:
        final_data.append({
            "image": item["image"],
            "title": item["title"],
            "description": item["description"],
            "url": item["url"],
            "client": "", # 手動で追記
            "production_period": "", # 手動で追記
            "design": "", # 手動で追記
            "notes": "" # 手動で追記
        })


    with open(works_json_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully created '{works_json_path}'")
    print(f"Found {len(final_data)} items.")

if __name__ == '__main__':
    main()
