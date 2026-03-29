/**
 * HOLD 社区门户 - Binance Web3 功能
 */

// ========== Binance Skills 模态框 ==========
async function openBinanceSkill(skill) {
    const modal = document.getElementById('binanceSkillModal');
    const title = document.getElementById('binanceSkillTitle');
    const content = document.getElementById('binanceSkillContent');

    if (!modal || !title || !content) return;
    modal.classList.remove('hidden');

    switch(skill) {
        case 'search':
            title.textContent = '🔍 代币搜索';
            content.innerHTML = `
                <p class="text-gray-600 mb-4">搜索代币名称、符号或合约地址</p>
                <div class="flex gap-2 mb-4">
                    <select id="searchChain" class="input-base">
                        <option value="56,8453,CT_501">全部链</option>
                        <option value="56">BSC</option>
                        <option value="8453">Base</option>
                        <option value="CT_501">Solana</option>
                    </select>
                    <input type="text" id="searchKeyword" placeholder="输入代币名称..." class="input-base flex-1">
                    <button onclick="doBinanceSearch()" class="btn-primary px-4 py-2 rounded-xl text-sm">搜索</button>
                </div>
                <div id="searchResults" class="space-y-2 max-h-64 overflow-y-auto"></div>
            `;
            break;

        case 'audit':
            title.textContent = '🛡️ 安全审计';
            content.innerHTML = `
                <p class="text-gray-600 mb-4">检测蜜罐、假币、恶意合约</p>
                <div class="space-y-3 mb-4">
                    <select id="auditChain" class="input-base w-full">
                        <option value="56">BSC (56)</option>
                        <option value="8453">Base (8453)</option>
                        <option value="CT_501">Solana (CT_501)</option>
                        <option value="1">Ethereum (1)</option>
                    </select>
                    <input type="text" id="auditAddress" placeholder="0x..." class="input-base w-full">
                    <button onclick="doBinanceAudit()" class="btn-primary w-full py-2.5 rounded-xl text-sm">开始检测</button>
                </div>
                <div id="auditResult"></div>
            `;
            break;

        case 'wallet':
            title.textContent = '👛 钱包查询';
            content.innerHTML = `
                <p class="text-gray-600 mb-4">查询任意地址的代币持仓</p>
                <div class="space-y-3 mb-4">
                    <select id="walletChain" class="input-base w-full">
                        <option value="56">BSC (56)</option>
                        <option value="8453">Base (8453)</option>
                        <option value="CT_501">Solana (CT_501)</option>
                    </select>
                    <input type="text" id="walletAddress" placeholder="钱包地址 0x..." class="input-base w-full">
                    <button onclick="doBinanceWallet()" class="btn-primary w-full py-2.5 rounded-xl text-sm">查询持仓</button>
                </div>
                <div id="walletResult"></div>
            `;
            break;

        case 'signals':
            title.textContent = '📈 聪明钱信号';
            content.innerHTML = `
                <p class="text-gray-600 mb-4">跟踪聪明钱交易信号</p>
                <div class="flex gap-2 mb-4">
                    <select id="signalChain" class="input-base" onchange="loadBinanceSignals()">
                        <option value="CT_501">Solana</option>
                        <option value="56">BSC</option>
                    </select>
                    <button onclick="loadBinanceSignals()" class="btn-primary px-4 py-2 rounded-xl text-sm">刷新</button>
                </div>
                <div id="signalsContent" class="space-y-2 max-h-96 overflow-y-auto"></div>
            `;
            loadBinanceSignals();
            break;

        case 'rank':
            title.textContent = '🏆 市场排行';
            content.innerHTML = `
                <p class="text-gray-600 mb-4">按市值/交易量排名</p>
                <div class="flex gap-2 mb-4">
                    <select id="rankChain" class="input-base" onchange="loadBinanceRank()">
                        <option value="CT_501">Solana</option>
                        <option value="56">BSC</option>
                    </select>
                    <button onclick="loadBinanceRank()" class="btn-primary px-4 py-2 rounded-xl text-sm">刷新</button>
                </div>
                <div id="rankContent" class="space-y-2 max-h-96 overflow-y-auto"></div>
            `;
            loadBinanceRank();
            break;
    }
}

