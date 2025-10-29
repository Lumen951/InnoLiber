# API接口规范文档

**版本**: v1.0
**创建日期**: 2025-10-28
**Base URL**: `https://api.innolibr.com/v1`
**协议**: HTTPS only

---

## 📋 接口设计原则

### RESTful规范
- **资源导向**: URL代表资源，HTTP方法代表操作
- **无状态**: 每个请求包含完整信息
- **统一接口**: 标准化的请求/响应格式
- **分层系统**: 支持缓存和负载均衡

### 响应格式
所有API响应遵循统一JSON格式：

```json
{
  "success": true,
  "data": {
    // 实际数据
  },
  "message": "操作成功",
  "timestamp": "2025-10-28T10:30:00Z"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": {
      "title": ["标题不能为空"]
    }
  },
  "timestamp": "2025-10-28T10:30:00Z"
}
```

---

## 🔐 认证与授权

### JWT认证流程
```
1. 用户登录 -> 返回access_token + refresh_token
2. 后续请求携带: Authorization: Bearer {access_token}
3. token过期 -> 使用refresh_token获取新token
```

### Token结构
```python
# Access Token (24小时有效)
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "role": "ecr",
  "exp": 1703764800,
  "iat": 1703678400
}

# Refresh Token (30天有效)
{
  "sub": "user_uuid",
  "type": "refresh",
  "exp": 1706270400
}
```

---

## 📚 API分组

### 接口模块列表
```
1. 认证模块 (/auth)
2. 用户模块 (/users)
3. 标书模块 (/proposals)
4. K-TAS服务 (/ktas)
5. SPG-S服务 (/spgs)
6. DDC-S服务 (/ddcs)
7. 文献模块 (/corpus)
```

---

## 🔑 认证模块 (/auth)

### POST /auth/register
**功能**: 用户注册

**请求体**:
```json
{
  "email": "researcher@university.edu",
  "password": "StrongP@ss123",
  "username": "john_doe",
  "full_name": "张三",
  "institution": "北京理工大学",
  "research_field": ["人工智能", "机器学习"]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user_id": "uuid-here",
    "email": "researcher@university.edu",
    "message": "注册成功，请验证邮箱"
  }
}
```

**错误码**:
- `EMAIL_EXISTS`: 邮箱已被注册
- `WEAK_PASSWORD`: 密码强度不足

---

### POST /auth/login
**功能**: 用户登录

**请求体**:
```json
{
  "email": "researcher@university.edu",
  "password": "StrongP@ss123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": "uuid",
      "email": "researcher@university.edu",
      "username": "john_doe",
      "role": "ecr"
    }
  }
}
```

---

### POST /auth/refresh
**功能**: 刷新访问令牌

**请求体**:
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "access_token": "new_token",
    "expires_in": 86400
  }
}
```

---

## 👤 用户模块 (/users)

### GET /users/me
**功能**: 获取当前用户信息

**认证**: 必需

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "username": "john_doe",
    "full_name": "张三",
    "institution": "北京理工大学",
    "research_field": ["人工智能", "机器学习"],
    "role": "ecr",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### PATCH /users/me
**功能**: 更新用户信息

**认证**: 必需

**请求体**:
```json
{
  "full_name": "李四",
  "institution": "清华大学",
  "research_field": ["深度学习"]
}
```

---

## 📝 标书模块 (/proposals)

### POST /proposals
**功能**: 创建新标书

**认证**: 必需

**请求体**:
```json
{
  "title": "基于大语言模型的智能科研助理系统研究",
  "research_field": "计算机科学",
  "funding_program": "NSFC",
  "initial_idea": {
    "background": "简要背景描述",
    "objectives": ["目标1", "目标2"],
    "preliminary_methods": "初步研究思路"
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "proposal-uuid",
    "title": "基于大语言模型的智能科研助理系统研究",
    "status": "draft",
    "version": 1,
    "created_at": "2025-10-28T10:30:00Z"
  }
}
```

---

### GET /proposals
**功能**: 获取用户的标书列表

**认证**: 必需

**查询参数**:
```
?status=draft&page=1&page_size=20&sort_by=created_at&order=desc
```

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "标书标题",
        "status": "draft",
        "version": 1,
        "quality_score": 0.85,
        "created_at": "2025-10-28T10:30:00Z",
        "updated_at": "2025-10-28T11:00:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "page_size": 20,
      "total_pages": 3
    }
  }
}
```

---

### GET /proposals/{id}
**功能**: 获取标书详情

