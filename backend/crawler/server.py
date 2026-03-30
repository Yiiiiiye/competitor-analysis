from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import logging
import traceback

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from crawler import crawl_competitor

app = Flask(__name__)
CORS(app)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crawler.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


@app.route('/api/crawl', methods=['POST'])
def crawl():
    try:
        data = request.json
        logger.info(f"收到爬取请求: {data}")
        
        competitor_data = data.get('competitor')
        
        if not competitor_data:
            logger.error("缺少竞品数据")
            return jsonify({'success': False, 'message': '缺少竞品数据'}), 400
        
        logger.info(f"开始爬取竞品: {competitor_data.get('name')}")
        results = crawl_competitor(competitor_data)
        logger.info(f"爬取完成，获取到 {len(results)} 条数据")
        
        return jsonify({
            'success': True,
            'data': results,
            'count': len(results)
        })
    except Exception as e:
        logger.error(f"爬取失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    logger.info("健康检查请求")
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    logger.info("爬虫服务启动中...")
    app.run(host='127.0.0.1', port=5001, debug=True)