function closeBinanceSkillModal() {
    const modal = document.getElementById('binanceSkillModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ========== Binance API 调用 ==========
async function doBinanceSearch() {
    const chainId = document.getElementById('searchChain')?.value;
    const keyword = document.getElementById('searchKeyword')?.value;
    const resultsContainer = document.getElementById('searchResults');

    if (!keyword || !resultsContainer) return;

    resultsContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.Binance.searchTokens(keyword, chainId);

        if (data.success && data.data && data.data.length > 0) {
            resultsContainer.innerHTML = data.data.map(token => `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-yellow-50 transition" onclick="viewTokenDetail('${token.chainId}', '${token.address}')">
                    <img src="${token.logo || ''}" class="w-8 h-8 rounded-full" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪙</text></svg>'">
                    <div class="flex-1">
                        <div class="font-medium">${token.symbol || ''}</div>
                        <div class="text-xs text-gray-500">${token.name || ''}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium">$${token.price || '0'}</div>
                        <div class="text-xs ${parseFloat(token.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}">${token.change || '+0'}%</div>
                    </div>
                </div>
            `).join('');
        } else {
            resultsContainer.innerHTML = '<div class="text-center text-gray-400 py-4">未找到结果</div>';
        }
    } catch (error) {
        resultsContainer.innerHTML = '<div class="text-center text-red-400 py-4">搜索失败</div>';
    }
}

async function doBinanceAudit() {
    const chainId = document.getElementById('auditChain')?.value;
    const address = document.getElementById('auditAddress')?.value;
    const resultContainer = document.getElementById('auditResult');

    if (!address || !resultContainer) return;

    resultContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.Binance.auditToken(chainId, address);

        if (data.success && data.data) {
            const audit = data.data;
            resultContainer.innerHTML = `
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>安全评分</span>
                        <span class="font-bold ${audit.score >= 80 ? 'text-green-500' : audit.score >= 50 ? 'text-yellow-500' : 'text-red-500'}">${audit.score || 0}/100</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="p-2 bg-gray-50 rounded text-center">
                            <div class="text-xs text-gray-500">流动性</div>
                            <div class="font-medium">${audit.liquidity || 'N/A'}</div>
                        </div>
                        <div class="p-2 bg-gray-50 rounded text-center">
                            <div class="text-xs text-gray-500">持有人</div>
                            <div class="font-medium">${audit.holders || 'N/A'}</div>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">${audit.warning || '请自行研究后投资'}</div>
                </div>
            `;
        } else {
            resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">检测失败</div>';
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">检测失败</div>';
    }
}

async function doBinanceWallet() {
    const chainId = document.getElementById('walletChain')?.value;
    const address = document.getElementById('walletAddress')?.value;
    const resultContainer = document.getElementById('walletResult');

    if (!address || !resultContainer) return;

    resultContainer.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.Binance.getWalletHoldings(address, chainId);

        if (data.success && data.data && data.data.length > 0) {
            resultContainer.innerHTML = `
                <div class="space-y-2 max-h-64 overflow-y-auto">
                    ${data.data.map(item => `
                        <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <span class="font-medium">${item.symbol || ''}</span>
                            <span class="flex-1 text-right">${item.balance || '0'}</span>
                            <span class="text-sm text-gray-500">$${item.value || '0'}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            resultContainer.innerHTML = '<div class="text-center text-gray-400 py-4">无持仓数据</div>';
        }
    } catch (error) {
        resultContainer.innerHTML = '<div class="text-center text-red-400 py-4">查询失败</div>';
    }
}

