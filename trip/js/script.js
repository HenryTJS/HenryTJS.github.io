class FootprintMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.footprints = [];
        this.cities = [];
        this.init();
    }
    async init() {
        try {
            console.log('开始初始化足迹地图系统...');
            await this.loadData();
            console.log('数据加载完成');
            this.renderFootprintList();
            console.log('足迹列表渲染完成');
            this.updateStats();
            console.log('统计信息更新完成');
            if (typeof AMap === 'undefined') {
                console.warn('高德地图API未加载，仅显示列表模式');
                this.showMapError('地图服务暂时不可用，但足迹列表已正常显示');
                return;
            }
            console.log('高德地图API加载成功');
            this.initMap();
            console.log('地图初始化完成');
            this.renderFootprints();
            console.log('足迹渲染完成');
            console.log('足迹地图系统初始化成功！');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError(`系统初始化失败: ${error.message}。请检查控制台获取详细信息。`);
        }
    }
    async loadData() {
        try {
            console.log('正在加载数据文件...');
            const response = await fetch('json/data.json');
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            this.footprints = data.footprints || [];
            this.cities = data.cities || [];
            console.log(`数据加载成功: ${this.footprints.length}个足迹, ${this.cities.length}个城市`);
        } catch (error) {
            console.error('数据加载失败:', error);
            this.footprints = [];
            this.cities = [];
        }
    }
    initMap() {
        try {
            console.log('正在初始化地图...');
            this.map = new AMap.Map('mapContainer', {
                zoom: 5,
                center: [104.114129, 37.550339],
                mapStyle: 'amap://styles/blue',
                viewMode: '3D',
                pitch: 0,
                showLabel: true,
                features: ['bg', 'road', 'building', 'point']
            });
            console.log('地图实例创建成功');
            console.log('地图初始化成功');
        } catch (error) {
            console.error('地图初始化失败:', error);
            throw new Error(`地图初始化失败: ${error.message}`);
        }
    }
    renderFootprints() {
        if (this.footprints.length === 0) {
            return;
        }
        this.footprints.forEach(footprint => {
            const circleMarker = new AMap.CircleMarker({
                center: [footprint.longitude, footprint.latitude],
                radius: 10,
                fillColor: footprint.color || '#ff6b6b',
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
                    radius: 12,
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
    showFootprintInfo(footprint) {
        const info = `
            <div style="padding: 15px; min-width: 200px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">${footprint.city}</h4>
                <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>省份:</strong> ${footprint.province}</p>
                <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>访问时间:</strong> ${footprint.visitDate}</p>
                <p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>访问类型:</strong> ${footprint.type}</p>
                ${footprint.note ? `<p style="margin: 5px 0; color: #666; font-size: 14px;"><strong>备注:</strong> ${footprint.note}</p>` : ''}
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
            listContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无足迹记录</p>';
            return;
        }
        const sortedFootprints = [...this.footprints].sort((a, b) => 
            new Date(b.visitDate) - new Date(a.visitDate)
        );
        listContainer.innerHTML = sortedFootprints.map(footprint => `
            <div class="footprint-item" data-id="${footprint.id}">
                <h4>${footprint.city}</h4>
                <p><strong>省份:</strong> ${footprint.province}</p>
                <p><strong>访问时间:</strong> ${footprint.visitDate}</p>
                <p><strong>访问类型:</strong> ${footprint.type || '未指定'}</p>
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
                    background: #fff3cd;
                    color: #856404;
                    text-align: center;
                    padding: 20px;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                ">
                    <h3 style="margin-bottom: 15px;">⚠️ 地图服务暂时不可用</h3>
                    <p style="margin-bottom: 10px;">${message}</p>
                    <small style="color: #6c757d;">足迹列表和统计信息仍可正常使用</small>
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
                    color: #dc3545;
                    text-align: center;
                    padding: 20px;
                ">
                    <h3 style="margin-bottom: 15px;">系统错误</h3>
                    <p style="margin-bottom: 10px;">${message}</p>
                    <small style="color: #6c757d;">请检查控制台获取详细信息</small>
                </div>
            `;
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面DOM加载完成，开始初始化足迹地图系统...');
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
                    color: #dc3545;
                    text-align: center;
                    padding: 20px;
                ">
                    <h3 style="margin-bottom: 15px;">系统初始化失败</h3>
                    <p style="margin-bottom: 10px;">错误信息: ${error.message}</p>
                    <small style="color: #6c757d;">请刷新页面重试，或检查控制台获取详细信息</small>
                </div>
            `;
        }
    }
});