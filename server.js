const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// 修正：优先用平台动态端口，本地默认 3000
const PORT = process.env.PORT || 3000;

// 中间件：允许跨域请求（解决前端调用后端的跨域问题）
app.use(cors());
// 中间件：解析前端提交的 JSON 数据
app.use(express.json());

// 数据存储路径（用 JSON 文件保存所有打卡记录）
const DATA_PATH = path.join(__dirname, 'checkinData.json');

// 初始化 JSON 数据文件（如果文件不存在则创建）
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2), 'utf8');
}

// 接口1：提交打卡（前端点击“提交打卡”时调用）
app.post('/api/checkin', (req, res) => {
  try {
    // 1. 获取前端传过来的打卡数据（游戏名、地图、日期、时间）
    const { gameName, map, date, time } = req.body;
    // 校验必填字段
    if (!gameName || !map || !date || !time) {
      return res.status(400).json({ success: false, msg: '请填写完整打卡信息！' });
    }

    // 2. 读取现有数据
    const existingData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    // 3. 添加新打卡记录
    const newRecord = { gameName, map, date, time };
    existingData.push(newRecord);
    // 4. 保存到 JSON 文件
    fs.writeFileSync(DATA_PATH, JSON.stringify(existingData, null, 2), 'utf8');

    // 5. 返回成功响应
    res.json({ success: true, msg: `打卡成功！游戏名：${gameName}` });
  } catch (error) {
    res.status(500).json({ success: false, msg: '服务器错误，打卡失败！' });
  }
});

// 接口2：获取所有打卡记录（前端加载页面/查看历史时调用）
app.get('/api/records', (req, res) => {
  try {
    // 读取 JSON 文件中的所有记录并返回
    const allRecords = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    res.json({ success: true, data: allRecords });
  } catch (error) {
    res.status(500).json({ success: false, msg: '服务器错误，无法获取记录！' });
  }
});

// 修正：日志显示正确的本地服务地址
app.listen(PORT, () => {
  console.log(`后端服务已启动，本地地址：http://localhost:${PORT}`);
  console.log(`提交打卡接口：http://localhost:${PORT}/api/checkin`);
  console.log(`获取记录接口：http://localhost:${PORT}/api/records`);
});