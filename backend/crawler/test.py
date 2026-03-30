import requests
import json

test_data = {
    "competitor": {
        "_id": "test123",
        "name": "测试竞品",
        "socialAccounts": {
            "weibo": {
                "enabled": True,
                "accountId": "1739046297"
            },
            "douyin": {
                "enabled": False,
                "accountId": ""
            },
            "xiaohongshu": {
                "enabled": False,
                "accountId": ""
            },
            "bilibili": {
                "enabled": False,
                "accountId": ""
            }
        }
    }
}

try:
    print("发送请求到爬虫服务...")
    response = requests.post(
        'http://127.0.0.1:5001/api/crawl',
        json=test_data,
        timeout=30
    )
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"错误: {e}")
