import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

def get_publication_date(soup, url):
    """
    ページの公開日と思われる日付をベストエフォートで取得する
    """
    date_str = None
    
    # 1. JSON-LD (application/ld+json) を探す
    try:
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_ld_scripts:
            # script.stringがNoneの場合があるためチェック
            if not script.string:
                continue
            data = json.loads(script.string)
            if isinstance(data, dict) and 'datePublished' in data:
                date_str = data['datePublished']
                break
            # 配列の場合
            if isinstance(data, list) and data:
                if isinstance(data[0], dict) and 'datePublished' in data[0]:
                    date_str = data[0]['datePublished']
                    break
    except (json.JSONDecodeError, TypeError): 
        pass # JSONのパースに失敗した場合は無視

    # 2. OGPのメタタグ (article:published_time) を探す
    if not date_str:
        meta_tag = soup.find('meta', property='article:published_time')
        if meta_tag and meta_tag.get('content'):
            date_str = meta_tag.get('content')

    # 3. OGPのメタタグ (og:updated_time) を探す
    if not date_str:
        meta_tag = soup.find('meta', property='og:updated_time')
        if meta_tag and meta_tag.get('content'):
            date_str = meta_tag.get('content')

    # 4. time タグの datetime 属性を探す
    if not date_str:
        time_tag = soup.find('time')
        if time_tag and time_tag.get('datetime'):
            date_str = time_tag.get('datetime')

    # 見つかった日付文字列をパースしてフォーマットする
    if date_str:
        try:
            # ISO 8601形式 (YYYY-MM-DDTHH:MM:SS...) をパース
            dt_object = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt_object.strftime('%Y.%-m')
        except (ValueError, TypeError):
            # YYYY-MM-DD 形式など、他の一般的な形式を試す
            try:
                dt_object = datetime.strptime(date_str.split('T')[0], '%Y-%m-%d')
                return dt_object.strftime('%Y.%-m')
            except (ValueError, TypeError):
                return "" # パース失敗
    
    return "" # 何も見つからなかった場合

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
        
        # 公開日を取得
        production_period = get_publication_date(soup, url)

        return {
            "url": url,
            "title": title.strip() if title else 'No Title Found',
            "description": description.strip() if description else 'No Description Found',
            "image": image,
            "production_period": production_period
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    """
    urls.txtからURLを読み込み、メタデータを取得してworks.jsonに保存する
    手動で入力したデータは保持する
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    urls_file_path = os.path.join(script_dir, 'urls.txt')
    works_json_path = os.path.join(script_dir, 'works.json')

    # 1. 既存のworks.jsonを読み込み、URLをキーにした辞書を作成
    existing_data = {}
    if os.path.exists(works_json_path):
        with open(works_json_path, 'r', encoding='utf-8') as f:
            try:
                for item in json.load(f):
                    if 'url' in item:
                        existing_data[item['url']] = item
            except json.JSONDecodeError:
                print(f"Warning: Could not parse {works_json_path}. It will be overwritten.")

    # 2. urls.txtを読み込む
    if not os.path.exists(urls_file_path):
        print(f"Error: '{urls_file_path}' not found.")
        return
    with open(urls_file_path, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]

    final_data = []
    for url in urls:
        print(f"Processing: {url}")
        
        # 3. URLから新しいデータをスクレイピング
        scraped_data = get_meta_data(url)
        
        # 既存の手動入力データを取得
        manual_data = existing_data.get(url, {})

        if not scraped_data:
            print(f"  -> Scraping failed for {url}.")
            # スクレイピングに失敗しても、既存のデータがあればそれを使う
            if manual_data:
                print("  -> Using existing data.")
                final_data.append(manual_data)
            else:
                print("  -> No existing data. Skipping.")
            continue

        # 4. データをマージ（手動入力を優先）
        #    手動入力フィールドが空でない場合はその値を、空の場合はスクレイピングした値（またはデフォルト値）を使用
        final_item = {
            "image": manual_data.get("image") or scraped_data.get("image", ""),
            "title": manual_data.get("title") or scraped_data.get("title", "No Title Found"),
            "description": manual_data.get("description") or scraped_data.get("description", "No Description Found"),
            "url": url,
            "client": manual_data.get("client", ""),
            "production_period": manual_data.get("production_period") or scraped_data.get("production_period", ""),
            "design": manual_data.get("design", ""),
            "notes": manual_data.get("notes", "")
        }
        final_data.append(final_item)

    # 5. 新しいJSONファイルとして書き出し
    with open(works_json_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully created '{works_json_path}'")
    print(f"Processed {len(final_data)} items.")

if __name__ == '__main__':
    main()
