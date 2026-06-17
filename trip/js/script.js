/* ============================================
   足迹地图 - JavaScript
   ============================================ */

class FootprintMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.footprints = [];
        this.init();
    }

    async init() {
        try {
            // 导航栏滚动效果
            const navBar = document.getElementById('mainNavBar');
            window.addEventListener('scroll', function() {
                if (window.scrollY > 20) {
                    navBar.classList.add('scrolled');
                } else {
                    navBar.classList.remove('scrolled');
                }
            }, { passive: true });

            await this.loadData();
            this.renderFootprintList();
            this.updateStats();
            this.syncMapHeightWithRight();

            if (typeof AMap === 'undefined') {
                console.warn('高德地图API未加载，仅显示列表模式');
                this.showMapError('地图服务暂时不可用，但足迹列表已正常显示');
                return;
            }

            this.initMap();
            this.renderFootprints();

            if (this.map && typeof this.map.resize === 'function') {
                requestAnimationFrame(() => this.map.resize());
            }

            window.addEventListener('resize', () => this.syncMapHeightWithRight());
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError(`系统初始化失败: ${error.message}`);
        }
    }

    async loadData() {
        try {
            const response = await fetch('/trip/json/data.json');
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            const data = await response.json();
            this.footprints = data.footprints || [];
        } catch (error) {
            console.error('数据加载失败:', error);
            this.footprints = [];
        }
    }

    initMap() {
        try {
            this.map = new AMap.Map('mapContainer', {
                zoom: 5,
                center: [104.114129, 37.550339],
                mapStyle: 'amap://styles/blue',
                viewMode: '3D',
                pitch: 0,
                showLabel: true,
                features: ['bg', 'road', 'building', 'point']
            });
        } catch (error) {
            console.error('地图初始化失败:', error);
            throw new Error(`地图初始化失败: ${error.message}`);
        }
    }

    renderFootprints() {
        if (this.footprints.length === 0) return;

        this.footprints.forEach(footprint => {
            const circleMarker = new AMap.CircleMarker({
                center: [footprint.longitude, footprint.latitude],
                radius: 10,
                fillColor: footprint.color || '#6c63ff',
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                strokeOpacity: 1,
                cursor: 'pointer'
            });

            circleMarker.on('click', () => {
                this.showFootprintInfo(footprint);
            });

            circleMarker.on('mouseover', () => {
                circleMarker.setOptions({
                    radius: 13,
                    fillOpacity: 1
                });
            });

            circleMarker.on('mouseout', () => {
                circleMarker.setOptions({
                    radius: 10,
                    fillOpacity: 0.8
                });
            });

            this.markers.push(circleMarker);
            this.map.add(circleMarker);
        });

        if (this.markers.length > 0) {
            this.map.setFitView(this.markers);
        }
    }

    syncMapHeightWithRight() {
        try {
            const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
            const mapEl = document.getElementById('mapContainer');
            if (!mapEl) return;

            if (isMobile) {
                mapEl.style.height = '50vh';
                if (this.map && typeof this.map.resize === 'function') this.map.resize();
                return;
            }

            const statsGrid = document.querySelector('.stats-grid');
            const controlPanel = document.querySelector('.control-panel');
            const mainContent = document.querySelector('.main-content');
            if (!statsGrid || !controlPanel || !mainContent) return;

            const statsH = statsGrid.offsetHeight || 0;
            const panelH = controlPanel.offsetHeight || 0;
            const cs = window.getComputedStyle(mainContent);
            const rowGapStr = cs.rowGap || cs.gap || '0px';
            const rowGap = parseFloat(rowGapStr) || 0;
            const total = statsH + panelH + rowGap;

            if (total > 0) {
                mapEl.style.height = total + 'px';
                if (this.map && typeof this.map.resize === 'function') this.map.resize();
            }
        } catch (e) {
            console.warn('同步地图高度失败:', e);
        }
    }

    showFootprintInfo(footprint) {
        const info = `
            <div style="padding: 15px; min-width: 200px;">
                <h4 style="margin: 0 0 10px 0; color: #1a1a2e; font-size: 16px; font-weight: 600;">${footprint.city}</h4>
                <p style="margin: 5px 0; color: #4a4a6a; font-size: 14px;"><strong>省份:</strong> ${footprint.province}</p>
                <p style="margin: 5px 0; color: #4a4a6a; font-size: 14px;"><strong>访问时间:</strong> ${footprint.visitDate}</p>
                <p style="margin: 5px 0; color: #4a4a6a; font-size: 14px;"><strong>访问类型:</strong> ${footprint.type}</p>
                ${footprint.note ? `<p style="margin: 5px 0; color: #4a4a6a; font-size: 14px;"><strong>备注:</strong> ${footprint.note}</p>` : ''}
            </div>
        `;
        const infoWindow = new AMap.InfoWindow({
            content: info,
            offset: new AMap.Pixel(0, -30)
        });
        infoWindow.open(this.map, [footprint.longitude, footprint.latitude]);
    }

    renderFootprintList() {
        const listContainer = document.getElementById('footprintList');
        if (this.footprints.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: 20px;">暂无足迹记录</p>';
            return;
        }

        const sortedFootprints = [...this.footprints].sort((a, b) =>
            new Date(b.visitDate) - new Date(a.visitDate)
        );

        listContainer.innerHTML = sortedFootprints.map(footprint => `
            <div class="footprint-item" data-id="${footprint.id}">
                <h4>${footprint.city}</h4>
                <p><strong>省份:</strong> ${footprint.province}</p>
                <p><strong>时间:</strong> ${footprint.visitDate}</p>
                <p><strong>类型:</strong> ${footprint.type || '未指定'}</p>
                ${footprint.note ? `<p><strong>备注:</strong> ${footprint.note}</p>` : ''}
            </div>
        `).join('');
    }

    updateStats() {
        const totalCities = this.footprints.length;
        const totalProvinces = new Set(this.footprints.map(f => f.province)).size;

        const citiesElement = document.getElementById('totalCities');
        const provincesElement = document.getElementById('totalProvinces');

        if (citiesElement) {
            citiesElement.textContent = totalCities;
        }
        if (provincesElement) {
            provincesElement.textContent = totalProvinces;
        }
    }

    showMapError(message) {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    background: #fffbe6;
                    color: #8e8ea0;
                    text-align: center;
                    padding: 20px;
                ">
                    <i class="fas fa-map-marked-alt" style="font-size: 2.5rem; color: #6c63ff; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 10px; color: #1a1a2e;">地图服务暂时不可用</h3>
                    <p style="margin-bottom: 10px; color: #4a4a6a;">${message}</p>
                    <small style="color: #8e8ea0;">足迹列表和统计信息仍可正常使用</small>
                </div>
            `;
        }
    }

    showError(message) {
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    background: #f8f9fa;
                    color: #4a4a6a;
                    text-align: center;
                    padding: 20px;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 10px; color: #1a1a2e;">系统错误</h3>
                    <p style="margin-bottom: 10px;">${message}</p>
                    <small style="color: #8e8ea0;">请检查控制台获取详细信息</small>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.footprintMap = new FootprintMap();
    } catch (error) {
        console.error('足迹地图系统创建失败:', error);
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    background: #f8f9fa;
                    color: #4a4a6a;
                    text-align: center;
                    padding: 20px;
                ">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 10px; color: #1a1a2e;">系统初始化失败</h3>
                    <p style="margin-bottom: 10px;">错误信息: ${error.message}</p>
                    <small style="color: #8e8ea0;">请刷新页面重试</small>
                </div>
            `;
        }
    }
});
