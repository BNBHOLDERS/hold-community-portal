/**
 * 邮件发送服务
 * 用于价格提醒、验证码等通知
 */

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.enabled = false;
        this.init();
    }

    /**
     * 初始化邮件服务
     */
    init() {
        const smtpConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // STARTTLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

        // 检查是否配置了 SMTP
        if (smtpConfig.host && smtpConfig.host !== 'smtp.gmail.com' && smtpConfig.host !== process.env.SMTP_HOST) {
            try {
                this.transporter = nodemailer.createTransport(smtpConfig);
                this.enabled = true;
                console.log('邮件服务已启用');
            } catch (error) {
                console.error('邮件服务初始化失败:', error.message);
            }
        } else {
            console.log('邮件服务未配置（使用模拟模式）');
        }
    }

    /**
     * 发送邮件
     */
    async sendMail(to, subject, html, text) {
        if (!this.enabled || !this.transporter) {
            console.log('[模拟邮件] 发送给:', to);
            console.log('[模拟邮件] 主题:', subject);
            console.log('[模拟邮件] 内容:', text?.substring(0, 100) + '...');
            return { success: true, simulated: true };
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"HOLD 社区" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text
            });
            console.log('邮件已发送:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('邮件发送失败:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 发送价格提醒邮件
     */
    async sendPriceAlert(email, symbol, currentPrice, targetPrice, condition) {
        const conditionText = condition === 'above' ? '突破' : '跌破';
        const subject = `🔔 价格提醒：${symbol} ${conditionText} $${targetPrice}`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); color: #1a1a1a; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
                    .price-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                    .price { font-size: 32px; font-weight: bold; color: #F3BA2F; }
                    .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); color: #1a1a1a; text-decoration: none; border-radius: 25px; font-weight: 600; }
                    .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 价格提醒</h1>
                    </div>
                    <div class="content">
                        <p>你关注的 <strong>${symbol}</strong> 价格已触发提醒条件：</p>
                        <div class="price-box">
                            <div style="color: #666;">当前价格</div>
                            <div class="price">$${currentPrice}</div>
                            <div style="margin-top: 10px; color: #999;">目标价格：$${targetPrice}</div>
                        </div>
                        <p style="text-align: center;">
                            <a href="https://hold.community/ai" class="btn">查看详情</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>HOLD 社区 - 让每个 Holder 都学会看链上数据</p>
                        <p>如需取消提醒，请访问设置页面</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendMail(email, subject, html);
    }

    /**
     * 发送验证码邮件
     */
    async sendVerificationCode(email, code) {
        const subject = '📧 HOLD 社区 - 验证码';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; }
                    .code { font-size: 32px; font-weight: bold; color: #F3BA2F; letter-spacing: 5px; }
                </style>
            </head>
            <body style="background: #f5f5f5; padding: 40px;">
                <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); padding: 30px; text-align: center;">
                        <h1 style="color: #1a1a1a; margin: 0;">HOLD 社区</h1>
                    </div>
                    <div style="padding: 40px; text-align: center;">
                        <p style="color: #666;">你的验证码是：</p>
                        <div class="code">${code}</div>
                        <p style="color: #999; font-size: 14px; margin-top: 30px;">
                            验证码 5 分钟内有效，请勿泄露给他人。
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendMail(email, subject, html);
    }

    /**
     * 发送欢迎邮件
     */
    async sendWelcome(email, username) {
        const subject = '🎉 欢迎加入 HOLD 社区';
        const html = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: sans-serif; background: #f5f5f5; padding: 40px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); padding: 40px; text-align: center;">
                        <h1 style="color: #1a1a1a; margin: 0;">🎉 欢迎，${username}！</h1>
                    </div>
                    <div style="padding: 40px;">
                        <p style="color: #333; font-size: 16px; line-height: 1.6;">
                            欢迎加入 <strong>HOLD 社区</strong>！
                        </p>
                        <p style="color: #666; line-height: 1.6;">
                            这里是首个免费的链上学习社区，无需钱包连接，即可学习：
                        </p>
                        <ul style="color: #666; line-height: 1.8;">
                            <li>📊 链上数据分析</li>
                            <li>🛡️ 安全识别技巧</li>
                            <li>💰 交易策略学习</li>
                            <li>🤖 免费 AI 工具</li>
                        </ul>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://hold.community/docs" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #F3BA2F 0%, #FCD535 100%); color: #1a1a1a; text-decoration: none; border-radius: 25px; font-weight: 600;">
                                开始学习 →
                            </a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendMail(email, subject, html);
    }
}

module.exports = new EmailService();
