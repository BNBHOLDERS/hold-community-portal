/**
 * Binance Web3 Skills 服务
 * 官方 API: 代币信息、安全审计、钱包查询、聪明钱信号
 */

const axios = require('axios');

const BASE_URL = 'https://web3.binance.com/bapi/defi';
const USER_AGENT = 'binance-web3/1.1 (Skill)';

class BinanceWeb3Service {
  /**
   * 代币搜索
   */
  async searchTokens(keyword, chainIds = '56,8453,CT_501') {
    try {
      const response = await axios.get(
        `${BASE_URL}/v5/public/wallet-direct/buw/wallet/market/token/search/ai`,
        {
          params: { keyword, chainIds, orderBy: 'volume24h' },
          headers: {
            'Accept-Encoding': 'identity',
            'User-Agent': USER_AGENT
          }
        }
      );
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Token Search Error:', error.message);
      throw error;
    }
  }

  /**
   * 获取代币元数据
   */
  async getTokenMetadata(chainId, contractAddress) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v1/public/wallet-direct/buw/wallet/dex/market/token/meta/info/ai`,
        {
          params: { chainId, contractAddress },
          headers: {
            'Accept-Encoding': 'identity',
            'User-Agent': USER_AGENT
          }
        }
      );
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Token Metadata Error:', error.message);
      throw error;
    }
  }

  /**
   * 获取代币动态数据（价格、交易量等）
   */
  async getTokenDynamic(chainId, contractAddress) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v4/public/wallet-direct/buw/wallet/market/token/dynamic/info/ai`,
        {
          params: { chainId, contractAddress },
          headers: {
            'Accept-Encoding': 'identity',
            'User-Agent': USER_AGENT
          }
        }
      );
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Token Dynamic Error:', error.message);
      throw error;
    }
  }

  /**
   * 代币安全审计（蜜罐检测）
   */
  async auditToken(chainId, contractAddress) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/public/wallet-direct/security/token/audit`,
        {
          binanceChainId: chainId,
          contractAddress,
          requestId: this.generateUUID()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'source': 'agent',
            'Accept-Encoding': 'identity',
            'User-Agent': 'binance-web3/1.4 (Skill)'
          }
        }
      );
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Token Audit Error:', error.message);
      throw error;
    }
  }

  /**
   * 查询钱包持仓
   */
  async getWalletHoldings(address, chainId = '56', offset = 0) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v3/public/wallet-direct/buw/wallet/address/pnl/active-position-list/ai`,
        {
          params: { address, chainId, offset },
          headers: {
            'clienttype': 'web',
            'clientversion': '1.2.0',
            'Accept-Encoding': 'identity',
            'User-Agent': USER_AGENT
          }
        }
      );
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Wallet Holdings Error:', error.message);
      throw error;
    }
  }

  /**
   * 获取聪明钱信号
   */
  async getSmartMoneySignals(chainId = 'CT_501', page = 1, pageSize = 20) {
    try {
      const response = await axios.post(
        `${BASE_URL}/v1/public/wallet-direct/buw/wallet/web/signal/smart-money/ai`,
        {
          smartSignalType: '',
          page,
          pageSize,
          chainId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'identity',
            'User-Agent': USER_AGENT
          }
        }
      );
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Smart Money Signals Error:', error.message);
      throw error;
    }
  }

  /**
   * 获取加密市场排行
   */
  async getMarketRank(chainId = '56', sortField = 'volume24h', page = 1, pageSize = 50) {
    try {
      const response = await axios.get(
        `${BASE_URL}/v1/public/wallet-direct/buw/wallet/market/token/rank/ai`,
        {
          params: { chainId, sortField, page, pageSize },
          headers: {
            'Accept-Encoding': 'identity',
            'User-Agent': USER_AGENT
          }
        }
      );
      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Market Rank Error:', error.message);
      throw error;
    }
  }

  /**
   * 综合代币分析（组合多个 API）
   */
  async analyzeTokenFull(chainId, contractAddress) {
    try {
      const [metadata, dynamic, audit] = await Promise.all([
        this.getTokenMetadata(chainId, contractAddress).catch(() => null),
        this.getTokenDynamic(chainId, contractAddress).catch(() => null),
        this.auditToken(chainId, contractAddress).catch(() => null)
      ]);

      return {
        success: true,
        data: {
          metadata: metadata?.data || null,
          dynamic: dynamic?.data || null,
          audit: audit?.data || null
        }
      };
    } catch (error) {
      console.error('Full Token Analysis Error:', error.message);
      throw error;
    }
  }

  /**
   * 格式化响应
   */
  formatResponse(response) {
    if (response?.code === '000000' || response?.success === true) {
      return { success: true, data: response.data };
    }
    return { success: false, error: response?.message || 'API request failed' };
  }

  /**
   * 生成 UUID v4
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 风险等级转换
   */
  getRiskLevelInfo(riskLevel) {
    const levels = {
      0: { level: 'LOW', text: '低风险', color: 'green', action: '谨慎参与' },
      1: { level: 'LOW', text: '低风险', color: 'green', action: '谨慎参与' },
      2: { level: 'MEDIUM', text: '中风险', color: 'yellow', action: '仔细评估' },
      3: { level: 'MEDIUM', text: '中风险', color: 'yellow', action: '仔细评估' },
      4: { level: 'HIGH', text: '高风险', color: 'red', action: '建议避免' },
      5: { level: 'HIGH', text: '极高风险', color: 'red', action: '禁止交易' }
    };
    return levels[riskLevel] || levels[0];
  }
}

module.exports = new BinanceWeb3Service();
