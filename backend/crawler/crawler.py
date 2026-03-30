import requests
import json
import datetime
import logging
from typing import List, Dict, Optional
from abc import ABC, abstractmethod

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaseCrawler(ABC):
    
    def __init__(self, account_id: str):
        self.account_id = account_id
    
    @abstractmethod
    def fetch_posts(self, limit: int = 10) -> List[Dict]:
        pass
    
    @abstractmethod
    def parse_post(self, raw_data: Dict) -> Dict:
        pass


class WeiboCrawler(BaseCrawler):
    
    def __init__(self, account_id: str):
        super().__init__(account_id)
        self.base_url = "https://weibo.com/ajax/statuses/mymblog"
    
    def fetch_posts(self, limit: int = 10) -> List[Dict]:
        try:
            logger.info(f"[微博] 开始爬取账号: {self.account_id}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            params = {
                'uid': self.account_id,
                'page': 1,
                'feature': 0
            }
            logger.info(f"[微博] 请求URL: {self.base_url}")
            logger.info(f"[微博] 请求参数: {params}")
            
            response = requests.get(self.base_url, headers=headers, params=params, timeout=10)
            logger.info(f"[微博] 响应状态码: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"[微博] 响应数据结构: {list(data.keys()) if isinstance(data, dict) else type(data)}")
                posts = data.get('data', {}).get('list', [])
                logger.info(f"[微博] 获取到 {len(posts)} 条数据")
                return posts[:limit]
            logger.warning(f"[微博] 请求失败，状态码: {response.status_code}")
            return []
        except Exception as e:
            logger.error(f"[微博] 爬取错误: {e}")
            return []
    
    def parse_post(self, raw_data: Dict) -> Optional[Dict]:
        try:
            return {
                'title': raw_data.get('text', '')[:100],
                'content': raw_data.get('text', ''),
                'publishTime': datetime.datetime.fromtimestamp(raw_data.get('created_at', 0)),
                'url': f"https://weibo.com/{self.account_id}/{raw_data.get('bid', '')}",
                'likes': raw_data.get('attitudes_count', 0),
                'comments': raw_data.get('comments_count', 0),
                'reposts': raw_data.get('reposts_count', 0)
            }
        except Exception as e:
            logger.error(f"[微博] 数据解析错误: {e}")
            return None


class DouyinCrawler(BaseCrawler):
    
    def __init__(self, account_id: str):
        super().__init__(account_id)
        self.base_url = "https://www.douyin.com/aweme/v1/web/aweme/post/"
    
    def fetch_posts(self, limit: int = 10) -> List[Dict]:
        try:
            logger.info(f"[抖音] 开始爬取账号: {self.account_id}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            params = {
                'user_id': self.account_id,
                'count': limit,
                'max_cursor': 0
            }
            logger.info(f"[抖音] 请求URL: {self.base_url}")
            
            response = requests.get(self.base_url, headers=headers, params=params, timeout=10)
            logger.info(f"[抖音] 响应状态码: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                posts = data.get('aweme_list', [])
                logger.info(f"[抖音] 获取到 {len(posts)} 条数据")
                return posts[:limit]
            logger.warning(f"[抖音] 请求失败，状态码: {response.status_code}")
            return []
        except Exception as e:
            logger.error(f"[抖音] 爬取错误: {e}")
            return []
    
    def parse_post(self, raw_data: Dict) -> Optional[Dict]:
        try:
            desc = raw_data.get('desc', '')
            return {
                'title': desc[:100],
                'content': desc,
                'publishTime': datetime.datetime.fromtimestamp(raw_data.get('create_time', 0)),
                'url': f"https://www.douyin.com/video/{raw_data.get('aweme_id', '')}",
                'likes': raw_data.get('statistics', {}).get('digg_count', 0),
                'comments': raw_data.get('statistics', {}).get('comment_count', 0),
                'shares': raw_data.get('statistics', {}).get('share_count', 0)
            }
        except Exception as e:
            logger.error(f"[抖音] 数据解析错误: {e}")
            return None


class XiaohongshuCrawler(BaseCrawler):
    
    def __init__(self, account_id: str):
        super().__init__(account_id)
        self.base_url = "https://edith.xiaohongshu.com/api/sns/web/v1/user_posted"
    
    def fetch_posts(self, limit: int = 10) -> List[Dict]:
        try:
            logger.info(f"[小红书] 开始爬取账号: {self.account_id}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            params = {
                'num': limit,
                'cursor': '',
                'user_id': self.account_id
            }
            logger.info(f"[小红书] 请求URL: {self.base_url}")
            
            response = requests.get(self.base_url, headers=headers, params=params, timeout=10)
            logger.info(f"[小红书] 响应状态码: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                posts = data.get('data', {}).get('notes', [])
                logger.info(f"[小红书] 获取到 {len(posts)} 条数据")
                return posts[:limit]
            logger.warning(f"[小红书] 请求失败，状态码: {response.status_code}")
            return []
        except Exception as e:
            logger.error(f"[小红书] 爬取错误: {e}")
            return []
    
    def parse_post(self, raw_data: Dict) -> Optional[Dict]:
        try:
            note_card = raw_data.get('note_card', {})
            return {
                'title': note_card.get('title', ''),
                'content': note_card.get('desc', ''),
                'publishTime': datetime.datetime.fromtimestamp(note_card.get('time', 0) / 1000),
                'url': f"https://www.xiaohongshu.com/explore/{note_card.get('note_id', '')}",
                'likes': note_card.get('interact_info', {}).get('liked_count', 0),
                'comments': note_card.get('interact_info', {}).get('comment_count', 0),
                'collects': note_card.get('interact_info', {}).get('collect_count', 0)
            }
        except Exception as e:
            logger.error(f"[小红书] 数据解析错误: {e}")
            return None


class BilibiliCrawler(BaseCrawler):
    
    def __init__(self, account_id: str):
        super().__init__(account_id)
        self.base_url = f"https://api.bilibili.com/x/space/arc/search"
    
    def fetch_posts(self, limit: int = 10) -> List[Dict]:
        try:
            logger.info(f"[B站] 开始爬取账号: {self.account_id}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            params = {
                'mid': self.account_id,
                'ps': limit,
                'pn': 1
            }
            logger.info(f"[B站] 请求URL: {self.base_url}")
            
            response = requests.get(self.base_url, headers=headers, params=params, timeout=10)
            logger.info(f"[B站] 响应状态码: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('code') == 0:
                    posts = data.get('data', {}).get('list', {}).get('vlist', [])
                    logger.info(f"[B站] 获取到 {len(posts)} 条数据")
                    return posts[:limit]
                logger.warning(f"[B站] API返回错误: {data.get('message', '未知错误')}")
            logger.warning(f"[B站] 请求失败，状态码: {response.status_code}")
            return []
        except Exception as e:
            logger.error(f"[B站] 爬取错误: {e}")
            return []
    
    def parse_post(self, raw_data: Dict) -> Optional[Dict]:
        try:
            return {
                'title': raw_data.get('title', ''),
                'content': raw_data.get('description', ''),
                'publishTime': datetime.datetime.fromtimestamp(raw_data.get('created', 0)),
                'url': f"https://www.bilibili.com/video/{raw_data.get('bvid', '')}",
                'views': raw_data.get('play', 0),
                'likes': raw_data.get('like', 0),
                'comments': raw_data.get('comment', 0)
            }
        except Exception as e:
            logger.error(f"[B站] 数据解析错误: {e}")
            return None


class CrawlerFactory:
    
    @staticmethod
    def create_crawler(platform: str, account_id: str) -> Optional[BaseCrawler]:
        crawlers = {
            'weibo': WeiboCrawler,
            'douyin': DouyinCrawler,
            'xiaohongshu': XiaohongshuCrawler,
            'bilibili': BilibiliCrawler
        }
        crawler_class = crawlers.get(platform.lower())
        if crawler_class:
            return crawler_class(account_id)
        return None


class CompetitorCrawler:
    
    def __init__(self, competitor_data: Dict):
        self.competitor_id = competitor_data.get('_id')
        self.competitor_name = competitor_data.get('name')
        self.social_accounts = competitor_data.get('socialAccounts', {})
        self.results = []
        logger.info(f"[竞品爬虫] 初始化爬虫 - 竞品: {self.competitor_name}, ID: {self.competitor_id}")
        logger.info(f"[竞品爬虫] 社交媒体配置: {self.social_accounts}")
    
    def crawl_all_platforms(self) -> List[Dict]:
        platform_mapping = {
            'weibo': '微博',
            'douyin': '抖音',
            'xiaohongshu': '小红书',
            'bilibili': 'B站'
        }
        
        logger.info(f"[竞品爬虫] 开始爬取所有平台")
        
        for platform, account_info in self.social_accounts.items():
            logger.info(f"[竞品爬虫] 检查平台: {platform}, 配置: {account_info}")
            
            if account_info.get('enabled') and account_info.get('accountId'):
                logger.info(f"[竞品爬虫] 平台 {platform} 已启用，账号ID: {account_info.get('accountId')}")
                
                crawler = CrawlerFactory.create_crawler(platform, account_info['accountId'])
                if crawler:
                    logger.info(f"[竞品爬虫] 创建 {platform} 爬虫成功")
                    raw_posts = crawler.fetch_posts(limit=10)
                    logger.info(f"[竞品爬虫] {platform} 获取到 {len(raw_posts)} 条原始数据")
                    
                    for raw_post in raw_posts:
                        parsed_post = crawler.parse_post(raw_post)
                        if parsed_post:
                            parsed_post['competitorId'] = self.competitor_id
                            parsed_post['competitorName'] = self.competitor_name
                            parsed_post['channel'] = platform_mapping.get(platform, platform)
                            self.results.append(parsed_post)
                            logger.info(f"[竞品爬虫] 成功解析一条 {platform} 动态")
                        else:
                            logger.warning(f"[竞品爬虫] {platform} 数据解析失败")
                else:
                    logger.warning(f"[竞品爬虫] 无法创建 {platform} 爬虫")
            else:
                logger.info(f"[竞品爬虫] 平台 {platform} 未启用或账号ID为空")
        
        logger.info(f"[竞品爬虫] 爬取完成，总共获取到 {len(self.results)} 条数据")
        return self.results
    
    def get_results(self) -> List[Dict]:
        return self.results


def crawl_competitor(competitor_data: Dict) -> List[Dict]:
    logger.info(f"[竞品爬虫] 开始爬取竞品: {competitor_data.get('name')}")
    crawler = CompetitorCrawler(competitor_data)
    results = crawler.crawl_all_platforms()
    logger.info(f"[竞品爬虫] 竞品爬取完成，返回 {len(results)} 条数据")
    return results
