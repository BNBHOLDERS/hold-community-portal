/**
 * GMGN API 服务
 * 封装所有 GMGN API 调用
 */

const axios = require('axios');

const GMGN_BASE_URL = 'https://openapi.gmgn.ai';
const API_KEY = process.env.GMGN_API_KEY;

class GMGNService {
  /**
   * 发起 API 请求
   */
  async request(endpoint, params = {}) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const client_id = this.generateUUID();

      const queryParams = new URLSearchParams({
        ...params,
        timestamp,
        client_id
      });

      const response = await axios.get(
        `${GMGN_BASE_URL}${endpoint}?${queryParams}`,
        {
          headers: {
            'X-APIKEY': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('GMGN API Error:', error.message);
      throw error;
    }
  }

  /**
   * 生成 UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ========== 代币相关 ==========

  /**
   * 获取代币基础信息
   */
  async getTokenInfo(address, chain = 'bsc') {
    return this.request('/v1/token/info', { address, chain });
  }

  /**
   * 获取代币安全信息
   */
  async getTokenSecurity(address, chain = 'bsc') {
    return this.request('/v1/token/security', { address, chain });
  }

  /**
   * 获取流动性池信息
   */
  async getTokenPool(address, chain = 'bsc') {
    return this.request('/v1/token/pool_info', { address, chain });
  }

  /**
   * 获取 Top 持有者
   */
  async getTokenHolders(address, chain = 'bsc', limit = 20) {
    return this.request('/v1/market/token_top_holders', {
      address,
      chain,
      limit
    });
  }

  /**
   * 获取 Top 交易者
   */
  async getTokenTraders(address, chain = 'bsc', limit = 20) {
    return this.request('/v1/market/token_top_traders', {
      address,
      chain,
      limit
    });
  }

  // ========== 钱包相关 ==========

  /**
   * 获取钱包持仓
   */
  async getWalletHoldings(walletAddress, chain = 'bsc') {
    return this.request('/v1/user/wallet_holdings', {
      chain,
      wallet_address: walletAddress
    });
  }

  /**
   * 获取钱包交易记录
   */
  async getWalletActivity(walletAddress, chain = 'bsc', limit = 50) {
    return this.request('/v1/user/wallet_activity', {
      chain,
      wallet_address: walletAddress,
      limit
    });
  }

  /**
   * 获取钱包统计
   */
  async getWalletStats(walletAddress, chain = 'bsc', period = '7d') {
    return this.request('/v1/user/wallet_stats', {
      chain,
      wallet_address: walletAddress,
      period
    });
  }

  /**
   * 获取钱包代币余额
   */
  async getWalletTokenBalance(walletAddress, tokenAddress, chain = 'bsc') {
    return this.request('/v1/user/wallet_token_balance', {
      chain,
      wallet_address: walletAddress,
      token_address: tokenAddress
    });
  }

  // ========== 市场相关 ==========

  /**
   * 获取热门代币榜单
   */
  async getTrending(chain = 'bsc', interval = '24h', limit = 10) {
    return this.request('/v1/market/rank', {
      chain,
      interval,
      limit
    });
  }

  /**
   * 获取 KOL 列表
   */
  async getKOLs(chain = 'bsc', limit = 20) {
    return this.request('/v1/user/kol', {
      chain,
      limit
    });
  }

  /**
   * 获取聪明钱列表
   */
  async getSmartMoney(chain = 'bsc', limit = 20) {
    return this.request('/v1/user/smartmoney', {
      chain,
      limit
    });
  }
}

module.exports = new GMGNService();