**认证**: 必需

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "标书标题",
    "research_field": "计算机科学",
    "status": "completed",
    "version": 3,
    "parent_version_id": "parent-uuid",
    "content": {
      "sections": [
        {
          "id": "section-uuid",
          "type": "background",
          "title": "立项依据",
          "content": "详细内容...",
          "word_count": 2500,
          "generated_by": "spg-s"
        }
      ]
    },
    "quality_score": 0.88,
    "compliance_score": 0.92,
    "created_at": "2025-10-28T10:30:00Z",
    "updated_at": "2025-10-28T15:00:00Z"
  }
}
```

---

### PATCH /proposals/{id}
**功能**: 更新标书内容

**认证**: 必需

**请求体**:
```json
{
  "title": "更新后的标题",
  "status": "reviewing",
  "content": {
    "sections": [...]
  }
}
```

---

### DELETE /proposals/{id}
**功能**: 删除标书（软删除）

**认证**: 必需

**响应**:
```json
{
  "success": true,
  "message": "标书已删除"
}
```

---

### GET /proposals/{id}/versions
**功能**: 获取标书版本历史

**认证**: 必需

**响应**:
```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "version": 3,
        "id": "current-uuid",
        "created_at": "2025-10-28T15:00:00Z",
        "changes_summary": "更新了研究方案"
      },
      {
        "version": 2,
        "id": "v2-uuid",
        "created_at": "2025-10-28T12:00:00Z"
      }
    ]
  }
}
```

---

## 🔬 K-TAS服务 (/ktas)

### POST /ktas/analyze-trends
**功能**: 分析研究趋势

**认证**: 必需

**请求体**:
```json
{
  "research_topic": "大语言模型Agent",
  "research_field": "人工智能",
  "time_range": {
    "start": "2023-01-01",
    "end": "2025-10-28"
  },
  "analysis_depth": "comprehensive"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "task_id": "task-uuid",
    "status": "processing",
    "estimated_time": 120
  }
}
```

**说明**: 异步任务，需轮询状态或使用WebSocket

---

### GET /ktas/tasks/{task_id}
**功能**: 获取分析任务状态

**响应**:
```json
{
  "success": true,
  "data": {
    "task_id": "task-uuid",
    "status": "completed",
    "result": {
      "trending_topics": [
        {
          "topic": "Multi-Agent Collaboration",
          "growth_rate": 0.85,
          "citation_count": 1250,
          "key_papers": [
            {
              "id": "corpus-uuid",
              "title": "论文标题",
              "authors": ["作者1", "作者2"],
              "published_date": "2024-06-15",
              "citation_count": 320
            }
          ]
        }
      ],
      "research_gaps": [
        {
          "gap": "缺少多智能体可解释性研究",
          "opportunity_score": 0.78
        }
      ],
      "perspective_mapping": {
        "input": ["文本", "图像"],
        "modeling": ["Transformer", "Diffusion"],
        "output": ["文本生成", "决策"],
        "objective": ["提升准确率", "降低延迟"],
        "learning": ["监督学习", "强化学习"]
      }
    },
    "created_at": "2025-10-28T10:30:00Z",
    "completed_at": "2025-10-28T10:32:15Z"
  }
}
```

---

### POST /ktas/recommend-papers
**功能**: 推荐相关文献

**请求体**:
```json
{
  "query": "大语言模型的多智能体协作",
  "filters": {
    "published_after": "2023-01-01",
    "min_citations": 10,
    "sources": ["arxiv", "nsfc"]
  },
  "limit": 20
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "papers": [
      {
        "id": "corpus-uuid",
        "title": "Multi-Agent LLM Collaboration Framework",
        "authors": ["Author A", "Author B"],
        "abstract": "摘要内容...",
        "relevance_score": 0.95,
        "published_date": "2024-08-20",
        "citation_count": 45,
        "source": "arxiv",
        "arxiv_id": "2408.12345"
      }
    ],
    "total": 156
  }
}
```

---

## ✍️ SPG-S服务 (/spgs)

### POST /spgs/generate-section
**功能**: 生成标书章节内容

**认证**: 必需

**请求体**:
```json
{
  "proposal_id": "proposal-uuid",
  "section_type": "background",
  "parameters": {
    "research_topic": "大语言模型Agent",
    "key_points": ["现有研究不足", "技术挑战", "研究意义"],
    "word_count_target": 2500,
    "style": "academic",
    "references": ["corpus-uuid-1", "corpus-uuid-2"]
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "task_id": "gen-task-uuid",
    "status": "processing",
    "estimated_time": 45
  }
}
```

---

### GET /spgs/tasks/{task_id}
**功能**: 获取生成任务状态

**响应**:
```json
{
  "success": true,
  "data": {
    "task_id": "gen-task-uuid",
    "status": "completed",
    "result": {
      "section_id": "section-uuid",
      "content": "生成的完整内容...",
      "word_count": 2487,
      "quality_metrics": {
        "coherence": 0.89,
        "relevance": 0.92,
        "novelty": 0.76
      },
      "suggestions": [
        "建议增加对XX方法的对比分析",
        "可以补充更多实验数据支撑"
      ]
    },
    "model_used": "deepseek-reasoner",
    "tokens_used": 12450
  }
}
```

---

### POST /spgs/feasibility-analysis
**功能**: 可行性分析与建议

**请求体**:
```json
{
  "proposal_id": "proposal-uuid",
  "research_objectives": ["目标1", "目标2"],
  "available_resources": {
    "equipment": ["GPU服务器", "实验设备"],
    "team": ["成员1专长", "成员2专长"],
    "budget": 300000
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "feasibility_score": 0.82,
    "risk_assessment": [
      {
        "risk": "数据采集难度较高",
        "severity": "medium",
        "mitigation": "建议与XX机构合作"
      }
    ],
    "pre_experiment_suggestions": [
      {
        "experiment": "小规模验证实验",
        "objective": "验证核心算法有效性",
        "resources_needed": ["GPU 1张", "1周时间"],
        "expected_outcome": "准确率提升5%以上"
      }
    ],
    "capability_gaps": [
      {
        "gap": "缺少大规模并行计算能力",
        "recommendation": "建议申请超算中心资源"
      }
    ]
  }
}
```

---

## 📏 DDC-S服务 (/ddcs)

### POST /ddcs/check-format
**功能**: 格式合规性检查

**认证**: 必需

**请求体**:
```json
{
  "proposal_id": "proposal-uuid",
  "standard": "NSFC",  // 或 "BIT"
  "sections": ["background", "objectives", "methods"]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "overall_score": 0.88,
    "issues": [
      {
        "section": "background",
        "issue_type": "font",
        "severity": "error",
        "description": "正文字体应为宋体小四，当前为黑体",
        "location": {
          "paragraph": 3,
          "line": 12
        },
        "auto_fixable": true
      },
      {
        "section": "objectives",
        "issue_type": "structure",
        "severity": "warning",
        "description": "建议将研究目标分为3-5个子目标",
        "auto_fixable": false
      }
    ],
    "suggestions": [
      "图表标题建议居中对齐",
      "参考文献格式需符合GB/T 7714-2005标准"
    ]
  }
}
```

---

### POST /ddcs/auto-fix
**功能**: 自动修正格式问题

**请求体**:
```json
{
  "proposal_id": "proposal-uuid",
  "fix_types": ["font", "spacing", "alignment"]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "fixed_issues": 12,
    "remaining_issues": 3,
    "changes": [
      "修正了15处字体错误",
      "调整了8处行距",
      "对齐了所有图表标题"
    ],
    "new_version_id": "new-version-uuid"
  }
}
```

---

## 📚 文献模块 (/corpus)

### GET /corpus/search
**功能**: 搜索文献

**查询参数**:
```
?q=multi-agent&source=arxiv&published_after=2024-01-01&limit=20
```

**响应**:
```json
{
  "success": true,
  "data": {
    "papers": [...],
    "total": 234,
    "facets": {
      "sources": {"arxiv": 180, "nsfc": 54},
      "years": {"2024": 120, "2023": 114}
    }
  }
}
```

---

## ⚙️ 通用规范

### 分页参数
```
page: 页码（从1开始）
page_size: 每页数量（默认20，最大100）
```

### 排序参数
```
sort_by: 排序字段
order: asc（升序）/ desc（降序）
```

### 错误码列表
| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| `UNAUTHORIZED` | 401 | 未认证 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 422 | 参数验证失败 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `SERVICE_UNAVAILABLE` | 503 | 服务暂不可用 |

### 速率限制
```
认证用户: 100请求/分钟
生成服务: 10请求/分钟
搜索服务: 30请求/分钟
```

---

**文档状态**: ✅ 规范完成
**最后更新**: 2025-10-28
**OpenAPI文档**: 将自动生成于 `/docs`