/**
 * 卡牌弹出显示模块
 * 负责显示选中卡牌的大图和详细信息
 */
class CardPopup {
    constructor() {
        this.popupElement = null;
        this.overlayElement = null;
        this.cardData = null;
        this.isVisible = false;
        this.tarotData = null; // 存储塔罗牌数据
        this.autoCloseTimer = null; // 自动关闭定时器
        this.particleSystem = null; // 粒子系统
        
        this.init();
    }

    /**
     * 初始化弹出窗口
     */
    init() {
        // 创建遮罩层
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'card-popup-overlay';
        this.overlayElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            backdrop-filter: blur(5px);
        `;
        
        // 创建弹出窗口容器
        this.popupElement = document.createElement('div');
        this.popupElement.id = 'card-popup';
        this.popupElement.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 100%);
            border-radius: 15px;
            border: 2px solid #d4af37;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            max-width: 90%;
            max-height: 90%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transform: scale(0.8);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(212, 175, 55, 0.8);
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            color: #000;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            z-index: 10;
        `;
        closeButton.addEventListener('click', () => this.hide());
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.9)';
            closeButton.style.transform = 'scale(1.1)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(212, 175, 55, 0.8)';
            closeButton.style.transform = 'scale(1)';
        });
        
        // 创建内容容器
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            padding: 20px;
            gap: 30px;
            align-items: center;
        `;
        
        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.id = 'card-image-container';
        imageContainer.style.cssText = `
            flex: 0 0 auto;
            position: relative;
        `;
        
        // 创建信息容器
        const infoContainer = document.createElement('div');
        infoContainer.id = 'card-info-container';
        infoContainer.style.cssText = `
            flex: 1;
            color: #fff;
            min-width: 250px;
        `;
        
        // 组装元素
        this.popupElement.appendChild(closeButton);
        this.popupElement.appendChild(contentContainer);
        contentContainer.appendChild(imageContainer);
        contentContainer.appendChild(infoContainer);
        this.overlayElement.appendChild(this.popupElement);
        
        // 添加到页面
        document.body.appendChild(this.overlayElement);
        
        // 点击遮罩层关闭
        this.overlayElement.addEventListener('click', (e) => {
            if (e.target === this.overlayElement) {
                this.hide();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * 加载塔罗牌数据
     */
    async loadTarotData() {
        try {
            const response = await fetch('cards/tarot-json-master/tarot-images.json');
            this.tarotData = await response.json();
            console.log('塔罗牌数据加载成功');
        } catch (error) {
            console.error('加载塔罗牌数据失败:', error);
        }
    }

    /**
     * 显示卡牌弹出窗口
     * @param {Object} cardData - 卡牌数据
     */
    async show(cardData) {
        if (!this.tarotData) {
            await this.loadTarotData();
        }
        
        this.cardData = cardData;
        this.updateContent();
        
        // 显示遮罩层和弹出窗口
        this.overlayElement.style.display = 'flex';
        
        // 触发动画
        setTimeout(() => {
            this.popupElement.style.transform = 'scale(1)';
            this.popupElement.style.opacity = '1';
        }, 10);
        
        this.isVisible = true;
        
        // 设置3秒后自动关闭
        this.setAutoCloseTimer();
    }

    /**
     * 隐藏卡牌弹出窗口
     */
    hide() {
        // 清除自动关闭定时器
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
            this.autoCloseTimer = null;
        }
        
        // 创建粒子消散效果
        this.createDisperseParticles();
        
        this.popupElement.style.transform = 'scale(0.8)';
        this.popupElement.style.opacity = '0';
        
        setTimeout(() => {
            this.overlayElement.style.display = 'none';
        }, 300);
        
        this.isVisible = false;
    }

    /**
     * 更新弹出窗口内容
     */
    updateContent() {
        if (!this.cardData) return;
        
        // 查找完整的卡牌信息
        const fullCardInfo = this.tarotData?.cards.find(card => card.name === this.cardData.name);
        
        // 更新图片
        const imageContainer = document.getElementById('card-image-container');
        imageContainer.innerHTML = '';
        
        const cardImage = document.createElement('img');
        const imagePath = fullCardInfo ? 
            `cards/tarot-json-master/cards/${fullCardInfo.img}` : 
            this.cardData.image || 'cards/tarot-json-master/cards/m00.jpg';
        
        cardImage.src = imagePath;
        cardImage.alt = this.cardData.name;
        cardImage.style.cssText = `
            max-width: 300px;
            max-height: 500px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border: 3px solid #d4af37;
        `;
        
        // 添加图片加载错误处理
        cardImage.onerror = () => {
            cardImage.src = 'cards/tarot-json-master/cards/m00.jpg'; // 默认图片
        };
        
        imageContainer.appendChild(cardImage);
        
        // 更新信息
        const infoContainer = document.getElementById('card-info-container');
        infoContainer.innerHTML = `
            <h2 style="color: #d4af37; margin: 0 0 20px 0; font-size: 2rem;">${this.cardData.name}</h2>
            ${fullCardInfo ? `
                <div style="margin-bottom: 15px;">
                    <span style="color: #aaa;">编号:</span> 
                    <span style="color: #fff; font-weight: bold;">${fullCardInfo.number}</span>
                </div>
                <div style="margin-bottom: 15px;">
                    <span style="color: #aaa;">类型:</span> 
                    <span style="color: #fff; font-weight: bold;">${fullCardInfo.arcana}</span>
                </div>
                ${fullCardInfo.suit ? `
                    <div style="margin-bottom: 15px;">
                        <span style="color: #aaa;">花色:</span> 
                        <span style="color: #fff; font-weight: bold;">${fullCardInfo.suit}</span>
                    </div>
                ` : ''}
            ` : ''}
            <div style="margin-bottom: 15px;">
                <span style="color: #aaa;">状态:</span> 
                <span style="color: ${this.cardData.isReversed ? '#ff6b6b' : '#4ecdc4'}; font-weight: bold;">
                    ${this.cardData.isReversed ? '逆位' : '正位'}
                </span>
            </div>
            <div style="margin-bottom: 20px;">
                <h3 style="color: #d4af37; margin: 0 0 10px 0;">含义:</h3>
                <p style="margin: 0; line-height: 1.6; color: #ccc;">
                    ${this.cardData.isReversed ? this.cardData.meaningRev : this.cardData.meaningUp}
                </p>
            </div>
            <div style="background: rgba(212, 175, 55, 0.1); padding: 15px; border-radius: 8px; border-left: 3px solid #d4af37;">
                <p style="margin: 0; font-style: italic; color: #aaa;">
                    ${this.getCardInterpretation(this.cardData)}
                </p>
            </div>
        `;
    }

    /**
     * 获取卡牌解读
     * @param {Object} cardData - 卡牌数据
     * @returns {string} 解读文本
     */
    getCardInterpretation(cardData) {
        // 这里可以添加更复杂的解读逻辑
        const interpretations = {
            'The Fool': cardData.isReversed ? 
                '新的开始受阻，需要谨慎前行。' : 
                '勇敢踏上新的旅程，相信直觉的指引。',
            'The Magician': cardData.isReversed ? 
                '才能被浪费，需要重新审视自己的能力。' : 
                '你拥有实现目标所需的一切能力，是时候采取行动了。',
            'The High Priestess': cardData.isReversed ? 
                '直觉被压抑，需要倾听内心的声音。' : 
                '相信你的直觉，潜意识中蕴含着答案。',
            'The Empress': cardData.isReversed ? 
                '创造力受阻，需要关注内在的滋养。' : 
                '丰饶与创造力的象征，是成长和收获的时期。',
            'The Lovers': cardData.isReversed ? 
                '关系出现不和谐，需要重新审视选择。' : 
                '爱与和谐的能量，重要的选择即将到来。',
            'The Hermit': cardData.isReversed ? 
                '过度孤立，需要与外界连接。' : 
                '内省的时期，独处将带来智慧。',
            'Death': cardData.isReversed ? 
                '抗拒改变，停滞不前。' : 
                '结束与转变，为新生命让路。',
            'The World': cardData.isReversed ? 
                '缺乏闭环，有未完成的事务。' : 
                '完成与整合，一个周期的圆满结束。'
        };
        
        return interpretations[cardData.name] || 
            (cardData.isReversed ? 
                '逆位提示需要反思和调整。' : 
                '正位带来积极的能量和指引。');
    }

    /**
     * 检查弹出窗口是否可见
     * @returns {boolean}
     */
    isPopupVisible() {
        return this.isVisible;
    }
    
    /**
     * 设置自动关闭定时器
     */
    setAutoCloseTimer() {
        // 清除之前的定时器
        if (this.autoCloseTimer) {
            clearTimeout(this.autoCloseTimer);
        }
        
        // 设置3秒后自动关闭
        this.autoCloseTimer = setTimeout(() => {
            this.hide();
        }, 3000);
    }
    
    /**
     * 创建粒子消散效果
     */
    createDisperseParticles() {
        // 获取弹出窗口的位置和大小
        const popupRect = this.popupElement.getBoundingClientRect();
        const centerX = popupRect.left + popupRect.width / 2;
        const centerY = popupRect.top + popupRect.height / 2;
        
        // 创建粒子容器
        const particleContainer = document.createElement('div');
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1999;
        `;
        
        // 创建粒子
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${this.getRandomColor()};
                border-radius: 50%;
                left: ${centerX}px;
                top: ${centerY}px;
                box-shadow: 0 0 6px ${this.getRandomColor()};
            `;
            
            particleContainer.appendChild(particle);
            
            // 设置粒子动画
            this.animateParticle(particle, centerX, centerY);
        }
        
        // 添加到页面
        document.body.appendChild(particleContainer);
        
        // 2秒后移除粒子容器
        setTimeout(() => {
            document.body.removeChild(particleContainer);
        }, 2000);
    }
    
    /**
     * 获取随机颜色（金色或紫色系）
     */
    getRandomColor() {
        const colors = [
            '#d4af37', // 金色
            '#ffd700', // 亮金色
            '#ffed4e', // 浅金色
            '#9370db', // 紫色
            '#ba55d3', // 中紫色
            '#dda0dd'  // 浅紫色
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 粒子动画
     */
    animateParticle(particle, startX, startY) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4; // 速度范围：2-6
        const lifetime = 1000 + Math.random() * 1000; // 生命周期：1-2秒
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / lifetime;
            
            if (progress >= 1) {
                particle.style.opacity = '0';
                return;
            }
            
            // 计算位置
            const distance = velocity * elapsed * 0.1;
            const x = startX + Math.cos(angle) * distance;
            const y = startY + Math.sin(angle) * distance + (progress * progress * 50); // 添加重力效果
            
            // 更新位置
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // 更新透明度
            particle.style.opacity = 1 - progress;
            
            // 更新大小
            const scale = 1 + progress * 0.5;
            particle.style.transform = `scale(${scale})`;
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardPopup;
} else {
    window.CardPopup = CardPopup;
}