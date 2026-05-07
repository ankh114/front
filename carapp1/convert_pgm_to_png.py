# -*- coding: utf-8 -*-
from __future__ import with_statement
import os
from PIL import Image
import numpy as np

# 输入和输出目录
input_dir = 'maps'
output_dir = 'public'

# 确保输出目录存在
os.makedirs(output_dir, exist_ok=True)

# 遍历所有.pgm文件
for filename in os.listdir(input_dir):
    if filename.endswith('.pgm'):
        # 构建输入和输出路径
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename.replace('.pgm', '.png'))
        
        try:
            # 读取.pgm文件
            with open(input_path, 'rb') as f:
                # 读取PGM头部
                magic = f.readline().strip()
                if magic != b'P5':
                    print(f"跳过非P5格式的文件: {filename}")
                    continue
                    
                # 读取尺寸
                while True:
                    line = f.readline().strip()
                    if not line.startswith(b'#'):
                        width, height = map(int, line.split())
                        break
                        
                # 读取最大值
                max_val = int(f.readline().strip())
                
                # 读取图像数据
                data = np.fromfile(f, dtype=np.uint8, count=width*height)
                data = data.reshape((height, width))
                
                # 创建PIL图像
                img = Image.fromarray(data, mode='L')
                
                # 保存为.png文件
                img.save(output_path)
                print(f"已转换: {filename} -> {output_path}")
                
        except Exception as e:
            print(f"转换文件 {filename} 时出错: {e}")

print("转换完成！")
