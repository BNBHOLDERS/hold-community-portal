/**
 * HOLD 社区门户 - AI 工具功能
 */

// 聊天历史记录
let chatHistory = [];

// ========== AI 工具模态框 ==========
function showToolModal(title, content) {
    const modal = document.getElementById('toolModal');
    const titleEl = document.getElementById('toolModalTitle');
    const contentEl = document.getElementById('toolModalContent');

    if (modal && titleEl && contentEl) {
        titleEl.textContent = title;
        contentEl.innerHTML = content;
        modal.classList.remove('hidden');
    }
}

function closeToolModal() {
    const modal = document.getElementById('toolModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ========== AI 工具函数 ==========
function rugCheck() {
    showToolModal('RUG 检测', `
        <p class="mb-4">输入代币合约地址，AI 帮你检测是否为 RUG：</p>
        <input type="text" id="rugAddress" placeholder="0x..." class="input-base w-full mb-3">
        <button onclick="doRugCheck()" class="btn-primary w-full py-2.5 rounded-xl text-sm">开始检测</button>
        <div id="rugResult" class="mt-4 hidden"></div>
    `);
}

function holderAnalysis() {
    showToolModal('持仓分析', `
        <p class="mb-4">输入代币地址，分析 Top Holders 分布：</p>
        <input type="text" id="holderToken" placeholder="0x..." class="input-base w-full mb-3">
        <button onclick="doHolderAnalysis()" class="btn-primary w-full py-2.5 rounded-xl text-sm">分析持仓</button>
        <div id="holderResult" class="mt-4 hidden"></div>
    `);
}

function tradeAssistant() {
    showToolModal('交易助手', `
        <div class="space-y-3">
            <p class="font-medium">你想了解什么？</p>
            <button onclick="getTradeAdvice('entry')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">🟢 买入时机判断</button>
            <button onclick="getTradeAdvice('exit')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">🔴 卖出时机判断</button>
            <button onclick="getTradeAdvice('position')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">⚖️ 仓位管理建议</button>
            <button onclick="getTradeAdvice('psychology')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">🧠 交易心理指导</button>
        </div>
    `);
}

function safetyScore() {
    showToolModal('安全评分', `
        <p class="mb-4">输入代币地址，获取综合安全评分：</p>
        <input type="text" id="safetyToken" placeholder="0x..." class="input-base w-full mb-3">
        <button onclick="doSafetyCheck()" class="btn-primary w-full py-2.5 rounded-xl text-sm">获取评分</button>
        <div id="safetyResult" class="mt-4 hidden"></div>
    `);
}

function newbieGuide() {
    showToolModal('新手指引', `
        <div class="space-y-3">
            <p class="font-medium mb-2">选择学习路径：</p>
            <button onclick="showGuide('basic')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">📚 基础知识（什么是币、链、钱包）</button>
            <button onclick="showGuide('bscscan')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">🔍 如何看 BscScan</button>
            <button onclick="showGuide('dexscreener')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">📊 如何看 DEX Screener</button>
            <button onclick="showGuide('security')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">🛡️ 安全基础与防骗</button>
        </div>
    `);
}

function mindset() {
    showToolModal('心态修炼', `
        <div class="space-y-3">
            <p class="font-medium mb-2">选择主题：</p>
            <button onclick="showMindset('fomo')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">😰 如何克服 FOMO</button>
            <button onclick="showMindset('loss')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">📉 亏损后如何调整</button>
            <button onclick="showMindset('patience')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">🧘 修炼耐心与纪律</button>
            <button onclick="showMindset('growth')" class="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-yellow-50 transition">📈 成长型思维培养</button>
        </div>
    `);
}

// ========== AI API 调用 ==========

// 代币分析
async function analyzeToken(btn) {
    const input = document.getElementById('tokenAddress');
    const resultContainer = document.getElementById('tokenResult');

    const address = input?.value?.trim();
    if (!address) {
        window.UI?.showToast('请输入代币地址', 'warning');
        return;
    }

    const originalText = btn.textContent;
    btn.textContent = '分析中...';
    btn.disabled = true;

    if (resultContainer) {
        resultContainer.classList.remove('hidden');
        resultContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';
    }

    try {
        const data = await window.API.AI.analyzeToken(address);

        if (resultContainer && data.success && data.data) {
            resultContainer.innerHTML = formatTokenResult(data.data);
        }
        window.UI?.showToast('分析完成', 'success');
    } catch (error) {
        if (resultContainer) {
            resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">分析失败</div>';
        }
        window.UI?.showToast('分析失败', 'error');
    }

    btn.textContent = originalText;
    btn.disabled = false;
}

// 钱包诊断
async function diagnoseWallet(btn) {
    const input = document.getElementById('walletAddress');
    const resultContainer = document.getElementById('walletResult');

    const address = input?.value?.trim();
    if (!address) {
        window.UI?.showToast('请输入钱包地址', 'warning');
        return;
    }

    const originalText = btn.textContent;
    btn.textContent = '分析中...';
    btn.disabled = true;

    if (resultContainer) {
        resultContainer.classList.remove('hidden');
        resultContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';
    }

    try {
        const data = await window.API.AI.diagnoseWallet(address);

        if (resultContainer && data.success && data.data) {
            resultContainer.innerHTML = formatWalletResult(data.data);
        }
        window.UI?.showToast('诊断完成', 'success');
    } catch (error) {
        if (resultContainer) {
            resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">诊断失败</div>';
        }
        window.UI?.showToast('诊断失败', 'error');
    }

    btn.textContent = originalText;
    btn.disabled = false;
}

// 格式化钱包诊断结果
function formatWalletResult(data) {
    return `
        <div class="space-y-3">
            <div class="p-3 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">钱包地址</div>
                <div class="font-mono text-sm">${data.address || 'N/A'}</div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="p-2 bg-gray-50 rounded text-center">
                    <div class="text-xs text-gray-500">交易次数</div>
                    <div class="font-medium">${data.txCount || '0'}</div>
                </div>
                <div class="p-2 bg-gray-50 rounded text-center">
                    <div class="text-xs text-gray-500">首次交易</div>
                    <div class="font-medium">${data.firstTx || 'N/A'}</div>
                </div>
            </div>
            <div class="text-sm text-gray-600">${data.summary || '暂无分析数据'}</div>
        </div>
    `;
}

// 格式化代币分析结果
function formatTokenResult(data) {
    const score = data.score || 0;
    return `
        <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium">安全评分</span>
                <span class="font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}">${score}/100</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div class="p-2 bg-gray-50 rounded text-center">
                    <div class="text-xs text-gray-500">流动性</div>
                    <div class="font-medium">$${data.liquidity || 'N/A'}</div>
                </div>
                <div class="p-2 bg-gray-50 rounded text-center">
                    <div class="text-xs text-gray-500">持有人</div>
                    <div class="font-medium">${data.holders || 'N/A'}</div>
                </div>
            </div>
            <div class="text-sm text-gray-600">${data.warning || '请自行研究后投资'}</div>
        </div>
    `;
}

// RUG 检测
async function doRugCheck() {
    const address = document.getElementById('rugAddress')?.value;
    const resultContainer = document.getElementById('rugResult');

    if (!address || !resultContainer) return;

    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.AI.analyzeToken(address);
        if (data.success && data.data) {
            const result = data.data;
            resultContainer.innerHTML = `
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 rounded-lg ${result.isHoneypot ? 'bg-red-50' : 'bg-green-50'}">
                        <span class="font-medium">检测结果</span>
                        <span class="${result.isHoneypot ? 'text-red-500' : 'text-green-500'}">${result.isHoneypot ? '⚠️ 可能是蜜罐' : '✅ 看起来安全'}</span>
                    </div>
                    <div class="text-sm text-gray-600">${result.warning || result.reason || '请自行研究后投资'}</div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">分析失败</div>';
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">检测失败</div>';
    }
}

// 持仓分析
async function doHolderAnalysis() {
    const token = document.getElementById('holderToken')?.value;
    const resultContainer = document.getElementById('holderResult');

    if (!token || !resultContainer) return;

    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.AI.analyzeToken(token);
        if (data.success && data.data) {
            const holders = data.data.topHolders || [];
            resultContainer.innerHTML = `
                <div class="space-y-2">
                    <div class="text-sm font-medium mb-2">Top 10 持仓地址</div>
                    ${holders.length > 0 ? holders.map((h, i) => `
                        <div class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span class="text-gray-500">#${i + 1}</span>
                            <span class="flex-1 truncate px-2">${h.address?.slice(0, 8)}...${h.address?.slice(-6)}</span>
                            <span>${h.percentage || h.balance || '0'}%</span>
                        </div>
                    `).join('') : '<div class="text-center text-gray-400 py-2">暂无持仓数据</div>'}
                </div>
            `;
        } else {
            resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">分析失败</div>';
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">分析失败</div>';
    }
}

// 安全检查
async function doSafetyCheck() {
    const token = document.getElementById('safetyToken')?.value;
    const resultContainer = document.getElementById('safetyResult');

    if (!token || !resultContainer) return;

    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.AI.analyzeToken(token);
        if (data.success && data.data) {
            const score = data.data.safetyScore || calculateSafetyScore(data.data);
            resultContainer.innerHTML = `
                <div class="space-y-3">
                    <div class="text-center">
                        <div class="text-4xl font-bold ${score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'}">${score}/100</div>
                        <div class="text-sm text-gray-500 mt-1">安全评分</div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="p-2 bg-gray-50 rounded text-center">
                            <div class="text-gray-500">流动性</div>
                            <div class="font-medium">${data.data.liquidity || 'N/A'}</div>
                        </div>
                        <div class="p-2 bg-gray-50 rounded text-center">
                            <div class="text-gray-500">持有人</div>
                            <div class="font-medium">${data.data.holderCount || data.data.holders || 'N/A'}</div>
                        </div>
                        <div class="p-2 bg-gray-50 rounded text-center">
                            <div class="text-gray-500">交易税</div>
                            <div class="font-medium">${data.data.buyTax || data.data.sellTax || 'N/A'}</div>
                        </div>
                        <div class="p-2 bg-gray-50 rounded text-center">
                            <div class="text-gray-500">合约验证</div>
                            <div class="font-medium ${data.data.verified ? 'text-green-500' : 'text-red-500'}">${data.data.verified ? '✅ 已验证' : '⚠️ 未验证'}</div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">${data.data.warning || '请自行研究后投资'}</div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">检查失败</div>';
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">检查失败</div>';
    }
}

// 计算安全评分
function calculateSafetyScore(data) {
    let score = 50;
    if (!data.isHoneypot) score += 20;
    if (data.verified) score += 15;
    if (data.liquidity && parseFloat(data.liquidity) > 10000) score += 10;
    if (data.holderCount && data.holderCount > 100) score += 5;
    const tax = Math.max(
        parseFloat(data.buyTax) || 0,
        parseFloat(data.sellTax) || 0
    );
    if (tax <= 5) score += 10;
    else if (tax <= 10) score += 5;
    else if (tax > 15) score -= 10;
    return Math.min(100, Math.max(0, score));
}

// 交易建议
function getTradeAdvice(type) {
    const advices = {
        entry: {
            title: '买入时机建议',
            content: `
                <ul class="space-y-2 text-sm">
                    <li>✓ 等待回调到支撑位再入场</li>
                    <li>✓ 关注成交量放大信号</li>
                    <li>✓ 设置止损点位</li>
                    <li>✓ 分批建仓，降低风险</li>
                </ul>
            `
        },
        exit: {
            title: '卖出时机建议',
            content: `
                <ul class="space-y-2 text-sm">
                    <li>✓ 达到预期收益目标</li>
                    <li>✓ 技术指标背离信号</li>
                    <li>✓ 成交量异常放大</li>
                    <li>✓ 分批止盈，保留利润</li>
                </ul>
            `
        },
        position: {
            title: '仓位管理建议',
            content: `
                <ul class="space-y-2 text-sm">
                    <li>✓ 单笔投资不超过总资金的 10%</li>
                    <li>✓ 高风险项目仓位控制在 5% 以内</li>
                    <li>✓ 留有现金储备应对机会</li>
                    <li>✓ 根据市场波动调整仓位</li>
                </ul>
            `
        },
        psychology: {
            title: '交易心理指导',
            content: `
                <ul class="space-y-2 text-sm">
                    <li>✓ 制定交易计划并严格执行</li>
                    <li>✓ 接受亏损是交易的一部分</li>
                    <li>✓ 避免情绪化交易决策</li>
                    <li>✓ 保持学习和反思的习惯</li>
                </ul>
            `
        }
    };

    const advice = advices[type];
    if (advice) {
        showToolModal(advice.title, `<div class="py-4">${advice.content}</div>`);
    }
}

// 新手指南
function showGuide(type) {
    const guides = {
        basic: {
            title: '基础知识',
            content: `
                <div class="space-y-4 text-sm">
                    <div>
                        <div class="font-medium mb-2">什么是币？</div>
                        <p class="text-gray-600">加密货币是使用密码学技术保护的数字资产，基于区块链技术运行。</p>
                    </div>
                    <div>
                        <div class="font-medium mb-2">什么是链？</div>
                        <p class="text-gray-600">区块链是分布式账本技术，常见的有以太坊、BSC、Solana 等。</p>
                    </div>
                    <div>
                        <div class="font-medium mb-2">什么是钱包？</div>
                        <p class="text-gray-600">加密钱包用于存储和管理你的数字资产，如 MetaMask、Trust Wallet 等。</p>
                    </div>
                </div>
            `
        },
        bscscan: {
            title: '如何看 BscScan',
            content: `
                <div class="space-y-3 text-sm">
                    <div>1. 访问 bscscan.com</div>
                    <div>2. 输入代币合约地址搜索</div>
                    <div>3. 查看"Contract"标签页确认合约代码</div>
                    <div>4. 查看"Holders"了解持仓分布</div>
                    <div>5. 查看"Transactions"追踪交易记录</div>
                </div>
            `
        },
        dexscreener: {
            title: '如何看 DEX Screener',
            content: `
                <div class="space-y-3 text-sm">
                    <div>1. 访问 dexscreener.com</div>
                    <div>2. 搜索代币名称或地址</div>
                    <div>3. 关注价格走势图</div>
                    <div>4. 查看交易量和流动性</div>
                    <div>5. 检查 Top Traders 活动</div>
                </div>
            `
        },
        security: {
            title: '安全基础与防骗',
            content: `
                <div class="space-y-3 text-sm">
                    <div>⚠️ 永远不要分享你的私钥</div>
                    <div>⚠️ 警惕"高收益、零风险"的项目</div>
                    <div>⚠️ 投资前查看合约审计报告</div>
                    <div>⚠️ 使用硬件钱包存储大额资产</div>
                    <div>⚠️ 确认官网 URL，警惕钓鱼网站</div>
                </div>
            `
        }
    };

    const guide = guides[type];
    if (guide) {
        showToolModal(guide.title, `<div class="py-4">${guide.content}</div>`);
    }
}

// 心态修炼
function showMindset(type) {
    const mindsets = {
        fomo: {
            title: '如何克服 FOMO',
            content: `
                <div class="space-y-3 text-sm">
                    <div>1. 制定交易计划，坚持执行</div>
                    <div>2. 接受错过机会是正常的</div>
                    <div>3. 专注于长期策略而非短期波动</div>
                    <div>4. 限制每天的交易次数</div>
                    <div>5. 记录交易日记，反思决策</div>
                </div>
            `
        },
        loss: {
            title: '亏损后如何调整',
            content: `
                <div class="space-y-3 text-sm">
                    <div>1. 接受亏损，不要情绪化</div>
                    <div>2. 暂停交易，冷静分析原因</div>
                    <div>3. 复盘交易决策，找出问题</div>
                    <div>4. 调整仓位和风险策略</div>
                    <div>5. 保持学习，持续改进</div>
                </div>
            `
        },
        patience: {
            title: '修炼耐心与纪律',
            content: `
                <div class="space-y-3 text-sm">
                    <div>1. 等待确认信号再入场</div>
                    <div>2. 不要频繁查看价格</div>
                    <div>3. 设置止盈止损并遵守</div>
                    <div>4. 培养长期投资思维</div>
                    <div>5. 定期回顾和调整策略</div>
                </div>
            `
        },
        growth: {
            title: '成长型思维培养',
            content: `
                <div class="space-y-3 text-sm">
                    <div>1. 把每次亏损视为学习机会</div>
                    <div>2. 相信能力可以通过努力提升</div>
                    <div>3. 主动寻求反馈和建议</div>
                    <div>4. 保持好奇心和探索精神</div>
                    <div>5. 庆祝进步，而非只看结果</div>
                </div>
            `
        }
    };

    const mindset = mindsets[type];
    if (mindset) {
        showToolModal(mindset.title, `<div class="py-4">${mindset.content}</div>`);
    }
}

// ========== AI 聊天 ==========
function toggleAIChat() {
    const chatWindow = document.getElementById('aiChatWindow');
    const fab = document.getElementById('aiFab');

    if (chatWindow && fab) {
        chatWindow.classList.toggle('open');
        fab.classList.toggle('hidden');
    }
}

async function sendAIMessage(btn) {
    const input = document.getElementById('aiChatInput');
    const messagesContainer = document.getElementById('aiChatMessages');
    const message = input?.value?.trim();

    if (!message || !messagesContainer) return;

    // 添加用户消息
    messagesContainer.innerHTML += `
        <div class="chat-message flex justify-end mb-4">
            <div class="bg-[#F3BA2F] text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                ${window.UI?.escapeHtml(message) || message}
            </div>
        </div>
    `;

    input.value = '';

    // 显示加载状态
    messagesContainer.innerHTML += `
        <div class="chat-message flex justify-start mb-4" id="aiTyping">
            <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                <div class="loading-dots"><span>●</span><span>●</span><span>●</span></div>
            </div>
        </div>
    `;

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: chatHistory })
        });
        const data = await response.json();

        // 移除加载状态
        const typingIndicator = document.getElementById('aiTyping');
        if (typingIndicator) typingIndicator.remove();

        // 添加 AI 回复
        if (data.data?.reply) {
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: data.data.reply });

            messagesContainer.innerHTML += `
                <div class="chat-message flex justify-start mb-4">
                    <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                        ${window.UI?.escapeHtml(data.data.reply)}
                    </div>
                </div>
            `;
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        const typingIndicator = document.getElementById('aiTyping');
        if (typingIndicator) typingIndicator.remove();
        window.UI?.showToast('消息发送失败', 'error');
    }
}

// 导出 AI 模块
window.AI = {
    rugCheck,
    holderAnalysis,
    tradeAssistant,
    safetyScore,
    newbieGuide,
    mindset,
    showToolModal,
    closeToolModal,
    analyzeToken,
    diagnoseWallet,
    doRugCheck,
    doHolderAnalysis,
    doSafetyCheck,
    getTradeAdvice,
    showGuide,
    showMindset,
    toggleAIChat,
    sendAIMessage
};

// 导出函数到 window（供 HTML 调用）
window.rugCheck = rugCheck;
window.holderAnalysis = holderAnalysis;
window.tradeAssistant = tradeAssistant;
window.safetyScore = safetyScore;
window.newbieGuide = newbieGuide;
window.mindset = mindset;
window.analyzeToken = analyzeToken;
window.diagnoseWallet = diagnoseWallet;
window.closeToolModal = closeToolModal;
window.toggleAIChat = toggleAIChat;
window.sendAIMessage = sendAIMessage;
window.doRugCheck = doRugCheck;
window.doHolderAnalysis = doHolderAnalysis;
window.doSafetyCheck = doSafetyCheck;
window.getTradeAdvice = getTradeAdvice;
window.showGuide = showGuide;
window.showMindset = showMindset;