async function loadBinanceSignals() {
    const chainId = document.getElementById('signalChain')?.value || 'CT_501';
    const container = document.getElementById('signalsContent');

    if (!container) return;

    container.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.Binance.getSmartMoneySignals(chainId);

        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map((signal, i) => `
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-medium">${signal.token || ''}</span>
                        <span class="text-xs px-2 py-0.5 rounded-full ${signal.action === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">${signal.action === 'buy' ? '买入' : '卖出'}</span>
                    </div>
                    <div class="text-xs text-gray-500">
                        <span>金额: $${signal.amount || '0'}</span>
                        <span class="ml-2">${window.AppConfig?.timeAgo(signal.timestamp) || '刚刚'}</span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="text-center text-gray-400 py-4">暂无信号</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="text-center text-gray-400 py-4">加载失败</div>';
    }
}

async function loadBinanceRank() {
    const chainId = document.getElementById('rankChain')?.value || 'CT_501';
    const container = document.getElementById('rankContent');

    if (!container) return;

    container.innerHTML = '<div class="text-center py-4"><div class="loading-dots"><span>●</span><span>●</span><span>●</span></div></div>';

    try {
        const data = await window.API.Binance.getMarketRank(chainId);

        if (data.success && data.data && data.data.length > 0) {
            container.innerHTML = data.data.map((token, i) => `
                <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span class="w-6 h-6 flex items-center justify-center rounded-full ${i < 3 ? 'bg-[#F3BA2F] text-white' : 'bg-gray-200'} text-xs font-bold">${i + 1}</span>
                    <span class="flex-1 font-medium">${token.symbol || ''}</span>
                    <span class="text-sm">$${token.price || '0'}</span>
                    <span class="text-xs ${parseFloat(token.change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}">${token.change || '+0'}%</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="text-center text-gray-400 py-4">暂无排行数据</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="text-center text-gray-400 py-4">加载失败</div>';
    }
}

async function doBinanceDetail() {
    // TODO: 实现代币详情
}

function viewTokenDetail(chainId, address) {
    // 打开代币详情
    window.UI?.showToast('代币详情加载中...', 'info');
    // TODO: 实现详情页
}

// ========== 图表渲染 ==========
function renderTokenChart(containerId, tokenData) {
    const container = document.getElementById(containerId);
    if (!container || !window.LightweightCharts) return;

    container.innerHTML = '';
    const chart = window.LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 300,
        layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
        },
        grid: {
            vertLines: { color: '#f1f1f1' },
            horzLines: { color: '#f1f1f1' },
        },
    });

    const candleSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
    });

    // 模拟数据
    const data = [];
    let basePrice = 100;
    for (let i = 0; i < 50; i++) {
        const time = Math.floor(Date.now() / 1000) - (50 - i) * 3600;
        const open = basePrice;
        const close = basePrice + (Math.random() - 0.5) * 10;
        const high = Math.max(open, close) + Math.random() * 5;
        const low = Math.min(open, close) - Math.random() * 5;
        data.push({ time, open, high, low, close });
        basePrice = close;
    }

    candleSeries.setData(data);
    chart.timeScale().fitContent();
}

function renderWalletChart(containerId, walletData) {
    const container = document.getElementById(containerId);
    if (!container || !window.LightweightCharts) return;

    container.innerHTML = '';
    const chart = window.LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 200,
        layout: {
            background: { color: '#ffffff' },
            textColor: '#333',
        },
    });

    const areaSeries = chart.addAreaSeries({
        lineColor: '#F3BA2F',
        topColor: 'rgba(243, 186, 47, 0.4)',
        bottomColor: 'rgba(243, 186, 47, 0.0)',
    });

    // 模拟数据
    const data = [];
    let baseValue = 1000;
    for (let i = 0; i < 30; i++) {
        const time = Math.floor(Date.now() / 1000) - (30 - i) * 86400;
        baseValue = baseValue * (1 + (Math.random() - 0.5) * 0.1);
        data.push({ time, value: baseValue });
    }

    areaSeries.setData(data);
    chart.timeScale().fitContent();
}

// 导出 Binance 模块
window.Binance = {
    openBinanceSkill,
    closeBinanceSkillModal,
    doBinanceSearch,
    doBinanceAudit,
    doBinanceWallet,
    loadBinanceSignals,
    loadBinanceRank,
    doBinanceDetail,
    viewTokenDetail,
    renderTokenChart,
    renderWalletChart
};

// 导出函数到 window（供 HTML 调用）
window.openBinanceSkill = openBinanceSkill;
window.closeBinanceSkillModal = closeBinanceSkillModal;
window.doBinanceSearch = doBinanceSearch;
window.doBinanceAudit = doBinanceAudit;
window.doBinanceWallet = doBinanceWallet;
window.loadBinanceSignals = loadBinanceSignals;
window.loadBinanceRank = loadBinanceRank;
window.viewTokenDetail = viewTokenDetail;
