"""
title: Heroes API Tool
author: Your Name
description: 这个工具用于从本地API获取英雄数据
version: 1.0.0
"""

import aiohttp
from pydantic import BaseModel, Field
from typing import List, Dict, Any

class Tools:
    class Valves(BaseModel):
        api_url: str = Field(
            default="http://127.0.0.1:5000/api/heroes",
            description="英雄数据API地址"
        )

    def __init__(self):
        """初始化工具"""
        self.valves = self.Valves()

    async def get_heroes(self, __event_emitter__=None) -> str:
        """
        获取所有英雄的信息
        """
        try:
            # 发送状态更新
            if __event_emitter__:
                await __event_emitter__(
                    {
                        "type": "status",
                        "data": {"description": "正在获取英雄数据...", "done": False}
                    }
                )

            async with aiohttp.ClientSession() as session:
                async with session.get(self.valves.api_url) as response:
                    if response.status == 200:
                        heroes = await response.json()
                        
                        # 格式化输出结果
                        result = "获取到以下英雄信息：\n\n"
                        for hero in heroes:
                            result += f"英雄: {hero['name']}\n"
                            result += f"真实姓名: {hero['real_name']}\n"
                            result += f"角色: {hero['role']}\n"
                            result += f"描述: {hero['description']}\n"
                            result += "\n技能:\n"
                            for skill in hero['skills']:
                                result += f"- {skill['name']}: {skill['description']} (冷却时间: {skill['cooldown']})\n"
                            result += "\n---\n\n"

                        # 发送完成状态
                        if __event_emitter__:
                            await __event_emitter__(
                                {
                                    "type": "status",
                                    "data": {"description": "英雄数据获取成功!", "done": True}
                                }
                            )

                        return result
                    else:
                        error_msg = f"API请求失败: HTTP {response.status}"
                        if __event_emitter__:
                            await __event_emitter__(
                                {
                                    "type": "status",
                                    "data": {"description": error_msg, "done": True}
                                }
                            )
                        return error_msg

        except Exception as e:
            error_msg = f"发生错误: {str(e)}"
            if __event_emitter__:
                await __event_emitter__(
                    {
                        "type": "status",
                        "data": {"description": error_msg, "done": True}
                    }
                )
            return error_msg 